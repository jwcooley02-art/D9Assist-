import React from 'react';
import { ModuleItem } from '../types';
import { Cpu, ShieldCheck, History, Check, Terminal } from 'lucide-react';

interface ModuleDetailsProps {
  module: ModuleItem;
}

export const ModuleDetails: React.FC<ModuleDetailsProps> = ({ module }) => {
  return (
    <section id="module-specs" className="py-14 bg-[#0c0d0e] border-b border-[#232529] font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Architecture & Feature Breakdown */}
        <div>
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="flex items-center justify-center gap-2 text-xs text-lime-400 uppercase tracking-wider mb-2 font-bold">
              <span>D9ASSIST // TECHNICAL SPECIFICATIONS</span>
              <span aria-hidden="true">·</span>
              <span>RUNTIME INVARIANTS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
              Engineered for High-Stakes Operations
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-zinc-400">
              Low-overhead background calculations running outside user-space memory hooks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {module.features.map((feat, idx) => (
              <div
                key={idx}
                className="p-5 sm:p-6 rounded-lg bg-[#141518] border border-[#232529] space-y-2 hover:border-lime-400/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-lime-400/10 border border-lime-400/30 flex items-center justify-center text-lime-400 shrink-0 mt-0.5">
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white tracking-tight uppercase">
                      {feat.title}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-400 leading-relaxed font-sans">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Requirements & Changelog Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
          {/* Requirements (5 cols) */}
          <div className="lg:col-span-5 p-5 sm:p-6 rounded-lg bg-[#141518] border border-[#232529] space-y-4">
            <div className="flex items-center gap-2 text-xs text-lime-400 uppercase tracking-wider font-bold">
              <Cpu className="w-4 h-4" />
              <span>Target & Host Requirements</span>
            </div>
            <h3 className="text-base font-bold text-white uppercase">System Prerequisites</h3>

            <div className="space-y-2.5 pt-1">
              {module.requirements.map((req, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded bg-[#0c0d0e] border border-[#232529] text-xs"
                >
                  <span className="text-zinc-500 block text-[10px] uppercase">
                    {req.label}
                  </span>
                  <span className="text-lime-300 font-bold mt-0.5 block truncate">
                    {req.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Changelog & Deployment History (7 cols) */}
          <div className="lg:col-span-7 p-5 sm:p-6 rounded-lg bg-[#141518] border border-[#232529] space-y-4">
            <div className="flex items-center gap-2 text-xs text-lime-400 uppercase tracking-wider font-bold">
              <History className="w-4 h-4" />
              <span>Deployment Changelog</span>
            </div>
            <h3 className="text-base font-bold text-white uppercase">Build & Maintenance History</h3>

            <div className="space-y-3 pt-1">
              {module.changelog.map((entry, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded bg-[#0c0d0e] border border-[#232529] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-lime-400">
                      [{entry.version}]
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      {entry.date}
                    </span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-zinc-300">
                    {entry.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex items-start gap-2">
                        <span className="text-lime-400 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
