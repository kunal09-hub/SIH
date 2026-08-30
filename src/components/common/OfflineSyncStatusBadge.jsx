import React, { useState } from 'react';
import { useOffline } from '../../context/OfflineContext';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  CloudUpload, 
  Database,
  Image as ImageIcon,
  Siren,
  FileCheck
} from 'lucide-react';
import Modal from './Modal';

export default function OfflineSyncStatusBadge() {
  const { 
    isOnline, 
    pendingCount, 
    pendingQueue, 
    offlineInspections, 
    syncNow, 
    toggleSimulatedOffline, 
    syncStatus 
  } = useOffline();

  const [showQueueModal, setShowQueueModal] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Online / Offline Status Pill */}
        <button
          onClick={toggleSimulatedOffline}
          title={`Status: ${isOnline ? 'Online (Connected)' : 'Offline (Disconnected)'}. Click to toggle simulated network state for testing.`}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all border shadow-sm cursor-pointer ${
            isOnline
              ? 'bg-emerald-50 text-mgGreen-600 border-green-200 hover:bg-emerald-100'
              : 'bg-red-50 text-mgRed-600 border-red-200 hover:bg-red-100 animate-pulse'
          }`}
        >
          {isOnline ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-mgGreen-600" />
              <span>Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-mgRed-600" />
              <span>Offline Mode</span>
            </>
          )}
        </button>

        {/* Pending Sync Counter Badge */}
        {pendingCount > 0 && (
          <button
            onClick={() => setShowQueueModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition-colors shadow-sm cursor-pointer"
          >
            <CloudUpload className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
            <span>{pendingCount} Pending Sync</span>
          </button>
        )}

        {/* Sync Now Button if Online and items exist */}
        {isOnline && pendingCount > 0 && (
          <button
            onClick={syncNow}
            disabled={syncStatus.isSyncing}
            className={`px-2 py-1 text-xs font-bold text-white bg-mgBlue-600 hover:bg-mgBlue-500 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ${
              syncStatus.isSyncing ? 'opacity-75 cursor-wait' : ''
            }`}
            title="Synchronize all pending offline inspections, photos, and SOS events"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline text-[11px]">
              {syncStatus.isSyncing ? 'Syncing...' : 'Sync Now'}
            </span>
          </button>
        )}
      </div>

      {/* Offline Sync Queue Details Modal */}
      {showQueueModal && (
        <Modal
          isOpen={showQueueModal}
          onClose={() => setShowQueueModal(false)}
          title="📡 Offline-First Storage & Synchronization Queue"
          subtitle="Client-side IndexedDB records pending central database synchronization"
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 text-xs">
            
            {/* Context Info Box */}
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-slate-700 leading-relaxed space-y-1">
              <div className="flex items-center gap-1.5 text-mgBlue-700 font-bold">
                <Database className="w-4 h-4" />
                <span>IndexedDB Persistent Storage Mode</span>
              </div>
              <p className="text-[11px] text-slate-600">
                All field safety inspections, high-resolution evidence photographs, and emergency records are stored securely on the local device. When network connectivity is restored, they synchronize automatically in dependency order without duplicate entries.
              </p>
            </div>

            {/* Live Sync Progress Indicator */}
            {syncStatus.isSyncing && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
                <RefreshCw className="w-4 h-4 text-amber-600 animate-spin shrink-0" />
                <div>
                  <p className="font-bold text-amber-800 text-xs">Auto-Synchronization in Progress</p>
                  <p className="text-[11px] text-amber-700 font-mono mt-0.5">{syncStatus.currentStep || 'Processing queue...'}</p>
                </div>
              </div>
            )}

            {/* Pending Queue Records List */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {pendingQueue.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="font-bold text-slate-700">All Records Synchronized</p>
                  <p className="text-[11px]">IndexedDB storage is completely up to date.</p>
                </div>
              ) : (
                pendingQueue.map((item) => (
                  <div 
                    key={item.queueId} 
                    className="p-3 bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-2xs flex justify-between items-start gap-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 text-slate-700">
                        {item.operationType === 'CREATE_INSPECTION' ? (
                          <FileCheck className="w-4 h-4 text-mgBlue-600" />
                        ) : item.operationType === 'UPLOAD_PHOTO' ? (
                          <ImageIcon className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Siren className="w-4 h-4 text-red-600" />
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 text-xs">{item.entityId}</span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-[10px] uppercase text-slate-600">
                            {item.operationType.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-slate-700 font-medium text-xs">
                          {item.payload?.area || item.payload?.mineName || item.payload?.fileName || 'Field Observation Record'}
                        </p>
                        <p className="text-slate-400 text-[10px] font-mono">
                          Captured: {new Date(item.createdAt).toLocaleTimeString('en-GB')}
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-mono font-bold text-[10px] shrink-0">
                      PENDING SYNC
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center pt-3 border-t border-enterprise-border">
              <span className="text-slate-500 text-[11px]">
                Network: <strong>{isOnline ? '🟢 Connected' : '🔴 Offline (Local Mode)'}</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowQueueModal(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
                >
                  Close
                </button>
                {isOnline && pendingCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      syncNow();
                    }}
                    disabled={syncStatus.isSyncing}
                    className="px-4 py-1.5 bg-mgBlue-600 hover:bg-mgBlue-500 text-white font-bold rounded-xl text-xs shadow-md shadow-mgBlue-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
                    <span>Sync All ({pendingCount})</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </Modal>
      )}
    </>
  );
}
