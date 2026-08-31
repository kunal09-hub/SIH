import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../common/StatCard';
import Badge from '../common/Badge';
import { formatDate, calculateCertificateStatus } from '../../utils/dateHelpers';
import {
  LayoutDashboard,
  Users,
  FileCheck,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  Plus,
  CheckCircle2,
  AlertOctagon,
  Building2,
  Activity,
  History
} from 'lucide-react';
import AddCertificateModal from './AddCertificateModal';
import CreateActionModal from './CreateActionModal';

export default function OfficerDashboard({ onNavigate }) {
  const { mines, workers, certificates, violations, correctiveActions, sosAlerts } = useData();
  const { currentUser } = useAuth();
  const [showAddCertModal, setShowAddCertModal] = useState(false);
  const [selectedViolationForAction, setSelectedViolationForAction] = useState(null);
  const [targetCertUpload, setTargetCertUpload] = useState({});

  // Focus on Mine Alpha (Officer's assigned mine)
  const currentMineId = currentUser?.mineId || 'MINE-01';
  const myMine = mines.find(m => m.mineId === currentMineId) || mines[0];
  const myWorkers = workers.filter(w => w.mineId === currentMineId);
  const myViolations = violations.filter(v => v.mineId === currentMineId && v.status !== 'RESOLVED');
  const myActions = correctiveActions.filter(ca => ca.mineId === currentMineId);

  // Active Emergency SOS alerts
  const activeEmergency = Array.isArray(sosAlerts) ? sosAlerts.find(a => a.status === 'ACTIVE') : null;

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-2xl font-extrabold text-[#172033] tracking-tight">
              Mine Safety & Compliance Console
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 font-mono font-bold">
              {myMine.mineName}
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Safety Officer: <strong>{currentUser?.name}</strong> • Concession Code: {myMine.code} ({myMine.location})
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
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Verified Certificate</span>
          </button>
        </div>
      </div>

      {/* Prominent Active Emergency Banner (if any SOS is active) */}
      {activeEmergency && (
        <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-4 sm:p-5 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-red-600 text-white shrink-0 mt-0.5 shadow-sm animate-pulse">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider text-red-700">
                  🔴 ACTIVE EMERGENCY DISTRESS SIGNAL
                </span>
                <Badge size="sm" variant="red">P1 CRITICAL</Badge>
              </div>
              <p className="text-xs text-[#172033] font-medium">
                Inspector <strong>{activeEmergency.inspectorName} ({activeEmergency.inspectorId})</strong> triggered distress signal at <strong>{activeEmergency.mineName}</strong>.
              </p>
              <p className="text-[11px] text-[#64748B] font-mono">
                Timestamp: {activeEmergency.timestamp} • Incident Ref: {activeEmergency.alertId}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('sos-history')}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm whitespace-nowrap self-stretch sm:self-auto transition-colors"
          >
            View Emergency Response Log →
          </button>
        </div>
      )}

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Mine Compliance Index"
          value={`${myMine.complianceScore}%`}
          subtitle={`Risk Classification: ${myMine.riskLevel}`}
          icon={LayoutDashboard}
          color={myMine.complianceScore >= 80 ? 'emerald' : 'amber'}
        />
        <StatCard
          title="Active Breaches"
          value={myViolations.length}
          subtitle="Open Remediation Tickets"
          icon={AlertTriangle}
          color={myViolations.length > 0 ? 'red' : 'emerald'}
          onClick={() => onNavigate('violations')}
        />
        <StatCard
          title="Expiring Certificates"
          value={expiringCerts.length}
          subtitle="Renewal Window Breached"
          icon={FileCheck}
          color="amber"
          onClick={() => onNavigate('certificates')}
        />
        <StatCard
          title="Monitored Workforce"
          value={myWorkers.length}
          subtitle="Active Certified Crew"
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
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#E2E8F0]">
              <h3 className="text-sm font-bold text-[#172033] uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Violations Requiring Corrective Remediation ({myViolations.length})</span>
              </h3>
              <button
                onClick={() => onNavigate('violations')}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
              >
                <span>View Inbox</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-[#E2E8F0] mt-1">
              {myViolations.length === 0 ? (
                <p className="py-8 text-center text-xs text-[#94A3B8]">No open compliance violations for this mine.</p>
              ) : (
                myViolations.map((v) => (
                  <div key={v.violationId} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-[#172033]">{v.violationId}</span>
                        <span className="text-xs text-[#64748B] font-medium">{v.area}</span>
                        <Badge size="sm">{v.severity}</Badge>
                      </div>
                      <p className="text-xs text-[#334155] font-medium">{v.description}</p>
                      <p className="text-[10px] text-blue-600 font-mono font-semibold">AI Risk Score: {v.riskScore}/100</p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        onClick={() => setSelectedViolationForAction(v)}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
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
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#E2E8F0]">
              <h3 className="text-sm font-bold text-[#172033] uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-blue-600" />
                <span>Active Remediation Pipeline ({myActions.length})</span>
              </h3>
              <button
                onClick={() => onNavigate('actions')}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
              >
                <span>Manage All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-[#E2E8F0] mt-1">
              {myActions.length === 0 ? (
                <p className="py-8 text-center text-xs text-[#94A3B8]">No corrective actions currently in progress.</p>
              ) : (
                myActions.slice(0, 3).map((ca) => (
                  <div key={ca.actionId} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#172033]">{ca.actionId}</span>
                        <span className="text-[#334155] font-medium truncate max-w-sm">{ca.title}</span>
                      </div>
                      <p className="text-[11px] text-[#64748B] mt-0.5">Assigned to: {ca.assignedTo}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge size="sm">{ca.status}</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Expiring Certificates */}
        <div className="space-y-5">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#172033] mb-3 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-amber-600" />
              <span>Certificates Requiring Renewal</span>
            </h4>

            <div className="space-y-3">
              {expiringCerts.length === 0 ? (
                <p className="py-6 text-center text-xs text-[#94A3B8]">All workforce credentials valid.</p>
              ) : (
                expiringCerts.slice(0, 4).map((c) => {
                  const st = calculateCertificateStatus(c.expiryDate);
                  return (
                    <div key={c.certificateId} className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-[#172033]">{c.workerName}</span>
                        <Badge size="sm">{st.status}</Badge>
                      </div>
                      <p className="text-[11px] text-[#475569] truncate">{c.certificateType}</p>
                      <div className="flex justify-between items-center text-[10px] text-[#64748B] font-mono pt-1.5 border-t border-[#E2E8F0]">
                        <span>Exp: {formatDate(c.expiryDate)}</span>
                        <button
                          onClick={() => handleOpenUploadForCert(c)}
                          className="text-blue-600 hover:text-blue-700 font-bold"
                        >
                          Upload Renewed →
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
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
