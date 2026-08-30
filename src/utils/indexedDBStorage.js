// Production IndexedDB Storage Layer for MineGuard Offline-First Field Inspections
// Supports large photo blobs, inspection documents, evidence files, and offline sync queues.

const DB_NAME = 'mineguard_offline_db_v2';
const DB_VERSION = 1;

let dbPromise = null;

export function getDB() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // 1. Inspections Store (indexed by localId, mineId, syncStatus)
      if (!db.objectStoreNames.contains('inspections')) {
        const inspStore = db.createObjectStore('inspections', { keyPath: 'localId' });
        inspStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        inspStore.createIndex('mineId', 'mineId', { unique: false });
        inspStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // 2. Photos & Evidence Store (indexed by localPhotoId, inspectionLocalId, syncStatus)
      if (!db.objectStoreNames.contains('photos')) {
        const photoStore = db.createObjectStore('photos', { keyPath: 'localPhotoId' });
        photoStore.createIndex('inspectionLocalId', 'inspectionLocalId', { unique: false });
        photoStore.createIndex('syncStatus', 'syncStatus', { unique: false });
      }

      // 3. Offline Sync Queue (dependency-aware queue)
      if (!db.objectStoreNames.contains('syncQueue')) {
        const queueStore = db.createObjectStore('syncQueue', { keyPath: 'queueId' });
        queueStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        queueStore.createIndex('operationType', 'operationType', { unique: false });
        queueStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // 4. Offline SOS Events Queue
      if (!db.objectStoreNames.contains('sosQueue')) {
        const sosStore = db.createObjectStore('sosQueue', { keyPath: 'localId' });
        sosStore.createIndex('syncStatus', 'syncStatus', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      console.error('IndexedDB open error:', event.target.error);
      reject(event.target.error);
    };
  });

  return dbPromise;
}

// =========================================================================
// 1. INSPECTIONS STORE OPERATIONS
// =========================================================================

export async function saveOfflineInspection(inspectionData) {
  const db = await getDB();
  const localId = inspectionData.localId || `OFFLINE-INSP-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  
  const record = {
    ...inspectionData,
    localId,
    inspectionId: inspectionData.inspectionId || localId,
    syncStatus: inspectionData.syncStatus || 'PENDING',
    createdAt: inspectionData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(['inspections', 'syncQueue'], 'readwrite');
    const inspStore = tx.objectStore('inspections');
    const queueStore = tx.objectStore('syncQueue');

    inspStore.put(record);

    // Also register in the sync queue
    const queueItem = {
      queueId: `QUEUE-INSP-${localId}`,
      operationType: 'CREATE_INSPECTION',
      entityType: 'INSPECTION',
      entityId: localId,
      payload: record,
      createdAt: new Date().toISOString(),
      retryCount: 0,
      syncStatus: 'PENDING',
      lastError: null
    };
    queueStore.put(queueItem);

    tx.oncomplete = () => resolve(record);
    tx.onerror = (e) => reject(e.target.error);
  });
}

export async function getAllOfflineInspections() {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('inspections', 'readonly');
    const store = tx.objectStore('inspections');
    const req = store.getAll();

    req.onsuccess = () => resolve(req.result || []);
    req.onerror = (e) => reject(e.target.error);
  });
}

export async function getOfflineInspectionById(localId) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('inspections', 'readonly');
    const store = tx.objectStore('inspections');
    const req = store.get(localId);

    req.onsuccess = () => resolve(req.result || null);
    req.onerror = (e) => reject(e.target.error);
  });
}

export async function updateOfflineInspectionStatus(localId, syncStatus, serverId = null, lastError = null) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('inspections', 'readwrite');
    const store = tx.objectStore('inspections');
    const getReq = store.get(localId);

    getReq.onsuccess = () => {
      const record = getReq.result;
      if (!record) {
        resolve(null);
        return;
      }
      record.syncStatus = syncStatus;
      if (serverId) record.serverId = serverId;
      if (lastError) record.lastError = lastError;
      record.updatedAt = new Date().toISOString();

      store.put(record);
    };

    tx.oncomplete = () => resolve(true);
    tx.onerror = (e) => reject(e.target.error);
  });
}

// =========================================================================
// 2. EVIDENCE PHOTOS STORE OPERATIONS
// =========================================================================

export async function saveOfflinePhoto({ inspectionLocalId, fileBlob, fileName, mimeType, gpsLocation, previewUrl }) {
  const db = await getDB();
  const localPhotoId = `PHOTO-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const photoRecord = {
    localPhotoId,
    inspectionLocalId,
    fileName: fileName || `evidence_${Date.now()}.jpg`,
    fileSize: fileBlob?.size || 0,
    mimeType: mimeType || 'image/jpeg',
    fileBlob,
    previewUrl,
    gpsLocation: gpsLocation || { latitude: 23.7957, longitude: 86.4304, accuracy: 12 }, // e.g. Dhanbad Coalfields default
    timestamp: new Date().toISOString(),
    syncStatus: 'PENDING'
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(['photos', 'syncQueue'], 'readwrite');
    const photoStore = tx.objectStore('photos');
    const queueStore = tx.objectStore('syncQueue');

    photoStore.put(photoRecord);

    const queueItem = {
      queueId: `QUEUE-PHOTO-${localPhotoId}`,
      operationType: 'UPLOAD_PHOTO',
      entityType: 'PHOTO',
      entityId: localPhotoId,
      parentEntityId: inspectionLocalId,
      payload: photoRecord,
      createdAt: new Date().toISOString(),
      retryCount: 0,
      syncStatus: 'PENDING',
      lastError: null
    };
    queueStore.put(queueItem);

    tx.oncomplete = () => resolve(photoRecord);
    tx.onerror = (e) => reject(e.target.error);
  });
}

