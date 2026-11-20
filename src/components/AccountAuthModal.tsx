import React, { useState } from 'react';
import { UserAccount, UserRole } from '../types';
import { X, Lock, Key, User, Mail, ShieldAlert, CheckCircle2, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';

interface AccountAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserAccount, sessionToken: string) => void;
  onNavigateToBuy: () => void;
}

export const AccountAuthModal: React.FC<AccountAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  onNavigateToBuy,
}) => {
  const [mode, setMode] = useState<'signin' | 'register'>('signin');

  // Sign in fields
  const [loginIdentifier, setLoginIdentifier] = useState('OPD9');
  const [loginPassword, setLoginPassword] = useState('password123');

  // Register fields
  const [regCode, setRegCode] = useState('D9A-LIFE-JEREMY-2026');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Status
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginIdentifier.trim(),
          password: loginPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Invalid username or password.');
        setLoading(false);
        return;
      }

      const role: UserRole =
        loginIdentifier.trim().toLowerCase() === 'jwcooley02@gmail.com' ||
        loginIdentifier.trim().toUpperCase() === 'OPD9'
          ? 'Admin'
          : 'Member';

      const userAccount: UserAccount = {
        id: `user-${Date.now()}`,
        username: data.username || loginIdentifier.trim(),
        email: loginIdentifier.includes('@') ? loginIdentifier.trim() : `${loginIdentifier.trim().toLowerCase()}@d9assist.net`,
        role,
        isOwner: role === 'Admin',
        assignedAt: Date.now(),
      };

      setSuccessMsg('Authentication verified. Access granted.');
      setTimeout(() => {
        onAuthSuccess(userAccount, data.session_token);
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMsg(`Server connection error: ${err.message || 'Failed to authenticate.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterWithCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!regCode.trim()) {
      setErrorMsg('An authentic activation code is required. Account creation is license-gated.');
      return;
    }
    if (!regUsername.trim() || !regEmail.trim() || !regPassword) {
      setErrorMsg('Please complete all required account fields.');
      return;
    }

    setLoading(true);

    try {
      // 1. Redeem and bind code to username
      const redeemRes = await fetch('/api/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: regCode.trim(),
          username: regUsername.trim(),
          password: regPassword,
        }),
      });

      const redeemData = await redeemRes.json();
      if (!redeemRes.ok || !redeemData.success) {
        setErrorMsg(redeemData.message || 'Invalid or already claimed activation code.');
        setLoading(false);
        return;
      }

      // 2. Add user to server database
      const role: UserRole =
        regCode.toUpperCase().includes('LIFE') ||
        regEmail.toLowerCase() === 'jwcooley02@gmail.com' ||
        regUsername.toUpperCase() === 'OPD9'
          ? 'Admin'
          : regCode.toUpperCase().includes('VIP')
          ? 'VIP'
          : 'Member';

      await fetch('/api/users/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requester: 'OPD9',
          username: regUsername.trim(),
          email: regEmail.trim(),
          role,
        }),
      }).catch(() => {});

      // 3. Login with newly bound credentials
      const loginRes = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: regUsername.trim(),
          password: regPassword,
        }),
      });

      const loginData = await loginRes.json();
      const sessionToken = loginData.session_token || `d9s_${Date.now()}`;

      const userAccount: UserAccount = {
        id: `user-${Date.now()}`,
        username: regUsername.trim(),
        email: regEmail.trim(),
        role,
        isOwner: role === 'Admin',
        assignedAt: Date.now(),
      };

      setSuccessMsg('Account created & activation code bound! Launcher download unlocked.');
      setTimeout(() => {
        onAuthSuccess(userAccount, sessionToken);
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg(`Registration error: ${err.message || 'Failed to bind activation code.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in font-mono">
      <div className="relative w-full max-w-lg bg-[#141518] border border-[#232529] rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#232529] flex items-center justify-between bg-[#0e0f11]">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-lime-400" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase">
                D9ASSIST // ACCOUNT GATEWAY
              </h3>
              <p className="text-[11px] text-zinc-400">
                Sign in or register an account with a verified activation code.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-[#1e2025] text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#232529] bg-[#0c0d0e] text-xs">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 text-center font-bold uppercase transition-colors cursor-pointer ${
              mode === 'signin'
                ? 'border-b-2 border-lime-400 text-lime-400'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 text-center font-bold uppercase transition-colors cursor-pointer ${
              mode === 'register'
                ? 'border-b-2 border-lime-400 text-lime-400'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Register with Code
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {errorMsg && (
            <div className="p-2.5 rounded bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 rounded bg-lime-950/40 border border-lime-400/40 text-xs text-lime-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'signin' ? (
            /* TAB 1: SIGN IN */
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                  Username or Email
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="OPD9 or jwcooley02@gmail.com"
                    className="w-full pl-9 pr-3 py-2 bg-[#0c0d0e] border border-[#232529] focus:border-lime-400 rounded text-xs text-lime-400 font-bold placeholder-zinc-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-[#0c0d0e] border border-[#232529] focus:border-lime-400 rounded text-xs text-white placeholder-zinc-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-lime-400 hover:bg-lime-300 text-black text-xs font-black uppercase tracking-wider rounded transition-all cursor-pointer flex items-center justify-center gap-2 shadow"
                >
                  {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Sign In & Verify Account</span>
                </button>
              </div>

              <div className="p-3 rounded bg-[#0c0d0e] border border-[#232529] text-[11px] text-zinc-400 space-y-1">
                <span className="text-zinc-300 font-bold block">Need an account?</span>
                <p className="font-sans text-zinc-400">
                  Accounts cannot be created without a license. You can register if you have an activation key, or acquire a subscription tier.
                </p>
                <div className="pt-1 flex gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="text-lime-400 hover:underline font-bold"
                  >
                    Register with Code
                  </button>
                  <span className="text-zinc-600">·</span>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateToBuy();
                    }}
                    className="text-zinc-300 hover:text-white"
                  >
                    Purchase a Tier
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* TAB 2: REGISTER WITH ACTIVATION CODE */
            <form onSubmit={handleRegisterWithCode} className="space-y-4">
              {/* License Gated Notice */}
              <div className="p-3 rounded bg-[#0c0d0e] border border-lime-400/40 text-xs space-y-1">
                <span className="text-lime-400 font-bold block uppercase flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Activation Key Required for Registration</span>
                </span>
                <p className="text-[11px] text-zinc-400 font-sans">
                  Account creation is restricted to customers who have purchased a subscription tier or received an authentic code from an authorized distributor.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                  Activation Code (Required) *
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 w-4 h-4 text-lime-400" />
                  <input
                    type="text"
                    required
                    value={regCode}
                    onChange={(e) => setRegCode(e.target.value)}
                    placeholder="e.g. D9A-LIFE-JEREMY-2026 or D9A-EFT-7X89-21PQ"
                    className="w-full pl-9 pr-3 py-2 bg-[#0c0d0e] border border-lime-400/70 focus:border-lime-400 rounded text-xs text-lime-400 font-bold placeholder-zinc-600 focus:outline-none"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                  <span>Preloaded sample: D9A-LIFE-JEREMY-2026</span>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateToBuy();
                    }}
                    className="text-lime-400 hover:underline"
                  >
                    Don't have a code? Purchase a tier
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                  Desired Username *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="e.g. OperatorDelta"
                    className="w-full pl-9 pr-3 py-2 bg-[#0c0d0e] border border-[#232529] focus:border-lime-400 rounded text-xs text-white placeholder-zinc-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="operator@proton.me"
                    className="w-full pl-9 pr-3 py-2 bg-[#0c0d0e] border border-[#232529] focus:border-lime-400 rounded text-xs text-white placeholder-zinc-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                  Account Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-[#0c0d0e] border border-[#232529] focus:border-lime-400 rounded text-xs text-white placeholder-zinc-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-lime-400 hover:bg-lime-300 text-black text-xs font-black uppercase tracking-wider rounded transition-all cursor-pointer flex items-center justify-center gap-2 shadow"
                >
                  {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Verify Code & Create Account</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
