import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Lock, User, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const res = login(userId, password);
      if (!res.success) {
        setError(res.message);
        setIsLoading(false);
      }
    }, 250);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex font-sans select-none">

      {/* ── LEFT PANEL: Brand & Illustration ── */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[44%] flex-col justify-between p-10 xl:p-14 relative overflow-hidden">

        {/* Subtle background grid pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.035]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="loginGrid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#2563EB" strokeWidth="0.7" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#loginGrid)" />
          </svg>
        </div>

        {/* Top Brand */}
        <div className="relative z-10 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-600/20 border border-blue-500/20">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#172033] tracking-tight leading-none">
                MineGuard
              </h1>
              <p className="text-[11px] text-[#64748B] font-medium mt-0.5">Enterprise Platform</p>
            </div>
          </div>

          <div className="max-w-sm space-y-3 pt-4">
            <h2 className="text-3xl xl:text-4xl font-extrabold text-[#172033] leading-tight tracking-tight">
              Smart Mine<br />
              Governance &<br />
              <span className="text-[#2563EB]">Safety Management</span>
            </h2>
            <p className="text-sm text-[#64748B] leading-relaxed max-w-xs">
              Unified inspection, compliance, risk assessment, and emergency response platform for coal mine operations.
            </p>
          </div>

          {/* Feature Highlights — 2×2 grid with equal sizing */}
          <div className="grid grid-cols-2 gap-3 max-w-sm pt-4">
            {[
              { label: 'Digital Inspections', desc: 'SOP-based field audits' },
              { label: 'AI Risk Scoring', desc: 'Automated prioritization' },
              { label: 'Certificate Registry', desc: 'Compliance tracking' },
              { label: 'Emergency SOS', desc: 'Real-time alert dispatch' },
            ].map((f) => (
              <div key={f.label} className="p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-[#E2E8F0] flex flex-col justify-center min-h-[62px]">
                <p className="text-xs font-bold text-[#172033]">{f.label}</p>
                <p className="text-[11px] text-[#64748B] mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Attribution */}
        <div className="relative z-10 space-y-2 pt-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
            <span className="text-[11px] font-semibold text-blue-700 tracking-wide">
              Made By Team PRAYOJANA
            </span>
          </div>
          <p className="text-[11px] text-[#94A3B8]">
            © 2026 MineGuard · Authorized Access Only
          </p>
        </div>

        {/* Decorative abstract mining landscape */}
        <div className="absolute bottom-0 right-0 w-72 h-72 opacity-[0.04] pointer-events-none">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <polygon points="0,200 40,120 80,160 120,90 160,130 200,70 200,200" fill="#2563EB" />
            <polygon points="0,200 60,140 100,170 140,110 180,150 200,120 200,200" fill="#1D4ED8" />
          </svg>
        </div>
      </div>

      {/* ── RIGHT PANEL: Login Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-[420px] space-y-6">

          {/* Mobile-only brand header (hidden on desktop where left panel shows) */}
          <div className="text-center lg:hidden space-y-3 pb-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-600/20 border border-blue-500/20">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#172033] tracking-tight">MineGuard</h1>
              <p className="text-xs text-[#64748B] mt-0.5">Smart Mine Governance & Safety Management</p>
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-[0_4px_24px_rgba(15,23,42,0.06)] p-7 sm:p-8 space-y-5">

            {/* Card Header */}
            <div className="space-y-1">
              <h2 className="text-lg font-extrabold text-[#172033] tracking-tight flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#2563EB]" />
                Secure Login
              </h2>
              <p className="text-xs text-[#64748B]">
                Enter your credentials to access the governance portal
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="p-3 bg-[#FEF2F2] border border-red-200 rounded-xl text-xs text-[#DC2626] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-userId" className="block text-sm font-semibold text-[#334155] mb-1.5">
                  User / Employee ID
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-userId"
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="w-full h-[46px] pl-10 pr-4 bg-white border border-[#CBD5E1] rounded-xl text-sm text-[#172033] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                    placeholder="e.g. INS-001, MO-001"
                    required
                    autoFocus
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="login-password" className="block text-sm font-semibold text-[#334155] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-[46px] pl-10 pr-11 bg-white border border-[#CBD5E1] rounded-xl text-sm text-[#172033] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                    placeholder="Enter password"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-[#94A3B8] hover:text-[#64748B] focus:outline-none focus:text-[#2563EB] transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={0}
                  >
                    {showPassword ? (
                      <EyeOff className="w-[18px] h-[18px]" />
                    ) : (
                      <Eye className="w-[18px] h-[18px]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot */}
              <div className="flex items-center justify-between text-sm pt-0.5">
                <label className="flex items-center gap-2 text-[#475569] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
                  />
                  <span className="text-xs font-medium">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setError('Contact your System Administrator for credential reset.')}
                  className="text-xs text-[#2563EB] hover:text-[#1D4ED8] font-semibold transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[46px] px-4 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-[#93B4F6] text-white font-bold text-sm rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:ring-offset-2"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Mobile Footer */}
          <div className="text-center space-y-1 lg:hidden">
            <p className="text-[11px] text-[#94A3B8]">Made By Team PRAYOJANA</p>
            <p className="text-[10px] text-[#CBD5E1]">© 2026 MineGuard · Authorized Access Only</p>
          </div>

        </div>
      </div>
    </div>
  );
}

