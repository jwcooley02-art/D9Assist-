import React, { useState } from 'react';
import { ModuleItem, SubscriptionDuration, WaitlistEntry } from '../types';
import { saveStoredWaitlist } from '../utils/storage';
import { X, Check, BellRing } from 'lucide-react';

interface WaitlistModalProps {
  module: ModuleItem;
  tierId: SubscriptionDuration | null;
  isOpen: boolean;
  onClose: () => void;
}

export const WaitlistModal: React.FC<WaitlistModalProps> = ({
  module,
  tierId,
  isOpen,
  onClose,
}) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !tierId) return null;

  const tier = module.tiers[tierId];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    const entry: WaitlistEntry = {
      id: `wl-${Date.now()}`,
      moduleId: module.id,
      moduleName: module.name,
      tierId,
      email: email.trim(),
      createdAt: Date.now(),
    };

    saveStoredWaitlist(entry);
    setSubmitted(true);
  };

  const handleClose = () => {
    setSubmitted(false);
    setEmail('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-sm animate-fade-in font-mono">
      <div className="relative w-full max-w-md bg-[#141518] border border-[#232529] rounded-lg shadow-2xl overflow-hidden p-6">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded bg-[#1e2025] text-zinc-400 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {submitted ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-lime-400/10 border border-lime-400/40 text-lime-400 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h3 className="text-base font-bold text-white uppercase">Waitlist Reserved</h3>
            <p className="text-xs text-zinc-400 font-sans">
              Notified dispatch queue. When an active {tier.name} slot expires, an authorization link will be dispatched to <span className="text-lime-400 font-bold">{email}</span>.
            </p>
            <button
              onClick={handleClose}
              className="mt-4 px-5 py-2.5 bg-[#1e2025] hover:bg-[#282a31] text-zinc-200 text-xs font-bold rounded uppercase cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 text-lime-400 text-xs font-bold uppercase tracking-wider">
              <BellRing className="w-4 h-4" />
              <span>D9ASSIST // PRIORITY SLOT WAITLIST</span>
            </div>

            <div>
              <h3 className="text-base font-bold text-white uppercase">
                {module.name} · {tier.name}
              </h3>
              <p className="text-xs text-zinc-400 mt-1 font-sans">
                All {tier.maxSlots} slots are currently claimed by active operators. Enter your email to receive immediate notification when a slot opens up.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                Notification Email
              </label>
              <input
                type="email"
                required
                placeholder="operator@proton.me"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[#0c0d0e] border border-[#232529] focus:border-lime-400 rounded text-xs text-white placeholder-zinc-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-lime-400 hover:bg-lime-300 text-black font-black text-xs rounded transition-colors cursor-pointer uppercase tracking-wider"
            >
              Join Slot Waitlist
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
