import React from 'react';

interface FooterProps {
  onOpenCreator: () => void;
  onSelectTab: (tab: 'overview' | 'buy' | 'media' | 'specs' | 'download') => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenCreator, onSelectTab }) => {
  return (
    <footer className="bg-[#0c0d0e] border-t border-[#232529] py-12 text-zinc-400 font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-[#232529]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-lime-400 tracking-tight uppercase block">
                D9ASSIST
              </span>
              <span className="text-zinc-600">//</span>
              <span className="text-xs text-white uppercase font-bold">MODULE PLATFORM</span>
            </div>
            <p className="text-xs text-zinc-500 mt-1 max-w-md font-sans">
              Tactical gaming modules with zero-disk stream memory architecture, strict 10-slot quota management, and multi-tier subscription access.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs uppercase font-medium">
            <button
              onClick={() => onSelectTab('overview')}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Overview
            </button>
            <button
              onClick={() => onSelectTab('buy')}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Buy Windows
            </button>
            <button
              onClick={() => onSelectTab('media')}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Media Showcase
            </button>
            <button
              onClick={() => onSelectTab('download')}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Web Launcher
            </button>
            <button
              onClick={() => onSelectTab('specs')}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Specifications
            </button>
            <button
              onClick={onOpenCreator}
              className="text-lime-400 hover:text-lime-300 font-bold transition-colors cursor-pointer"
            >
              + Creator Studio
            </button>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© 2026 D9Assist. All module slots subject to hard capacity limits.</p>
          <div className="flex items-center gap-4">
            <span className="text-lime-400 font-bold">Slots Capped: 10 Annual · 10 Monthly · 10 Weekly</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
