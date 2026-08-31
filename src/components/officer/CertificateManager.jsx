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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-2xl font-extrabold text-[#172033] tracking-tight flex items-center gap-2">
              <FileCheck className="w-6 h-6 text-emerald-600" />
              <span>Certificate Database & Expiry Tracker</span>
            </h2>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Track all statutory mining competencies, upcoming expiry thresholds, and renewal records
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 self-start sm:self-auto transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Upload / Register Certificate</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white border border-[#E2E8F0] p-4 rounded-2xl text-xs shadow-sm">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5">Filter by Mine</label>
          <select
            value={selectedMine}
            disabled={currentUser?.role === 'OFFICER'}
            onChange={(e) => setSelectedMine(e.target.value)}
            className={`w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#172033] text-xs focus:outline-none focus:border-blue-600 ${currentUser?.role === 'OFFICER' ? 'opacity-80 cursor-not-allowed bg-slate-100 font-semibold' : ''}`}
          >
            {currentUser?.role === 'OFFICER' ? (
              <option value={currentUser.mineId || 'MINE-01'}>Mine Alpha (Assigned Unit)</option>
            ) : (
              <>
                <option value="ALL">All Mines ({certificates.length} Records)</option>
                {mines.map(m => <option key={m.mineId} value={m.mineId}>{m.mineName}</option>)}
              </>
            )}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5">Status Filter</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#172033] text-xs focus:outline-none focus:border-blue-600"
          >
            <option value="ALL">All Statuses ({certificates.length})</option>
            <option value="VALID">VALID</option>
            <option value="EXPIRING SOON">EXPIRING SOON (within 30d)</option>
            <option value="EXPIRED">EXPIRED</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5">Category Filter</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#172033] text-xs focus:outline-none focus:border-blue-600"
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
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5">Search Records</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search worker or Cert ID..."
            className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#172033] text-xs focus:outline-none focus:border-blue-600 font-mono"
          />
        </div>
      </div>

      {/* Certificates Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
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
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredCerts.map((c) => {
                const st = calculateCertificateStatus(c.expiryDate);
                const linkedMine = mines.find(m => m.mineId === c.mineId);
                return (
                  <tr key={c.certificateId} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="p-3.5">
                      <p className="font-mono font-bold text-[#172033]">{c.certificateId}</p>
                      <p className="text-[11px] text-blue-600 font-semibold mt-0.5">{c.certificateType}</p>
                    </td>
                    <td className="p-3.5">
                      <p className="font-semibold text-[#172033]">{c.workerName}</p>
                      <p className="text-[10px] text-[#64748B] font-mono">{c.workerId}</p>
                    </td>
                    <td className="p-3.5 text-[#475569]">
                      {linkedMine?.mineName || 'Mine Alpha'}
                    </td>
                    <td className="p-3.5 font-mono text-[#64748B]">
                      {formatDate(c.issueDate)}
                    </td>
                    <td className={`p-3.5 font-mono font-bold ${st.status === 'EXPIRED' ? 'text-red-600' : 'text-[#334155]'}`}>
                      {formatDate(c.expiryDate)}
                    </td>
                    <td className="p-3.5">
                      <Badge size="sm">{st.status}</Badge>
                    </td>
                    <td className="p-3.5 text-[#64748B] text-[11px] max-w-xs truncate">
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
