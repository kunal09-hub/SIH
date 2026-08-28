import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Flame, ShieldCheck, User, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [userId, setUserId] = useState('INS-001');
  const [password, setPassword] = useState('Inspector@123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const res = login(userId, password);
      if (!res.success) {
        setError(res.message);
      }
      setLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col justify-center items-center p-4 selection:bg-mgBlue-600 selection:text-white">
      <div className="w-full max-w-[460px] flex flex-col items-center">
        {/* Top Logo Icon */}
        <div className="w-16 h-16 rounded-2xl bg-navy-800 flex items-center justify-center shadow-lg shadow-navy-900/10 mb-4">
          <Flame className="w-8 h-8 text-white fill-white/10" />
        </div>

        {/* Header Branding */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-800 tracking-tight">
            MineGuard <span className="text-mgBlue-600">AI</span>
          </h1>
          <p className="text-xs text-enterprise-text-muted mt-2 max-w-sm mx-auto leading-relaxed">
            AI-Based Smart Governance & Compliance Monitoring System for Coal Mines
          </p>
          <div className="mt-3.5">
            <span className="inline-flex items-center text-[11px] px-3.5 py-1 rounded-full border border-blue-200 bg-blue-50 text-mgBlue-600 font-medium tracking-wide shadow-sm">
              SIH Prototype • Demo Data Mode
            </span>
          </div>
        </div>

        {/* Authentication Card */}
        <div className="w-full bg-white border border-enterprise-border rounded-2xl p-6 sm:p-8 shadow-card space-y-5">
          {/* Card Title */}
          <div className="flex items-center gap-2 pb-3 border-b border-enterprise-border">
            <ShieldCheck className="w-4 h-4 text-mgBlue-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-navy-800">
              ROLE-BASED SYSTEM AUTHENTICATION
            </span>
          </div>

          {error && (
            <div className="p-3 bg-mgRed-50 border border-red-200 rounded-lg text-xs text-mgRed-600 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* User ID / Email / Badge ID */}
            <div>
              <label className="block text-xs font-semibold text-enterprise-text mb-2">
                User ID / Email / Badge ID
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-enterprise-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full bg-white border border-enterprise-border rounded-lg pl-10 pr-4 py-3 text-xs sm:text-sm text-enterprise-text placeholder-gray-400 font-mono focus:outline-none focus:border-mgBlue-600 focus:ring-1 focus:ring-mgBlue-600 transition-all"
                  placeholder="e.g. INS-001 or inspector@mineguard.demo"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-enterprise-text mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-enterprise-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-enterprise-border rounded-lg pl-10 pr-10 py-3 text-xs sm:text-sm text-enterprise-text placeholder-gray-400 focus:outline-none focus:border-mgBlue-600 focus:ring-1 focus:ring-mgBlue-600 transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-enterprise-text-muted hover:text-enterprise-text transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Authenticate & Enter Portal Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-4 bg-mgBlue-600 hover:bg-mgBlue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 mt-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Authenticating...
                </span>
              ) : (
                <>
                  <span>Authenticate & Enter Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
