import React from 'react';
import { ModuleItem } from '../types';
import { Plus, Check, Shield } from 'lucide-react';

interface ModuleSelectorProps {
  modules: ModuleItem[];
  activeModuleId: string;
  onSelectModule: (id: string) => void;
  onOpenCreator: () => void;
}

export const ModuleSelector: React.FC<ModuleSelectorProps> = ({
  modules,
  activeModuleId,
  onSelectModule,
  onOpenCreator,
}) => {
  return (
    <div className="border-b border-[#232529] bg-[#121316]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 font-mono">
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          <div className="flex items-center gap-2 text-xs text-zinc-400 mr-2 uppercase tracking-wider">
            <span className="text-lime-400 font-bold">USER: OPD9</span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-400 text-[11px]">LIBRARY:</span>
          </div>
          {modules
            .filter((mod) => {
              const s = mod.status;
              if (s === 'Updating' || s === 'Detected') return false;
              const nameLower = mod.name.toLowerCase();
              const idLower = mod.id.toLowerCase();
              if (nameLower.includes('arena') || idLower.includes('arena') || nameLower.includes('sdk harness') || idLower.includes('sdk')) {
                return false;
              }
              return true;
            })
            .map((mod) => {
              const isActive = mod.id === activeModuleId;
              const isTesting = mod.status === 'Testing';
              const totalAvailableSlots =
                (mod.tiers['1_week'].maxSlots - mod.tiers['1_week'].claimedSlots) +
                (mod.tiers['1_month'].maxSlots - mod.tiers['1_month'].claimedSlots) +
                (mod.tiers['1_year'].maxSlots - mod.tiers['1_year'].claimedSlots);

              return (
                <button
                  key={mod.id}
                  onClick={() => onSelectModule(mod.id)}
                  className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-semibold transition-all whitespace-nowrap border ${
                    isActive
                      ? isTesting
                        ? 'bg-[#181a1d] text-white border-cyan-400/80 shadow-sm'
                        : 'bg-[#181a1d] text-white border-lime-400/80 shadow-sm'
                      : 'bg-[#0f1012] text-zinc-400 border-[#232529] hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  <Shield
                    className={`w-3 h-3 ${
                      isActive
                        ? isTesting
                          ? 'text-cyan-400'
                          : 'text-lime-400'
                        : 'text-zinc-500'
                    }`}
                  />
                  <span className="font-bold tracking-tight">{mod.name}</span>
                  {isTesting ? (
                    <span className="text-cyan-400 text-[10px] font-bold">[ TESTING MODE ]</span>
                  ) : isActive ? (
                    <span className="text-lime-400 text-[10px] font-bold">[ ACTIVE ]</span>
                  ) : (
                    <span className="text-zinc-500 text-[10px]">[{totalAvailableSlots} SLOTS]</span>
                  )}
                </button>
              );
            })}
        </div>

        <button
          onClick={onOpenCreator}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold text-lime-400 hover:text-black hover:bg-lime-400 border border-lime-400/40 transition-all whitespace-nowrap uppercase tracking-wider"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Module</span>
        </button>
      </div>
    </div>
  );
};
