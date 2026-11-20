import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface LicenseRecord {
  code: string;
  tierId: '1_week' | '1_month' | '1_year' | 'lifetime';
  durationLabel: string;
  gameId: string;
  gameName: string;
  isBound: boolean;
  boundUsername?: string;
  passwordHash?: string;
  expiresAt?: number;
  createdAt: number;
  revoked: boolean;
}

export interface SessionRecord {
  sessionToken: string;
  username: string;
  sessionKey: Buffer; // 32 bytes for ChaCha20-Poly1305
  expiresAt: number;
  entitledGameIds: string[];
}

export interface StreamEvent {
  id: string;
  username: string;
  gameId: string;
  artifactFile: string;
  plainBytes: number;
  cipherBytes: number;
  nonceHex: string;
  tagHex: string;
  timestamp: number;
}

export interface UserAccountRecord {
  id: string;
  username: string;
  email: string;
  role: 'Admin' | 'Member' | 'VIP';
  isOwner?: boolean;
  assignedBy?: string;
  assignedAt: number;
}

const DB_FILE = path.resolve('d9a_licenses.json');

const INITIAL_USERS: UserAccountRecord[] = [
  {
    id: 'user-opd9',
    username: 'OPD9',
    email: 'jwcooley02@gmail.com',
    role: 'Admin',
    isOwner: true,
    assignedBy: 'System (Owner / Creator)',
    assignedAt: Date.now() - 30 * 86400000,
  },
  {
    id: 'user-vip1',
    username: 'GhostActual',
    email: 'ghost@d9assist.net',
    role: 'VIP',
    isOwner: false,
    assignedBy: 'OPD9',
    assignedAt: Date.now() - 7 * 86400000,
  },
  {
    id: 'user-mem1',
    username: 'BravoSix',
    email: 'bravo@d9assist.net',
    role: 'Member',
    isOwner: false,
    assignedBy: 'OPD9',
    assignedAt: Date.now() - 2 * 86400000,
  },
];

const INITIAL_LICENSES: LicenseRecord[] = [
  {
    code: 'D9A-LIFE-JEREMY-2026',
    tierId: 'lifetime',
    durationLabel: 'Lifetime Access (Permanent)',
    gameId: 'all',
    gameName: 'Escape from Tarkov + Arena + SDK',
    isBound: true,
    boundUsername: 'OPD9',
    passwordHash: crypto.createHash('sha256').update('password123').digest('hex'),
    expiresAt: Date.now() + 10 * 365 * 86400000, // 10 years
    createdAt: Date.now() - 30 * 86400000,
    revoked: false,
  },
  {
    code: 'D9A-EFT-7X89-21PQ',
    tierId: '1_month',
    durationLabel: '30 Days Access',
    gameId: 'd9-escape-from-tarkov',
    gameName: 'Escape from Tarkov',
    isBound: false,
    createdAt: Date.now() - 86400000,
    revoked: false,
  },
  {
    code: 'D9A-EFT-99M1-44B8',
    tierId: '1_week',
    durationLabel: '7 Days Access',
    gameId: 'd9-escape-from-tarkov',
    gameName: 'Escape from Tarkov',
    isBound: false,
    createdAt: Date.now() - 400000,
    revoked: false,
  },
];

