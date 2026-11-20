import React from 'react';
import { Key, Play, Database, Download, ShieldCheck, User } from 'lucide-react';
import { UserAccount } from '../types';

interface HeaderProps {
  orderCount: number;
  currentUser: UserAccount | null;
  onOpenLicenses: () => void;
  onOpenCreator: () => void;
  onOpenLauncher: () => void;
  onOpenVault: () => void;
  onOpenAuth: () => void;
  onOpenRoles: () => void;
  activeTab: string;
  onSelectTab: (tab: 'overview' | 'buy' | 'media' | 'specs' | 'download') => void;
}

export const Header: React.FC<HeaderProps> = ({
  orderCount,
  currentUser,
  onOpenLicenses,
  onOpenCreator,
  onOpenLauncher,
  onOpenVault,
  onOpenAuth,
  onOpenRoles,
  activeTab,
  onSelectTab,
}) => {
  const isAdmin = currentUser?.role === 'Admin';

  return (
    <header className="sticky top-0 z-40 bg-[#0c0d0e]/95 backdrop-blur-md border-b border-[#232529]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onSelectTab('overview');
          }}
          className="flex items-center gap-2 text-base font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity font-mono uppercase"
        >
          <span className="text-lime-400">D9ASSIST</span>
          <span className="text-zinc-600">//</span>
          <span className="text-zinc-300 text-xs">MODULE STORE</span>
        </a>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden lg:flex items-center gap-5 text-xs font-mono font-medium text-zinc-400">
          <button
            onClick={() => onSelectTab('overview')}
            className={`whitespace-nowrap shrink-0 transition-colors uppercase cursor-pointer ${
              activeTab === 'overview'
                ? 'text-lime-400 font-bold'
                : 'hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onSelectTab('buy')}
            className={`whitespace-nowrap shrink-0 transition-colors uppercase cursor-pointer ${
              activeTab === 'buy'
                ? 'text-lime-400 font-bold'
                : 'hover:text-white'
            }`}
          >
            Buy Windows
          </button>
          <button
            onClick={() => onSelectTab('media')}
            className={`whitespace-nowrap shrink-0 transition-colors uppercase cursor-pointer ${
              activeTab === 'media'
                ? 'text-lime-400 font-bold'
                : 'hover:text-white'
            }`}
          >
            Media Showcase
          </button>
          <button
            onClick={() => onSelectTab('download')}
            className={`whitespace-nowrap shrink-0 transition-colors uppercase cursor-pointer flex items-center gap-1 ${
              activeTab === 'download'
                ? 'text-lime-400 font-bold'
                : 'hover:text-white'
            }`}
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Web Launcher</span>
          </button>
          <button
            onClick={onOpenLauncher}
            className="text-lime-400 hover:text-lime-300 whitespace-nowrap shrink-0 transition-colors font-bold uppercase cursor-pointer flex items-center gap-1"
          >
            <Play className="w-3 h-3 fill-lime-400" />
            <span>Live Stream HUD</span>
          </button>

          {isAdmin && (
            <>
              <button
                onClick={onOpenRoles}
                className="text-zinc-400 hover:text-lime-400 whitespace-nowrap shrink-0 transition-colors uppercase cursor-pointer flex items-center gap-1 text-[11px]"
              >
                <ShieldCheck className="w-3 h-3 text-lime-400" />
                <span>Roles & Access</span>
              </button>
              <button
                onClick={onOpenVault}
                className="text-zinc-400 hover:text-lime-400 whitespace-nowrap shrink-0 transition-colors uppercase cursor-pointer flex items-center gap-1 text-[11px]"
              >
                <Database className="w-3 h-3 text-zinc-500" />
                <span>Vault</span>
              </button>
              <button
                onClick={onOpenCreator}
                className="text-zinc-500 hover:text-white whitespace-nowrap shrink-0 transition-colors text-[11px] uppercase cursor-pointer"
              >
                Creator
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Primary action + Account state */}
        <div className="flex items-center gap-3 shrink-0">
          {currentUser ? (
            <button
              onClick={onOpenRoles}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono bg-[#141518] hover:bg-[#1a1c20] border border-[#232529] rounded transition-all text-zinc-300 cursor-pointer"
              title="Click to manage roles & test switcher"
            >
              <User className="w-3 h-3 text-lime-400" />
              <span className="font-bold text-white text-[11px]">{currentUser.username}</span>
              <span
                className={`text-[9px] px-1 py-0.2 rounded font-black uppercase tracking-wider ${
                  currentUser.role === 'Admin'
                    ? 'bg-lime-400/20 text-lime-400 border border-lime-400/40'
                    : currentUser.role === 'VIP'
                    ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/40'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {currentUser.role}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="text-xs font-mono font-bold text-zinc-300 hover:text-white px-2.5 py-1 bg-[#141518] border border-[#232529] rounded uppercase cursor-pointer"
            >
              Sign In
            </button>
          )}

          <button
            onClick={onOpenLicenses}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono font-bold text-black bg-lime-400 hover:bg-lime-300 rounded transition-all whitespace-nowrap shrink-0 shadow-sm uppercase tracking-wider cursor-pointer"
          >
            <Key className="w-3.5 h-3.5 text-black stroke-[2.5]" />
            <span>My Licenses</span>
            {orderCount > 0 && (
              <span className="text-black bg-black/15 px-1 rounded text-[10px]">
                {orderCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
