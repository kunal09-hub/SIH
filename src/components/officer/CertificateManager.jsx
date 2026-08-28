import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { calculateCertificateStatus, formatDate } from '../../utils/dateHelpers';
import Badge from '../common/Badge';
import { FileCheck, Plus, Search, Filter, AlertTriangle, CheckCircle2 } from 'lucide-react';
import AddCertificateModal from './AddCertificateModal';

export default function CertificateManager() {
  const { certificates, workers, mines } = useData();
  const { currentUser } = useAuth();

  const [selectedMine, setSelectedMine] = useState(currentUser?.role === 'OFFICER' ? (currentUser.mineId || 'MINE-01') : 'ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredCerts = certificates.filter(c => {
    if (selectedMine !== 'ALL' && c.mineId !== selectedMine) return false;
    const st = calculateCertificateStatus(c.expiryDate).status;
    if (filterStatus !== 'ALL' && st !== filterStatus) return false;
    if (filterCategory !== 'ALL' && c.certificateType !== filterCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return c.certificateId.toLowerCase().includes(q) ||
             c.workerName.toLowerCase().includes(q) ||
             c.certificateType.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-enterprise-border">
        <div>
          <h2 className="text-xl font-bold text-enterprise-text flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-mgGreen-600" />
            <span>Master Certificate Database & Expiry Tracker</span>
          </h2>
          <p className="text-xs text-enterprise-text-muted mt-1">
            Track all safety mining competencies, upcoming expiry thresholds, and renewal archives
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-mgBlue-600 hover:bg-mgBlue-500 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 self-start sm:self-auto transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Upload / Register Certificate</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mg-card p-3.5 text-xs">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-enterprise-text-muted mb-1">Filter by Mine</label>
          <select
            value={selectedMine}
            disabled={currentUser?.role === 'OFFICER'}
            onChange={(e) => setSelectedMine(e.target.value)}
            className={`w-full px-2.5 py-1.5 bg-gray-50 border border-enterprise-border rounded-lg text-enterprise-text text-xs focus:outline-none ${currentUser?.role === 'OFFICER' ? 'opacity-80 cursor-not-allowed border-amber-500/40 text-mgAmber-600 font-semibold' : ''}`}
          >
            {currentUser?.role === 'OFFICER' ? (
              <option value={currentUser.mineId || 'MINE-01'}>Demo Mine Alpha (Assigned Unit)</option>
            ) : (
              <>
                <option value="ALL">All Mines ({certificates.length} Records)</option>
                {mines.map(m => <option key={m.mineId} value={m.mineId}>{m.mineName}</option>)}
              </>
            )}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-enterprise-text-muted mb-1">Status Filter</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-gray-50 border border-enterprise-border rounded-lg text-enterprise-text text-xs focus:outline-none"
          >
            <option value="ALL">All Statuses ({certificates.length})</option>
            <option value="VALID">VALID</option>
            <option value="EXPIRING SOON">EXPIRING SOON (within 30d)</option>
            <option value="EXPIRED">EXPIRED</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-enterprise-text-muted mb-1">Category Filter</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-gray-50 border border-enterprise-border rounded-lg text-enterprise-text text-xs focus:outline-none"
          >
            <option value="ALL">All 5 Categories</option>
            <option value="Electrical Competency Certificate">Electrical Competency</option>
            <option value="Mining Safety Training Certificate">Mining Safety Training</option>
            <option value="First Aid & Emergency Response Certificate">First Aid & Emergency</option>
            <option value="Equipment Operation Certificate">Equipment Operation</option>
            <option value="Fire Safety Certificate">Fire Safety</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-enterprise-text-muted mb-1">Search Records</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search worker or Cert ID..."
            className="w-full px-2.5 py-1.5 bg-gray-50 border border-enterprise-border rounded-lg text-enterprise-text text-xs focus:outline-none font-mono"
          />
        </div>
      </div>

      {/* Certificates Table */}
      <div className="mg-card overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-enterprise-border text-[10px] font-bold uppercase tracking-wider text-enterprise-text-muted">
              <tr>
                <th className="p-3.5">Certificate ID & Category</th>
                <th className="p-3.5">Worker Name</th>
                <th className="p-3.5">Assigned Mine</th>
                <th className="p-3.5">Issue Date</th>
                <th className="p-3.5">Expiry Date</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Issuing Authority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-enterprise-border">
              {filteredCerts.map((c) => {
                const st = calculateCertificateStatus(c.expiryDate);
                const linkedMine = mines.find(m => m.mineId === c.mineId);
                return (
                  <tr key={c.certificateId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-3.5">
                      <p className="font-mono font-bold text-enterprise-text">{c.certificateId}</p>
                      <p className="text-[11px] text-mgBlue-600 font-medium mt-0.5">{c.certificateType}</p>
                    </td>
                    <td className="p-3.5">
                      <p className="font-semibold text-enterprise-text">{c.workerName}</p>
                      <p className="text-[10px] text-enterprise-text-muted font-mono">{c.workerId}</p>
                    </td>
                    <td className="p-3.5 text-enterprise-text-secondary">
                      {linkedMine?.mineName || 'Demo Mine'}
                    </td>
                    <td className="p-3.5 font-mono text-enterprise-text-muted">
                      {formatDate(c.issueDate)}
                    </td>
                    <td className={`p-3.5 font-mono font-bold ${st.status === 'EXPIRED' ? 'text-mgRed-600' : 'text-enterprise-text-secondary'}`}>
                      {formatDate(c.expiryDate)}
                    </td>
                    <td className="p-3.5">
                      <Badge size="sm">{st.status}</Badge>
                    </td>
                    <td className="p-3.5 text-enterprise-text-muted text-[11px] max-w-xs truncate">
                      {c.issuingAuthority}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AddCertificateModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
}