class ServerDatabase {
  private licenses: Map<string, LicenseRecord> = new Map();
  private users: Map<string, UserAccountRecord> = new Map();
  private sessions: Map<string, SessionRecord> = new Map();
  private streamEvents: StreamEvent[] = [];

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        const data = JSON.parse(raw);
        if (Array.isArray(data.licenses)) {
          data.licenses.forEach((lic: LicenseRecord) => this.licenses.set(lic.code.toUpperCase(), lic));
        }
        if (Array.isArray(data.users) && data.users.length > 0) {
          data.users.forEach((usr: UserAccountRecord) => this.users.set(usr.id, usr));
        } else {
          INITIAL_USERS.forEach((usr) => this.users.set(usr.id, usr));
        }
        if (Array.isArray(data.streamEvents)) {
          this.streamEvents = data.streamEvents;
        }
      } else {
        INITIAL_LICENSES.forEach((lic) => this.licenses.set(lic.code.toUpperCase(), lic));
        INITIAL_USERS.forEach((usr) => this.users.set(usr.id, usr));
        this.save();
      }
    } catch {
      INITIAL_LICENSES.forEach((lic) => this.licenses.set(lic.code.toUpperCase(), lic));
      INITIAL_USERS.forEach((usr) => this.users.set(usr.id, usr));
    }
  }

  private save() {
    try {
      const data = {
        licenses: Array.from(this.licenses.values()),
        users: Array.from(this.users.values()),
        streamEvents: this.streamEvents.slice(-50), // keep last 50 events
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to save d9a_licenses.json:', err);
    }
  }

  // --- Licenses API ---
  getLicenses(): LicenseRecord[] {
    return Array.from(this.licenses.values());
  }

  getLicense(code: string): LicenseRecord | undefined {
    return this.licenses.get(code.trim().toUpperCase());
  }

  addLicense(record: LicenseRecord): LicenseRecord {
    this.licenses.set(record.code.toUpperCase(), record);
    this.save();
    return record;
  }

  mintCode(gameId: string, gameName: string, tierId: '1_week' | '1_month' | '1_year' | 'lifetime'): LicenseRecord {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const chunk = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const code = `D9A-${gameId.includes('arena') ? 'ARN' : 'EFT'}-${chunk()}-${chunk()}`;
    const durationLabel =
      tierId === '1_week'
        ? '7 Days Access'
        : tierId === '1_month'
        ? '30 Days Access'
        : tierId === '1_year'
        ? '365 Days Access'
        : 'Lifetime Access';

    const record: LicenseRecord = {
      code,
      tierId,
      durationLabel,
      gameId,
      gameName,
      isBound: false,
      createdAt: Date.now(),
      revoked: false,
    };

    this.licenses.set(code, record);
    this.save();
    return record;
  }

  revokeLicense(code: string): boolean {
    const lic = this.licenses.get(code.toUpperCase());
    if (!lic) return false;
    lic.revoked = true;
    this.save();
    return true;
  }

  // --- Redeem Code ---
  redeemCode(code: string, username: string, password: string): { success: boolean; message: string; record?: LicenseRecord } {
    const lic = this.licenses.get(code.trim().toUpperCase());
    if (!lic) {
      return { success: false, message: 'Invalid activation code' };
    }
    if (lic.revoked) {
      return { success: false, message: 'This activation code has been revoked' };
    }
    if (lic.isBound && lic.boundUsername?.toLowerCase() !== username.toLowerCase()) {
      return { success: false, message: `Code already bound to another user account (${lic.boundUsername})` };
    }

    const durationMs =
      lic.tierId === '1_week'
        ? 7 * 86400000
        : lic.tierId === '1_month'
        ? 30 * 86400000
        : lic.tierId === '1_year'
        ? 365 * 86400000
        : 10 * 365 * 86400000;

    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    lic.isBound = true;
    lic.boundUsername = username.trim();
    lic.passwordHash = passwordHash;
    lic.expiresAt = Date.now() + durationMs;

    this.save();
    return { success: true, message: 'Code successfully redeemed and bound', record: lic };
  }

  // --- Authentication & Session Tokens ---
  login(username: string, password: string): { success: boolean; message: string; sessionToken?: string; expiresAt?: number; entitledGames?: string[] } {
    const cleanUser = username.trim().toLowerCase();
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    // Find any valid, non-expired license bound to this username
    const userLicenses = Array.from(this.licenses.values()).filter(
      (lic) =>
        lic.boundUsername?.toLowerCase() === cleanUser &&
        !lic.revoked &&
        (!lic.expiresAt || lic.expiresAt > Date.now())
    );

    if (userLicenses.length === 0) {
      return { success: false, message: 'No active licenses found for this username. Please redeem a code first.' };
    }

    // Verify password if set
    const withPassword = userLicenses.find((l) => l.passwordHash);
    if (withPassword && withPassword.passwordHash !== passwordHash) {
      return { success: false, message: 'Invalid credentials. Password does not match bound activation code.' };
    }

    const sessionToken = `d9s_${crypto.randomBytes(24).toString('hex')}`;
    const sessionKey = crypto.randomBytes(32); // 256-bit key for ChaCha20-Poly1305
    const expiresAt = Date.now() + 24 * 3600 * 1000; // 24-hour session

    const entitledGames: string[] = [];
    userLicenses.forEach((l) => {
      if (l.gameId === 'all') {
        entitledGames.push('d9-escape-from-tarkov', 'd9-tarkov-arena', 'd9-sdk-harness');
      } else {
        entitledGames.push(l.gameId);
      }
    });

    const session: SessionRecord = {
      sessionToken,
      username: userLicenses[0].boundUsername || username,
      sessionKey,
      expiresAt,
      entitledGameIds: Array.from(new Set(entitledGames)),
    };

    this.sessions.set(sessionToken, session);

    return {
      success: true,
      message: 'Authentication verified',
      sessionToken,
      expiresAt,
      entitledGames: session.entitledGameIds,
    };
  }

  validateSession(sessionToken: string): SessionRecord | null {
    const session = this.sessions.get(sessionToken);
    if (!session) return null;
    if (Date.now() > session.expiresAt) {
      this.sessions.delete(sessionToken);
      return null;
    }
    return session;
  }

  // --- Stream Event Logging ---
  recordStream(event: StreamEvent) {
    this.streamEvents.unshift(event);
    if (this.streamEvents.length > 50) this.streamEvents.pop();
    this.save();
  }

  getStreamHistory(): StreamEvent[] {
    return this.streamEvents;
  }

  // --- User & Role Management (Admin, Member, VIP) ---
  getUsers(): UserAccountRecord[] {
    return Array.from(this.users.values());
  }

  getUser(identifier: string): UserAccountRecord | undefined {
    const clean = identifier.trim().toLowerCase();
    for (const usr of this.users.values()) {
      if (usr.id.toLowerCase() === clean || usr.email.toLowerCase() === clean || usr.username.toLowerCase() === clean) {
        return usr;
      }
    }
    return undefined;
  }

  assignUserRole(
    targetIdentifier: string,
    newRole: 'Admin' | 'Member' | 'VIP',
    assignedBy: string
  ): { success: boolean; user?: UserAccountRecord; message?: string } {
    const user = this.getUser(targetIdentifier);
    if (!user) {
      return { success: false, message: `User not found: ${targetIdentifier}` };
    }

    user.role = newRole;
    user.assignedBy = assignedBy;
    user.assignedAt = Date.now();
    this.save();
    return { success: true, user, message: `Role updated to ${newRole} for ${user.username}` };
  }

  addUser(
    username: string,
    email: string,
    role: 'Admin' | 'Member' | 'VIP',
    assignedBy: string
  ): UserAccountRecord {
    const existing = this.getUser(email) || this.getUser(username);
    if (existing) {
      existing.role = role;
      existing.assignedBy = assignedBy;
      existing.assignedAt = Date.now();
      this.save();
      return existing;
    }

    const id = `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newRecord: UserAccountRecord = {
      id,
      username: username.trim(),
      email: email.trim().toLowerCase(),
      role,
      isOwner: false,
      assignedBy,
      assignedAt: Date.now(),
    };

    this.users.set(id, newRecord);
    this.save();
    return newRecord;
  }

  deleteUser(id: string): boolean {
    const user = this.users.get(id);
    if (!user || user.isOwner) return false;
    this.users.delete(id);
    this.save();
    return true;
  }
}

export const serverDb = new ServerDatabase();
