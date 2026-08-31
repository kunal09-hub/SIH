import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Scale, Send } from 'lucide-react';

export default function IssueDirectiveModal({ isOpen, onClose }) {
  const { mines, issueDirective } = useData();
  const { currentUser } = useAuth();

  const [mineId, setMineId] = useState('MINE-03');
  const [title, setTitle] = useState('Mandatory Ventilation Recalibration & Blasting Protocol Audit');
  const [description, setDescription] = useState('Notice: Compliance scores in Deep Seam IV have breached safety threshold. DGMS statutory guidelines mandate immediate engineering audit within 48 hours to avert operational stop-work notice.');
  const [severity, setSeverity] = useState('CRITICAL');

  const handleSubmit = (e) => {
    e.preventDefault();
    issueDirective({
      mineId,
      title,
      description,
      severity,
    }, currentUser?.name);

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="⚖️ Issue Regulatory Compliance Notice" subtitle="Issue a formal statutory safety compliance notice to a non-compliant mine unit" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#334155] mb-1">Target Non-Compliant Mine</label>
          <select
            value={mineId}
            onChange={(e) => setMineId(e.target.value)}
            className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#172033] focus:outline-none focus:border-blue-600"
          >
            {mines.map(m => (
              <option key={m.mineId} value={m.mineId}>{m.mineName} (Compliance: {m.complianceScore}%)</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#334155] mb-1">Compliance Notice Title / Reference</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#172033] focus:outline-none focus:border-blue-600"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#334155] mb-1">Detailed Compliance Remediation Directives</label>
          <textarea
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#172033] focus:outline-none focus:border-blue-600"
            required
          />
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
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Scale className="w-4 h-4" />
            <span>Issue Compliance Notice</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
