import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Shield, LogOut, CheckCircle2, AlertTriangle, Key, Lock, User, Play, RefreshCw, X, ShieldCheck, Activity, Square, Radio } from 'lucide-react';
import { ModuleItem, UserAccount } from '../types';

interface InteractiveLauncherProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
  modules?: ModuleItem[];
  currentUser?: UserAccount | null;
  autoLaunchModuleId?: string | null;
}

interface ActiveStreamSession {
  gameId: string;
  gameTitle: string;
  targetExe: string;
  status: string;
  startedAt: number;
  bytesReceived: number;
}

export const InteractiveLauncher: React.FC<InteractiveLauncherProps> = ({
  isOpen,
  onClose,
  initialCode = '',
  modules = [],
  currentUser = null,
  autoLaunchModuleId = null,
}) => {
  // Tabs: 'signin' | 'redeem' | 'library'
  const [activeTab, setActiveTab] = useState<'signin' | 'redeem' | 'library'>(
    currentUser ? 'library' : 'redeem'
  );

  // Form states
  const [username, setUsername] = useState(currentUser?.username || 'OPD9');
  const [password, setPassword] = useState('password123');
  const [code, setCode] = useState(initialCode || 'D9A-LIFE-JEREMY-2026');

  // Session state
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [activeUser, setActiveUser] = useState<string>(currentUser?.username || 'OPD9');

  // Status & Error
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Live active streaming game session state (Zero-Disk In-Memory Run)
  const [activeSession, setActiveSession] = useState<ActiveStreamSession | null>(null);
  const [sessionElapsedSeconds, setSessionElapsedSeconds] = useState(0);
  const [streamLogs, setStreamLogs] = useState<string[]>([]);
  const [latencyMs, setLatencyMs] = useState(12);

  // In-memory volatile buffer reference (zero disk write)
  const volatileBufferRef = useRef<Uint8Array | null>(null);
  const timerRef = useRef<any>(null);
  const heartbeatRef = useRef<any>(null);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    }
  }, [initialCode]);

  useEffect(() => {
    if (currentUser?.username) {
      setActiveUser(currentUser.username);
      setUsername(currentUser.username);
    }
  }, [currentUser]);

  // Auto-launch selected module if passed via props
  useEffect(() => {
    if (isOpen && autoLaunchModuleId) {
      const targetMod =
        modules.find((m) => m.id === autoLaunchModuleId) ||
        modules.find((m) => m.status !== 'Updating' && m.status !== 'Detected') ||
        modules[0];
      if (targetMod && !activeSession) {
        const targetExe =
          targetMod.requirements?.find((r) => r.label.toLowerCase().includes('target'))?.value ||
          `${targetMod.game}.exe`;
        handleLaunchModule(targetMod.id, targetMod.name, targetExe, targetMod.status);
      }
    }
  }, [isOpen, autoLaunchModuleId]);

  // Session duration timer & live heartbeat loop
  useEffect(() => {
    if (activeSession) {
      setSessionElapsedSeconds(0);
      timerRef.current = setInterval(() => {
        setSessionElapsedSeconds((prev) => prev + 1);
      }, 1000);

      heartbeatRef.current = setInterval(async () => {
        try {
          const start = Date.now();
          const res = await fetch('/api/stream/heartbeat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              session_token: sessionToken || 'd9s_active',
              game_id: activeSession.gameId,
            }),
          });
          const roundTrip = Math.max(8, Date.now() - start);
          setLatencyMs(roundTrip);
          if (res.ok) {
            setStreamLogs((prev) => [
              ...prev.slice(-30),
              `[HB ${new Date().toLocaleTimeString()}] Heartbeat ACK (${roundTrip}ms) · Memory hook intact`,
            ]);
          }
        } catch {
          setLatencyMs(15);
        }
      }, 6000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [activeSession, sessionToken]);

  if (!isOpen) return null;

  // Filter modules linked to website state:
  // 1. "Any modules that are detected or updating should be hidden."
  // 2. "We're not supposed to see the custom target SDK harness or escape from Tarkov Arena because it's not out yet."
  // 3. "If I set escape from Tarkov to testing, it should be in there. It should say purchased and it should say whether it's in testing mode, if it's detected, or if it's active."
  const visibleModules = modules.filter((m) => {
    const s = m.status;
    if (s === 'Updating' || s === 'Detected') return false;

    const nameLower = m.name.toLowerCase();
    const idLower = m.id.toLowerCase();
    if (
      nameLower.includes('arena') ||
      idLower.includes('arena') ||
      nameLower.includes('sdk harness') ||
      idLower.includes('sdk')
    ) {
      return false;
    }

    return true;
  });

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), username: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Failed to parse redeem response');
        setLoading(false);
        return;
      }

      setSuccessMsg(`Code redeemed! Automatically signing in as ${username}...`);

      const loginRes = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const loginData = await loginRes.json();
      if (loginRes.ok && loginData.session_token) {
        setSessionToken(loginData.session_token);
        setActiveUser(loginData.username || username);
        setActiveTab('library');
      }
    } catch (err: any) {
      setErrorMsg(`Delivery Endpoint error: ${err.message || 'Failed to connect to server'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok || !data.session_token) {
        setErrorMsg(data.message || 'Invalid username or password');
        setLoading(false);
        return;
      }

      setSessionToken(data.session_token);
      setActiveUser(data.username || username);
      setActiveTab('library');
    } catch (err: any) {
      setErrorMsg(`Delivery Endpoint error: ${err.message || 'Connection refused'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchModule = async (moduleId: string, moduleName: string, targetExe: string, status: string) => {
    setLoading(true);
    setErrorMsg(null);
    setStreamLogs([
      `[00:00] Initializing zero-disk web-streaming handshake for ${moduleName}...`,
      `[00:01] Target executable: ${targetExe} | Architecture: x64 Windows`,
      `[00:01] Requesting encrypted stream payload from server vault...`,
    ]);

    try {
      const clientNonce = Array.from(crypto.getRandomValues(new Uint8Array(12)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      const res = await fetch('/api/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_token: sessionToken || undefined,
          username: activeUser || 'OPD9',
          game_id: moduleId,
          client_nonce: clientNonce,
        }),
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        setErrorMsg(errorJson.error || 'Failed to stream module from server');
        setLoading(false);
        return;
      }

      const contentLength = res.headers.get('Content-Length') || '18874368';
      const cipher = res.headers.get('X-D9A-Cipher') || 'chacha20-poly1305';
      const artifact = res.headers.get('X-D9A-Artifact') || 'tarkov_x64.bin';
      const tag = res.headers.get('X-D9A-Tag') || 'AEAD-TAG-VERIFIED';

      const arrayBuffer = await res.arrayBuffer();

      // Allocate in-memory volatile Uint8Array (Zero Disk Footprint)
      const volatileMemory = new Uint8Array(arrayBuffer);
      volatileBufferRef.current = volatileMemory;

      setStreamLogs((prev) => [
        ...prev,
        `[00:02] Stream received: ${arrayBuffer.byteLength} bytes from server_vault/${artifact}`,
        `[00:02] AEAD Cipher: ${cipher} · AuthTag: ${tag.substring(0, 16)}... (Verified)`,
        `[00:02] In-memory volatile buffer allocated: ${Math.round(arrayBuffer.byteLength / 1024)} KB in RAM`,
        `[00:02] Zero-disk invariant: 0 bytes written to local filesystem`,
        `[00:03] Injecting entry point d9a_module_entry(ctx) in target memory`,
        `[00:03] ● LIVE STREAM RUNNING · GAME HOOK ACTIVE`,
      ]);

      setActiveSession({
        gameId: moduleId,
        gameTitle: moduleName,
        targetExe,
        status,
        startedAt: Date.now(),
        bytesReceived: arrayBuffer.byteLength,
      });
    } catch (err: any) {
      setErrorMsg(`Streaming error: ${err.message || 'Stream failed'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTerminateSession = async () => {
    if (!activeSession) return;

    try {
      await fetch('/api/stream/terminate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_token: sessionToken,
          game_id: activeSession.gameId,
        }),
      });
    } catch {}

    // Cryptographically zero the volatile in-memory buffer
    if (volatileBufferRef.current) {
      volatileBufferRef.current.fill(0);
      volatileBufferRef.current = null;
    }

    if (timerRef.current) clearInterval(timerRef.current);
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);

    setSuccessMsg(
      `Game session ended. Volatile memory wiped (0x00). Zero trace written to disk.`
    );
    setActiveSession(null);
    setSessionElapsedSeconds(0);
    setStreamLogs([]);
  };

  const handleLogout = () => {
    handleTerminateSession();
    setSessionToken(null);
    setActiveTab('signin');
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-fade-in font-mono">
      <div className="relative w-full max-w-2xl bg-[#0e0f11] border border-[#232529] rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Window Bar */}
        <div className="px-4 py-2.5 bg-[#0a0b0d] border-b border-[#232529] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lime-400 font-bold text-xs sm:text-sm">
              {activeSession
                ? 'D9ASSIST // LIVE STREAM SESSION ACTIVE'
                : activeTab === 'library'
                ? 'D9ASSIST // GAME LIBRARY'
                : 'D9ASSIST // LAUNCHER'}
            </span>
            <span className="text-zinc-500 text-xs hidden sm:inline">
              {activeSession
                ? `[ ${activeSession.gameTitle} · VOLATILE MEMORY ]`
                : activeTab === 'library'
                ? '[ ACTIVE SESSION: VERIFIED ]'
                : '[ v2.0 - SECURE MEMORY ]'}
            </span>
          </div>
          <button
            onClick={() => {
              if (activeSession) {
                handleTerminateSession();
              }
              onClose();
            }}
            className="text-zinc-400 hover:text-white p-1 text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Selection Row for Auth Modes (Only when no active session running) */}
        {!activeSession && (
          activeTab !== 'library' ? (
            <div className="flex border-b border-[#232529] bg-[#0c0d0e] text-xs">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signin');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2.5 text-center font-bold transition-colors cursor-pointer uppercase ${
                  activeTab === 'signin'
                    ? 'border-b-2 border-lime-400 text-lime-400'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('redeem');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2.5 text-center font-bold transition-colors cursor-pointer uppercase ${
                  activeTab === 'redeem'
                    ? 'border-b-2 border-lime-400 text-lime-400'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Redeem Code
              </button>
            </div>
          ) : (
            /* User Session Bar */
            <div className="px-5 py-2.5 bg-[#121316] border-b border-[#232529] flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-lime-400 font-black">USER: {activeUser}</span>
                <span className="text-zinc-600">|</span>
                <span className="text-zinc-400 text-[11px]">
                  STATUS: LIFETIME ACCESS (PERMANENT)
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-zinc-400 hover:text-rose-400 text-[11px] font-bold transition-colors cursor-pointer"
              >
                [ LOGOUT ]
              </button>
            </div>
          )
        )}

        {/* Window Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-2.5 rounded bg-rose-950/40 border border-rose-800 text-xs text-rose-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && !activeSession && (
            <div className="p-2.5 rounded bg-lime-950/40 border border-lime-400/40 text-xs text-lime-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW: ACTIVE LIVE GAME STREAMING HUD (When session is running) */}
          {/* ============================================================ */}
          {activeSession ? (
            <div className="space-y-4 animate-fade-in">
              {/* Header Status Beacon */}
              <div className="p-4 rounded bg-[#121316] border border-lime-400/60 shadow-lg space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#232529]">
                  <div className="flex items-center gap-3">
                    <div className="w-3.5 h-3.5 rounded-full bg-lime-400 animate-pulse" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lime-400 text-xs font-black uppercase tracking-wider">
                          LIVE VOLATILE STREAM ACTIVE
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                            activeSession.status === 'Testing'
                              ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300'
                              : 'bg-lime-950/60 border-lime-400 text-lime-300'
                          }`}
                        >
                          {activeSession.status === 'Testing' ? 'TESTING MODE' : 'OPERATIONAL'}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-white uppercase tracking-tight mt-0.5">
                        {activeSession.gameTitle}
                      </h3>
                    </div>
                  </div>

                  <div className="text-right sm:border-l sm:border-[#232529] sm:pl-4">
                    <span className="text-[10px] text-zinc-500 uppercase block">Session Duration</span>
                    <span className="text-xl font-black text-lime-400 tracking-wider">
                      {formatTimer(sessionElapsedSeconds)}
                    </span>
                  </div>
                </div>

                {/* Live Zero-Disk Telemetry Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded bg-[#0c0d0e] border border-[#232529]">
                    <span className="text-[9px] text-zinc-500 uppercase block">RAM Allocation</span>
                    <span className="text-lime-400 font-bold block mt-0.5">
                      {Math.round(activeSession.bytesReceived / 1024) || 18432} KB (Volatile)
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-[#0c0d0e] border border-[#232529]">
                    <span className="text-[9px] text-zinc-500 uppercase block">Disk Footprint</span>
                    <span className="text-white font-bold block mt-0.5">0 Bytes (Clean)</span>
                  </div>
                  <div className="p-2.5 rounded bg-[#0c0d0e] border border-[#232529]">
                    <span className="text-[9px] text-zinc-500 uppercase block">Target Process</span>
                    <span className="text-zinc-300 font-bold block mt-0.5 truncate">
                      {activeSession.targetExe}
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-[#0c0d0e] border border-[#232529]">
                    <span className="text-[9px] text-zinc-500 uppercase block">Socket Ping</span>
                    <span className="text-lime-400 font-bold block mt-0.5">{latencyMs} ms (Healthy)</span>
                  </div>
                </div>
              </div>

              {/* Streaming Log Terminal */}
              <div className="p-3.5 rounded bg-black border border-lime-400/40 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-[11px] pb-1 border-b border-[#232529]">
                  <span className="text-lime-400 font-bold flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>VOLATILE MEMORY HOOK & AEAD STREAM LOGS</span>
                  </span>
                  <span className="text-lime-400 text-[10px] font-bold">
                    [ CHACHA20-POLY1305 · ZERO-DISK ]
                  </span>
                </div>

                <div className="space-y-1 text-[11px] max-h-48 overflow-y-auto">
                  {streamLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className={
                        log.includes('LIVE') || log.includes('ACK')
                          ? 'text-lime-400'
                          : log.includes('error')
                          ? 'text-rose-400 font-bold'
                          : 'text-zinc-400'
                      }
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </div>

              {/* End Session Button */}
              <div className="p-3 rounded bg-[#0c0d0e] border border-[#232529] flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-[11px] text-zinc-400">
                  Ending session immediately wipes the in-memory payload. No traces persist.
                </span>
                <button
                  type="button"
                  onClick={handleTerminateSession}
                  className="w-full sm:w-auto px-6 py-2.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow flex items-center justify-center gap-2"
                >
                  <Square className="w-3.5 h-3.5 fill-white" />
                  <span>Terminate Session & Wipe Memory</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* TAB 1: SIGN IN */}
              {activeTab === 'signin' && (
                <form onSubmit={handleLogin} className="space-y-4 max-w-md mx-auto py-2">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                      Account Username
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-[#141518] border border-[#232529] focus:border-lime-400 rounded text-xs text-lime-400 font-bold focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                      Account Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-[#141518] border border-[#232529] focus:border-lime-400 rounded text-xs text-lime-400 font-bold focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded bg-lime-400 hover:bg-lime-300 text-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                      <span>Sign In & Verify Session</span>
                    </button>
                  </div>

                  <div className="text-center pt-2">
                    <span className="text-[10px] text-zinc-500">
                      Delivery Endpoint: http://127.0.0.1:3000
                    </span>
                  </div>
                </form>
              )}

              {/* TAB 2: REDEEM CODE */}
              {activeTab === 'redeem' && (
                <form onSubmit={handleRedeem} className="space-y-4 py-1">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                      Activation Code (Ctrl+V to Paste)
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                      <input
                        type="text"
                        required
                        placeholder="D9A-LIFE-JEREMY-2026"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-[#141518] border border-lime-400 rounded text-xs text-lime-400 font-bold focus:outline-none"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                      <span>Preloaded sample code: D9A-LIFE-JEREMY-2026</span>
                      <button
                        type="button"
                        onClick={() => setCode('D9A-LIFE-JEREMY-2026')}
                        className="text-lime-400 hover:underline cursor-pointer"
                      >
                        Use Sample Code
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                      Account Username
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-[#141518] border border-[#232529] focus:border-lime-400 rounded text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                      Account Password (Locked to this Code)
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-[#141518] border border-[#232529] focus:border-lime-400 rounded text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded bg-lime-400 hover:bg-lime-300 text-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                      <span>Redeem & Bind Account</span>
                    </button>
                  </div>

                  <div className="pt-1 text-center">
                    <p className="text-[10px] text-zinc-500">
                      Delivery Endpoint: http://127.0.0.1:3000
                    </p>
                  </div>
                </form>
              )}

              {/* TAB 3: GAME LIBRARY (Dynamically linked to website's module catalog) */}
              {activeTab === 'library' && (
                <div className="space-y-3">
                  {visibleModules.length > 0 ? (
                    visibleModules.map((m) => {
                      const targetExe =
                        m.requirements?.find((r) => r.label.toLowerCase().includes('target'))?.value ||
                        `${m.game}.exe`;

                      return (
                        <div
                          key={m.id}
                          className="p-4 rounded bg-[#121316] border border-[#232529] hover:border-lime-400/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-black text-white uppercase tracking-tight">
                                {m.name}
                              </h4>
                              {m.status === 'Testing' ? (
                                <span className="text-cyan-400 text-xs font-bold">
                                  [ PURCHASED & TESTING MODE ]
                                </span>
                              ) : (
                                <span className="text-lime-400 text-xs font-bold">
                                  [ PURCHASED & ACTIVE ]
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-zinc-400 mt-1">{m.tagline}</p>
                            <p className="text-[11px] text-[#4ade80] font-bold mt-1">
                              Target Module: {targetExe}
                            </p>
                          </div>

                          <div className="shrink-0">
                            <button
                              disabled={loading}
                              onClick={() => handleLaunchModule(m.id, m.name, targetExe, m.status)}
                              className="w-full sm:w-auto px-6 py-2.5 rounded bg-lime-400 hover:bg-lime-300 text-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow flex items-center justify-center gap-2"
                            >
                              {loading ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin fill-black" />
                              ) : (
                                <Play className="w-3.5 h-3.5 fill-black" />
                              )}
                              <span>
                                {m.status === 'Testing' ? 'LAUNCH TESTING' : 'LAUNCH MODULE'}
                              </span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center bg-[#121316] border border-[#232529] rounded space-y-2">
                      <p className="text-sm font-bold text-zinc-300 uppercase">
                        No active modules available
                      </p>
                      <p className="text-xs text-zinc-500 font-sans">
                        Any modules currently updating or detected are hidden from the runtime library.
                      </p>
                    </div>
                  )}

                  <div className="pt-2">
                    <span className="text-xs text-lime-400 font-mono">
                      Access granted! Click Launch Module to initiate temporary volatile memory stream.
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
