import React from 'react';
import { ModuleItem, SubscriptionDuration, SubscriptionTier } from '../types';
import { Check, ShieldAlert, Zap, Clock, Users } from 'lucide-react';

interface BuyWindowsProps {
  module: ModuleItem;
  onSelectTier: (tier: SubscriptionTier) => void;
  onJoinWaitlist: (tierId: SubscriptionDuration) => void;
}

export const BuyWindows: React.FC<BuyWindowsProps> = ({
  module,
  onSelectTier,
  onJoinWaitlist,
}) => {
  const tiersList: SubscriptionTier[] = [
    module.tiers['1_week'],
    module.tiers['1_month'],
    module.tiers['1_year'],
  ];

  return (
    <section id="buy-windows" className="py-14 bg-[#0c0d0e] border-b border-[#232529]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-2 text-xs font-mono text-lime-400 uppercase tracking-wider mb-2 font-bold">
            <span>D9ASSIST // SUBSCRIPTION ACCESS</span>
            <span aria-hidden="true">·</span>
            <span>10 SLOTS PER TIER</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase font-mono">
            {module.name} Buy Windows
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-zinc-400 font-mono">
            Zero-disk streaming memory architecture. Hard-capped at 10 weekly, 10 monthly, and 10 annual slots to guarantee zero detection profile.
          </p>
        </div>

        {/* 3 Purchase Windows Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch font-mono">
          {tiersList.map((tier) => {
            const remaining = Math.max(0, tier.maxSlots - tier.claimedSlots);
            const isSoldOut = remaining <= 0;
            const percentageLeft = Math.round((remaining / tier.maxSlots) * 100);
            const isRecommended = tier.recommended;

            return (
              <div
                key={tier.id}
                className={`relative flex flex-col justify-between rounded-lg p-6 sm:p-7 transition-all border ${
                  isRecommended
                    ? 'bg-[#141518] border-lime-400/70 shadow-lg shadow-lime-400/5'
                    : 'bg-[#121316] border-[#232529] hover:border-zinc-700'
                }`}
              >
                {/* Recommended Tag */}
                {isRecommended && (
                  <div className="absolute -top-3 left-6 flex items-center gap-1.5 px-2.5 py-0.5 bg-lime-400 text-black text-[10px] font-black uppercase tracking-wider rounded">
                    <span>[ MOST POPULAR WINDOW ]</span>
                  </div>
                )}

                <div>
                  {/* Top Tier Info */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <h3 className="text-base font-bold text-white tracking-tight uppercase">
                      {tier.name}
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                      <Clock className="w-3.5 h-3.5 text-lime-400" />
                      <span>{tier.durationLabel}</span>
                    </div>
                  </div>

                  {/* Pricing Display */}
                  <div className="mb-6 pb-6 border-b border-[#232529]">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-black text-white tracking-tight tabular-nums">
                        ${tier.price.toFixed(2)}
                      </span>
                      <span className="text-xs text-zinc-400 font-medium">
                        / {tier.id === '1_week' ? 'week' : tier.id === '1_month' ? 'month' : 'year'}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-zinc-500">
                      Subscription access · 1-click renewal control
                    </p>
                  </div>

                  {/* Slot Allocation Gauge */}
                  <div className="mb-6 p-4 rounded bg-[#0b0c0e] border border-[#232529]">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-zinc-400 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Available Slots:</span>
                      </span>
                      <span
                        className={`font-bold tabular-nums ${
                          isSoldOut
                            ? 'text-rose-400'
                            : remaining <= 3
                            ? 'text-lime-300'
                            : 'text-lime-400'
                        }`}
                      >
                        {isSoldOut ? '0 SLOTS (SOLD OUT)' : `${remaining} OF ${tier.maxSlots} OPEN`}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#1e2025] h-2 rounded overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isSoldOut
                            ? 'bg-rose-500'
                            : remaining <= 3
                            ? 'bg-lime-300'
                            : 'bg-lime-400'
                        }`}
                        style={{ width: `${percentageLeft}%` }}
                      />
                    </div>

                    <div className="mt-2 text-[10px] text-zinc-500 flex justify-between">
                      <span>HARD LIMIT: {tier.maxSlots} SLOTS</span>
                      <span>ACTIVE OPERATORS: {tier.claimedSlots}</span>
                    </div>
                  </div>

                  {/* Perks Checklist */}
                  <div className="space-y-3 mb-8">
                    <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                      Module Capabilities:
                    </p>
                    <ul className="space-y-2 text-xs text-zinc-300">
                      {tier.perks.map((perk, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-lime-400 shrink-0 mt-0.5 stroke-[2.5]" />
                          <span className="leading-relaxed">{perk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Purchase or Waitlist Action */}
                <div>
                  {isSoldOut ? (
                    <button
                      onClick={() => onJoinWaitlist(tier.id)}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded text-xs font-bold text-rose-300 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/80 transition-colors cursor-pointer uppercase tracking-wider"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>Sold Out · Join Slot Queue</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onSelectTier(tier)}
                      className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded text-xs font-black transition-all cursor-pointer uppercase tracking-wider ${
                        isRecommended
                          ? 'bg-lime-400 hover:bg-lime-300 text-black shadow-md shadow-lime-400/20'
                          : 'bg-white hover:bg-zinc-200 text-black'
                      }`}
                    >
                      <Zap className="w-4 h-4 fill-current" />
                      <span>
                        Purchase {tier.name} (${tier.price.toFixed(2)})
                      </span>
                    </button>
                  )}
                  <p className="text-center text-[10px] text-zinc-500 mt-2">
                    Instant activation code release · D9Assist bind ready
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
