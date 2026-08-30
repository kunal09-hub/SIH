import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useOffline } from '../../context/OfflineContext';
import { 
  ClipboardCheck, 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  AlertTriangle, 
  Send, 
  WifiOff, 
  Wifi, 
  Camera, 
  Image as ImageIcon, 
  Trash2, 
  MapPin, 
  HardDrive,
  RefreshCw
} from 'lucide-react';
import ReportViolationModal from './ReportViolationModal';

export default function InspectionRunner({ onComplete }) {
  const { mines, workers, certificates, createInspection } = useData();
  const { currentUser } = useAuth();
  const { isOnline, saveInspectionLocally, toggleSimulatedOffline, syncNow, syncStatus } = useOffline();

  const [mineId, setMineId] = useState('MINE-01');
  const selectedMine = mines.find(m => m.mineId === mineId) || mines[0];
  const [area, setArea] = useState(selectedMine?.zones?.[0]?.zoneName || 'North Shaft');
  const [inspectionType, setInspectionType] = useState('Electrical & Personnel Compliance Safety Inspection');
  const [generalNotes, setGeneralNotes] = useState('');
  const [photos, setPhotos] = useState([
    {
      id: 'photo-seed-1',
      name: 'substation_switchgear_isolation.jpg',
      size: '1.4 MB',
      previewUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=400&auto=format&fit=crop&q=60',
      gpsLocation: { latitude: 23.7957, longitude: 86.4304 },
      savedOffline: true
    }
  ]);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [submittedInspection, setSubmittedInspection] = useState(null);
  const [inspectionSuccessMsg, setInspectionSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update area when mineId changes
  const handleMineChange = (newMineId) => {
    setMineId(newMineId);
    const m = mines.find(x => x.mineId === newMineId);
    if (m && m.zones && m.zones.length > 0) {
      setArea(m.zones[0].zoneName);
    }
  };

  // Find workers and candidate cert for the selected mine and zone
  const mineWorkers = workers.filter(w => w.mineId === mineId);
  const zoneWorkers = mineWorkers.filter(w => w.zoneName === area || w.area === area);
  const activeWorkersPool = zoneWorkers.length > 0 ? zoneWorkers : mineWorkers;

  const candidateWorker = activeWorkersPool.find(w => {
    return certificates.some(c => c.workerId === w.workerId && new Date(c.expiryDate) < new Date());
  }) || activeWorkersPool[0];

  // Pre-configured checklist items
  const [checklist, setChecklist] = useState([
    { id: 1, category: 'Safety & Signage', item: 'Danger High Voltage signage & isolation barriers in place', status: 'PASS', notes: 'Visible and illuminated' },
    { id: 2, category: 'Safety & Signage', item: 'Emergency fire extinguishers inspected and charged (CO2/Dry Powder)', status: 'PASS', notes: 'Pressure gauges nominal' },
    { id: 3, category: 'Equipment Safety', item: 'Transformer grounding & earth leakage circuit breakers tested', status: 'PASS', notes: 'Ground resistance nominal' },
    { id: 4, category: 'Equipment Safety', item: 'Insulated rubber floor matting in front of power panels', status: 'PASS', notes: 'Tested and stamp verified' },
    { id: 5, category: 'Worker Compliance', item: 'On-duty personnel possess valid mandatory competency certificate', status: 'FAIL', notes: 'Assigned personnel competency certificate expired' },
    { id: 6, category: 'Worker Compliance', item: 'Mandatory PPE (Arc-flash shield / helmet / safety boots) worn', status: 'PASS', notes: 'PPE in proper use' },
  ]);

  const updateItemStatus = (id, newStatus) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  const updateItemNotes = (id, notes) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, notes } : item));
  };

  // Handle Photo Attachments (Stored in IndexedDB)
  const handlePhotoCapture = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach(file => {
      const previewUrl = URL.createObjectURL(file);
      const newPhoto = {
        id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        file,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        type: file.type,
        previewUrl,
        gpsLocation: { latitude: 23.7957, longitude: 86.4304 },
        savedOffline: true
      };

      setPhotos(prev => [...prev, newPhoto]);
    });
  };

  const removePhoto = (photoId) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  const hasFailures = checklist.some(item => item.status === 'FAIL');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const overallResult = hasFailures ? 'FAILED' : 'PASSED';
    const payload = {
      mineId,
      mineName: selectedMine?.mineName || 'Demo Mine Alpha',
      area,
      inspectionType,
      checklistResults: checklist,
      overallResult,
      notes: generalNotes || (hasFailures ? 'Inspection logged compliance failures requiring immediate rectification.' : 'All statutory safety parameters verified in nominal condition.'),
      evidence: photos.length > 0 ? photos.map(p => p.name).join(', ') : 'evidence_field_inspection.jpg',
      photosCount: photos.length,
      inspectorId: currentUser?.userId || 'INS-001',
      inspectorName: currentUser?.name || 'Anita Kulkarni',
      syncStatus: isOnline ? 'SYNCED' : 'PENDING'
    };

    if (!isOnline) {
      // Offline-First Submission: Store in IndexedDB
      const savedRecord = await saveInspectionLocally(payload, photos);
      setSubmittedInspection(savedRecord);
      setInspectionSuccessMsg(`💾 Inspection saved on device (${savedRecord.localId}) with ${photos.length} photos. It will synchronize automatically when network connectivity returns.`);
      setIsSubmitting(false);

      if (hasFailures) {
        setShowViolationModal(true);
      }
      return;
    }

    // Online Submission: Standard DataContext pipeline
    const newInsp = createInspection(payload, currentUser?.name);
    setSubmittedInspection(newInsp);
    setIsSubmitting(false);

    if (hasFailures) {
      setShowViolationModal(true);
    } else {
      setInspectionSuccessMsg(`Inspection ${newInsp.inspectionId} submitted successfully to central database.`);
    }
  };

  const candidateCert = candidateWorker ? certificates.find(c => c.workerId === candidateWorker.workerId) : null;

  return (
    <div className="space-y-6">
      {/* Header with Connectivity Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-enterprise-border">
        <div>
          <h2 className="text-xl font-bold text-enterprise-text flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-mgAmber-600" />
            <span>Digital Field Safety Inspection Runner</span>
          </h2>
          <p className="text-xs text-enterprise-text-muted mt-1">
            Standard Operating Procedure (SOP) safety & compliance evaluation checklist • Offline-First Enabled
          </p>
        </div>

        {/* Live Network & Storage Status Pill */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleSimulatedOffline}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
              isOnline 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                : 'bg-red-50 text-red-700 border-red-300 animate-pulse'
            }`}
            title="Click to toggle simulated offline mode for testing"
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-600" /> : <WifiOff className="w-3.5 h-3.5 text-red-600" />}
            <span>{isOnline ? '🟢 Online Mode' : '🔴 Offline Mode (IndexedDB Active)'}</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {inspectionSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-800 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-emerald-900">Submission Recorded</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">{inspectionSuccessMsg}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setInspectionSuccessMsg('');
              if (onComplete) onComplete();
            }}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors cursor-pointer shrink-0"
          >
            Done
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Inspection Header Selector */}
        <div className="mg-card p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-enterprise-text mb-1.5">Assigned Coal Mine</label>
            <select
              value={mineId}
              onChange={(e) => handleMineChange(e.target.value)}
              className="mg-select text-xs font-medium"
            >
              {mines.map(m => (
                <option key={m.mineId} value={m.mineId}>{m.mineName} ({m.mineId})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-enterprise-text mb-1.5">Inspected Mine Zone / Operational Area</label>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="mg-select text-xs font-medium"
            >
              {selectedMine?.zones ? (
                selectedMine.zones.map(z => (
                  <option key={z.zoneId} value={z.zoneName}>{z.zoneId}: {z.zoneName}</option>
                ))
              ) : (
                <>
                  <option value="North Shaft">North Shaft</option>
                  <option value="South Shaft">South Shaft</option>
                  <option value="Processing Plant">Processing Plant</option>
                  <option value="Substation">Substation</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-enterprise-text mb-1.5">Audit Type</label>
            <select
              value={inspectionType}
              onChange={(e) => setInspectionType(e.target.value)}
              className="mg-select text-xs"
            >
              <option value="Electrical & Personnel Compliance Safety Inspection">Electrical & Personnel Compliance</option>
              <option value="Ventilation & Gas Testing Audit">Ventilation & Gas Testing Audit</option>
              <option value="Roof Support & Strata Control Inspection">Roof Support & Strata Control</option>
              <option value="HEMM Machinery & Transport Safety Audit">HEMM Machinery & Transport Safety</option>
            </select>
          </div>
        </div>

        {/* Checklist Table */}
        <div className="mg-card overflow-hidden">
          <div className="p-4 border-b border-enterprise-border bg-gray-50 flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-enterprise-text">
              Safety Evaluation Checklist ({checklist.length} Items)
            </span>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-mgGreen-600 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Pass
              </span>
              <span className="flex items-center gap-1 text-mgRed-600 font-semibold">
                <XCircle className="w-3.5 h-3.5" /> Fail (Violation)
              </span>
              <span className="flex items-center gap-1 text-enterprise-text-muted">
                <MinusCircle className="w-3.5 h-3.5" /> N/A
              </span>
            </div>
          </div>

          <div className="divide-y divide-enterprise-border">
            {checklist.map((item) => (
              <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-enterprise-text-secondary uppercase tracking-wider border border-gray-200">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-enterprise-text mt-1.5">{item.item}</p>
                  <input
                    type="text"
                    value={item.notes}
                    onChange={(e) => updateItemNotes(item.id, e.target.value)}
                    placeholder="Add inspector field observation notes..."
                    className="mt-2 w-full max-w-lg px-2.5 py-1.5 bg-white border border-enterprise-border rounded text-[11px] text-enterprise-text focus:outline-none focus:ring-2 focus:ring-mgBlue-500 font-mono"
                  />
                </div>

                {/* PASS / FAIL / NA Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => updateItemStatus(item.id, 'PASS')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border ${
                      item.status === 'PASS'
                        ? 'bg-mgGreen-600 text-white border-mgGreen-600 shadow-sm'
                        : 'bg-white text-enterprise-text-secondary hover:border-mgGreen-500 border-enterprise-border'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>PASS</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateItemStatus(item.id, 'FAIL')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border ${
                      item.status === 'FAIL'
                        ? 'bg-mgRed-600 text-white border-mgRed-600 shadow-sm'
                        : 'bg-white text-enterprise-text-secondary hover:border-mgRed-500 border-enterprise-border'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>FAIL</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateItemStatus(item.id, 'N/A')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border ${
                      item.status === 'N/A'
                        ? 'bg-gray-600 text-white border-gray-600'
                        : 'bg-white text-enterprise-text-secondary hover:border-gray-400 border-enterprise-border'
                    }`}
                  >
                    <MinusCircle className="w-3.5 h-3.5" />
                    <span>N/A</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evidence Photos Section (IndexedDB Offline Support) */}
        <div className="mg-card p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-enterprise-border pb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-enterprise-text flex items-center gap-2">
                <Camera className="w-4 h-4 text-mgBlue-600" />
                <span>Field Evidence Photos ({photos.length} Captured)</span>
              </h3>
              <p className="text-[11px] text-enterprise-text-muted mt-0.5">
                Photographs stored in browser IndexedDB while offline; automatically uploaded upon sync
              </p>
            </div>

            <label className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm transition-all self-start sm:self-auto">
              <Camera className="w-3.5 h-3.5" />
              <span>Capture / Add Photo</span>
              <input
                type="file"
                accept="image/*"
                multiple
                capture="environment"
                onChange={handlePhotoCapture}
                className="hidden"
              />
            </label>
          </div>

          {/* Photo Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {photos.map((photo) => (
              <div 
                key={photo.id}
                className="group relative bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden p-2.5 space-y-2 hover:border-mgBlue-400 transition-all shadow-2xs"
              >
                {/* Photo Thumbnail */}
                <div className="h-28 w-full bg-slate-200 rounded-xl overflow-hidden relative">
                  <img
                    src={photo.previewUrl}
                    alt={photo.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Photo saved offline ✓</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePhoto(photo.id)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-600/90 text-white rounded-full flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Photo Metadata */}
                <div className="space-y-0.5 text-[11px]">
                  <p className="font-bold text-slate-800 truncate">{photo.name}</p>
                  <div className="flex items-center justify-between text-slate-500 text-[10px]">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-500" /> 23.795°N, 86.430°E
                    </span>
                    <span>{photo.size}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Notes & Submit */}
        <div className="mg-card p-5 space-y-4">
          <label className="block text-xs font-semibold text-enterprise-text">Inspector Overall Concluding Remarks</label>
          <textarea
            rows="2"
            value={generalNotes}
            onChange={(e) => setGeneralNotes(e.target.value)}
            className="mg-input text-xs"
            placeholder="Summarize key inspection findings, immediate hazard warnings, or verbal instructions given..."
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-enterprise-border">
            <div className="flex items-center gap-2 text-xs">
              {hasFailures ? (
                <div className="flex items-center gap-1.5 text-mgRed-600 font-semibold bg-mgRed-50 px-3 py-1.5 rounded-lg border border-red-200">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Compliance Failures Detected — Filing violation ticket will be required</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-mgGreen-600 font-semibold bg-mgGreen-50 px-3 py-1.5 rounded-lg border border-green-200">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>All evaluated safety parameters PASS</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full sm:w-auto px-6 py-2.5 bg-mgBlue-600 hover:bg-mgBlue-500 active:bg-mgBlue-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-mgBlue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`}
            >
              {isSubmitting ? (
                <span>Recording Inspection...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{isOnline ? 'Submit Field Inspection Report' : 'Save Inspection to Device (Offline)'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Auto Report Violation Modal upon failure */}
      <ReportViolationModal
        isOpen={showViolationModal}
        onClose={() => {
          setShowViolationModal(false);
          if (onComplete) onComplete();
        }}
        initialData={{
          mineId,
          area,
          category: 'Statutory Certification Breach',
          severity: 'HIGH',
          workerId: candidateWorker?.workerId || '',
          certificateId: candidateCert?.certificateId || '',
          description: candidateWorker 
            ? `${candidateWorker.role} ${candidateWorker.name} (${candidateWorker.workerId}) observed on duty in ${area} with expired safety competency certification.`
            : `Safety non-compliance detected in ${area} requiring immediate remediation.`,
          inspectionId: submittedInspection?.inspectionId || submittedInspection?.localId
        }}
      />
    </div>
  );
}
