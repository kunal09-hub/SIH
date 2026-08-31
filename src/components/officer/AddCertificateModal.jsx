import React, { useState, useEffect, useRef } from 'react';
import Modal from '../common/Modal';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { CERTIFICATE_CATEGORIES } from '../../utils/seedData';
import { getTodayDateString } from '../../utils/dateHelpers';
import { UploadCloud, FileCheck, CheckCircle2 } from 'lucide-react';

export default function AddCertificateModal({ isOpen, onClose, initialData = {} }) {
  const { workers, mines, addOrUpdateCertificate, violations } = useData();
  const { currentUser } = useAuth();
  const fileInputRef = useRef(null);

  const defaultWorkerId = initialData.workerId || workers[0]?.workerId || 'W-10452';
  const [workerId, setWorkerId] = useState(defaultWorkerId);
  const [certificateType, setCertificateType] = useState(initialData.certificateType || 'Electrical Competency Certificate');
  const [certificateId, setCertificateId] = useState(initialData.certificateId || `CERT-2026-${Date.now().toString().slice(-4)}`);
  const [issueDate, setIssueDate] = useState(getTodayDateString());
  const [expiryDate, setExpiryDate] = useState('2028-08-27'); // 2 years in future (VALID)
  const [issuingAuthority, setIssuingAuthority] = useState('State Directorate of Electrical & Mining Safety');
  const [docName, setDocName] = useState('renewed_competency_certificate_2026.pdf');
  const [linkedViolationId, setLinkedViolationId] = useState(initialData.linkedViolationId || '');

  useEffect(() => {
    if (isOpen) {
      const wId = initialData.workerId || workers[0]?.workerId || 'W-10452';
      setWorkerId(wId);
      setCertificateType(initialData.certificateType || 'Electrical Competency Certificate');
      setCertificateId(initialData.certificateId || `CERT-2026-${Date.now().toString().slice(-4)}`);
      setIssueDate(getTodayDateString());
      setExpiryDate('2028-08-27');
      setIssuingAuthority('State Directorate of Electrical & Mining Safety');
      setDocName('renewed_competency_certificate_2026.pdf');
      setLinkedViolationId(initialData.linkedViolationId || '');
    }
  }, [isOpen, initialData, workers]);

  const selectedWorker = workers.find(w => w.workerId === workerId);
  const targetMineId = selectedWorker?.mineId || currentUser?.mineId || 'MINE-01';

  // Handle file select
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocName(file.name);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addOrUpdateCertificate({
      certificateId,
      workerId,
      workerName: selectedWorker?.name || 'Worker',
      certificateType,
      issueDate,
      expiryDate,
      issuingAuthority,
      documentUrl: docName,
      mineId: targetMineId,
      verificationStatus: 'VALID'
    }, linkedViolationId || null, currentUser?.name);

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📜 Register Renewed Compliance Certificate" subtitle="Record worker's renewed competency credentials into compliance registry" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
          <strong>Compliance Registration Workflow:</strong> When personnel submit renewed certification documents, the Mine Officer enters the validity details here. The system updates the worker's status to 🟢 VALID and advances any linked violation to <strong>VERIFICATION REQUIRED</strong> for inspector sign-off.
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#334155] mb-1">Target Personnel</label>
            <select
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#172033] focus:outline-none focus:border-blue-600"
            >
              {workers.map(w => (
                <option key={w.workerId} value={w.workerId}>{w.name} ({w.role}) — {w.workerId}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#334155] mb-1">Certificate Category</label>
            <select
              value={certificateType}
              onChange={(e) => setCertificateType(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#172033] focus:outline-none focus:border-blue-600"
            >
              {CERTIFICATE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#334155] mb-1">Certificate Document ID</label>
            <input
              type="text"
              value={certificateId}
              onChange={(e) => setCertificateId(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#172033] font-mono focus:outline-none focus:border-blue-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#334155] mb-1">Issue Date</label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#172033] font-mono focus:outline-none focus:border-blue-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#334155] mb-1">Valid Until (Expiry)</label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-emerald-700 font-bold font-mono focus:outline-none focus:border-blue-600"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#334155] mb-1">Issuing Authority / Training Body</label>
            <input
              type="text"
              value={issuingAuthority}
              onChange={(e) => setIssuingAuthority(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#172033] focus:outline-none focus:border-blue-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#334155] mb-1">Link to Active Violation (Optional)</label>
            <select
              value={linkedViolationId}
              onChange={(e) => setLinkedViolationId(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#172033] font-mono focus:outline-none focus:border-blue-600"
            >
              <option value="">None (Independent Registration)</option>
              {violations.filter(v => v.status !== 'RESOLVED').map(v => (
                <option key={v.violationId} value={v.violationId}>
                  {v.violationId} — {v.mineName} ({v.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Document Attachment */}
        <div className="p-3.5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] flex items-center justify-between">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept=".pdf,.png,.jpg,.jpeg" 
          />
          <div className="flex items-center gap-2.5">
            <UploadCloud className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-xs font-semibold text-[#172033]">Scanned Document Attachment</p>
              <p className="text-[10px] text-[#64748B] font-mono">{docName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-[#334155] rounded-xl text-xs border border-[#CBD5E1] font-semibold shadow-sm"
          >
            Browse / Attach
          </button>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-[#334155] border border-[#CBD5E1] rounded-xl text-xs font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Register & Submit for Verification</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
