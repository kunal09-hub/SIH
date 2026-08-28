import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { getTodayDateString } from '../../utils/dateHelpers';
import { ShieldAlert, Send } from 'lucide-react';

export default function CreateActionModal({ isOpen, onClose, violation }) {
  const { violations, createCorrectiveAction } = useData();
  const { currentUser } = useAuth();

  const openViolations = violations.filter(v => v.status !== 'RESOLVED');
  const [selectedViolationId, setSelectedViolationId] = useState(violation?.violationId || openViolations[0]?.violationId || '');
  const activeViolation = violation || violations.find(v => v.violationId === selectedViolationId) || openViolations[0];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('2026-08-30');
  const [priority, setPriority] = useState('HIGH');

  useEffect(() => {
    if (isOpen) {
      const v = violation || violations.find(x => x.violationId === selectedViolationId) || openViolations[0];
      if (v) {
        setSelectedViolationId(v.violationId);
        setTitle(
          v.category?.includes('Cert') 
            ? `Obtain & Submit Renewed Competency Certification (${v.workerName || 'Worker'})` 
            : `Remediate Safety Defect: ${v.category}`
        );
        setDescription(`Remediate violation ${v.violationId} in ${v.area}: Complete safety compliance action and submit documentary evidence for verification.`);
        setAssignedTo(v.workerName ? `${v.workerName} & Safety Desk` : 'Mine Engineering & Safety Team');
        setDueDate('2026-08-30');
        setPriority(v.severity || 'HIGH');
      }
    }
  }, [isOpen, violation, selectedViolationId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!activeViolation) return;

    createCorrectiveAction({
      violationId: activeViolation.violationId,
      mineId: activeViolation.mineId,
      title,
      description,
      assignedTo,
      dueDate,
      priority,
    }, currentUser?.name);

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🛡️ Create Corrective Action Plan (CAPA)" subtitle={`Assign remediation action for ${activeViolation?.violationId || 'Open Violation'}`} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Violation Selector if not fixed */}
        {!violation && (
          <div>
            <label className="block text-xs font-semibold text-enterprise-text-secondary mb-1">Select Open Violation to Address</label>
            <select
              value={selectedViolationId}
              onChange={(e) => setSelectedViolationId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-enterprise-border rounded-lg text-xs text-enterprise-text focus:outline-none focus:ring-2 focus:ring-mgBlue-500 font-mono"
            >
              {openViolations.map(v => (
                <option key={v.violationId} value={v.violationId}>
                  {v.violationId} — {v.mineName} ({v.severity}: {v.category})
                </option>
              ))}
            </select>
          </div>
        )}

        {activeViolation && (
          <div className="p-3 bg-gray-50 rounded-xl border border-enterprise-border text-xs space-y-1">
            <div className="flex justify-between items-center text-enterprise-text-muted font-mono">
              <span>Violation ID: <strong>{activeViolation.violationId}</strong></span>
              <span>Mine: <strong>{activeViolation.mineName}</strong> ({activeViolation.area})</span>
            </div>
            <p className="text-enterprise-text font-medium">{activeViolation.description}</p>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-enterprise-text-secondary mb-1">Action Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-enterprise-border rounded-lg text-xs text-enterprise-text focus:outline-none focus:ring-2 focus:ring-mgBlue-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-enterprise-text-secondary mb-1">Action Description & Directives</label>
          <textarea
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-enterprise-border rounded-lg text-xs text-enterprise-text focus:outline-none focus:ring-2 focus:ring-mgBlue-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-enterprise-text-secondary mb-1">Assigned Responsible Entity</label>
            <input
              type="text"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-enterprise-border rounded-lg text-xs text-enterprise-text focus:outline-none focus:ring-2 focus:ring-mgBlue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-enterprise-text-secondary mb-1">Target Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-enterprise-border rounded-lg text-xs text-enterprise-text font-mono focus:outline-none focus:ring-2 focus:ring-mgBlue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-enterprise-text-secondary mb-1">Action Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-enterprise-border rounded-lg text-xs text-enterprise-text focus:outline-none focus:ring-2 focus:ring-mgBlue-500 font-bold"
            >
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-enterprise-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-gray-50 border border-enterprise-border text-enterprise-text-secondary rounded-lg text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-mgBlue-600 hover:bg-mgBlue-500 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>Create Action & Set In-Progress</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
