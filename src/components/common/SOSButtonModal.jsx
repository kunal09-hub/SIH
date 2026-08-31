import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { AlertOctagon, Radio, CheckCircle, X, ShieldAlert, Clock, Check } from 'lucide-react';
import Badge from './Badge';

export default function SOSButtonModal() {
  const { currentUser } = useAuth();
  const { sendSOSAlert } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sentAlertInfo, setSentAlertInfo] = useState(null);

  // Security guard: Floating SOS trigger strictly for Field Inspector
  if (!currentUser || currentUser.role !== 'INSPECTOR') {
    return null;
  }

  const handleConfirmSOS = async () => {
    setIsSending(true);
    try {
      const createdAlert = await sendSOSAlert({
        inspectorName: currentUser.name || 'Anita Kulkarni',
        inspectorId: currentUser.badge || 'INS-001',
        mineName: currentUser.mineName || 'Demo Mine Alpha',
        mineId: currentUser.mineId || 'MINE-01'
      });

      setSentAlertInfo({
        alertId: createdAlert?.alertId || `SOS-${Date.now().toString().slice(-6)}`,
        time: new Date().toLocaleTimeString(),
        status: 'ACTIVE'
      });
    } catch (err) {
      console.error('Error sending SOS from modal:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSentAlertInfo(null);
  };

  return (
    <>
      {/* Floating Red SOS Emergency Button for Inspector */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => { setSentAlertInfo(null); setIsOpen(true); }}
          className="group relative inline-flex items-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-full shadow-lg shadow-red-600/40 border border-red-500 transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none"
          title="Trigger Field Emergency SOS Alert"
        >
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
          </span>
          <AlertOctagon className="w-4 h-4 text-white" />
          <span>Send SOS</span>
        </button>
      </div>

      {/* SOS Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-[110] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            
            {sentAlertInfo ? (
              /* Inspector SOS Confirmation View */
              <div className="space-y-4 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 mb-1">
                  <Check className="w-7 h-7" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-black text-emerald-600">
                    ✓ SOS SENT
                  </h3>
                  <p className="text-xs text-[#64748B] font-medium">
                    Mine Manager and safety dispatch team have been notified.
                  </p>
                </div>

                {/* Status Box */}
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 text-left space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center text-[#64748B]">
                    <span>SOS ID:</span>
                    <strong className="text-[#172033]">{sentAlertInfo.alertId}</strong>
                  </div>
                  <div className="flex justify-between items-center text-[#64748B]">
                    <span>Dispatch Time:</span>
                    <span className="text-[#172033]">{sentAlertInfo.time}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#64748B] pt-2 border-t border-[#E2E8F0]">
                    <span>Status:</span>
                    <Badge size="sm" variant="red">ACTIVE</Badge>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                >
                  Return to Dashboard
                </button>
              </div>
            ) : (
              /* SOS Trigger Confirmation */
              <>
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-200">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-[#172033] flex items-center gap-2">
                      🚨 Confirm Emergency SOS
                    </h3>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-1.5 text-[#64748B] hover:text-[#172033] hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-medium text-[#334155] leading-relaxed">
                    Are you sure you want to broadcast an Emergency SOS distress alert to the Mine Manager & Safety Rescue Team?
                  </p>
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                      Immediate Action:
                    </p>
                    <p className="text-[11px] text-red-600/90 leading-relaxed">
                      This will sound the emergency alarm and display a Priority-1 intervention alert on active Mine Officer consoles.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSending}
                    className="px-4 py-2 bg-white hover:bg-slate-50 text-[#334155] font-semibold text-xs rounded-xl transition-colors border border-[#CBD5E1]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmSOS}
                    disabled={isSending}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-red-600/30 transition-all flex items-center gap-2"
                  >
                    {isSending ? (
                      <span>Broadcasting SOS...</span>
                    ) : (
                      <>
                        <AlertOctagon className="w-4 h-4" />
                        <span>Send Emergency SOS</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </>
  );
}
