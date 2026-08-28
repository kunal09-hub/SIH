import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useData } from '../../context/DataContext';
import { calculateCertificateStatus, formatDate } from '../../utils/dateHelpers';
import Badge from '../common/Badge';
import { QrCode, Search, CheckCircle2, AlertTriangle, FileText, User } from 'lucide-react';

export default function CertificateVerifierModal({ isOpen, onClose }) {
  const { certificates, workers, mines } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCert, setSelectedCert] = useState(() => certificates[0]);

  const handleSearch = (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    const found = certificates.find(
      c => c.certificateId.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
           c.workerName.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
           c.workerId.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );
    if (found) {
      setSelectedCert(found);
    }
  };

  const handleSelectCertId = (id) => {
    const found = certificates.find(c => c.certificateId === id);
    if (found) {
      setSelectedCert(found);
      setSearchQuery(found.certificateId);
    }
  };

  const statusObj = selectedCert ? calculateCertificateStatus(selectedCert.expiryDate) : null;
  const linkedWorker = selectedCert ? workers.find(w => w.workerId === selectedCert.workerId) : null;
  const linkedMine = selectedCert ? mines.find(m => m.mineId === selectedCert.mineId) : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🔍 Certificate Verification & Compliance Lookup" subtitle="Verify worker competency credentials against active compliance registry" maxWidth="max-w-2xl">
      <div className="space-y-4">
        {/* Search & Certificate Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-enterprise-text-muted absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ID or Worker Name..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-enterprise-border rounded-lg text-xs text-enterprise-text font-mono focus:outline-none focus:ring-2 focus:ring-mgBlue-500 focus:border-mgBlue-500"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 bg-mgBlue-600 hover:bg-mgBlue-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shadow-sm"
            >
              <span>Search</span>
            </button>
          </form>

          <div>
            <select
              value={selectedCert?.certificateId || ''}
              onChange={(e) => handleSelectCertId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-enterprise-border rounded-lg text-xs text-enterprise-text focus:outline-none focus:ring-2 focus:ring-mgBlue-500 focus:border-mgBlue-500 font-mono"
            >
              {certificates.map(c => (
                <option key={c.certificateId} value={c.certificateId}>
                  {c.certificateId} — {c.workerName} ({c.certificateType.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Demo Pre-set Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] text-enterprise-text-muted">Demo Quick Select:</span>
          {certificates.slice(0, 4).map(c => {
            const st = calculateCertificateStatus(c.expiryDate).status;
            return (
              <button
                key={c.certificateId}
                type="button"
                onClick={() => handleSelectCertId(c.certificateId)}
                className={`px-2 py-1 border rounded text-[11px] font-mono transition-colors ${
                  st === 'EXPIRED' 
                    ? 'bg-mgRed-50 hover:bg-red-100 text-mgRed-600 border-red-200' 
                    : st === 'EXPIRING SOON' 
                    ? 'bg-mgAmber-50 hover:bg-amber-100 text-mgAmber-600 border-amber-200' 
                    : 'bg-mgGreen-50 hover:bg-green-100 text-mgGreen-600 border-green-200'
                }`}
              >
                {c.certificateId} ({c.workerName.split(' ')[0]} - {st})
              </button>
            );
          })}
        </div>

        {/* Certificate Display Card */}
        {selectedCert ? (
          <div className="bg-white border border-enterprise-border rounded-xl p-5 relative overflow-hidden shadow-card">
            {/* Watermark */}
            <div className="absolute right-4 top-4 opacity-10 pointer-events-none">
              <QrCode className="w-32 h-32 text-enterprise-text-muted" />
            </div>

            <div className="flex items-start justify-between relative z-10">
              <div>
                <span className="text-[10px] uppercase font-bold text-mgBlue-600 tracking-wider">
                  Coal Mine Safety Authority Verification Record
                </span>
                <h4 className="text-base font-extrabold text-enterprise-text mt-1">{selectedCert.certificateType}</h4>
                <p className="text-xs text-enterprise-text-muted font-mono mt-0.5">ID: {selectedCert.certificateId}</p>
              </div>
              <Badge size="md">{statusObj?.status}</Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-enterprise-border text-xs">
              <div>
                <span className="text-[10px] text-enterprise-text-muted uppercase font-semibold">Worker Name</span>
                <p className="font-bold text-enterprise-text mt-0.5">{selectedCert.workerName}</p>
                <p className="text-[10px] text-enterprise-text-muted font-mono">({selectedCert.workerId})</p>
              </div>

              <div>
                <span className="text-[10px] text-enterprise-text-muted uppercase font-semibold">Designation</span>
                <p className="font-medium text-enterprise-text mt-0.5">{linkedWorker?.role || 'Mining Crew'}</p>
                <p className="text-[10px] text-enterprise-text-muted">{linkedWorker?.area}</p>
              </div>

              <div>
                <span className="text-[10px] text-enterprise-text-muted uppercase font-semibold">Assigned Mine</span>
                <p className="font-medium text-enterprise-text mt-0.5">{linkedMine?.mineName || 'Demo Mine'}</p>
                <p className="text-[10px] text-enterprise-text-muted">{linkedMine?.location?.split(',')[0]}</p>
              </div>

              <div>
                <span className="text-[10px] text-enterprise-text-muted uppercase font-semibold">Issue Date</span>
                <p className="font-mono text-enterprise-text-secondary mt-0.5">{formatDate(selectedCert.issueDate)}</p>
              </div>

              <div>
                <span className="text-[10px] text-enterprise-text-muted uppercase font-semibold">Expiry Date</span>
                <p className={`font-mono font-bold mt-0.5 ${statusObj?.status === 'EXPIRED' ? 'text-mgRed-600' : 'text-enterprise-text-secondary'}`}>
                  {formatDate(selectedCert.expiryDate)}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-enterprise-text-muted uppercase font-semibold">Issuing Authority</span>
                <p className="text-enterprise-text-secondary mt-0.5 truncate">{selectedCert.issuingAuthority}</p>
              </div>
            </div>

            {/* Status explanation notice */}
            <div className={`mt-4 p-3 rounded-lg border text-xs flex items-center gap-2 ${
              statusObj?.status === 'EXPIRED'
                ? 'bg-mgRed-50 border-red-200 text-mgRed-600'
                : statusObj?.status === 'EXPIRING SOON'
                ? 'bg-mgAmber-50 border-amber-200 text-mgAmber-600'
                : 'bg-mgGreen-50 border-green-200 text-mgGreen-600'
            }`}>
              {statusObj?.status === 'EXPIRED' ? (
                <AlertTriangle className="w-4 h-4 text-mgRed-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-mgGreen-600 shrink-0" />
              )}
              <span>
                <strong>System Verdict:</strong> {statusObj?.label}. {statusObj?.status === 'EXPIRED' ? 'Mandatory non-compliance if deployed in operational zone.' : 'Eligible for active duty.'}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-enterprise-text-muted bg-white rounded-xl border border-enterprise-border">
            No matching certificate record found in database.
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-gray-50 border border-enterprise-border text-enterprise-text rounded-lg text-xs font-semibold"
          >
            Close Verifier
          </button>
        </div>
      </div>
    </Modal>
  );
}
