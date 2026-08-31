import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/dateHelpers';
import Badge from '../common/Badge';
import { ShieldAlert, CheckCircle2, Clock, Plus, ArrowRight, UserCheck, Search, Filter, FileText, Send } from 'lucide-react';
import CreateActionModal from './CreateActionModal';
import AddCertificateModal from './AddCertificateModal';
import Modal from '../common/Modal';

export default function CorrectiveActionManager() {
  const { correctiveActions, violations, mines, updateCorrectiveAction } = useData();
  const { currentUser } = useAuth();
  const [selectedViolationForAction, setSelectedViolationForAction] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddCertModal, setShowAddCertModal] = useState(false);
  const [targetCertData, setTargetCertData] = useState({});

  // Direct Remediation Submission Modal State
  const [actionForRemediation, setActionForRemediation] = useState(null);
  const [remediationNotes, setRemediationNotes] = useState('');
  const [remediationDoc, setRemediationDoc] = useState('remediation_evidence_report.pdf');

  // Filters
  const [selectedMine, setSelectedMine] = useState(currentUser?.role === 'OFFICER' ? (currentUser.mineId || 'MINE-01') : 'ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredActions = correctiveActions.filter(ca => {
    if (selectedMine !== 'ALL' && ca.mineId !== selectedMine) return false;
    if (filterStatus !== 'ALL' && ca.status !== filterStatus) return false;
    if (filterPriority !== 'ALL' && ca.priority !== filterPriority) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return ca.actionId.toLowerCase().includes(q) ||
             ca.title.toLowerCase().includes(q) ||
             ca.violationId.toLowerCase().includes(q) ||
             ca.assignedTo.toLowerCase().includes(q);
    }
    return true;
  });

  const handleOpenCertModalForAction = (ca) => {
    const linkedV = violations.find(v => v.violationId === ca.violationId);
    setTargetCertData({
      workerId: linkedV?.workerId || 'W-10452',
      linkedViolationId: ca.violationId,
      certificateType: 'Electrical Competency Certificate'
    });
    setShowAddCertModal(true);
  };

  const handleSubmitRemediation = (e) => {
    e.preventDefault();
    if (!actionForRemediation) return;

    updateCorrectiveAction(actionForRemediation.actionId, {
      status: 'VERIFICATION REQUIRED',
      completionNotes: remediationNotes || 'Remediation completed by maintenance & safety desk. Awaiting Inspector verification.',
      evidence: remediationDoc
    }, 'Mine Safety Officer');

    setActionForRemediation(null);
    setRemediationNotes('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-2xl font-extrabold text-[#172033] tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-blue-600" />
              <span>Corrective Action Remediation (CAPA)</span>
            </h2>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Track compliance remediation from initial assignment through evidence submission and inspector verification
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Corrective Action</span>
          </button>
          <button
            onClick={() => {
              setTargetCertData({});
              setShowAddCertModal(true);
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
          >
            <span>+ Upload Renewed Cert</span>
          </button>
        </div>
      </div>

      {/* Action Lifecycle Pipeline Visualizer */}
      <div className="bg-white border border-[#E2E8F0] p-4 sm:p-5 rounded-2xl shadow-sm">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-3">
          Remediation Lifecycle Stages
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <span className="text-[10px] text-[#64748B] font-bold block">STAGE 1</span>
            <span className="font-bold text-[#172033] mt-1 block">ASSIGNED</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700">
            <span className="text-[10px] font-bold block">STAGE 2</span>
            <span className="font-bold mt-1 block">IN PROGRESS</span>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700">
            <span className="text-[10px] font-bold block">STAGE 3</span>
            <span className="font-bold mt-1 block">EVIDENCE SUBMITTED</span>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-700">
            <span className="text-[10px] font-bold block">STAGE 4</span>
            <span className="font-bold mt-1 block">VERIFY REQUIRED</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
            <span className="text-[10px] font-bold block">STAGE 5</span>
            <span className="font-bold mt-1 block">VERIFIED & CLOSED</span>
          </div>
        </div>
      </div>

      {/* Filters */}
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
                <option value="ALL">All Mines ({correctiveActions.length} Actions)</option>
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
            <option value="ALL">All Statuses ({correctiveActions.length})</option>
            <option value="PENDING">PENDING</option>
            <option value="IN PROGRESS">IN PROGRESS</option>
            <option value="VERIFICATION REQUIRED">VERIFICATION REQUIRED</option>
            <option value="VERIFIED">VERIFIED</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5">Priority Filter</label>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#172033] text-xs focus:outline-none focus:border-blue-600"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5">Search CAPA</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action, ticket ID, team..."
            className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#172033] text-xs focus:outline-none focus:border-blue-600 font-mono"
          />
        </div>
      </div>

      {/* Corrective Actions Table */}
      <div className="space-y-3">
        {filteredActions.length === 0 ? (
          <p className="p-12 text-center text-[#64748B] bg-white border border-[#E2E8F0] rounded-2xl text-xs shadow-sm">
            No corrective actions match the selected filter.
          </p>
        ) : (
          filteredActions.map((ca) => {
            const linkedViolation = violations.find(v => v.violationId === ca.violationId);
            const linkedMine = mines.find(m => m.mineId === ca.mineId);
            const isCertRelated = linkedViolation?.category?.includes('Cert') || linkedViolation?.certificateId;

            return (
              <div key={ca.actionId} className="p-5 bg-white border border-[#E2E8F0] hover:border-slate-300 rounded-2xl shadow-sm space-y-3 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#172033] text-xs">{ca.actionId}</span>
                    <span className="text-xs text-[#64748B] font-medium">• For {ca.violationId} ({linkedMine?.mineName || ca.mineId})</span>
                    <Badge size="sm">{ca.priority}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge size="sm">{ca.status}</Badge>
                    <span className="text-[11px] text-[#64748B] font-mono">Due: {formatDate(ca.dueDate)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="md:col-span-2 space-y-1">
                    <h4 className="font-bold text-[#172033]">{ca.title}</h4>
                    <p className="text-[#475569] leading-relaxed">{ca.description}</p>
                    <p className="text-[11px] text-[#64748B] pt-1">
                      <strong>Assigned To:</strong> {ca.assignedTo} • <strong>Created:</strong> {formatDate(ca.createdDate)}
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-[11px] space-y-2">
                    <p className="font-bold text-[#172033]">Remediation Status:</p>
                    <p className="text-[#64748B] leading-relaxed">
                      {ca.completionNotes || 'Remediation currently in progress.'}
                    </p>
                    {ca.evidence && (
                      <p className="text-[10px] text-emerald-700 font-mono flex items-center gap-1 font-bold">
                        <FileText className="w-3 h-3 text-emerald-600" /> Evidence: {ca.evidence}
                      </p>
                    )}

                    {ca.status !== 'VERIFIED' && ca.status !== 'RESOLVED' && ca.status !== 'VERIFICATION REQUIRED' && (
                      <div className="pt-1 flex flex-col gap-1.5">
                        {isCertRelated ? (
                          <button
                            onClick={() => handleOpenCertModalForAction(ca)}
                            className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[11px] transition-colors flex items-center justify-center gap-1 shadow-sm"
                          >
                            <span>Upload Renewed Certificate</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setActionForRemediation(ca);
                              setRemediationNotes(ca.completionNotes || '');
                            }}
                            className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[11px] transition-colors flex items-center justify-center gap-1 shadow-sm"
                          >
                            <span>Submit Remediation Evidence</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal for creating action */}
      <CreateActionModal
        isOpen={showCreateModal || !!selectedViolationForAction}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedViolationForAction(null);
        }}
        violation={selectedViolationForAction}
      />

      {/* Modal for registering certificate */}
      <AddCertificateModal
        isOpen={showAddCertModal}
        onClose={() => setShowAddCertModal(false)}
        initialData={targetCertData}
      />

      {/* Modal for submitting non-cert remediation evidence */}
      {actionForRemediation && (
        <Modal
          isOpen={!!actionForRemediation}
          onClose={() => setActionForRemediation(null)}
          title="📝 Submit Action Remediation & Evidence"
          subtitle={`Submit completion notes for Action ${actionForRemediation.actionId}`}
        >
          <form onSubmit={handleSubmitRemediation} className="space-y-4 text-xs">
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1">
              <span className="font-mono text-[#64748B]">Action: {actionForRemediation.actionId}</span>
              <p className="font-bold text-[#172033]">{actionForRemediation.title}</p>
            </div>

            <div>
              <label className="block font-semibold text-[#334155] mb-1">Completion & Remediation Notes</label>
              <textarea
                rows="3"
                value={remediationNotes}
                onChange={(e) => setRemediationNotes(e.target.value)}
                placeholder="Describe actions taken, parts replaced, sensor recalibrations, or procedural fixes completed..."
                className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-[#172033] focus:outline-none focus:border-blue-600"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-[#334155] mb-1">Evidence Document Reference</label>
              <input
                type="text"
                value={remediationDoc}
                onChange={(e) => setRemediationDoc(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-[#172033] font-mono focus:outline-none focus:border-blue-600"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setActionForRemediation(null)}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-[#334155] border border-[#CBD5E1] rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span>Submit for Inspector Verification</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
