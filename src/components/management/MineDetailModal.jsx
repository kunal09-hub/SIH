import React from 'react';
import Modal from '../common/Modal';
import { useData } from '../../context/DataContext';
import Badge from '../common/Badge';
import { formatDate } from '../../utils/dateHelpers';
import { Building2, Users, AlertTriangle, ShieldCheck, FileCheck } from 'lucide-react';

export default function MineDetailModal({ isOpen, onClose, mine }) {
  const { workers, violations, correctiveActions, certificates } = useData();

  if (!mine) return null;

  const mineWorkers = workers.filter(w => w.mineId === mine.mineId);
  const mineViolations = violations.filter(v => v.mineId === mine.mineId);
  const mineActions = correctiveActions.filter(ca => ca.mineId === mine.mineId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`🏢 ${mine.mineName} — Executive Performance Audit`} subtitle={mine.location} maxWidth="max-w-3xl">
      <div className="space-y-5">
        {/* Top Score Banner */}
        <div className="p-4 bg-gray-50 rounded-xl border border-enterprise-border flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-enterprise-text-muted">Current Statutory Compliance Rating</span>
            <div className="flex items-center gap-3 mt-1">
              <span className={`text-3xl font-extrabold font-mono ${mine.complianceScore >= 80 ? 'text-mgGreen-600' : mine.complianceScore >= 70 ? 'text-mgAmber-600' : 'text-mgRed-600'}`}>
                {mine.complianceScore}%
              </span>
              <Badge size="md">{mine.riskLevel} RISK</Badge>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center text-xs">
            <div className="p-2 bg-white rounded-lg border border-enterprise-border">
              <span className="text-enterprise-text-muted text-[10px]">Workforce</span>
              <p className="font-bold text-enterprise-text text-base mt-0.5">{mineWorkers.length}</p>
            </div>
            <div className="p-2 bg-white rounded-lg border border-enterprise-border">
              <span className="text-enterprise-text-muted text-[10px]">Open Violations</span>
              <p className="font-bold text-mgRed-600 text-base mt-0.5">{mineViolations.filter(v => v.status !== 'RESOLVED').length}</p>
            </div>
            <div className="p-2 bg-white rounded-lg border border-enterprise-border">
              <span className="text-enterprise-text-muted text-[10px]">CAPA Actions</span>
              <p className="font-bold text-mgAmber-600 text-base mt-0.5">{mineActions.length}</p>
            </div>
          </div>
        </div>

        {/* Violations in this mine */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-enterprise-text-secondary mb-2">
            Logged Compliance Violations ({mineViolations.length})
          </h4>
          <div className="space-y-2">
            {mineViolations.length === 0 ? (
              <p className="p-4 bg-gray-50 rounded-lg border border-enterprise-border text-xs text-enterprise-text-muted text-center">No compliance violations reported for this mine.</p>
            ) : (
              mineViolations.map(v => (
                <div key={v.violationId} className="p-3 bg-gray-50 rounded-lg border border-enterprise-border text-xs flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-enterprise-text">{v.violationId}</span>
                      <span className="text-enterprise-text-muted font-semibold">{v.area}</span>
                      <Badge size="sm">{v.severity}</Badge>
                    </div>
                    <p className="text-enterprise-text mt-1">{v.description}</p>
                  </div>
                  <Badge size="sm">{v.status}</Badge>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Workforce in this mine */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-enterprise-text-secondary mb-2">
            Assigned Personnel ({mineWorkers.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {mineWorkers.map(w => (
              <div key={w.workerId} className="p-2.5 bg-gray-50 rounded-lg border border-enterprise-border text-xs flex justify-between items-center">
                <div>
                  <p className="font-bold text-enterprise-text">{w.name}</p>
                  <p className="text-[11px] text-mgAmber-600 font-medium">{w.role}</p>
                </div>
                <span className="font-mono text-[10px] text-enterprise-text-muted">{w.workerId}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-enterprise-border">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-gray-50 border border-enterprise-border text-enterprise-text rounded-lg text-xs font-semibold"
          >
            Close Mine Profile
          </button>
        </div>
      </div>
    </Modal>
  );
}
