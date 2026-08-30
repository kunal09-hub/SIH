import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useOffline } from '../../context/OfflineContext';
import { 
  AlertOctagon, 
  Siren, 
  X, 
  CheckCircle2, 
  Radio, 
  MapPin, 
  User, 
  Clock, 
  ShieldAlert,
  Send,
  WifiOff
} from 'lucide-react';

export default function InspectorSOSButton() {
  const { currentUser } = useAuth();
  const { mines, sosAlerts, sendSOSAlert } = useData();
  const { isOnline, saveSOSLocally } = useOffline();
  
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMineId, setSelectedMineId] = useState('MINE-01');
  const [zoneDetail, setZoneDetail] = useState('North Shaft - Substation 3');
  const [emergencyNotes, setEmergencyNotes] = useState('');
  const [lastDispatchedSOS, setLastDispatchedSOS] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Check if there is an active SOS sent by this inspector
  const activeMySOS = (sosAlerts || []).find(
    a => a.status === 'ACTIVE' && (a.inspectorId === currentUser?.userId || a.inspectorId === currentUser?.badge || a.inspectorName === currentUser?.name)
  );

  // Lock background body scroll when trigger confirmation modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setIsOpen(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  // Security guard: only Inspector role can send SOS
  if (currentUser?.role !== 'INSPECTOR') {
    return null;
  }

  // =========================================================================
  // FIELD INSPECTOR DISPATCH HANDLER: Routes to Mine Manager (Offline Aware)
  // =========================================================================
  const handleSendSOSToManager = async (e) => {
    if (e) e.preventDefault();

    const targetMine = mines.find(m => m.mineId === selectedMineId) || mines[0] || { mineId: 'MINE-01', mineName: 'Demo Mine Alpha' };
    const sosPayload = {
      inspectorId: currentUser.userId || currentUser.badge || 'INS-001',
      inspectorName: currentUser.name || 'Anita Kulkarni',
      senderRole: 'FIELD_INSPECTOR',
      recipientRole: 'MINE_MANAGER',
      mineId: targetMine.mineId,
      mineName: targetMine.mineName,
      zoneName: zoneDetail || 'Active Underground Working Area',
      location: `${targetMine.mineName} (${zoneDetail || 'North Shaft'})`,
      notes: emergencyNotes.trim() || 'Immediate statutory mine evacuation and safety response requested by Field Inspector.',
      timestamp: new Date().toISOString(),
      displayTime: new Date().toLocaleTimeString('en-GB')
    };

    if (!isOnline) {
      // Offline Special Rule: Store in IndexedDB and flag as pending synchronization
      const savedOfflineRecord = await saveSOSLocally(sosPayload);
      setLastDispatchedSOS(savedOfflineRecord);
      setIsOpen(false);

      setToastMessage({
        type: 'warning',
        title: '⚠️ Emergency SOS Recorded Offline',
        subtitle: `Emergency SOS recorded locally on device. Network is unavailable; Mine Manager notification will dispatch automatically when connectivity returns.`,
        alertId: savedOfflineRecord.localId,
        time: new Date().toLocaleTimeString('en-GB')
      });
    } else {
      // Online Real-Time Dispatch: Immediate broadcast to Mine Manager
      const newAlert = sendSOSAlert(sosPayload);
      setLastDispatchedSOS(newAlert);
      setIsOpen(false);

      setToastMessage({
        type: 'success',
        title: '✓ Emergency SOS Sent',
        subtitle: `Assigned Mine Manager for ${targetMine.mineName} has been alerted in real time.`,
        alertId: newAlert.alertId,
        time: newAlert.displayTime || new Date().toLocaleTimeString('en-GB')
      });
    }

    setTimeout(() => {
      setToastMessage(null);
    }, 9000);
  };

  return (
    <>
      {/* Floating Bottom-Right SOS Trigger / Dispatch Status Badge */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2 pointer-events-auto">
        
        {/* Inspector Confirmation Toast */}
        {toastMessage && (
          <div className="mb-2 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/60 flex items-start gap-3 animate-slideUp text-xs max-w-sm">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="flex-1 space-y-0.5">
              <p className="font-bold text-emerald-400 text-xs">{toastMessage.title}</p>
              <p className="text-[11px] text-slate-300 leading-snug">{toastMessage.subtitle}</p>
              <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-400 font-mono">
                <span>Ref: {toastMessage.alertId}</span>
                <span>•</span>
                <span>{toastMessage.time}</span>
              </div>
            </div>
            <button 
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Floating Trigger Button */}
        {activeMySOS ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-900/90 text-white text-xs font-semibold rounded-full border border-red-500/60 shadow-lg backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="text-amber-300 font-mono text-[11px] font-bold">SOS ACTIVE</span>
              <span className="text-slate-400 text-[10px]">Waiting for Manager Acknowledgment</span>
            </div>
            <button
              onClick={() => setIsOpen(true)}
              className="px-3.5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-full shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
              title="Send Follow-up SOS"
            >
              <Siren className="w-4 h-4" />
              <span>Send Update</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 active:scale-95 text-white font-extrabold text-xs tracking-wider uppercase rounded-full shadow-[0_8px_20px_-4px_rgba(220,38,38,0.6)] hover:shadow-[0_12px_25px_-4px_rgba(220,38,38,0.8)] transition-all cursor-pointer border border-red-400/40"
            aria-label="Send Emergency SOS Alert to Mine Manager"
          >
            {/* Subtle Radar Pulse */}
            <span className="absolute -inset-1 rounded-full bg-red-500/25 animate-ping pointer-events-none" style={{ animationDuration: '2.5s' }} />
            <Siren className="w-4 h-4 text-white animate-bounce" />
            <span className="font-mono tracking-tight font-black">SOS Emergency</span>
            <Radio className="w-3 h-3 text-red-200 animate-pulse" />
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* FIELD INSPECTOR SEND CONFIRMATION MODAL (Compact ~480px)                 */}
      {/* ========================================================================= */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div 
            className="w-[calc(100%-24px)] max-w-[480px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-scaleUp"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sos-modal-title"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 px-5 py-3 text-white flex items-center justify-between shrink-0 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <AlertOctagon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 id="sos-modal-title" className="text-sm font-black tracking-tight flex items-center gap-1.5">
                    🚨 Emergency SOS Alert
                  </h3>
                  <p className="text-[10px] text-red-100 font-mono tracking-wider uppercase">
                    Statutory Priority-1 • Direct Dispatch to Mine Manager
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 space-y-3 overflow-y-auto max-h-[calc(85vh-110px)] text-slate-800 text-xs">
              
              {/* Warning Confirmation Message */}
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-red-900 text-xs leading-tight">
                    Are you sure you want to send an emergency alert to the Mine Manager?
                  </p>
                  <p className="text-[11px] text-red-700 leading-snug">
                    This will immediately sound the alarm siren on the <strong>Mine Manager's dashboard</strong> and dispatch the emergency response team.
                  </p>
                </div>
              </div>

              {/* Inspector & Timestamp Row */}
              <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Inspector: <strong className="font-semibold text-slate-900">{currentUser.name}</strong> ({currentUser.userId || 'INS-001'})</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 font-mono">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{new Date().toLocaleTimeString('en-GB')}</span>
                </div>
              </div>

              {/* Target Coal Mine Location */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-red-600" />
                  Target Coal Mine Location
                </label>
                <select
                  value={selectedMineId}
                  onChange={(e) => setSelectedMineId(e.target.value)}
                  className="w-full bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-red-500/15 transition-all cursor-pointer"
                >
                  {mines.map((m) => (
                    <option key={m.mineId} value={m.mineId}>
                      {m.mineName} — {m.location.split(',')[0]} (Manager: {m.safetyOfficer || 'Rajesh Deshmukh'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Zone / Underground Section */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Zone / Section
                </label>
                <input
                  type="text"
                  value={zoneDetail}
                  onChange={(e) => setZoneDetail(e.target.value)}
                  placeholder="e.g. North Shaft - Substation 3 (-240m level)"
                  className="w-full bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/15 transition-all"
                />
              </div>

              {/* Emergency Situation Details */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Emergency Situation Details (Optional)
                </label>
                <textarea
                  value={emergencyNotes}
                  onChange={(e) => setEmergencyNotes(e.target.value)}
                  placeholder="Brief description of emergency..."
                  rows={2}
                  className="w-full bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-red-500 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/15 transition-all resize-none"
                />
              </div>

            </div>

            {/* Footer Action Buttons */}
            <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSendSOSToManager}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold shadow-md shadow-red-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send SOS to Mine Manager</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
