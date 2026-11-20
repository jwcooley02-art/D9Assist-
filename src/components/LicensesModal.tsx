import React, { useState } from 'react';
import { OrderRecord } from '../types';
import { X, Key, Copy, CheckCheck, Download, Clock, ShieldCheck, Terminal, Play } from 'lucide-react';

interface LicensesModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: OrderRecord[];
  onOpenBuyWindows: () => void;
  onLaunchModule?: (code: string) => void;
}

export const LicensesModal: React.FC<LicensesModalProps> = ({
  isOpen,
  onClose,
  orders,
  onOpenBuyWindows,
  onLaunchModule,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSimulateDownload = (order: OrderRecord) => {
    const content = `[D9ASSIST MODULE INJECTION PROFILE]
Module: ${order.moduleName}
Subscription Tier: ${order.tierName}
Activation Code: ${order.licenseKey}
User: ${order.customerHandle}
Issued: ${new Date(order.purchasedAt).toISOString()}
Expires: ${new Date(order.expiresAt).toISOString()}
Security: RING-0 ZERO-DISK STREAM
Delivery Endpoint: http://127.0.0.1:8443
`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `D9_${order.moduleName.replace(/\s+/g, '_')}_Profile.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in font-mono">
      <div className="relative w-full max-w-2xl bg-[#141518] border border-[#232529] rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header matching Screenshot 1: D9ASSIST // GAME LIBRARY [ ACTIVE SESSION: VERIFIED ] */}
        <div className="px-5 py-3 border-b border-[#232529] flex items-center justify-between bg-[#0e0f11]">
          <div className="flex items-center gap-2">
            <span className="text-lime-400 font-bold text-xs sm:text-sm">
              D9ASSIST // GAME LIBRARY
            </span>
            <span className="text-zinc-500 text-xs hidden sm:inline">[ ACTIVE SESSION: VERIFIED ]</span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Subhead matching Screenshot 1: USER: OPD9, STATUS: ACTIVE SUBSCRIPTION */}
        <div className="px-5 py-2.5 bg-[#0c0d0e] border-b border-[#232529] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-lime-400 font-bold">USER: OPD9</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
            <span>STATUS: ACTIVE ACCESS</span>
            <span className="text-zinc-600">·</span>
            <span className="text-lime-400 font-bold">[{orders.length} ACTIVE MODULES]</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {orders.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <Key className="w-10 h-10 text-zinc-700 mx-auto" />
              <h4 className="text-sm font-bold text-zinc-300 uppercase">
                No active library licenses bound
              </h4>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto font-sans">
                You have not acquired any D9Assist module subscription passes yet. Select an open buy window to reserve a slot.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenBuyWindows();
                  }}
                  className="px-5 py-2.5 rounded bg-lime-400 hover:bg-lime-300 text-black text-xs font-black transition-all uppercase tracking-wider cursor-pointer"
                >
                  View Open Buy Windows
                </button>
              </div>
            </div>
          ) : (
            orders.map((ord) => {
              const isExpired = Date.now() > ord.expiresAt;
              const remainingDays = Math.max(
                0,
                Math.ceil((ord.expiresAt - Date.now()) / (1000 * 60 * 60 * 24))
              );

              return (
                <div
                  key={ord.id}
                  className="p-4 sm:p-5 rounded bg-[#0c0d0e] border border-[#232529] space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-white uppercase">
                          {ord.moduleName}
                        </h4>
                        <span className="text-lime-400 text-xs font-bold">
                          [ PURCHASED & ACTIVE ]
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Dual Engine PvE & PvP | Zero-Disk Stream
                      </p>
                      <p className="text-[11px] text-lime-400 font-bold mt-0.5">
                        Target Module: EscapeFromTarkov.exe (Unity 2022.3)
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleSimulateDownload(ord)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1e2025] hover:bg-[#282a31] text-zinc-300 text-xs font-bold uppercase cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Config</span>
                      </button>

                      <button
                        onClick={() => {
                          if (onLaunchModule) {
                            onLaunchModule(ord.licenseKey);
                          }
                        }}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-lime-400 hover:bg-lime-300 text-black text-xs font-black uppercase tracking-wider cursor-pointer shadow"
                      >
                        <Play className="w-3.5 h-3.5 fill-black" />
                        <span>Launch Module</span>
                      </button>
                    </div>
                  </div>

                  {/* Activation Code Box */}
                  <div className="flex items-center justify-between gap-2 p-2.5 bg-[#141518] rounded border border-lime-400/50">
                    <div className="flex items-center gap-2 min-w-0">
                      <Terminal className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                      <code className="text-xs sm:text-sm font-black text-lime-400 select-all truncate">
                        {ord.licenseKey}
                      </code>
                    </div>
                    <button
                      onClick={() => handleCopy(ord.licenseKey)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-lime-400 hover:bg-lime-300 text-black text-xs font-black rounded shrink-0 uppercase cursor-pointer"
                    >
                      {copiedKey === ord.licenseKey ? (
                        <>
                          <CheckCheck className="w-3 h-3" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Dates & Status */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] text-zinc-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Plan: {ord.tierName} ({remainingDays} Days Left)</span>
                    </span>
                    <span className="flex items-center gap-1 text-lime-400 font-bold">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Status: Verified (Permanent)</span>
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
