import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { sosAlarmSound } from '../../utils/sosAlarmSound';
import { AlertTriangle, CheckCircle, Volume2, VolumeX, ShieldAlert, User, MapPin, Clock, Send } from 'lucide-react';
import Badge from './Badge';

export default function SOSEmergencyOverlay() {
  const { currentUser } = useAuth();
  const { sosAlerts, acknowledgeSOSAlert } = useData();
  const [audioBlocked, setAudioBlocked] = useState(false);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);

  // Security guard: Alert modal & siren strictly for Mine Manager / Officer / Management / Authority
  const userRole = (currentUser?.role || '').toUpperCase();
  const isRecipient = userRole === 'OFFICER' || userRole === 'MINE_OFFICER' || userRole === 'MANAGEMENT' || userRole === 'AUTHORITY';

  // Find active SOS alerts
  const activeSos = Array.isArray(sosAlerts) ? sosAlerts.find(item => item.status === 'ACTIVE') : null;

  // Handle emergency audio alarm playback for recipients
  useEffect(() => {
    if (isRecipient && activeSos) {
      try {
        sosAlarmSound.start();
        setIsAlarmPlaying(true);
        setAudioBlocked(false);
      } catch (err) {
        console.warn('Browser prevented autoplay audio:', err);
        setAudioBlocked(true);
      }
    } else {
      sosAlarmSound.stop();
      setIsAlarmPlaying(false);
    }

    return () => {
      sosAlarmSound.stop();
      setIsAlarmPlaying(false);
    };
  }, [isRecipient, activeSos?.alertId]);

  if (!isRecipient || !activeSos) {
    return null;
  }

  const handleEnableAudio = () => {
    try {
      sosAlarmSound.start();
      setIsAlarmPlaying(true);
      setAudioBlocked(false);
    } catch (e) {
      console.error('Manual audio play failed:', e);
    }
  };

  const handleStopAlarmOnly = () => {
    sosAlarmSound.stop();
    setIsAlarmPlaying(false);
  };

  const handleAcknowledge = () => {
    sosAlarmSound.stop();
    setIsAlarmPlaying(false);
    acknowledgeSOSAlert(activeSos.alertId, `${currentUser.name} (${currentUser.role})`);
  };

  const handleDispatchResponse = () => {
    setIsDispatching(true);
    sosAlarmSound.stop();
    setIsAlarmPlaying(false);
    acknowledgeSOSAlert(activeSos.alertId, `${currentUser.name} (${currentUser.role}) - Response Dispatched`);
    setTimeout(() => {
      setIsDispatching(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      {/* Compact Centered SOS Modal (White surface with red accent, width: 500-520px, max-height: ~82vh) */}
      <div className="relative w-[calc(100%-24px)] max-w-[520px] max-h-[82vh] bg-white border-2 border-red-500 rounded-2xl shadow-2xl p-5 sm:p-6 flex flex-col justify-between overflow-y-auto space-y-4 animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-red-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-200">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-red-600 flex items-center gap-2 uppercase tracking-tight">
                <span>🚨 Emergency SOS Alert</span>
              </h2>
              <p className="text-[11px] text-[#64748B] font-mono">
                Incident Ref: <strong className="text-[#172033]">{activeSos.alertId}</strong> • Priority: <strong className="text-red-600">P1 CRITICAL</strong>
              </p>
            </div>
          </div>

          {/* Alarm Audio Status Indicator / Stop audio button */}
          <div className="flex items-center gap-1.5">
            {isAlarmPlaying ? (
              <button
                onClick={handleStopAlarmOnly}
                className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                title="Silence Siren Sound"
              >
                <Volume2 className="w-3.5 h-3.5 text-red-600 animate-ping" />
                <span>Mute Siren</span>
              </button>
            ) : audioBlocked ? (
              <button
                onClick={handleEnableAudio}
                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Enable Alarm</span>
              </button>
            ) : (
              <span className="px-2 py-0.5 rounded bg-slate-100 text-[#64748B] text-[10px] flex items-center gap-1 font-medium">
                <VolumeX className="w-3 h-3" /> Silenced
              </span>
            )}
          </div>
        </div>

        {/* Immediate Attention Callout */}
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-center">
          <p className="text-xs font-black text-red-700 uppercase tracking-wide">
            ⚠️ IMMEDIATE ATTENTION REQUIRED — DISPATCH FIELD RESPONSE
          </p>
        </div>

        {/* SOS Incident Details Grid */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white rounded-lg border border-[#E2E8F0] shadow-sm">
              <span className="text-[10px] font-bold uppercase text-[#64748B] flex items-center gap-1">
                <User className="w-3 h-3 text-blue-600" /> Field Inspector
              </span>
              <p className="text-xs font-bold text-[#172033] mt-1">{activeSos.inspectorName}</p>
              <p className="text-[10px] font-mono text-[#64748B]">ID: {activeSos.inspectorId}</p>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#E2E8F0] shadow-sm">
              <span className="text-[10px] font-bold uppercase text-[#64748B] flex items-center gap-1">
                <MapPin className="w-3 h-3 text-red-600" /> Target Mine
              </span>
              <p className="text-xs font-bold text-[#172033] mt-1">{activeSos.mineName}</p>
              <p className="text-[10px] font-mono text-[#64748B]">ID: {activeSos.mineId}</p>
            </div>
          </div>

          <div className="p-3 bg-white rounded-lg border border-[#E2E8F0] flex items-center justify-between shadow-sm">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase text-[#64748B] flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-600" /> Dispatched Timestamp
              </span>
              <p className="text-[11px] font-mono font-bold text-[#172033]">{activeSos.timestamp}</p>
            </div>
            <Badge size="sm" variant="red">
              STATUS: ACTIVE
            </Badge>
          </div>

          <div className="p-3 bg-white rounded-lg border border-[#E2E8F0] space-y-1 shadow-sm">
            <span className="text-[10px] font-bold uppercase text-[#64748B]">Situation Details:</span>
            <p className="text-xs text-[#334155] leading-relaxed">
              Field Inspector initiated emergency distress broadcast. Safety rescue team and mine rescue operations mobilization required.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            onClick={handleAcknowledge}
            className="w-full py-2.5 px-3 bg-white hover:bg-slate-50 text-[#172033] font-bold text-xs rounded-xl border border-[#CBD5E1] shadow-sm transition-all flex items-center justify-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Acknowledge Alert</span>
          </button>

          <button
            onClick={handleDispatchResponse}
            disabled={isDispatching}
            className="w-full py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-red-600/30 transition-all flex items-center justify-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span>{isDispatching ? 'Dispatching...' : 'Dispatch Safety Response'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
