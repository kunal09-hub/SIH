import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useData } from './DataContext';
import { useAuth } from './AuthContext';
import {
  saveOfflineInspection,
  getAllOfflineInspections,
  saveOfflinePhoto,
  saveOfflineSOS,
  getPendingSyncQueue
} from '../utils/indexedDBStorage';
import { syncEngine } from '../utils/syncEngine';

const OfflineContext = createContext();

export function OfflineProvider({ children }) {
  const dataContext = useData();
  const { currentUser } = useAuth();

  const [isOnline, setIsOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [offlineInspections, setOfflineInspections] = useState([]);
  const [pendingQueue, setPendingQueue] = useState([]);
  const [syncStatus, setSyncStatus] = useState({
    isSyncing: false,
    currentStep: '',
    lastSyncTime: null,
    syncedCount: 0
  });
  const [lastNotification, setLastNotification] = useState(null);

  // Refresh pending queues and inspections from IndexedDB
  const refreshOfflineState = useCallback(async () => {
    try {
      const [inspections, queue] = await Promise.all([
        getAllOfflineInspections(),
        getPendingSyncQueue()
      ]);
      setOfflineInspections(inspections || []);
      setPendingQueue(queue || []);
    } catch (e) {
      console.warn('Could not read IndexedDB offline state:', e);
    }
  }, []);

  useEffect(() => {
    refreshOfflineState();
  }, [refreshOfflineState]);

  // Subscribe to SyncEngine events
  useEffect(() => {
    const unsubscribe = syncEngine.subscribe((event) => {
      if (event.type === 'SYNC_STARTED') {
        setSyncStatus(prev => ({ ...prev, isSyncing: true, currentStep: 'Initializing synchronization...' }));
      } else if (event.type === 'SYNC_STEP') {
        setSyncStatus(prev => ({ ...prev, currentStep: event.step }));
      } else if (event.type === 'SYNC_COMPLETED') {
        setSyncStatus({
          isSyncing: false,
          currentStep: '',
          lastSyncTime: new Date().toLocaleTimeString('en-GB'),
          syncedCount: event.syncedCount
        });
        refreshOfflineState();

        if (event.syncedCount > 0) {
          setLastNotification({
            type: 'success',
            message: `✅ Synchronized ${event.syncedCount} offline record${event.syncedCount > 1 ? 's' : ''} to central MineGuard database.`
          });
          setTimeout(() => setLastNotification(null), 6000);
        }
      } else if (event.type === 'SYNC_FAILED') {
        setSyncStatus(prev => ({ ...prev, isSyncing: false }));
        setLastNotification({
          type: 'warning',
          message: 'Sync pending — retrying automatically when network is stable.'
        });
        setTimeout(() => setLastNotification(null), 6000);
      }
    });

    return () => unsubscribe();
  }, [refreshOfflineState]);

  // Trigger manual or automatic synchronization
  const syncNow = useCallback(async () => {
    if (!isOnline) {
      setLastNotification({
        type: 'warning',
        message: 'Cannot synchronize while in offline mode. Please restore connectivity first.'
      });
      setTimeout(() => setLastNotification(null), 4000);
      return;
    }

    setLastNotification({
      type: 'info',
      message: '🔄 Synchronizing offline inspection records...'
    });

    await syncEngine.runSync({ dataContext, currentUser });
  }, [isOnline, dataContext, currentUser]);

  // Listen for native online/offline browser events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastNotification({
        type: 'info',
        message: '📶 Connection restored. Auto-synchronizing offline data...'
      });
      setTimeout(() => setLastNotification(null), 4000);
      
      // Auto-trigger sync on reconnection
      setTimeout(() => {
        syncEngine.runSync({ dataContext, currentUser });
      }, 500);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setLastNotification({
        type: 'warning',
        message: '🔴 Network disconnected. Operating in Offline-First Mode (All inspections & photos saved locally).'
      });
      setTimeout(() => setLastNotification(null), 6000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dataContext, currentUser]);

  // Save inspection offline to IndexedDB
  const saveInspectionLocally = useCallback(async (inspectionData, photoFiles = []) => {
    const savedRecord = await saveOfflineInspection(inspectionData);

    // Save attached photos
    if (photoFiles && photoFiles.length > 0) {
      for (const p of photoFiles) {
        await saveOfflinePhoto({
          inspectionLocalId: savedRecord.localId,
          fileBlob: p.file,
          fileName: p.name || p.fileName,
          mimeType: p.type || 'image/jpeg',
          gpsLocation: p.gpsLocation,
          previewUrl: p.previewUrl
        });
      }
    }

    await refreshOfflineState();

    setLastNotification({
      type: 'warning',
      message: `💾 Inspection saved on device (${savedRecord.localId}). It will synchronize automatically when connectivity returns.`
    });
    setTimeout(() => setLastNotification(null), 6000);

    return savedRecord;
  }, [refreshOfflineState]);

  // Save SOS event offline to IndexedDB
  const saveSOSLocally = useCallback(async (sosData) => {
    const record = await saveOfflineSOS(sosData);
    await refreshOfflineState();

    setLastNotification({
      type: 'warning',
      message: '🚨 Emergency SOS recorded locally. Network unavailable; Mine Manager notification is pending synchronization.'
    });
    setTimeout(() => setLastNotification(null), 7000);

    return record;
  }, [refreshOfflineState]);

  // Manual Simulated Offline toggle for testing and demoing
  const toggleSimulatedOffline = useCallback(() => {
    setIsOnline(prev => {
      const nextState = !prev;
      if (nextState) {
        setLastNotification({
          type: 'info',
          message: '🟢 Connection restored (Simulated). Synchronizing pending inspections...'
        });
        setTimeout(() => {
          syncEngine.runSync({ dataContext, currentUser });
        }, 300);
      } else {
        setLastNotification({
          type: 'warning',
          message: '🔴 Switched to Simulated Offline Mode. Inspections & photos will store in IndexedDB.'
        });
      }
      setTimeout(() => setLastNotification(null), 5000);
      return nextState;
    });
  }, [dataContext, currentUser]);

  const pendingCount = pendingQueue.length;

  return (
    <OfflineContext.Provider value={{
      isOnline,
      pendingCount,
      pendingQueue,
      offlineInspections,
      saveInspectionLocally,
      saveSOSLocally,
      syncNow,
      toggleSimulatedOffline,
      syncStatus,
      lastNotification,
      dismissNotification: () => setLastNotification(null)
    }}>
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (!context) throw new Error('useOffline must be used within an OfflineProvider');
  return context;
}
