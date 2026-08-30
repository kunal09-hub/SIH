import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { emergencyAudio } from '../../utils/emergencyAudio';
import { 
  AlertTriangle, 
  Siren, 
  MapPin, 
  User, 
  Clock, 
  ShieldAlert, 
  CheckCircle, 
  X,
  Flame 
} from 'lucide-react';

export default function EmergencySOSOverlay() {
  const { currentUser } = useAuth();
  const { sosAlerts, acknowledgeSOSAlert } = useData();
  const [isAlarmPlaying, setIsAlarmPlaying] = React.useState(false);

  // Find the active unacknowledged SOS alert
  const activeAlert = sosAlerts.find(a => a.status === 'ACTIVE');

  // Security guard: only Officer, Management, or Authority see & acknowledge
  const canViewAndAcknowledge = currentUser && (
    currentUser.role === 'OFFICER' || 
    currentUser.role === 'MANAGEMENT' || 
    currentUser.role === 'AUTHORITY'
  );

  useEffect(() => {
    const unsubscribe = emergencyAudio.addListener((playing) => {
      setIsAlarmPlaying(playing);
    });
    return () => unsubscribe();
  }, []);

  // Lock background body scroll & play alarm siren while active
  useEffect(() => {
    if (activeAlert && canViewAndAcknowledge) {
      document.body.style.overflow = 'hidden';
      emergencyAudio.startAlarm();
    } else {
      document.body.style.overflow = '';
      emergencyAudio.stopAlarm();
    }

    return () => {
      document.body.style.overflow = '';
      emergencyAudio.stopAlarm();
    };
  }, [activeAlert, canViewAndAcknowledge]);

  if (!activeAlert || !canViewAndAcknowledge) {
    return null;
  }

  const handleToggleAlarm = () => {
    if (isAlarmPlaying) {
      emergencyAudio.stopAlarm();
    } else {
      emergencyAudio.startAlarm();
    }
  };

  const handleAcknowledge = () => {
    emergencyAudio.stopAlarm();
    acknowledgeSOSAlert(
      activeAlert.alertId, 
      `${currentUser.name} (${currentUser.userId || currentUser.badge})`, 
      currentUser.role
    );
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="emergency-modal-title"
    >
      {/* Compact Emergency Modal Container (~520px wide, max-h-[85vh]) */}
      <div className="w-[calc(100%-24px)] max-w-[520px] max-h-[85vh] bg-slate-900 rounded-2xl border-2 border-red-600 shadow-[0_0_50px_rgba(220,38,38,0.5)] overflow-hidden flex flex-col animate-scaleUp">
        
        {/* 1. Compact Header Bar */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 px-4 py-2.5 sm:px-5 sm:py-3 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
              <Siren className="w-4.5 h-4.5 text-white animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-black/40 px-1.5 py-0.5 rounded border border-white/20">
                  PRIORITY-1
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              </div>
              <h2 id="emergency-modal-title" className="text-sm sm:text-base font-black tracking-tight text-white">
                🚨 EMERGENCY SOS ALERT
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleToggleAlarm}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                isAlarmPlaying 
                  ? 'bg-red-950 text-red-200 border-red-400/60 animate-pulse' 
                  : 'bg-slate-800 text-slate-300 border-slate-600'
              }`}
            >
              <span>{isAlarmPlaying ? '🔊 ALARM ON' : '🔇 MUTED'}</span>
            </button>
            <button
              onClick={handleAcknowledge}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="Acknowledge & Close"
              aria-label="Acknowledge Alert and Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Compact Body Content */}
        <div className="p-4 sm:p-5 space-y-2.5 sm:space-y-3 overflow-y-auto max-h-[calc(85vh-120px)] text-white text-xs">
          
          {/* Urgent Warning Banner */}
          <div className="p-2.5 sm:p-3 bg-red-950/60 border border-red-500/50 rounded-xl flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
            <div>
              <p className="text-xs font-black text-red-400 uppercase tracking-wide">
                Immediate Attention Required
              </p>
              <p className="text-[11px] text-slate-300 leading-snug mt-0.5">
                Active distress signal detected from field statutory inspector.
              </p>
            </div>
          </div>

          {/* Compact 2x2 Information Cards Grid (80–90px height) */}
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
            
            {/* 1. Field Inspector */}
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <User className="w-3 h-3 text-red-400" />
                <span>INSPECTOR</span>
              </div>
              <p className="text-xs font-bold text-white truncate mt-1">
                {activeAlert.inspectorName}
              </p>
              <p className="text-[10px] font-mono text-slate-400 truncate">
                ID: {activeAlert.inspectorId}
              </p>
            </div>

            {/* 2. Mine Location */}
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <MapPin className="w-3 h-3 text-red-400" />
                <span>MINE LOCATION</span>
              </div>
              <p className="text-xs font-bold text-white truncate mt-1">
                {activeAlert.mineName}
              </p>
              <p className="text-[10px] font-mono text-slate-400 truncate">
                {activeAlert.zoneName || 'Underground Working Shaft'}
              </p>
            </div>

            {/* 3. Incident Time */}
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <Clock className="w-3 h-3 text-red-400" />
                <span>INCIDENT TIME</span>
              </div>
              <p className="text-xs font-bold font-mono text-white mt-1">
                {activeAlert.displayTime ? activeAlert.displayTime.split(' ')[1] : new Date(activeAlert.timestamp).toLocaleTimeString('en-GB')}
              </p>
              <p className="text-[10px] text-red-400 font-semibold truncate">
                Active Distress Signal
              </p>
            </div>

            {/* 4. Protocol Level */}
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <ShieldAlert className="w-3 h-3 text-red-400" />
                <span>PROTOCOL LEVEL</span>
              </div>
              <p className="text-xs font-bold text-red-400 flex items-center gap-1 mt-1 truncate">
                <Flame className="w-3 h-3 text-red-500 shrink-0" />
                CRITICAL STATUTORY
              </p>
              <p className="text-[10px] font-mono text-slate-400 truncate">
                {activeAlert.alertId}
              </p>
            </div>

          </div>

          {/* Field Situation Details (Compact box, 50–65px) */}
          {activeAlert.notes && (
            <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                FIELD SITUATION DETAILS:
              </span>
              <p className="text-[11px] text-slate-200 font-mono mt-0.5 line-clamp-2 leading-relaxed">
                "{activeAlert.notes}"
              </p>
            </div>
          )}

          {/* Primary Action Button */}
          <div className="pt-1">
            <button
              onClick={handleAcknowledge}
              className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer border border-emerald-400/30"
            >
              <CheckCircle className="w-4 h-4 text-white shrink-0" />
              <span className="truncate">Acknowledge Alert &amp; Dispatch Safety Response</span>
            </button>
            <p className="text-center text-[10px] text-slate-400 mt-1">
              Clicking stops the siren alarm &amp; logs your digital acknowledgment.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