export async function getPhotosForInspection(inspectionLocalId) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('photos', 'readonly');
    const store = tx.objectStore('photos');
    const index = store.index('inspectionLocalId');
    const req = index.getAll(inspectionLocalId);

    req.onsuccess = () => resolve(req.result || []);
    req.onerror = (e) => reject(e.target.error);
  });
}

// =========================================================================
// 3. OFFLINE SOS QUEUE OPERATIONS
// =========================================================================

export async function saveOfflineSOS(sosData) {
  const db = await getDB();
  const localId = sosData.alertId || `OFFLINE-SOS-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const record = {
    ...sosData,
    localId,
    syncStatus: 'PENDING_SYNC',
    offlineCreatedAt: new Date().toISOString()
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(['sosQueue', 'syncQueue'], 'readwrite');
    const sosStore = tx.objectStore('sosQueue');
    const queueStore = tx.objectStore('syncQueue');

    sosStore.put(record);

    const queueItem = {
      queueId: `QUEUE-SOS-${localId}`,
      operationType: 'SYNC_SOS',
      entityType: 'SOS',
      entityId: localId,
      payload: record,
      createdAt: new Date().toISOString(),
      retryCount: 0,
      syncStatus: 'PENDING',
      lastError: null
    };
    queueStore.put(queueItem);

    tx.oncomplete = () => resolve(record);
    tx.onerror = (e) => reject(e.target.error);
  });
}

// =========================================================================
// 4. SYNC QUEUE OPERATIONS
// =========================================================================

export async function getPendingSyncQueue() {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('syncQueue', 'readonly');
    const store = tx.objectStore('syncQueue');
    const req = store.getAll();

    req.onsuccess = () => {
      const items = (req.result || []).filter(item => item.syncStatus === 'PENDING');
      // Sort by creation time to maintain dependency order
      items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      resolve(items);
    };
    req.onerror = (e) => reject(e.target.error);
  });
}

export async function markSyncQueueItemCompleted(queueId) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('syncQueue', 'readwrite');
    const store = tx.objectStore('syncQueue');
    store.delete(queueId);

    tx.oncomplete = () => resolve(true);
    tx.onerror = (e) => reject(e.target.error);
  });
}

export async function updateSyncQueueItemError(queueId, errorMsg) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('syncQueue', 'readwrite');
    const store = tx.objectStore('syncQueue');
    const req = store.get(queueId);

    req.onsuccess = () => {
      const item = req.result;
      if (item) {
        item.retryCount = (item.retryCount || 0) + 1;
        item.lastError = errorMsg;
        item.lastAttemptAt = new Date().toISOString();
        store.put(item);
      }
    };

    tx.oncomplete = () => resolve(true);
    tx.onerror = (e) => reject(e.target.error);
  });
}
