import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { ShieldCheck, HardHat, Briefcase, Building2, Landmark, RefreshCw, HelpCircle, Sparkles } from 'lucide-react';
import DemoGuideModal from './DemoGuideModal';

export default function DemoQuickBar() {
  const { currentUser } = useAuth();
  const { resetDemoData } = useData();
  const [showGuide, setShowGuide] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  const handleReset = () => {
    resetDemoData();
    setResetConfirm(true);
    setTimeout(() => setResetConfirm(false), 2500);
  };

  return (
    <>
      <div className="bg-white border-b border-[#E2E8F0] px-4 py-2 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40 shadow-sm text-xs">
        {/* Left: Guide */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Demo Data Mode</span>
          </div>

          <button
            onClick={() => setShowGuide(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0] rounded-lg font-medium transition-colors shadow-sm"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-semibold text-[#2563EB]">Presentation Guide</span>
          </button>
        </div>

        {/* Center: Session Info */}
        <div className="flex items-center gap-2 px-3 py-1 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
          <span className="text-[10px] font-bold uppercase text-[#94A3B8]">Session:</span>
          <span className="text-[11px] font-bold text-[#172033] font-mono flex items-center gap-1.5">
            <span>{currentUser?.avatar}</span>
            <span>{currentUser?.name}</span>
            <span className="text-[#64748B]">({currentUser?.role})</span>
          </span>
        </div>

        {/* Right: Reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-red-50 text-[#64748B] hover:text-[#DC2626] border border-[#E2E8F0] hover:border-red-200 rounded-lg text-xs transition-colors"
            title="Reset dataset to initial demonstration state"
          >
            <RefreshCw className={`w-3 h-3 ${resetConfirm ? 'animate-spin text-emerald-600' : ''}`} />
            <span>{resetConfirm ? 'Reset Complete!' : 'Reset Demo Data'}</span>
          </button>
        </div>
      </div>

      <DemoGuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
    </>
  );
}
