import React, { useState, useEffect } from 'react';
import { ModuleItem } from '../types';
import { ShoppingCart, Film, ShieldCheck, Terminal, Cpu, ChevronLeft, ChevronRight, Play } from 'lucide-react';

interface ModuleHeroProps {
  module: ModuleItem;
  onScrollToBuy: () => void;
  onSelectTab: (tab: 'overview' | 'buy' | 'media' | 'specs') => void;
}

export const ModuleHero: React.FC<ModuleHeroProps> = ({
  module,
  onScrollToBuy,
  onSelectTab,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isSlideshowPaused, setIsSlideshowPaused] = useState(false);

  const totalSlides = module.media.length > 0 ? module.media.length : 1;
  const currentMedia = module.media[currentSlideIndex] || null;

  // Auto-play slideshow every 4.5 seconds when not hovered
  useEffect(() => {
    if (isSlideshowPaused || totalSlides <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % totalSlides);
    }, 4500);
    return () => clearInterval(interval);
  }, [isSlideshowPaused, totalSlides]);

  // Keep index in range if module changes
  useEffect(() => {
    setCurrentSlideIndex(0);
  }, [module.id]);

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % totalSlides);
  };

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const weekRemaining = module.tiers['1_week'].maxSlots - module.tiers['1_week'].claimedSlots;
  const monthRemaining = module.tiers['1_month'].maxSlots - module.tiers['1_month'].claimedSlots;
  const yearRemaining = module.tiers['1_year'].maxSlots - module.tiers['1_year'].claimedSlots;
  const totalRemaining = weekRemaining + monthRemaining + yearRemaining;
  const totalSlots = module.tiers['1_week'].maxSlots + module.tiers['1_month'].maxSlots + module.tiers['1_year'].maxSlots;

  return (
    <section className="relative overflow-hidden border-b border-[#232529] bg-[#0c0d0e]">
      {/* Background Media with Contrast Scrim */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img
          src={module.coverImage}
          alt={module.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-25 blur-[1px] scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d0e] via-[#0c0d0e]/85 to-[#0c0d0e]/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c0d0e] via-[#0c0d0e]/95 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Main Info Column */}
          <div className="lg:col-span-7 space-y-5">
            {/* Header Telemetry Line */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-zinc-400 uppercase tracking-wider">
              <span className="text-lime-400 font-bold">D9ASSIST // {module.game}</span>
              <span className="text-zinc-600">[</span>
              <span className="text-zinc-300">ACTIVE SESSION: VERIFIED</span>
              <span className="text-zinc-600">]</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1.5 text-lime-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-lime-400" />
                <span>STATUS: OPERATIONAL</span>
              </span>
            </div>

            {/* Main Headline */}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase font-mono">
                {module.name}
              </h1>
              <p className="mt-2 text-xs sm:text-sm font-mono text-lime-400 font-semibold">
                {module.tagline}
              </p>
            </div>

            {/* Description & Target Line */}
            <div className="space-y-3">
              <p className="text-sm text-zinc-300 max-w-2xl leading-relaxed">
                {module.description}
              </p>

              <div className="p-3 rounded bg-[#141518] border border-[#232529] flex items-center gap-2 text-xs font-mono text-zinc-300">
                <Terminal className="w-4 h-4 text-lime-400 shrink-0" />
                <span className="text-zinc-400">Target Executable:</span>
                <code className="text-lime-300 font-bold truncate">
                  {module.game.includes('Arena') ? 'EscapeFromTarkov.exe (Arena Matchmaking)' : 'EscapeFromTarkov.exe (Unity 2022.3)'}
                </code>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                onClick={onScrollToBuy}
                className="flex items-center gap-2 px-6 py-3 text-xs font-mono font-black text-black bg-lime-400 hover:bg-lime-300 rounded shadow-lg shadow-lime-400/10 transition-all cursor-pointer whitespace-nowrap uppercase tracking-wider"
              >
                <ShoppingCart className="w-4 h-4 stroke-[2.5]" />
                <span>Open Buy Windows ({totalRemaining} Slots Open)</span>
              </button>

              <button
                onClick={() => onSelectTab('media')}
                className="flex items-center gap-2 px-5 py-3 text-xs font-mono font-bold text-zinc-200 bg-[#141518] hover:bg-[#1a1c20] border border-[#27292e] hover:border-lime-400/50 rounded transition-all cursor-pointer whitespace-nowrap uppercase"
              >
                <Film className="w-4 h-4 text-lime-400" />
                <span>Media Showcase ({module.media.length})</span>
              </button>
            </div>

            {/* Slot Quota Telemetry Strip */}
            <div className="pt-4 border-t border-[#232529] flex flex-wrap items-center gap-6 text-xs text-zinc-400 font-mono">
              <div>
                <span className="text-zinc-500 uppercase block text-[10px]">Total Slot Pool</span>
                <span className="text-white font-bold tabular-nums text-sm">
                  {totalRemaining} / {totalSlots} Available
                </span>
              </div>
              <div className="h-6 w-px bg-[#232529] hidden sm:block" />
              <div>
                <span className="text-zinc-500 uppercase block text-[10px]">1 Week Slots</span>
                <span className="text-lime-400 font-bold tabular-nums text-sm">
                  {weekRemaining} of {module.tiers['1_week'].maxSlots} Left
                </span>
              </div>
              <div className="h-6 w-px bg-[#232529] hidden sm:block" />
              <div>
                <span className="text-zinc-500 uppercase block text-[10px]">1 Month Slots</span>
                <span className="text-lime-400 font-bold tabular-nums text-sm">
                  {monthRemaining} of {module.tiers['1_month'].maxSlots} Left
                </span>
              </div>
              <div className="h-6 w-px bg-[#232529] hidden sm:block" />
              <div>
                <span className="text-zinc-500 uppercase block text-[10px]">1 Year Slots</span>
                <span className="text-lime-400 font-bold tabular-nums text-sm">
                  {yearRemaining} of {module.tiers['1_year'].maxSlots} Left
                </span>
              </div>
            </div>
          </div>

          {/* Media Slideshow Column (Replaces static preview box) */}
          <div className="lg:col-span-5">
            <div
              className="relative rounded-lg overflow-hidden border border-[#232529] bg-[#141518] shadow-2xl group select-none"
              onMouseEnter={() => setIsSlideshowPaused(true)}
              onMouseLeave={() => setIsSlideshowPaused(false)}
            >
              {/* Slideshow Display Area */}
              <div className="aspect-video relative overflow-hidden bg-black flex items-center justify-center">
                {currentMedia ? (
                  currentMedia.type === 'video' ? (
                    <div className="relative w-full h-full flex items-center justify-center bg-black">
                      <video
                        key={currentMedia.id}
                        src={currentMedia.url}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-0.5 bg-black/85 backdrop-blur-sm rounded text-[10px] text-lime-400 border border-[#232529] font-bold">
                        <Play className="w-3 h-3 fill-lime-400" />
                        <span>VIDEO DEMO</span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      <img
                        key={currentMedia.id}
                        src={currentMedia.url}
                        alt={currentMedia.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-opacity duration-300"
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-0.5 bg-black/85 backdrop-blur-sm rounded text-[10px] text-zinc-300 border border-[#232529] font-bold">
                        <Film className="w-3 h-3 text-lime-400" />
                        <span>{currentMedia.tag || 'FIELD CAPTURE'}</span>
                      </div>
                    </div>
                  )
                ) : (
                  <img
                    src={module.coverImage}
                    alt={module.name}
                    className="w-full h-full object-cover"
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />

                {/* Slideshow Navigation Arrows */}
                {totalSlides > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevSlide();
                      }}
                      title="Previous media capture"
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/80 hover:bg-black text-white hover:text-lime-400 border border-[#232529] flex items-center justify-center transition-colors opacity-80 hover:opacity-100 cursor-pointer z-20 shadow-lg"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextSlide();
                      }}
                      title="Next media capture"
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/80 hover:bg-black text-white hover:text-lime-400 border border-[#232529] flex items-center justify-center transition-colors opacity-80 hover:opacity-100 cursor-pointer z-20 shadow-lg"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Bottom Overlay Title & Status */}
                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs font-mono pointer-events-none z-10">
                  <div className="min-w-0 pr-2">
                    <span className="text-white font-bold truncate block">
                      {currentMedia?.title || module.name}
                    </span>
                    <span className="text-[10px] text-zinc-400 truncate block">
                      {currentMedia?.caption || 'Verified D9Assist runtime capture'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-lime-400 text-[11px] whitespace-nowrap font-bold">
                      [{currentSlideIndex + 1}/{totalSlides}]
                    </span>
                  </div>
                </div>
              </div>

              {/* Slide Thumbnail Dots Strip */}
              {totalSlides > 1 && (
                <div className="px-3 py-2 bg-[#0c0d0e] border-t border-[#232529] flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {module.media.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentSlideIndex(idx)}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          currentSlideIndex === idx
                            ? 'w-6 bg-lime-400'
                            : 'w-2 bg-[#232529] hover:bg-zinc-600'
                        }`}
                        title={`Slide ${idx + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectTab('media')}
                    className="text-[10px] text-lime-400 hover:underline font-bold uppercase cursor-pointer"
                  >
                    View All Showcase ({totalSlides}) →
                  </button>
                </div>
              )}

              {/* Quick Spec Highlights */}
              <div className="p-3 bg-[#111215] border-t border-[#232529] grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="flex items-center gap-2 text-zinc-300">
                  <Cpu className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span className="truncate">Ring-0 Isolated</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                  <span className="truncate">Zero-Disk Stream</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
