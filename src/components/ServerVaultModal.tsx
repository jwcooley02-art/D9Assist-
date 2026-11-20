import React, { useState, useEffect } from 'react';
import { Shield, Key, Database, RefreshCw, X, Lock, Play, Trash2, CheckCircle2, Upload, AlertTriangle } from 'lucide-react';

interface ServerVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ServerVaultModal: React.FC<ServerVaultModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'vault' | 'licenses' | 'streams'>('vault');
  const [licenses, setLicenses] = useState<any[]>([]);
  const [streams, setStreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Uploading state for real anti-gravity module artifacts
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Minting form
  const [mintGame, setMintGame] = useState('d9-escape-from-tarkov');
  const [mintTier, setMintTier] = useState<'1_week' | '1_month' | '1_year' | 'lifetime'>('1_month');
  const [mintedCode, setMintedCode] = useState<string | null>(null);

  const fetchLicenses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/licenses');
      const data = await res.json();
      if (data.licenses) setLicenses(data.licenses);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const fetchStreams = async () => {
    try {
      const res = await fetch('/api/admin/streams');
      const data = await res.json();
      if (data.streams) setStreams(data.streams);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    fetchLicenses();
    fetchStreams();
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_id: mintGame, tier_id: mintTier }),
      });
      const data = await res.json();
      if (data.license?.code) {
        setMintedCode(data.license.code);
        fetchLicenses();
      }
    } catch {
      // ignore
    }
  };

  const handleRevoke = async (code: string) => {
    try {
      await fetch('/api/admin/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      fetchLicenses();
    } catch {
      // ignore
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const arrayBuffer = reader.result as ArrayBuffer;
          const bytes = new Uint8Array(arrayBuffer);
          let binary = '';
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          const base64Data = btoa(binary);

          const res = await fetch('/api/vault/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: file.name,
              base64Data,
              targetGame: 'tarkov',
            }),
          });
          const data = await res.json();
          if (res.ok && data.success) {
            setUploadSuccess(
              `Uploaded ${file.name} (${Math.round(file.size / 1024)} KB) into server_vault/tarkov_x64.bin. Web streaming is now serving your custom binary!`
            );
          } else {
            setUploadError(data.message || 'Upload failed');
          }
        } catch (err: any) {
          setUploadError(err.message || 'Error processing file');
        } finally {
          setUploading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err: any) {
      setUploadError(err.message);
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-fade-in font-mono">
      <div className="relative w-full max-w-3xl bg-[#141518] border border-[#232529] rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3 border-b border-[#232529] flex items-center justify-between bg-[#0e0f11]">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-lime-400" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase">
                D9ASSIST // SERVER VAULT & STREAMING MONITOR
              </h3>
              <p className="text-[11px] text-zinc-400">
                Private server_vault/ module artifacts, ChaCha20-Poly1305 AEAD streams, and license database.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-[#1e2025] text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab row */}
        <div className="flex border-b border-[#232529] bg-[#0c0d0e] px-5 text-xs">
          <button
            onClick={() => setActiveTab('vault')}
            className={`py-2.5 px-4 font-bold border-b-2 uppercase cursor-pointer ${
              activeTab === 'vault' ? 'border-lime-400 text-lime-400' : 'border-transparent text-zinc-400'
            }`}
          >
            Module Vault Artifacts
          </button>
          <button
            onClick={() => setActiveTab('licenses')}
            className={`py-2.5 px-4 font-bold border-b-2 uppercase cursor-pointer ${
              activeTab === 'licenses' ? 'border-lime-400 text-lime-400' : 'border-transparent text-zinc-400'
            }`}
          >
            License Minting ({licenses.length})
          </button>
          <button
            onClick={() => setActiveTab('streams')}
            className={`py-2.5 px-4 font-bold border-b-2 uppercase cursor-pointer ${
              activeTab === 'streams' ? 'border-lime-400 text-lime-400' : 'border-transparent text-zinc-400'
            }`}
          >
            Live Streams ({streams.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: VAULT ARTIFACTS */}
          {activeTab === 'vault' && (
            <div className="space-y-4">
              <div className="p-3 rounded bg-[#0c0d0e] border border-[#232529] text-xs space-y-1">
                <span className="text-lime-400 font-bold block uppercase">
                  Zero-Disk Isolation Policy (plan.md Section 1):
                </span>
                <p className="text-zinc-400 font-sans text-[11px]">
                  All module binary targets (tarkov_x64.bin, arena_x64.bin) remain strictly isolated inside the server_vault/ directory on the host server. They are never exposed as public web static files and stream only over authenticated ChaCha20-Poly1305 AEAD sessions directly into client memory.
                </p>
              </div>

              {/* Custom Binary Artifact Upload (Direct Hook to Anti-Gravity Payload) */}
              <div className="p-4 rounded bg-[#0c0d0e] border border-lime-400/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-lime-400" />
                    <span className="text-xs font-bold text-white uppercase">
                      Upload Custom Anti-Gravity Module Binary (.bin / .dll / .exe)
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-500 uppercase">
                    Host: server_vault/
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 font-sans">
                  Upload your actual compiled module or anti-gravity binary. When saved, the website streaming engine will immediately serve your real file during live web launches.
                </p>

                {uploadSuccess && (
                  <div className="p-2.5 rounded bg-lime-950/40 border border-lime-400/40 text-xs text-lime-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{uploadSuccess}</span>
                  </div>
                )}

                {uploadError && (
                  <div className="p-2.5 rounded bg-rose-950/40 border border-rose-800 text-xs text-rose-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                <label className="flex items-center justify-center gap-2 p-3 rounded border border-dashed border-[#35383f] hover:border-lime-400/80 bg-[#141518] hover:bg-[#181a1f] cursor-pointer transition-colors text-xs text-zinc-300">
                  {uploading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-lime-400" />
                  ) : (
                    <Upload className="w-4 h-4 text-lime-400" />
                  )}
                  <span className="font-bold uppercase tracking-wider">
                    {uploading ? 'Encrypting & Storing in Vault...' : 'Select Binary Payload to Store in Vault'}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>

              <div className="space-y-3">
                {[
                  {
                    file: 'server_vault/tarkov_x64.bin',
                    name: 'Escape from Tarkov Vanguard Module',
                    target: 'EscapeFromTarkov.exe (Unity 2022.3)',
                    size: '65,536 bytes',
                    entry: 'd9a_module_entry(ctx)',
                    status: 'Compiled & Stored in Server Vault',
                  },
                  {
                    file: 'server_vault/arena_x64.bin',
                    name: 'Escape from Tarkov: Arena Module',
                    target: 'EscapeFromTarkov.exe (Arena Matchmaking)',
                    size: '49,152 bytes',
                    entry: 'd9a_module_entry(ctx)',
                    status: 'Compiled & Stored in Server Vault',
                  },
                  {
                    file: 'server_vault/sdk_harness.bin',
                    name: 'Custom Target SDK Harness',
                    target: 'CustomTarget.exe',
                    size: '32,768 bytes',
                    entry: 'd9a_sdk_entry(ctx)',
                    status: 'Compiled & Stored in Server Vault',
                  },
                ].map((art, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded bg-[#0c0d0e] border border-[#232529] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-lime-400" />
                        <span className="text-white font-bold">{art.name}</span>
                      </div>
                      <p className="text-zinc-400 text-[11px] mt-0.5">{art.file} · {art.size}</p>
                      <p className="text-lime-400 text-[11px] font-bold mt-0.5">
                        Target: {art.target} | Entry: {art.entry}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="text-lime-400 text-[10px] bg-lime-400/10 px-2 py-0.5 rounded border border-lime-400/30 font-bold block">
                        [ READY FOR STREAMING ]
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: LICENSES & MINTING */}
          {activeTab === 'licenses' && (
            <div className="space-y-4">
              {/* Mint new code form */}
              <form onSubmit={handleMint} className="p-4 rounded bg-[#0c0d0e] border border-[#232529] space-y-3 text-xs">
                <span className="text-lime-400 font-bold block uppercase">
                  Mint New Activation Code (/api/admin/mint)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase block mb-1">Target Game</label>
                    <select
                      value={mintGame}
                      onChange={(e) => setMintGame(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#141518] border border-[#232529] rounded text-white"
                    >
                      <option value="d9-escape-from-tarkov">Escape from Tarkov</option>
                      <option value="d9-tarkov-arena">Escape from Tarkov: Arena</option>
                      <option value="all">All Games (Lifetime Pass)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase block mb-1">Subscription Duration</label>
                    <select
                      value={mintTier}
                      onChange={(e) => setMintTier(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 bg-[#141518] border border-[#232529] rounded text-white"
                    >
                      <option value="1_week">1 Week ($14.99)</option>
                      <option value="1_month">1 Month ($34.99)</option>
                      <option value="1_year">1 Year ($114.99)</option>
                      <option value="lifetime">Lifetime</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  {mintedCode && (
                    <span className="text-lime-400 font-bold text-xs select-all">
                      Minted: {mintedCode}
                    </span>
                  )}
                  <button
                    type="submit"
                    className="ml-auto px-4 py-2 rounded bg-lime-400 hover:bg-lime-300 text-black font-black uppercase tracking-wider cursor-pointer"
                  >
                    Generate & Save Key
                  </button>
                </div>
              </form>

              {/* Licenses Table */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-zinc-400 uppercase block">
                  Active Database Keys ({licenses.length})
                </span>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {licenses.map((lic, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded bg-[#0c0d0e] border border-[#232529] flex items-center justify-between text-xs font-mono"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <code className="text-lime-400 font-bold">{lic.code}</code>
                          <span className="text-[10px] text-zinc-400">({lic.durationLabel})</span>
                          {lic.revoked && <span className="text-rose-400 text-[10px] font-bold">[REVOKED]</span>}
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          Bound User: <span className="text-white">{lic.boundUsername || 'Unbound (Ready)'}</span>
                          {lic.expiresAt && ` · Exp: ${new Date(lic.expiresAt).toLocaleDateString()}`}
                        </p>
                      </div>

                      {!lic.revoked && (
                        <button
                          onClick={() => handleRevoke(lic.code)}
                          className="px-2 py-1 rounded bg-rose-950/40 hover:bg-rose-900 border border-rose-800 text-rose-300 text-[10px] font-bold uppercase cursor-pointer"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE STREAMS */}
          {activeTab === 'streams' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 uppercase font-bold">
                  Recent ChaCha20-Poly1305 Stream Dispatches ({streams.length})
                </span>
                <button
                  onClick={fetchStreams}
                  className="text-lime-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Refresh</span>
                </button>
              </div>

              {streams.length === 0 ? (
                <div className="py-8 text-center text-zinc-500 text-xs">
                  No module stream dispatches recorded yet. Launch a module from the thin launcher to see live telemetry.
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {streams.map((stm, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded bg-[#0c0d0e] border border-[#232529] space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lime-400 font-bold">
                          Stream ID: {stm.id}
                        </span>
                        <span className="text-zinc-500 text-[10px]">
                          {new Date(stm.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-zinc-300 text-[11px] flex justify-between">
                        <span>User: <strong className="text-white">{stm.username}</strong> ({stm.gameId})</span>
                        <span className="text-lime-300 font-bold">{stm.cipherBytes} bytes (encrypted block)</span>
                      </div>
                      <div className="text-zinc-500 text-[10px] truncate">
                        Artifact: {stm.artifactFile} | Poly1305 Tag: {stm.tagHex} | Nonce: {stm.nonceHex}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
