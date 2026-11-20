import React, { useState, useEffect } from 'react';
import { ModuleItem, SubscriptionTier, OrderRecord } from '../types';
import { generateLicenseKey } from '../utils/storage';
import { X, Check, ShieldCheck, CreditCard, Coins, Copy, CheckCheck, Clock, Key, Download } from 'lucide-react';

interface CheckoutModalProps {
  module: ModuleItem;
  tier: SubscriptionTier | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: OrderRecord) => void;
  onOpenLauncher?: (code: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  module,
  tier,
  isOpen,
  onClose,
  onOrderSuccess,
  onOpenLauncher,
}) => {
  const [handle, setHandle] = useState('OPD9');
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto' | 'instant'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<OrderRecord | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes reservation

  // Countdown timer for slot reservation
  useEffect(() => {
    if (!isOpen || completedOrder) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, completedOrder]);

  if (!isOpen || !tier) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const remainingSlots = Math.max(0, tier.maxSlots - tier.claimedSlots);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle.trim() || !email.trim()) return;

    setIsProcessing(true);

    // Simulated cryptographic authorization
    setTimeout(() => {
      const gameCode = module.game.toLowerCase().includes('arena') ? 'ARN' : 'EFT';
      const newLicenseKey = generateLicenseKey(gameCode);

      const durationMs =
        tier.id === '1_week'
          ? 7 * 86400000
          : tier.id === '1_month'
          ? 30 * 86400000
          : 365 * 86400000;

      const order: OrderRecord = {
        id: `d9-${Date.now()}`,
        moduleId: module.id,
        moduleName: module.name,
        tierId: tier.id,
        tierName: tier.name,
        price: tier.price,
        licenseKey: newLicenseKey,
        customerHandle: handle.trim(),
        email: email.trim(),
        paymentMethod,
        purchasedAt: Date.now(),
        expiresAt: Date.now() + durationMs,
        status: 'active',
      };

      setIsProcessing(false);
      setCompletedOrder(order);
      onOrderSuccess(order);
    }, 800);
  };

  const handleCopyKey = () => {
    if (!completedOrder) return;
    navigator.clipboard.writeText(completedOrder.licenseKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleModalClose = () => {
    setCompletedOrder(null);
    setEmail('');
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in font-mono">
      <div className="relative w-full max-w-lg bg-[#121316] border border-[#232529] rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar styled like D9Assist Launcher */}
        <div className="px-5 py-3 border-b border-[#232529] flex items-center justify-between bg-[#0e0f11]">
          <div className="flex items-center gap-2">
            <span className="text-lime-400 font-bold text-xs sm:text-sm">
              D9ASSIST // LAUNCHER
            </span>
            <span className="text-zinc-500 text-xs">[ v2.0 - SECURE MEMORY ]</span>
          </div>
          <button
            onClick={handleModalClose}
            className="text-zinc-400 hover:text-white p-1 text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Tab row */}
        <div className="flex border-b border-[#232529] bg-[#0c0d0e] text-xs">
          <div className="flex-1 py-2 text-center text-zinc-400">
            CHECKOUT WINDOW
          </div>
          <div className="flex-1 py-2 text-center border-b-2 border-lime-400 text-lime-400 font-bold">
            REDEEM & BIND
          </div>
        </div>

        {completedOrder ? (
          /* Post-Purchase Confirmed Receipt */
          <div className="p-6 overflow-y-auto space-y-5">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-lime-400/10 border border-lime-400/40 text-lime-400 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h4 className="text-base font-black text-white uppercase">
                Access Granted · Slot Bound
              </h4>
              <p className="text-xs text-zinc-400 font-sans">
                Activation code generated. Locked to username <span className="text-lime-400 font-bold">{completedOrder.customerHandle}</span> for {tier.durationLabel}.
              </p>
            </div>

            {/* Generated License Key Box */}
            <div className="p-4 rounded bg-[#0c0d0e] border border-lime-400/40 space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="flex items-center gap-1.5 text-lime-400 font-bold uppercase">
                  <Key className="w-3.5 h-3.5" />
                  <span>Activation Code (Ctrl+V to Paste)</span>
                </span>
                <span className="text-[10px] text-zinc-500">{tier.name}</span>
              </div>
              
              <div className="flex items-center justify-between gap-2 p-2.5 bg-[#141518] rounded border border-lime-400">
                <code className="text-xs sm:text-sm font-black text-lime-400 tracking-wider select-all truncate">
                  {completedOrder.licenseKey}
                </code>
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="flex items-center gap-1 px-3 py-1 bg-lime-400 hover:bg-lime-300 text-black text-xs font-black rounded shrink-0 uppercase"
                >
                  {copiedKey ? (
                    <>
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Invoice Summary */}
            <div className="p-3.5 rounded bg-[#0c0d0e] border border-[#232529] space-y-1.5 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Receipt:</span>
                <span className="text-white">{completedOrder.id}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Username:</span>
                <span className="text-lime-400 font-bold">{completedOrder.customerHandle}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Delivery:</span>
                <span className="text-white">{completedOrder.email}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Total Paid:</span>
                <span className="text-lime-400 font-bold">${completedOrder.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Session Status:</span>
                <span className="text-lime-400 font-bold">[ VERIFIED ACTIVE ]</span>
              </div>
            </div>

            {/* Launch Instructions */}
            <div className="p-3.5 rounded bg-[#0c0d0e] border border-[#232529] text-xs space-y-2">
              <h5 className="font-bold text-white flex items-center gap-1.5 uppercase">
                <Download className="w-3.5 h-3.5 text-lime-400" />
                <span>Launch Handshake Protocol:</span>
              </h5>
              <ol className="list-decimal list-inside space-y-1 text-zinc-400 text-[11px] leading-relaxed font-sans">
                <li>Launch D9Assist launcher v2.0 as Administrator.</li>
                <li>Go to Redeem Code tab and paste your code.</li>
                <li>Press "Redeem & Bind Account" to complete memory handshake.</li>
              </ol>
            </div>

            <div className="pt-1 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => {
                  const code = completedOrder.licenseKey;
                  handleModalClose();
                  if (onOpenLauncher) {
                    onOpenLauncher(code);
                  }
                }}
                className="flex-1 py-3 bg-lime-400 hover:bg-lime-300 text-black font-black text-xs rounded transition-colors cursor-pointer uppercase tracking-wider flex items-center justify-center gap-1.5 shadow"
              >
                <span>Launch in D9Assist (v2.0)</span>
              </button>
              <button
                type="button"
                onClick={handleModalClose}
                className="py-3 px-4 bg-[#1e2025] hover:bg-[#282a31] text-zinc-300 font-bold text-xs rounded transition-colors cursor-pointer uppercase tracking-wider"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* Pre-Purchase Checkout Form matching launcher UI */
          <form onSubmit={handleCheckout} className="p-6 overflow-y-auto space-y-4">
            {/* Slot Reservation Banner */}
            <div className="p-2.5 rounded bg-[#0c0d0e] border border-[#232529] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-zinc-300">
                <Clock className="w-3.5 h-3.5 text-lime-400" />
                <span>Slot Reserved:</span>
              </div>
              <span className="text-lime-400 font-bold tabular-nums">
                {formattedTime} [ 1 OF {tier.maxSlots} SLOTS ]
              </span>
            </div>

            {/* Target Module Summary */}
            <div className="p-3.5 rounded bg-[#0c0d0e] border border-[#232529] space-y-1.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-white uppercase">{module.name}</h4>
                  <p className="text-[11px] text-zinc-400">{tier.name} · {tier.durationLabel}</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-lime-400 tabular-nums">
                    ${tier.price.toFixed(2)}
                  </span>
                  <p className="text-[10px] text-zinc-500">Subscription</p>
                </div>
              </div>
              <div className="pt-2 border-t border-[#232529] flex items-center justify-between text-[10px] text-zinc-400">
                <span>Remaining Pool:</span>
                <span className="text-lime-400 font-bold">{remainingSlots} of {tier.maxSlots} slots</span>
              </div>
            </div>

            {/* Account Username */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                Account Username
              </label>
              <input
                type="text"
                required
                placeholder="OPD9"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="w-full px-3 py-2 bg-[#0c0d0e] border border-[#232529] focus:border-lime-400 rounded text-xs text-lime-400 font-bold placeholder-zinc-600 focus:outline-none"
              />
            </div>

            {/* Delivery Email */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                Delivery Email Address
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

            {/* Payment Method Selector */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                Payment Channel
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded border transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-lime-400/10 border-lime-400 text-lime-400 font-bold'
                      : 'bg-[#0c0d0e] border-[#232529] text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Card Checkout</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('crypto')}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded border transition-all ${
                    paymentMethod === 'crypto'
                      ? 'bg-lime-400/10 border-lime-400 text-lime-400 font-bold'
                      : 'bg-[#0c0d0e] border-[#232529] text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Crypto (BTC/ETH/XMR)</span>
                </button>
              </div>
            </div>

            {/* Policy Check */}
            <div className="flex items-start gap-2 text-[10px] text-zinc-400 font-sans">
              <ShieldCheck className="w-3.5 h-3.5 text-lime-400 shrink-0 mt-0.5" />
              <span>
                Zero-disk stream verified. Slot allocation is bound immediately upon authorization with zero latency.
              </span>
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 px-4 rounded bg-lime-400 hover:bg-lime-300 text-black text-xs font-black shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Redeeming & Binding Slot...</span>
                  </>
                ) : (
                  <span>
                    Redeem & Bind Account (${tier.price.toFixed(2)})
                  </span>
                )}
              </button>
              <p className="text-center text-[10px] text-zinc-500 mt-2">
                Delivery Endpoint: http://127.0.0.1:8443
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
