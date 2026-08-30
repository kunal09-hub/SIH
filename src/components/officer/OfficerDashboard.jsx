import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../common/StatCard';
import Badge from '../common/Badge';
import { formatDate, calculateCertificateStatus } from '../../utils/dateHelpers';
import { LayoutDashboard, Users, FileCheck, ShieldAlert, AlertTriangle, ArrowRight, Plus, Siren, CheckCircle2 } from 'lucide-react';
import AddCertificateModal from './AddCertificateModal';
import CreateActionModal from './CreateActionModal';

export default function OfficerDashboard({ onNavigate }) {
  const { mines, workers, certificates, violations, correctiveActions, sosAlerts, acknowledgeSOSAlert } = useData();
  const { currentUser } = useAuth();
  const [showAddCertModal, setShowAddCertModal] = useState(false);
  const [selectedViolationForAction, setSelectedViolationForAction] = useState(null);
  const [targetCertUpload, setTargetCertUpload] = useState({});

  // Active SOS alert for this Mine Officer
  const activeSOS = (sosAlerts || []).find(a => a.status === 'ACTIVE');

  // Focus on Mine Alpha (Officer's assigned mine)
  const currentMineId = currentUser?.mineId || 'MINE-01';
  const myMine = mines.find(m => m.mineId === currentMineId) || mines[0];
  const myWorkers = workers.filter(w => w.mineId === currentMineId);
  const myViolations = violations.filter(v => v.mineId === currentMineId && v.status !== 'RESOLVED');
  const myActions = correctiveActions.filter(ca => ca.mineId === currentMineId);

  // Expiring certs in this mine
  const expiringCerts = certificates.filter(c => {
    if (c.mineId !== currentMineId) return false;
    const st = calculateCertificateStatus(c.expiryDate).status;
    return st === 'EXPIRING SOON' || st === 'EXPIRED';
  });

  const handleOpenUploadForCert = (c) => {
    const linkedV = violations.find(v => (v.workerId === c.workerId || v.certificateId === c.certificateId) && v.status !== 'RESOLVED');
    setTargetCertUpload({
      workerId: c.workerId,
      certificateType: c.certificateType,
      certificateId: `CERT-2026-${Date.now().toString().slice(-4)}`,
      linkedViolationId: linkedV?.violationId || ''
    });
    setShowAddCertModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Active Priority-1 Emergency SOS Banner */}
      {activeSOS && (
        <div className="p-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white rounded-2xl shadow-xl shadow-red-600/25 border-2 border-red-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Siren className="w-6 h-6 text-white animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold bg-black/40 px-2 py-0.5 rounded border border-white/20 uppercase">
                  🚨 ACTIVE EMERGENCY SOS
                </span>
                <span className="text-xs font-mono font-bold text-red-100">{activeSOS.alertId}</span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-white mt-0.5">
                Distress Signal Dispatched by Inspector {activeSOS.inspectorName} ({activeSOS.mineName})
              </h3>
              <p className="text-xs text-red-100 mt-0.5 font-mono">
                Location: {activeSOS.zoneName || 'Underground Working Section'} • Time: {activeSOS.displayTime || 'Active Now'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={() => onNavigate('sos-history')}
              className="px-3.5 py-2 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              View SOS Log
            </button>
            <button
              onClick={() => {
                acknowledgeSOSAlert(
                  activeSOS.alertId,
                  `${currentUser.name} (${currentUser.userId || currentUser.badge})`,
                  currentUser.role
                );
              }}
              className="px-4 py-2 bg-white text-red-700 hover:bg-red-50 text-xs font-black rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-red-600" />
              <span>Acknowledge SOS</span>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-enterprise-border">
        <div>
          <h2 className="text-xl font-bold text-enterprise-text flex items-center gap-2">
            <span>Mine Safety &amp; Compliance Command</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-mgBlue-100 text-mgBlue-600 border border-blue-200 font-mono font-bold">
              {myMine.mineName}
            </span>
          </h2>
          <p className="text-xs text-enterprise-text-muted mt-1">
            Officer in Charge: <strong className="text-enterprise-text">{currentUser?.name}</strong> • {myMine.location}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (expiringCerts.length > 0) {
                handleOpenUploadForCert(expiringCerts[0]);
              } else {
                setTargetCertUpload({});
                setShowAddCertModal(true);
              }
            }}
            className="px-3.5 py-2 bg-mgBlue-600 hover:bg-mgBlue-500 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Renewed Certificate</span>
          </button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Mine Compliance Score"
          value={`${myMine.complianceScore}%`}
          subtitle={`Risk Level: ${myMine.riskLevel}`}
          icon={LayoutDashboard}
          color={myMine.complianceScore >= 80 ? 'emerald' : 'amber'}
        />
        <StatCard
          title="Active Violations"
          value={myViolations.length}
          subtitle="Awaiting Remediation"
          icon={AlertTriangle}
          color={myViolations.length > 0 ? 'red' : 'emerald'}
          onClick={() => onNavigate('violations')}
        />
        <StatCard
          title="Expiring / Expired Certs"
          value={expiringCerts.length}
          subtitle="Immediate Action Required"
          icon={FileCheck}
          color="amber"
          onClick={() => onNavigate('certificates')}
        />
        <StatCard
          title="Active Workforce"
          value={myWorkers.length}
          subtitle="Monitored Personnel"
          icon={Users}
          color="blue"
          onClick={() => onNavigate('workers')}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Violations & Corrective Actions */}
        <div className="lg:col-span-2 space-y-5">
          {/* Open Violations requiring Officer Action */}
          <div className="mg-card p-5">
            <div className="flex items-center justify-between pb-3 border-b border-enterprise-border">
              <h3 className="text-sm font-bold text-enterprise-text uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-mgRed-600" />
                <span>Violations Requiring Corrective Action ({myViolations.length})</span>
              </h3>
              <button
                onClick={() => onNavigate('violations')}
                className="text-xs text-mgBlue-600 hover:text-mgBlue-500 font-semibold flex items-center gap-1"
              >
                <span>View Inbox</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-enterprise-border mt-2">
              {myViolations.length === 0 ? (
                <p className="py-6 text-center text-xs text-enterprise-text-muted">No open compliance violations for this mine.</p>
              ) : (
                myViolations.map((v) => (
                  <div key={v.violationId} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-enterprise-text">{v.violationId}</span>
                        <span className="text-xs text-enterprise-text-secondary font-semibold">{v.area}</span>
                        <Badge size="sm">{v.severity}</Badge>
                      </div>
                      <p className="text-xs text-enterprise-text font-medium">{v.description}</p>
                      <p className="text-[10px] text-mgAmber-600 font-mono">AI Risk Score: {v.riskScore}/100</p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        onClick={() => setSelectedViolationForAction(v)}
                        className="px-3 py-1.5 bg-mgBlue-600 hover:bg-mgBlue-500 text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
                      >
                        Assign Action
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pending Corrective Actions */}
          <div className="mg-card p-5">
            <div className="flex items-center justify-between pb-3 border-b border-enterprise-border">
              <h3 className="text-sm font-bold text-enterprise-text uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-mgAmber-600" />
                <span>Active Remediation Pipeline ({myActions.length})</span>
              </h3>
              <button
                onClick={() => onNavigate('actions')}
                className="text-xs text-mgBlue-600 hover:text-mgBlue-500 font-semibold flex items-center gap-1"
              >
                <span>Manage All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-enterprise-border mt-2">
              {myActions.slice(0, 3).map((ca) => (
                <div key={ca.actionId} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-enterprise-text">{ca.actionId}</span>
                      <span className="text-enterprise-text font-medium truncate max-w-sm">{ca.title}</span>
                    </div>
                    <p className="text-[11px] text-enterprise-text-muted mt-0.5">Assigned to: {ca.assignedTo}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge size="sm">{ca.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Expiring Certificates & Quick Upload */}
        <div className="space-y-5">
          <div className="mg-card p-5 border-t-4 border-t-mgAmber-500">
            <h4 className="text-xs font-bold uppercase tracking-wider text-mgAmber-600 mb-3 flex items-center gap-2">
              <FileCheck className="w-4 h-4" />
              <span>Certificates Requiring Renewal</span>
            </h4>

            <div className="space-y-3">
              {expiringCerts.slice(0, 4).map((c) => {
                const st = calculateCertificateStatus(c.expiryDate);
                return (
                  <div key={c.certificateId} className="p-3 bg-gray-50 rounded-lg border border-enterprise-border space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-enterprise-text">{c.workerName}</span>
                      <Badge size="sm">{st.status}</Badge>
                    </div>
                    <p className="text-[11px] text-enterprise-text-secondary truncate">{c.certificateType}</p>
                    <div className="flex justify-between items-center text-[10px] text-enterprise-text-muted font-mono pt-1 border-t border-enterprise-border">
                      <span>Exp: {formatDate(c.expiryDate)}</span>
                      <button
                        onClick={() => handleOpenUploadForCert(c)}
                        className="text-mgBlue-600 hover:text-mgBlue-500 font-semibold"
                      >
                        Upload Renewed
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <AddCertificateModal
        isOpen={showAddCertModal}
        onClose={() => setShowAddCertModal(false)}
        initialData={targetCertUpload}
      />
      <CreateActionModal
        isOpen={!!selectedViolationForAction}
        onClose={() => setSelectedViolationForAction(null)}
        violation={selectedViolationForAction}
      />
    </div>
  );
}
