import React, { useState, useEffect, useRef } from 'react';
import Modal from '../common/Modal';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { evaluateRisk } from '../../utils/aiRiskEngine';
import { AlertTriangle, Sparkles, UploadCloud } from 'lucide-react';

export default function ReportViolationModal({ isOpen, onClose, initialData = {} }) {
  const { mines, workers, certificates, reportViolation } = useData();
  const { currentUser } = useAuth();
  const fileInputRef = useRef(null);

  const [mineId, setMineId] = useState(initialData.mineId || 'MINE-01');
  const [area, setArea] = useState(initialData.area || 'Substation Zone 3');
  const [category, setCategory] = useState(initialData.category || 'Statutory Certification Breach');
  const [severity, setSeverity] = useState(initialData.severity || 'HIGH');
  const [workerId, setWorkerId] = useState(initialData.workerId || '');
  const [certificateId, setCertificateId] = useState(initialData.certificateId || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [evidenceName, setEvidenceName] = useState('evidence_sample_photo.jpg');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state whenever modal opens with new initialData
  useEffect(() => {
    if (isOpen) {
      setMineId(initialData.mineId || 'MINE-01');
      setArea(initialData.area || 'Substation Zone 3');
      setCategory(initialData.category || 'Statutory Certification Breach');
      setSeverity(initialData.severity || 'HIGH');
      setWorkerId(initialData.workerId || '');
      setCertificateId(initialData.certificateId || '');
      setDescription(initialData.description || '');
      setEvidenceName('evidence_field_capture.jpg');
    }
  }, [isOpen, initialData]);

  // Handle file change
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setEvidenceName(file.name);
    }
  };

  // Live AI Preview
  const selectedWorker = workers.find(w => w.workerId === workerId);
  const aiPreview = evaluateRisk({
    category,
    severity,
    workerRole: selectedWorker?.role || '',
    certStatus: certificateId ? 'EXPIRED' : 'VALID',
    area,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const selectedMine = mines.find(m => m.mineId === mineId);

    reportViolation({
      mineId,
      mineName: selectedMine?.mineName || 'Demo Mine',
      area,
      category,
      severity,
      workerId: workerId || null,
      workerName: selectedWorker?.name || null,
      certificateId: certificateId || null,
      description,
      evidence: evidenceName,
      inspectionId: initialData.inspectionId || null,
    }, currentUser?.name);

    setIsSubmitting(false);
    onClose();
  };

  const categories = [
    'Statutory Certification Breach',
    'Explosives & Blasting Safety Non-Compliance',
    'Equipment Maintenance Safety Defect',
    'Ventilation & Environmental Hazard',
    'Roof & Strata Support Discrepancy',
    'PPE & Individual Safety Violation',
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="⚠️ Report Compliance Violation" subtitle="File a mine compliance violation with AI risk prioritization" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="mg-label">Target Mine</label>
            <select value={mineId} onChange={(e) => setMineId(e.target.value)} className="mg-select">
              {mines.map(m => (
                <option key={m.mineId} value={m.mineId}>{m.mineName} ({m.location.split(',')[0]})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mg-label">Operational Area / Sector</label>
            <input type="text" value={area} onChange={(e) => setArea(e.target.value)} className="mg-input" placeholder="e.g. Substation Zone 3" required />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="mg-label">Violation Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="mg-select">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="mg-label">Severity Classification</label>
            <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="mg-select font-semibold">
              <option value="LOW">LOW (Observational)</option>
              <option value="MEDIUM">MEDIUM (Remediation Required)</option>
              <option value="HIGH">HIGH (Major Compliance Breach)</option>
              <option value="CRITICAL">CRITICAL (Immediate Danger)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="mg-label">Linked Worker (Optional)</label>
            <select value={workerId} onChange={(e) => setWorkerId(e.target.value)} className="mg-select">
              <option value="">None / General Mine Hazard</option>
              {workers.filter(w => w.mineId === mineId).map(w => (
                <option key={w.workerId} value={w.workerId}>{w.name} ({w.role})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mg-label">Linked Certificate (Optional)</label>
            <select value={certificateId} onChange={(e) => setCertificateId(e.target.value)} className="mg-select font-mono">
              <option value="">None</option>
              {certificates.filter(c => !workerId || c.workerId === workerId).map(c => (
                <option key={c.certificateId} value={c.certificateId}>{c.certificateId} - {c.certificateType}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mg-label">Detailed Violation Description</label>
          <textarea rows="3" value={description} onChange={(e) => setDescription(e.target.value)} className="mg-input" placeholder="Describe the safety breach observed..." required />
        </div>

        {/* Evidence upload */}
        <div className="p-3 bg-gray-50 rounded-lg border border-enterprise-border flex items-center justify-between">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".jpg,.jpeg,.png,.pdf" />
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-mgBlue-600" />
            <div>
              <p className="text-sm font-medium text-enterprise-text">Evidence Attachment</p>
              <p className="text-xs text-enterprise-text-muted font-mono">{evidenceName}</p>
            </div>
          </div>
          <button type="button" onClick={() => fileInputRef.current?.click()} className="mg-btn-secondary text-xs py-1.5 px-3">
            Browse
          </button>
        </div>

        {/* AI Risk Preview */}
        <div className="p-3 bg-mgBlue-50 rounded-lg border border-mgBlue-100">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-enterprise-text flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-mgBlue-600" />
              AI Risk Assessment:
            </span>
            <span className="text-sm font-mono font-bold text-mgRed-600">{aiPreview.score}/100 ({aiPreview.level})</span>
          </div>
          <p className="text-xs text-enterprise-text-secondary mt-1">{aiPreview.summary}</p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-enterprise-border">
          <button type="button" onClick={onClose} className="mg-btn-secondary">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-mgRed-600 hover:bg-mgRed-500 text-white rounded-lg text-sm font-bold shadow transition-colors flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            <span>Submit Violation</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
