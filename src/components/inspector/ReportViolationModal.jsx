import React, { useState, useEffect, useRef } from 'react';
import Modal from '../common/Modal';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useOffline } from '../../context/OfflineContext';
import { evaluateRisk } from '../../utils/aiRiskEngine';
import { calculateCertificateStatus } from '../../utils/dateHelpers';
import { AlertTriangle, Sparkles, UploadCloud } from 'lucide-react';

export default function ReportViolationModal({ isOpen, onClose, initialData = null }) {
  const { mines, workers, certificates, reportViolation } = useData();
  const { currentUser } = useAuth();
  const { isOnline, queueOfflineItem } = useOffline();
  const fileInputRef = useRef(null);
  const prevIsOpenRef = useRef(false);

  const [mineId, setMineId] = useState('MINE-01');
  const [area, setArea] = useState('');
  const [category, setCategory] = useState('Statutory Certification Breach');
  const [severity, setSeverity] = useState('HIGH');
  const [workerId, setWorkerId] = useState('');
  const [certificateId, setCertificateId] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceName, setEvidenceName] = useState('evidence_field_capture.jpg');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state ONLY when the modal transitions from closed to open
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      const defaultMine = initialData?.mineId || (currentUser?.role === 'OFFICER' ? currentUser.mineId : null) || mines[0]?.mineId || 'MINE-01';
      setMineId(defaultMine);
      setArea(initialData?.area || '');
      setCategory(initialData?.category || 'Statutory Certification Breach');
      setSeverity(initialData?.severity || 'HIGH');
      setWorkerId(initialData?.workerId || '');
      setCertificateId(initialData?.certificateId || '');
      setDescription(initialData?.description || '');
      setEvidenceName(initialData?.evidence || 'evidence_field_capture.jpg');
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, initialData, currentUser, mines]);

  // Interconnected field handlers
  const handleMineChange = (newMineId) => {
    setMineId(newMineId);
    // Reset worker and certificate if they don't belong to the newly selected mine
    if (workerId) {
      const workerStillValid = workers.some(w => w.workerId === workerId && w.mineId === newMineId);
      if (!workerStillValid) {
        setWorkerId('');
        setCertificateId('');
      }
    }
  };

  const handleWorkerChange = (newWorkerId) => {
    setWorkerId(newWorkerId);
    if (!newWorkerId) {
      setCertificateId('');
    } else {
      const workerCerts = certificates.filter(c => c.workerId === newWorkerId);
      // Auto-select expired certificate if present, or first certificate
      const expiredCert = workerCerts.find(c => calculateCertificateStatus(c.expiryDate).status === 'EXPIRED');
      if (expiredCert) {
        setCertificateId(expiredCert.certificateId);
      } else if (workerCerts.length > 0) {
        setCertificateId(workerCerts[0].certificateId);
      } else {
        setCertificateId('');
      }
    }
  };

  const handleCertificateChange = (newCertId) => {
    setCertificateId(newCertId);
    if (newCertId) {
      const foundCert = certificates.find(c => c.certificateId === newCertId);
      if (foundCert && foundCert.workerId && foundCert.workerId !== workerId) {
        setWorkerId(foundCert.workerId);
      }
    }
  };

  // Handle file change
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setEvidenceName(file.name);
    }
  };

  // Available workers and certificates for the selected target mine
  const mineWorkers = workers.filter(w => w.mineId === mineId);
  const selectedWorker = workers.find(w => w.workerId === workerId);
  const availableCertificates = certificates.filter(c => {
    if (workerId) return c.workerId === workerId;
    return c.mineId === mineId || mineWorkers.some(w => w.workerId === c.workerId);
  });

  // Live AI Risk Assessment Preview
  const aiPreview = evaluateRisk({
    category,
    severity,
    workerRole: selectedWorker?.role || '',
    certStatus: certificateId ? 'EXPIRED' : 'VALID',
    area: area || 'General Mine Sector',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!area.trim() || !description.trim()) return;

    setIsSubmitting(true);
    const selectedMine = mines.find(m => m.mineId === mineId);
    const payload = {
      mineId,
      mineName: selectedMine?.mineName || mineId,
      area: area.trim(),
      category,
      severity,
      workerId: workerId || null,
      workerName: selectedWorker?.name || null,
      certificateId: certificateId || null,
      description: description.trim(),
      evidence: evidenceName,
      inspectionId: initialData?.inspectionId || null,
    };

    if (!isOnline) {
      queueOfflineItem('VIOLATION', payload, currentUser?.name);
      setIsSubmitting(false);
      onClose();
      return;
    }

    reportViolation(payload, currentUser?.name);

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
          {/* Target Mine */}
          <div>
            <label className="mg-label">Target Mine</label>
            <select
              value={mineId}
              onChange={(e) => handleMineChange(e.target.value)}
              className="mg-select"
            >
              {mines.map(m => (
                <option key={m.mineId} value={m.mineId}>
                  {m.mineName} ({m.location ? m.location.split(',')[0] : m.mineId})
                </option>
              ))}
            </select>
          </div>

          {/* Operational Area / Sector */}
          <div>
            <label className="mg-label">Operational Area / Sector</label>
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="mg-input"
              placeholder="e.g. North Shaft Zone 2 or Substation"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Violation Category */}
          <div>
            <label className="mg-label">Violation Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mg-select"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Severity Classification */}
          <div>
            <label className="mg-label">Severity Classification</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="mg-select font-semibold"
            >
              <option value="LOW">LOW (Observational)</option>
              <option value="MEDIUM">MEDIUM (Remediation Required)</option>
              <option value="HIGH">HIGH (Major Compliance Breach)</option>
              <option value="CRITICAL">CRITICAL (Immediate Danger)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Linked Worker */}
          <div>
            <label className="mg-label">Linked Worker (Optional)</label>
            <select
              value={workerId}
              onChange={(e) => handleWorkerChange(e.target.value)}
              className="mg-select"
            >
              <option value="">None / General Mine Hazard</option>
              {mineWorkers.map(w => (
                <option key={w.workerId} value={w.workerId}>
                  {w.name} ({w.role})
                </option>
              ))}
            </select>
          </div>

          {/* Linked Certificate */}
          <div>
            <label className="mg-label">Linked Certificate (Optional)</label>
            <select
              value={certificateId}
              onChange={(e) => handleCertificateChange(e.target.value)}
              className="mg-select font-mono text-xs"
            >
              <option value="">None / No Linked Certificate</option>
              {availableCertificates.map(c => {
                const st = calculateCertificateStatus(c.expiryDate).status;
                return (
                  <option key={c.certificateId} value={c.certificateId}>
                    {c.certificateId} — {c.certificateType} ({st})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Detailed Violation Description */}
        <div>
          <label className="mg-label">Detailed Violation Description</label>
          <textarea
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mg-input"
            placeholder="Describe the safety breach observed in detail..."
            required
          />
        </div>

        {/* Evidence upload */}
        <div className="p-3 bg-gray-50 rounded-lg border border-enterprise-border flex items-center justify-between">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".jpg,.jpeg,.png,.pdf"
          />
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-mgBlue-600" />
            <div>
              <p className="text-sm font-medium text-enterprise-text">Evidence Attachment</p>
              <p className="text-xs text-enterprise-text-muted font-mono">{evidenceName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mg-btn-secondary text-xs py-1.5 px-3"
          >
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
            <span className="text-sm font-mono font-bold text-mgRed-600">
              {aiPreview.score}/100 ({aiPreview.level})
            </span>
          </div>
          <p className="text-xs text-enterprise-text-secondary mt-1">{aiPreview.summary}</p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-enterprise-border">
          <button type="button" onClick={onClose} className="mg-btn-secondary">Cancel</button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-mgRed-600 hover:bg-mgRed-500 text-white rounded-lg text-sm font-bold shadow transition-colors flex items-center gap-1.5"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Submit Violation</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
