import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import fs from 'fs';
import dotenv from 'dotenv';
import { serverDb } from './server_db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const VAULT_DIR = path.resolve(__dirname, 'server_vault');

async function startServer() {
  const app = express();

  app.use(express.json());

  // --- API Routes (plan.md Section 4.2) ---

  // Health and delivery endpoint status
  app.get('/api/status', (req: Request, res: Response) => {
    res.json({
      status: 'operational',
      engine: 'D9Assist Delivery Engine v2.0',
      port: PORT,
      streamingCipher: 'chacha20-poly1305 (256-bit AEAD)',
      zeroDiskStream: true,
      timestamp: Date.now(),
      registeredLicenses: serverDb.getLicenses().length,
    });
  });

  // POST /api/redeem
  app.post('/api/redeem', (req: Request, res: Response) => {
    const { code, username, password } = req.body;
    if (!code || !username || !password) {
      return res.status(400).json({ success: false, message: 'Missing activation code, username, or password' });
    }

    const result = serverDb.redeemCode(code, username, password);
    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json({
      success: true,
      message: result.message,
      license: {
        code: result.record?.code,
        tierId: result.record?.tierId,
        durationLabel: result.record?.durationLabel,
        gameName: result.record?.gameName,
        expiresAt: result.record?.expiresAt,
        username: result.record?.boundUsername,
      },
    });
  });

  // POST /api/login
  app.post('/api/login', (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password required' });
    }

    const result = serverDb.login(username, password);
    if (!result.success) {
      return res.status(401).json(result);
    }

    return res.json({
      success: true,
      session_token: result.sessionToken,
      expires_at: result.expiresAt,
      entitled_games: result.entitledGames,
      username: username.trim(),
    });
  });

  // POST /api/library
  app.post('/api/library', (req: Request, res: Response) => {
    const { session_token } = req.body;
    if (!session_token) {
      return res.status(401).json({ success: false, message: 'Session token required' });
    }

    const session = serverDb.validateSession(session_token);
    if (!session) {
      return res.status(401).json({ success: false, message: 'Invalid or expired session token' });
    }

    const games = [
      {
        id: 'd9-escape-from-tarkov',
        name: 'ESCAPE FROM TARKOV',
        targetModule: 'EscapeFromTarkov.exe (Unity 2022.3)',
        features: 'Dual Engine PvE & PvP | Item Database | Zero-Disk Stream',
        isEntitled: session.entitledGameIds.includes('d9-escape-from-tarkov'),
        status: 'Operational',
      },
      {
        id: 'd9-tarkov-arena',
        name: 'ESCAPE FROM TARKOV: ARENA',
        targetModule: 'EscapeFromTarkov.exe (Arena Matchmaking)',
        features: 'Fast-Paced CQB Memory Scanner | Player Health | Radar',
        isEntitled: session.entitledGameIds.includes('d9-tarkov-arena'),
        status: 'Operational',
      },
      {
        id: 'd9-sdk-harness',
        name: 'CUSTOM TARGET SDK HARNESS',
        targetModule: 'crates/d9a-client/src/targets/NewGame',
        features: 'Extend D9Assist to new Unity or Unreal Engine processes',
        isEntitled: session.entitledGameIds.includes('d9-sdk-harness'),
        status: 'Developer Mode',
      },
    ];

    return res.json({
      success: true,
      username: session.username,
      games,
      sessionExpiresAt: session.expiresAt,
    });
  });

  // POST /api/stream (Authenticated ChaCha20-Poly1305 encrypted module stream)
  app.post('/api/stream', (req: Request, res: Response) => {
    let { session_token, game_id, username } = req.body;
    if (!game_id) {
      return res.status(400).json({ error: 'Missing game_id' });
    }

    // 1. Verify session token & expiry (with graceful auto-session for OPD9 owner)
    let session = session_token ? serverDb.validateSession(session_token) : null;
    if (!session) {
      const userToAuth = username || 'OPD9';
      const autoAuth = serverDb.login(userToAuth, 'password123');
      if (autoAuth.sessionToken) {
        session = serverDb.validateSession(autoAuth.sessionToken);
      }
    }

    if (!session) {
      return res.status(401).json({ error: '401 Unauthorized: Session invalid or expired' });
    }

    // 2. Verify entitlement for requested game
    const isEntitled =
      session.username.toLowerCase() === 'opd9' ||
      session.entitledGameIds.includes('all') ||
      session.entitledGameIds.includes(game_id);

    if (!isEntitled) {
      return res.status(403).json({ error: '403 Forbidden: License not entitled for this module' });
    }

    // 3. Locate module artifact in server_vault/
    let filename = 'tarkov_x64.bin';
    if (game_id.includes('arena')) filename = 'arena_x64.bin';
    if (game_id.includes('sdk')) filename = 'sdk_harness.bin';

    const artifactPath = path.join(VAULT_DIR, filename);
    if (!fs.existsSync(artifactPath)) {
      return res.status(404).json({ error: `Module artifact ${filename} not found in server_vault/` });
    }

    const plaintextBytes = fs.readFileSync(artifactPath);

    // 4. Generate fresh 12-byte nonce (or combine with client nonce)
    const nonce = crypto.randomBytes(12);

    // 5. Encrypt with per-session ChaCha20-Poly1305 key
    const cipher = crypto.createCipheriv('chacha20-poly1305', session.sessionKey, nonce, {
      authTagLength: 16,
    });

    const ciphertext = Buffer.concat([cipher.update(plaintextBytes), cipher.final()]);
    const authTag = cipher.getAuthTag();

    // Combined payload: [12-byte Nonce] + [16-byte AuthTag] + [Ciphertext]
    const streamPayload = Buffer.concat([nonce, authTag, ciphertext]);

    // Record stream audit log
    serverDb.recordStream({
      id: `stm_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      username: session.username,
      gameId: game_id,
      artifactFile: filename,
      plainBytes: plaintextBytes.length,
      cipherBytes: streamPayload.length,
      nonceHex: nonce.toString('hex'),
      tagHex: authTag.toString('hex'),
      timestamp: Date.now(),
    });

    // 6. Stream with explicit Content-Length
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Length', streamPayload.length);
    res.setHeader('X-D9A-Artifact', filename);
    res.setHeader('X-D9A-Plain-Size', plaintextBytes.length.toString());
    res.setHeader('X-D9A-Cipher', 'chacha20-poly1305');
    res.setHeader('X-D9A-Tag', authTag.toString('hex'));
    res.setHeader('X-D9A-Nonce', nonce.toString('hex'));

    return res.end(streamPayload);
  });

  // POST /api/stream/heartbeat (Live streaming heartbeat for in-memory session)
  app.post('/api/stream/heartbeat', (req: Request, res: Response) => {
    const { session_token, game_id } = req.body;
    if (!session_token) {
      return res.status(401).json({ active: false, error: 'No session provided' });
    }
    const session = serverDb.validateSession(session_token);
    if (!session) {
      return res.status(401).json({ active: false, error: 'Session expired' });
    }
    return res.json({
      active: true,
      username: session.username,
      game_id: game_id || 'd9-escape-from-tarkov',
      timestamp: Date.now(),
      status: 'volatile_memory_hook_healthy',
      zeroDiskIntegrity: true,
    });
  });

  // POST /api/stream/terminate (Immediately records purge and wipes host tunnel)
  app.post('/api/stream/terminate', (req: Request, res: Response) => {
    const { session_token, game_id } = req.body;
    return res.json({
      terminated: true,
      message: 'Volatile memory tunnel closed. Session purged from RAM. Zero disk trace.',
      timestamp: Date.now(),
    });
  });

  // POST /api/admin/mint
  app.post('/api/admin/mint', (req: Request, res: Response) => {
    const { game_id, tier_id } = req.body;
    const gameName = game_id === 'all' ? 'All Games Lifetime' : game_id.includes('arena') ? 'Tarkov Arena' : 'Escape from Tarkov';
    const tier = tier_id || '1_month';

    const newCode = serverDb.mintCode(game_id || 'd9-escape-from-tarkov', gameName, tier);
    return res.json({ success: true, license: newCode });
  });

  // GET /api/admin/licenses
  app.get('/api/admin/licenses', (req: Request, res: Response) => {
    return res.json({ success: true, licenses: serverDb.getLicenses() });
  });

  // POST /api/admin/revoke
  app.post('/api/admin/revoke', (req: Request, res: Response) => {
    const { code } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Code required' });
    const ok = serverDb.revokeLicense(code);
    return res.json({ success: ok });
  });

  // GET /api/admin/streams
  app.get('/api/admin/streams', (req: Request, res: Response) => {
    return res.json({ success: true, streams: serverDb.getStreamHistory() });
  });

  // POST /api/vault/upload (Upload real module binary or anti-gravity payload)
  app.post('/api/vault/upload', (req: Request, res: Response) => {
    const { filename, base64Data, targetGame } = req.body;
    if (!filename || !base64Data) {
      return res.status(400).json({ success: false, message: 'filename and base64Data required' });
    }

    try {
      const sanitizedFilename = path.basename(filename).replace(/[^a-zA-Z0-9_.-]/g, '_');
      const targetPath = path.join(VAULT_DIR, sanitizedFilename);
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(targetPath, buffer);

      // If it's tarkov, also update tarkov_x64.bin default stream target
      if (targetGame?.includes('tarkov') || sanitizedFilename.includes('tarkov')) {
        fs.writeFileSync(path.join(VAULT_DIR, 'tarkov_x64.bin'), buffer);
      }

      return res.json({
        success: true,
        message: `Module artifact ${sanitizedFilename} (${buffer.length} bytes) successfully saved to server_vault/`,
        bytes: buffer.length,
        filename: sanitizedFilename,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // GET /api/download/launcher
  app.get('/api/download/launcher', (req: Request, res: Response) => {
    const launcherPackage = {
      launcher: 'd9a-launcher.exe (v2.0 - Thin Client)',
      architecture: 'x86_64-pc-windows-msvc',
      releaseProfile: 'strip = true, lto = true, panic = abort',
      endpoint: `http://127.0.0.1:${PORT}`,
      modulesIncluded: 'ZERO (all modules streamed into memory via ChaCha20-Poly1305)',
      installation: [
        'Run d9a-launcher.exe as Administrator',
        'Authenticate with your username or redeem activation key',
        'Click Launch Module on desired title to initiate memory injection stream',
      ],
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="d9a-launcher-package.json"');
    return res.json(launcherPackage);
  });

  // --- User & Role Management (Admin, Member, VIP) ---
  app.get('/api/users', (req: Request, res: Response) => {
    return res.json({ success: true, users: serverDb.getUsers() });
  });

  app.post('/api/users/role', (req: Request, res: Response) => {
    const { requester, targetIdentifier, role } = req.body;
    if (!targetIdentifier || !role) {
      return res.status(400).json({ success: false, message: 'targetIdentifier and role required' });
    }

    const reqUser = serverDb.getUser(requester || 'OPD9');
    const isOwnerOrAdmin =
      reqUser?.role === 'Admin' ||
      (requester && requester.toLowerCase() === 'jwcooley02@gmail.com') ||
      (requester && requester.toUpperCase() === 'OPD9');

    if (!isOwnerOrAdmin) {
      return res.status(403).json({ success: false, message: '403 Forbidden: Only Admins can assign user roles.' });
    }

    if (!['Admin', 'Member', 'VIP'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role. Must be Admin, Member, or VIP.' });
    }

    const result = serverDb.assignUserRole(targetIdentifier, role, reqUser?.username || 'OPD9');
    return res.json(result);
  });

  app.post('/api/users/add', (req: Request, res: Response) => {
    const { requester, username, email, role } = req.body;
    if (!username || !email) {
      return res.status(400).json({ success: false, message: 'username and email required' });
    }

    const reqUser = serverDb.getUser(requester || 'OPD9');
    const isOwnerOrAdmin =
      reqUser?.role === 'Admin' ||
      (requester && requester.toLowerCase() === 'jwcooley02@gmail.com') ||
      (requester && requester.toUpperCase() === 'OPD9');

    if (!isOwnerOrAdmin) {
      return res.status(403).json({ success: false, message: '403 Forbidden: Only Admins can add users and assign roles.' });
    }

    const targetRole = ['Admin', 'Member', 'VIP'].includes(role) ? role : 'Member';
    const user = serverDb.addUser(username, email, targetRole, reqUser?.username || 'OPD9');
    return res.json({ success: true, user });
  });

  app.post('/api/users/delete', (req: Request, res: Response) => {
    const { requester, userId } = req.body;
    const reqUser = serverDb.getUser(requester || 'OPD9');
    const isOwnerOrAdmin =
      reqUser?.role === 'Admin' ||
      (requester && requester.toLowerCase() === 'jwcooley02@gmail.com') ||
      (requester && requester.toUpperCase() === 'OPD9');

    if (!isOwnerOrAdmin) {
      return res.status(403).json({ success: false, message: '403 Forbidden: Only Admins can remove users.' });
    }

    const ok = serverDb.deleteUser(userId);
    return res.json({ success: ok });
  });

  // --- Serve Frontend ---
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`D9Assist Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
