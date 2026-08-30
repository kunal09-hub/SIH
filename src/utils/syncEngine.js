// Dependency-Aware Offline Synchronization Engine for MineGuard
// Automatically synchronizes local IndexedDB data to Supabase/DataContext when network returns.

import {
  getPendingSyncQueue,
  markSyncQueueItemCompleted,
  updateSyncQueueItemError,
  updateOfflineInspectionStatus
} from './indexedDBStorage';

class SyncEngine {
  constructor() {
    this.isSyncing = false;
    this.listeners = new Set();
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify(event) {
    this.listeners.forEach(fn => {
      try { fn(event); } catch(e) {}
    });
  }

  async runSync({ dataContext, currentUser }) {
    if (this.isSyncing) return { success: false, message: 'Sync already in progress' };

    this.isSyncing = true;
    this.notify({ type: 'SYNC_STARTED' });

    try {
      const queue = await getPendingSyncQueue();
      if (queue.length === 0) {
        this.isSyncing = false;
        this.notify({ type: 'SYNC_COMPLETED', syncedCount: 0 });
        return { success: true, syncedCount: 0 };
      }

      let syncedCount = 0;
      let failedCount = 0;
      const idMap = new Map(); // Maps localId -> serverId

      // =======================================================================
      // STEP 1: Process CREATE_INSPECTION items
      // =======================================================================
      const inspectionItems = queue.filter(q => q.operationType === 'CREATE_INSPECTION');
      for (const item of inspectionItems) {
        try {
          this.notify({ 
            type: 'SYNC_STEP', 
            step: `Synchronizing inspection (${syncedCount + 1}/${queue.length})`,
            entityId: item.entityId 
          });

          // Check if already present in DataContext to guarantee idempotency
          const existing = (dataContext?.inspections || []).find(
            insp => insp.offlineLocalId === item.entityId || insp.inspectionId === item.payload.inspectionId
          );

          let serverRecord = existing;
          if (!serverRecord && dataContext?.createInspection) {
            serverRecord = dataContext.createInspection({
              ...item.payload,
              offlineLocalId: item.entityId,
              isSyncedFromOffline: true,
              syncedAt: new Date().toISOString()
            }, item.payload.inspectorName || currentUser?.name);
          }

          const serverId = serverRecord?.inspectionId || `INSP-${Date.now().toString().slice(-4)}`;
          idMap.set(item.entityId, serverId);

          // Update local IndexedDB status
          await updateOfflineInspectionStatus(item.entityId, 'SYNCED', serverId);
          await markSyncQueueItemCompleted(item.queueId);
          syncedCount++;
        } catch (err) {
          console.error('Failed to sync inspection item:', item, err);
          await updateSyncQueueItemError(item.queueId, err.message || 'Inspection sync error');
          failedCount++;
        }
      }

      // =======================================================================
      // STEP 2: Process REPORT_VIOLATION items
      // =======================================================================
      const violationItems = queue.filter(q => q.operationType === 'REPORT_VIOLATION');
      for (const item of violationItems) {
        try {
          const parentServerId = idMap.get(item.payload.inspectionLocalId) || item.payload.inspectionId;
          
          if (dataContext?.reportViolation) {
            dataContext.reportViolation({
              ...item.payload,
              inspectionId: parentServerId,
              offlineLocalId: item.entityId,
              isSyncedFromOffline: true,
            }, item.payload.actorName || currentUser?.name);
          }

          await markSyncQueueItemCompleted(item.queueId);
          syncedCount++;
        } catch (err) {
          console.error('Failed to sync violation item:', item, err);
          await updateSyncQueueItemError(item.queueId, err.message || 'Violation sync error');
          failedCount++;
        }
      }

      // =======================================================================
      // STEP 3: Process UPLOAD_PHOTO items
      // =======================================================================
      const photoItems = queue.filter(q => q.operationType === 'UPLOAD_PHOTO');
      for (const item of photoItems) {
        try {
          this.notify({ 
            type: 'SYNC_STEP', 
            step: `Uploading photo evidence (${item.payload.fileName})`,
            entityId: item.entityId 
          });

          // Simulate cloud storage upload / local evidence resolution
          await new Promise(r => setTimeout(r, 150));

          await markSyncQueueItemCompleted(item.queueId);
          syncedCount++;
        } catch (err) {
          console.error('Failed to upload photo item:', item, err);
          await updateSyncQueueItemError(item.queueId, err.message || 'Photo upload error');
          failedCount++;
        }
      }

      // =======================================================================
      // STEP 4: Process SYNC_SOS items (Offline Emergency Signals)
      // =======================================================================
      const sosItems = queue.filter(q => q.operationType === 'SYNC_SOS');
      for (const item of sosItems) {
        try {
          this.notify({ 
            type: 'SYNC_STEP', 
            step: `Synchronizing offline emergency SOS to Mine Manager (${item.entityId})`,
            entityId: item.entityId 
          });

          if (dataContext?.sendSOSAlert) {
            dataContext.sendSOSAlert({
              ...item.payload,
              isOfflineReplay: true,
              originalOfflineTimestamp: item.payload.offlineCreatedAt
            });
          }

          await markSyncQueueItemCompleted(item.queueId);
          syncedCount++;
        } catch (err) {
          console.error('Failed to sync offline SOS item:', item, err);
          await updateSyncQueueItemError(item.queueId, err.message || 'SOS sync error');
          failedCount++;
        }
      }

      this.isSyncing = false;
      this.notify({ 
        type: 'SYNC_COMPLETED', 
        syncedCount, 
        failedCount 
      });

      return { success: true, syncedCount, failedCount };
    } catch (error) {
      this.isSyncing = false;
      this.notify({ type: 'SYNC_FAILED', error: error.message });
      console.error('SyncEngine master failure:', error);
      return { success: false, error: error.message };
    }
  }
}

export const syncEngine = new SyncEngine();
