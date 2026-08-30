import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { RefreshCw, HelpCircle, Sparkles } from 'lucide-react';
import DemoGuideModal from './DemoGuideModal';
import OfflineSyncStatusBadge from './OfflineSyncStatusBadge';

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
      <div className="bg-white border-b border-enterprise-border px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 sticky top-0 z-40 text-xs">
        {/* Left: Prototype Tag */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-mgBlue-50 border border-mgBlue-100 rounded text-mgBlue-600 font-semibold text-[11px]">
            <Sparkles className="w-3 h-3" />
            <span>Made By Team PRAYOJANA</span>
          </div>

          <button
            onClick={() => setShowGuide(true)}
            className="flex items-center gap-1 px-2 py-0.5 text-enterprise-text-secondary hover:text-enterprise-text font-medium transition-colors text-[11px]"
          >
            <HelpCircle className="w-3 h-3" />
            <span>Guide</span>
          </button>
        </div>

        {/* Right: Offline Indicator & Reset Demo Data */}
        <div className="flex items-center gap-3">
          <OfflineSyncStatusBadge />
          
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-2 py-0.5 text-enterprise-text-muted hover:text-mgRed-600 font-medium transition-colors text-[11px]"
            title="Reset dataset to initial demonstration state"
          >
            <RefreshCw className={`w-3 h-3 ${resetConfirm ? 'animate-spin text-mgGreen-600' : ''}`} />
            <span>{resetConfirm ? 'Reset!' : 'Reset Data'}</span>
          </button>
        </div>
      </div>

      <DemoGuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
    </>
  );
}
