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
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col lg:flex-row font-sans select-none overflow-x-hidden">

      {/* ── LEFT PANEL: Brand & Product Information ── */}
      <div className="w-full lg:w-[48%] xl:w-[44%] flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-14 relative overflow-hidden bg-[#F7F9FC]">

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

        {/* Top Content Stack (Logo -> Heading -> Description -> 2x2 Cards) */}
        <div className="relative z-10 space-y-6">
          {/* MineGuard Logo & Platform Badge */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-md shadow-slate-900/5 border border-[#E2E8F0] shrink-0 p-1 overflow-hidden">
              <img
                src="/mineguard-logo.png"
                alt="MineGuard Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#172033] tracking-tight leading-none">
                MineGuard
              </h1>
              <p className="text-[11px] text-[#64748B] font-medium mt-0.5">Enterprise Platform</p>
            </div>
          </div>

          {/* Main Heading */}
          <div className="max-w-md space-y-3 text-wrap-safe">
            <h2 className="text-2xl sm:text-3xl xl:text-4xl font-extrabold text-[#172033] leading-tight tracking-tight text-wrap-safe">
              Smart Mine<br />
              Governance &<br />
              <span className="text-[#2563EB]">Safety Management</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed max-w-sm text-wrap-safe">
              Unified inspection, compliance, risk assessment, and emergency response platform for coal mine operations.
            </p>
          </div>

          {/* Feature Highlights — Clean 2×2 Grid with Equal Sizing */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 max-w-md">
            {[
              { label: 'Digital Inspections', desc: 'SOP-based field audits' },
              { label: 'AI Risk Scoring', desc: 'Automated prioritization' },
              { label: 'Certificate Registry', desc: 'Compliance tracking' },
              { label: 'Emergency SOS', desc: 'Real-time alert dispatch' },
            ].map((f) => (
              <div
                key={f.label}
                className="p-3 sm:p-3.5 bg-white/80 backdrop-blur-sm rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col justify-center min-h-[64px] text-wrap-safe min-w-0"
              >
                <p className="text-xs font-bold text-[#172033] leading-snug text-wrap-safe">{f.label}</p>
                <p className="text-[11px] text-[#64748B] mt-0.5 leading-tight text-wrap-safe">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Attribution (Shows here in flow on mobile/tablet) */}
          <div className="pt-2 lg:hidden space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-[11px] font-semibold text-blue-700 tracking-wide">
                Made By Team PRAYOJANA
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Attribution (Desktop) */}
        <div className="relative z-10 space-y-2 pt-8 hidden lg:block">
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
        <div className="absolute bottom-0 right-0 w-72 h-72 opacity-[0.04] pointer-events-none hidden lg:block">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <polygon points="0,200 40,120 80,160 120,90 160,130 200,70 200,200" fill="#2563EB" />
            <polygon points="0,200 60,140 100,170 140,110 180,150 200,120 200,200" fill="#1D4ED8" />
          </svg>
        </div>
      </div>

      {/* ── RIGHT PANEL: Centered Login Card ── */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 xl:p-14">
        <div className="w-[calc(100%-16px)] sm:w-full max-w-[420px] mx-auto space-y-4">

          {/* Login Card */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-[0_4px_24px_rgba(15,23,42,0.06)] p-6 sm:p-8 space-y-5">

            {/* Card Header */}
            <div className="space-y-1">
              <h2 className="text-lg font-extrabold text-[#172033] tracking-tight flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#2563EB] shrink-0" />
                Secure Login
              </h2>
              <p className="text-xs text-[#64748B]">
                Enter your credentials to access the governance portal
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="p-3 bg-[#FEF2F2] border border-red-200 rounded-xl text-xs text-[#DC2626] flex items-start gap-2 text-wrap-safe min-w-0">
                <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                <span className="font-medium text-wrap-safe min-w-0">{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 min-w-0">
              {/* User / Employee ID */}
              <div className="min-w-0">
                <label htmlFor="login-userId" className="block text-sm font-semibold text-[#334155] mb-1.5 text-wrap-safe">
                  User / Employee ID
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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

              {/* Password with Visibility Toggle */}
              <div>
                <label htmlFor="login-password" className="block text-sm font-semibold text-[#334155] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#94A3B8] hover:text-[#475569] focus:outline-none focus:text-[#2563EB] transition-colors cursor-pointer rounded-lg"
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

              {/* Remember Me & Forgot Password Row */}
              <div className="flex items-center justify-between text-sm pt-0.5 gap-2">
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
                  className="text-xs text-[#2563EB] hover:text-[#1D4ED8] font-semibold transition-colors cursor-pointer"
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

          {/* Mobile Footer Note */}
          <div className="text-center space-y-1 lg:hidden pt-2 pb-4">
            <p className="text-[10px] text-[#94A3B8]">© 2026 MineGuard · Authorized Access Only</p>
          </div>

        </div>
      </div>
    </div>
  );
}


