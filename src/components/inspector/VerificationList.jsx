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
      <div className="flex items-center justify-between pb-4 border-b border-enterprise-border">
        <div>
          <h2 className="text-xl font-bold text-enterprise-text flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-mgGreen-600" />
            <span>Inspector Verification & Closure Sign-Off</span>
          </h2>
          <p className="text-xs text-enterprise-text-muted mt-1">
            Review completed corrective actions submitted by Mine Officers and formally sign-off compliance resolution
          </p>
        </div>
        <Badge size="md">{pendingVerifications.length} Awaiting Sign-Off</Badge>
      </div>

      {/* Pending Verifications Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-enterprise-text-secondary">
          Remediations Awaiting Compliance Verification
        </h3>

        {pendingVerifications.length === 0 ? (
          <div className="p-8 text-center mg-card">
            <CheckCircle2 className="w-8 h-8 text-mgGreen-600 mx-auto mb-2 opacity-80" />
            <p className="text-xs font-semibold text-enterprise-text">No Pending Verifications</p>
            <p className="text-[11px] text-enterprise-text-muted mt-1">
              All submitted corrective actions have been verified and formally resolved.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {pendingVerifications.map((v) => {
              const linkedAction = correctiveActions.find(ca => ca.violationId === v.violationId);
              return (
                <div key={v.violationId} className="p-4 mg-card border-l-4 border-l-mgBlue-500 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-enterprise-text font-mono">{v.violationId}</span>
                      <span className="text-[10px] text-enterprise-text-muted font-semibold uppercase">• {v.mineName} ({v.area})</span>
                      <Badge size="sm">{v.severity}</Badge>
                      <Badge size="sm">VERIFICATION REQUIRED</Badge>
                    </div>

                    <p className="text-xs font-semibold text-enterprise-text">{v.description}</p>

                    {linkedAction && (
                      <div className="p-2.5 rounded-lg bg-gray-50 border border-enterprise-border text-[11px] text-enterprise-text-secondary">
                        <p className="font-semibold text-mgBlue-600">Mine Officer Remediation Notes:</p>
                        <p className="text-enterprise-text-secondary mt-0.5">{linkedAction.completionNotes || 'Renewed documentation submitted.'}</p>
                        {linkedAction.evidence && (
                          <p className="text-[10px] text-enterprise-text-muted mt-1 font-mono flex items-center gap-1">
                            <FileText className="w-3 h-3 text-mgGreen-600" /> Attached Doc: {linkedAction.evidence}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      onClick={() => setSelectedViolation(v)}
                      className="px-4 py-2 bg-mgGreen-600 hover:bg-green-600 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
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
      <div className="space-y-3 pt-4 border-t border-enterprise-border">
        <h3 className="text-xs font-bold uppercase tracking-wider text-enterprise-text-muted">
          Recently Resolved & Verified Compliance Records ({resolvedViolations.length})
        </h3>
        <div className="mg-card overflow-hidden">
          <div className="divide-y divide-enterprise-border">
            {resolvedViolations.map(v => (
              <div key={v.violationId} className="p-3.5 flex items-center justify-between text-xs hover:bg-gray-50/50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-enterprise-text">{v.violationId}</span>
                    <span className="text-enterprise-text-muted font-semibold">{v.mineName}</span>
                    <Badge size="sm">RESOLVED</Badge>
                  </div>
                  <p className="text-[11px] text-enterprise-text-secondary mt-1">{v.description}</p>
                </div>
                <div className="text-right font-mono text-[11px] text-enterprise-text-muted shrink-0">
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
            <div className="p-3.5 bg-gray-50 rounded-xl border border-enterprise-border space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="font-bold text-enterprise-text">{selectedViolation.violationId}</span>
                <span className="text-enterprise-text-muted">{selectedViolation.mineName} — {selectedViolation.area}</span>
              </div>
              <p className="text-xs text-enterprise-text">{selectedViolation.description}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-enterprise-text-secondary mb-1">Inspector Verification Notes</label>
              <textarea
                rows="3"
                value={verifyNotes}
                onChange={(e) => setVerifyNotes(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-enterprise-border rounded-lg text-xs text-enterprise-text focus:outline-none focus:ring-2 focus:ring-mgBlue-500"
                required
              />
            </div>

            <div className="p-3 bg-mgGreen-50 border border-green-200 rounded-lg text-xs text-mgGreen-600 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-mgGreen-600 shrink-0" />
              <span>Clicking sign-off will transition the violation to <strong>RESOLVED</strong>, recalculate the mine compliance scorecard, and notify Management & Regulatory Authority.</span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-enterprise-border">
              <button
                onClick={() => setSelectedViolation(null)}
                className="px-4 py-2 bg-white hover:bg-gray-50 border border-enterprise-border text-enterprise-text-secondary rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleVerify}
                disabled={isResolving}
                className="px-5 py-2 bg-mgGreen-600 hover:bg-green-600 text-white font-bold text-xs rounded-lg shadow-sm transition-colors"
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
