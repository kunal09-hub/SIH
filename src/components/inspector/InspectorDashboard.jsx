import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../common/StatCard';
import Badge from '../common/Badge';
import { formatDate } from '../../utils/dateHelpers';
import {
  ClipboardCheck,
  AlertTriangle,
  ShieldCheck,
  FileCheck,
  QrCode,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Wifi,
  WifiOff,
  RefreshCw,
  Plus,
  Building2
} from 'lucide-react';
import CertificateVerifierModal from './CertificateVerifierModal';
import ReportViolationModal from './ReportViolationModal';

export default function InspectorDashboard({ onNavigate }) {
  const { inspections, violations, certificates, mines } = useData();
  const { currentUser } = useAuth();
  const [showVerifier, setShowVerifier] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  // Monitor network online/offline state
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setIsSyncing(true);
      setTimeout(() => setIsSyncing(false), 1200);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const openViolations = violations.filter(v => v.status !== 'RESOLVED');
  const pendingVerifications = violations.filter(v => v.status === 'VERIFICATION REQUIRED');
  const highRiskIssues = violations.filter(v => v.severity === 'HIGH' || v.severity === 'CRITICAL');

  const triggerManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-2xl font-extrabold text-[#172033] tracking-tight">
              Inspector Dashboard
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 font-mono font-bold">
              {currentUser?.badge || 'INS-001'}
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Monitor statutory inspections, safety findings, workforce credentials and compliance status.
          </p>
        </div>

        {/* Sync Status & Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
            isOnline 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`}></span>
            <span>{isOnline ? '🟢 Online' : '🔴 Offline Mode'}</span>
          </div>

          <button
            onClick={triggerManualSync}
            disabled={isSyncing}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 text-[#64748B] hover:text-[#172033] border border-[#CBD5E1] shadow-sm transition-colors"
            title="Synchronize Local Cache"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Quick Action Ribbon */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3 overflow-x-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] whitespace-nowrap hidden md:inline">
          Field Quick Actions:
        </span>
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => onNavigate('inspections')}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 whitespace-nowrap transition-all"
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>+ Start Inspection</span>
          </button>

          <button
            onClick={() => setShowReportModal(true)}
            className="px-3.5 py-2.5 bg-white hover:bg-slate-50 text-[#172033] border border-[#CBD5E1] font-semibold text-xs rounded-xl shadow-sm flex items-center gap-1.5 whitespace-nowrap transition-colors"
          >
            <Plus className="w-4 h-4 text-red-600" />
            <span>Log Finding / Violation</span>
          </button>

          <button
            onClick={() => setShowVerifier(true)}
            className="px-3.5 py-2.5 bg-white hover:bg-slate-50 text-[#172033] border border-[#CBD5E1] font-semibold text-xs rounded-xl shadow-sm flex items-center gap-1.5 whitespace-nowrap transition-colors"
          >
            <QrCode className="w-4 h-4 text-blue-600" />
            <span>Verify Worker QR</span>
          </button>

          <button
            onClick={() => onNavigate('verifications')}
            className="px-3.5 py-2.5 bg-white hover:bg-slate-50 text-[#172033] border border-[#CBD5E1] font-semibold text-xs rounded-xl shadow-sm flex items-center gap-1.5 whitespace-nowrap transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Verification Sign-Off ({pendingVerifications.length})</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Scheduled Audits"
          value={inspections.length}
          subtitle="Assigned Coalfield Units"
          icon={ClipboardCheck}
          color="blue"
          onClick={() => onNavigate('inspections')}
        />
        <StatCard
          title="Active Violations"
          value={openViolations.length}
          subtitle={`${highRiskIssues.length} Classified High/Critical`}
          icon={AlertTriangle}
          color="red"
          onClick={() => onNavigate('violations')}
        />
        <StatCard
          title="Verifications Pending"
          value={pendingVerifications.length}
          subtitle="Corrective Remediation Review"
          icon={ShieldCheck}
          color="amber"
          onClick={() => onNavigate('verifications')}
        />
        <StatCard
          title="Worker Certificates"
          value={certificates.length}
          subtitle="Mandatory Credential Records"
          icon={FileCheck}
          color="emerald"
        />
      </div>

      {/* Main Content Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Findings */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#E2E8F0]">
              <h3 className="text-sm font-bold text-[#172033] uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Active Safety Findings & Breaches ({openViolations.length})</span>
              </h3>
              <button
                onClick={() => onNavigate('violations')}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
              >
                <span>View All ({violations.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-[#E2E8F0] mt-1">
              {openViolations.length === 0 ? (
                <p className="py-8 text-center text-xs text-[#94A3B8]">No active violations on record.</p>
              ) : (
                openViolations.slice(0, 4).map((v) => (
                  <div key={v.violationId} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-[#172033]">{v.violationId}</span>
                        <span className="text-xs text-[#64748B] font-medium">• {v.mineName} ({v.area})</span>
                        <Badge size="sm">{v.severity}</Badge>
                      </div>
                      <p className="text-xs text-[#334155] font-medium">{v.description}</p>
                      <div className="flex items-center gap-2 text-[10px] text-[#64748B] font-mono">
                        <span>Reported: {formatDate(v.date)}</span>
                        <span>•</span>
                        <span className="text-blue-600 font-semibold">AI Risk Score: {v.riskScore}/100</span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <Badge size="sm">{v.status}</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Completed Inspections */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#E2E8F0]">
              <h3 className="text-sm font-bold text-[#172033] uppercase tracking-wider flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-blue-600" />
                <span>Recent Completed Inspection Logs</span>
              </h3>
            </div>

            <div className="divide-y divide-[#E2E8F0] mt-1">
              {inspections.slice(0, 3).map((insp) => (
                <div key={insp.inspectionId} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#172033]">{insp.inspectionId}</span>
                      <span className="text-[#334155] font-medium">{insp.mineName} — {insp.area}</span>
                    </div>
                    <p className="text-[11px] text-[#64748B] mt-0.5">{insp.inspectionType}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge size="sm">{insp.overallResult}</Badge>
                    <span className="text-[#64748B] font-mono text-[11px]">{formatDate(insp.date)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Concession Watchlist & Quick Tools */}
        <div className="space-y-5">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#172033] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Assigned Concessions</span>
            </h4>

            <div className="space-y-2 text-xs">
              {mines.slice(0, 3).map(m => (
                <div key={m.mineId} className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#172033]">{m.mineName}</p>
                    <p className="text-[10px] text-[#64748B] font-mono">{m.location}</p>
                  </div>
                  <div className="text-right">
                    <span className={`font-mono font-bold text-xs ${m.complianceScore < 75 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {m.complianceScore}%
                    </span>
                    <p className="text-[9px] text-[#64748B] font-mono">Score</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Verifier Card */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#172033]">
              Field Verification Tools
            </h4>
            <button
              onClick={() => setShowVerifier(true)}
              className="w-full py-2.5 px-3 bg-[#F8FAFC] hover:bg-slate-100 border border-[#CBD5E1] text-[#172033] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <QrCode className="w-4 h-4 text-blue-600" />
              <span>Lookup Worker Certificate</span>
            </button>
            <button
              onClick={() => onNavigate('inspections')}
              className="w-full py-2.5 px-3 bg-[#F8FAFC] hover:bg-slate-100 border border-[#CBD5E1] text-[#172033] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <ClipboardCheck className="w-4 h-4 text-blue-600" />
              <span>Execute SOP Checklist</span>
            </button>
          </div>
        </div>
      </div>

      <CertificateVerifierModal
        isOpen={showVerifier}
        onClose={() => setShowVerifier(false)}
      />
      <ReportViolationModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />
    </div>
  );
}
