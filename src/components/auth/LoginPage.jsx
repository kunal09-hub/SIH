import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  AlertCircle 
} from 'lucide-react';
import symbolLogo from '../../assets/mineguard-ai-symbol.svg';
import DigitalMineBackground from './DigitalMineBackground';

export default function LoginPage() {
  const { login } = useAuth();
  
  // Fields load strictly empty by default
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      // Authenticates user and automatically determines role & routes to dashboard
      const res = login(userId, password);
      if (!res.success) {
        setError(res.message);
      }
      setLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] flex flex-col justify-center items-center p-4 relative font-sans selection:bg-mgBlue-600 selection:text-white overflow-hidden">
      
      {/* Subtle Digital Mine Intelligence Background Layer */}
      <DigitalMineBackground />

      <div className="w-full max-w-[380px] sm:max-w-[390px] flex flex-col items-center relative z-10 my-auto">
        
        {/* ========================================================================= */}
        {/* 1. TOP BRANDING: MineGuard Logo, Wordmark, Subtitle, Team Badge           */}
        {/* ========================================================================= */}
        <div className="text-center mb-5 flex flex-col items-center w-full">
          {/* Logo Icon */}
          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-center p-2.5 mb-3">
            <img 
              src={symbolLogo} 
              alt="MineGuard Symbol" 
              className="w-full h-full object-contain" 
            />
          </div>

          {/* Brand Heading (MineGuard only - no AI in title) */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            MineGuard
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-[13px] text-slate-500 max-w-xs sm:max-w-sm mt-1.5 leading-relaxed text-center">
            AI-Based Smart Governance &amp; Compliance Monitoring System for Coal Mines
          </p>

          {/* Team Badge (Clean pill - no SIH/PS24 references) */}
          <div className="mt-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50/90 border border-blue-200/80 text-mgBlue-700 text-[11px] font-semibold shadow-2xs">
              <Sparkles className="w-3 h-3 text-mgBlue-600" />
              Made By Team PRAYOJANA
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. LOGIN CARD: Compact Centered White Card (~380px)                       */}
        {/* ========================================================================= */}
        <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xl shadow-slate-200/50 space-y-4">
          
          {/* Card Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Secure Login
            </h2>
            <Lock className="w-4 h-4 text-slate-400" />
          </div>

          {/* Authentication Error Feedback */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-rose-800">Authentication Failed</p>
                <p className="text-[11px] mt-0.5 text-rose-700">{error}</p>
              </div>
            </div>
          )}

          {/* Minimal Login Form: User ID + Password ONLY */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Field 1: User / Employee ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                User / Employee ID
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full bg-slate-50/60 hover:bg-white focus:bg-white border border-slate-200 focus:border-mgBlue-600 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 font-mono focus:outline-none focus:ring-2 focus:ring-mgBlue-600/15 transition-all"
                  placeholder="Enter User ID"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Field 2: Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50/60 hover:bg-white focus:bg-white border border-slate-200 focus:border-mgBlue-600 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-mgBlue-600/15 transition-all"
                  placeholder="Enter Password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password on Same Horizontal Row */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-mgBlue-600 focus:ring-mgBlue-500 cursor-pointer"
                />
                <span className="text-xs text-slate-600">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => alert('Please contact your Mine Safety Administrator to reset statutory access credentials.')}
                className="text-xs font-medium text-mgBlue-600 hover:text-mgBlue-700 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Primary Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 px-4 bg-mgBlue-600 hover:bg-mgBlue-700 active:bg-mgBlue-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer ${loading ? 'opacity-75 cursor-wait' : ''}`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Signing In...</span>
                </span>
              ) : (
                <>
                  <span>Sign In &amp; Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>

        {/* ========================================================================= */}
        {/* 3. FOOTER: Authorized Access Only (No SIH references)                     */}
        {/* ========================================================================= */}
        <p className="text-xs text-slate-400 text-center mt-5">
          &copy; 2026 MineGuard &bull; Authorized Access Only
        </p>

      </div>
    </div>
  );
}
