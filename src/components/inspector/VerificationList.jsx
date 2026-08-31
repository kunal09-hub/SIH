import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/dateHelpers';
import Badge from '../common/Badge';
import { ShieldCheck, CheckCircle2, FileText, ArrowRight, AlertTriangle } from 'lucide-react';
import Modal from '../common/Modal';

export default function VerificationList() {
  const { violations, correctiveActions, verifyAndResolveViolation } = useData();
  const { currentUser } = useAuth();
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [verifyNotes, setVerifyNotes] = useState('Verified renewed competency certificate document. Remediation conforms with applicable safety requirements.');
  const [isResolving, setIsResolving] = useState(false);

  // Filter violations awaiting verification
  const pendingVerifications = violations.filter(v => v.status === 'VERIFICATION REQUIRED');
  const resolvedViolations = violations.filter(v => v.status === 'RESOLVED');

  const handleVerify = () => {
    if (!selectedViolation) return;
    setIsResolving(true);
    verifyAndResolveViolation(selectedViolation.violationId, verifyNotes, currentUser?.name);
    setIsResolving(false);
    setSelectedViolation(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-2xl font-extrabold text-[#172033] tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
              <span>Inspector Verification & Closure Sign-Off</span>
            </h2>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Review completed corrective actions submitted by Mine Officers and formally sign-off compliance resolution
          </p>
        </div>
        <Badge size="md" variant="blue">{pendingVerifications.length} Awaiting Sign-Off</Badge>
      </div>

      {/* Pending Verifications Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
          Remediations Awaiting Compliance Verification
        </h3>

        {pendingVerifications.length === 0 ? (
          <div className="p-12 text-center bg-white border border-[#E2E8F0] rounded-2xl shadow-sm">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-bold text-[#172033]">No Pending Verifications</p>
            <p className="text-xs text-[#64748B] mt-1">
              All submitted corrective actions have been verified and formally resolved.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {pendingVerifications.map((v) => {
              const linkedAction = correctiveActions.find(ca => ca.violationId === v.violationId);
              return (
                <div key={v.violationId} className="p-5 bg-white border border-[#E2E8F0] hover:border-slate-300 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[#172033] font-mono">{v.violationId}</span>
                      <span className="text-xs text-[#64748B] font-semibold">• {v.mineName} ({v.area})</span>
                      <Badge size="sm">{v.severity}</Badge>
                      <Badge size="sm">VERIFICATION REQUIRED</Badge>
                    </div>

                    <p className="text-xs font-semibold text-[#172033]">{v.description}</p>

                    {linkedAction && (
                      <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#334155]">
                        <p className="font-bold text-blue-700">Mine Officer Remediation Notes:</p>
                        <p className="text-[#475569] mt-0.5">{linkedAction.completionNotes || 'Renewed documentation submitted.'}</p>
                        {linkedAction.evidence && (
                          <p className="text-[11px] text-emerald-700 mt-1 font-mono flex items-center gap-1 font-bold">
                            <FileText className="w-3.5 h-3.5 text-emerald-600" /> Attached Document: {linkedAction.evidence}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      onClick={() => setSelectedViolation(v)}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Review & Sign-Off</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Resolved History */}
      <div className="space-y-3 pt-4 border-t border-[#E2E8F0]">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
          Recently Resolved & Verified Compliance Records ({resolvedViolations.length})
        </h3>
        <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
          <div className="divide-y divide-[#E2E8F0]">
            {resolvedViolations.map(v => (
              <div key={v.violationId} className="p-4 flex items-center justify-between text-xs hover:bg-[#F8FAFC] transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#172033]">{v.violationId}</span>
                    <span className="text-[#64748B] font-semibold">{v.mineName}</span>
                    <Badge size="sm">RESOLVED</Badge>
                  </div>
                  <p className="text-[11px] text-[#475569] mt-0.5">{v.description}</p>
                </div>
                <div className="text-right font-mono text-[11px] text-[#64748B] shrink-0">
                  <span>Resolved: {formatDate(v.resolvedDate || v.date)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review & Verify Modal */}
      {selectedViolation && (
        <Modal isOpen={!!selectedViolation} onClose={() => setSelectedViolation(null)} title="✅ Inspector Verification Sign-Off" subtitle="Confirm that compliance remediation meets safety requirements">
          <div className="space-y-4">
            <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="font-bold text-[#172033]">{selectedViolation.violationId}</span>
                <span className="text-[#64748B]">{selectedViolation.mineName} — {selectedViolation.area}</span>
              </div>
              <p className="text-xs text-[#334155]">{selectedViolation.description}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">Inspector Verification Notes</label>
              <textarea
                rows="3"
                value={verifyNotes}
                onChange={(e) => setVerifyNotes(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs text-[#172033] focus:outline-none focus:border-blue-600"
                required
              />
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Clicking sign-off will transition the violation to <strong>RESOLVED</strong>, recalculate the mine compliance scorecard, and notify Management & Regulatory Authority.</span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
              <button
                onClick={() => setSelectedViolation(null)}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-[#334155] border border-[#CBD5E1] rounded-xl text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleVerify}
                disabled={isResolving}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm"
              >
                Formally Sign-Off & Close Violation
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
