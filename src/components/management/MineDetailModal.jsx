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
        <div className="p-4 sm:p-5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#64748B]">Current Statutory Compliance Rating</span>
            <div className="flex items-center gap-3 mt-1">
              <span className={`text-3xl font-extrabold font-mono ${mine.complianceScore >= 80 ? 'text-emerald-600' : mine.complianceScore >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                {mine.complianceScore}%
              </span>
              <Badge size="md">{mine.riskLevel} RISK</Badge>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-2.5 bg-white rounded-xl border border-[#E2E8F0] shadow-sm">
              <span className="text-[#64748B] text-[10px]">Workforce</span>
              <p className="font-extrabold text-[#172033] text-base mt-0.5">{mineWorkers.length}</p>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-[#E2E8F0] shadow-sm">
              <span className="text-[#64748B] text-[10px]">Open Violations</span>
              <p className="font-extrabold text-red-600 text-base mt-0.5">{mineViolations.filter(v => v.status !== 'RESOLVED').length}</p>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-[#E2E8F0] shadow-sm">
              <span className="text-[#64748B] text-[10px]">CAPA Actions</span>
              <p className="font-extrabold text-blue-600 text-base mt-0.5">{mineActions.length}</p>
            </div>
          </div>
        </div>

        {/* Violations in this mine */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-2">
            Logged Compliance Violations ({mineViolations.length})
          </h4>
          <div className="space-y-2">
            {mineViolations.length === 0 ? (
              <p className="p-6 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-xs text-[#64748B] text-center">No compliance violations reported for this mine.</p>
            ) : (
              mineViolations.map(v => (
                <div key={v.violationId} className="p-3 bg-white rounded-xl border border-[#E2E8F0] text-xs flex justify-between items-center shadow-sm">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#172033]">{v.violationId}</span>
                      <span className="text-[#64748B] font-semibold">{v.area}</span>
                      <Badge size="sm">{v.severity}</Badge>
                    </div>
                    <p className="text-[#334155] mt-1">{v.description}</p>
                  </div>
                  <Badge size="sm">{v.status}</Badge>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Workforce in this mine */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-2">
            Assigned Personnel ({mineWorkers.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {mineWorkers.map(w => (
              <div key={w.workerId} className="p-3 bg-white rounded-xl border border-[#E2E8F0] text-xs flex justify-between items-center shadow-sm">
                <div>
                  <p className="font-bold text-[#172033]">{w.name}</p>
                  <p className="text-[11px] text-blue-600 font-semibold">{w.role}</p>
                </div>
                <span className="font-mono text-[10px] text-[#64748B]">{w.workerId}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-[#E2E8F0]">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-[#334155] border border-[#CBD5E1] rounded-xl text-xs font-bold transition-colors"
          >
            Close Mine Profile
          </button>
        </div>
      </div>
    </Modal>
  );
}
