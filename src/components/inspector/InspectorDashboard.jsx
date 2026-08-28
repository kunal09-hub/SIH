import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../common/StatCard';
import Badge from '../common/Badge';
import { formatDate } from '../../utils/dateHelpers';
import { ClipboardCheck, AlertTriangle, ShieldCheck, FileCheck, QrCode, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import CertificateVerifierModal from './CertificateVerifierModal';
import ReportViolationModal from './ReportViolationModal';

export default function InspectorDashboard({ onNavigate }) {
  const { inspections, violations, certificates } = useData();
  const { currentUser } = useAuth();
  const [showVerifier, setShowVerifier] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const openViolations = violations.filter(v => v.status !== 'RESOLVED');
  const pendingVerifications = violations.filter(v => v.status === 'VERIFICATION REQUIRED');
  const highRiskIssues = violations.filter(v => v.severity === 'HIGH' || v.severity === 'CRITICAL');

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-enterprise-border">
        <div>
          <h2 className="text-xl font-bold text-enterprise-text flex items-center gap-2">
            <span>Inspector Command Center</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-mgAmber-100 text-mgAmber-600 border border-amber-200 font-mono font-bold">
              INS-001
            </span>
          </h2>
          <p className="text-xs text-enterprise-text-muted mt-1">
            Logged in as <strong className="text-enterprise-text">{currentUser?.name}</strong> • Regulatory Compliance Inspector
          </p>
        </div>

        {/* Quick Inspector Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onNavigate('inspections')}
            className="px-3.5 py-2 bg-mgBlue-600 hover:bg-mgBlue-500 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Start Field Inspection</span>
          </button>

          <button
            onClick={() => setShowVerifier(true)}
            className="px-3 py-2 bg-white hover:bg-gray-50 text-enterprise-text border border-enterprise-border font-semibold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <QrCode className="w-4 h-4 text-mgBlue-600" />
            <span>Verify Certificate / QR</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Scheduled Audits Today"
          value={inspections.length}
          subtitle="3 Active Coal Mines"
          icon={ClipboardCheck}
          color="blue"
        />
        <StatCard
          title="Open Violations"
          value={openViolations.length}
          subtitle={`${highRiskIssues.length} Classified High Risk`}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Verifications Pending"
          value={pendingVerifications.length}
          subtitle="Remediation Sign-Off Needed"
          icon={ShieldCheck}
          color="amber"
          onClick={() => onNavigate('verifications')}
        />
        <StatCard
          title="Monitored Certificates"
          value={certificates.length}
          subtitle="Across 25+ Workers"
          icon={FileCheck}
          color="emerald"
        />
      </div>

      {/* Today's High-Priority Attention Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Violations & Action Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="mg-card p-5">
            <div className="flex items-center justify-between pb-3 border-b border-enterprise-border">
              <h3 className="text-sm font-bold text-enterprise-text uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-mgAmber-600" />
                <span>Active Violations Requiring Field Oversight</span>
              </h3>
              <button
                onClick={() => onNavigate('violations')}
                className="text-xs text-mgBlue-600 hover:text-mgBlue-500 font-semibold flex items-center gap-1"
              >
                <span>View All ({violations.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-enterprise-border mt-2">
              {openViolations.slice(0, 4).map((v) => (
                <div key={v.violationId} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-enterprise-text">{v.violationId}</span>
                      <span className="text-xs text-enterprise-text-secondary font-semibold">• {v.mineName} ({v.area})</span>
                      <Badge size="sm">{v.severity}</Badge>
                    </div>
                    <p className="text-xs text-enterprise-text font-medium">{v.description}</p>
                    <div className="flex items-center gap-2 text-[10px] text-enterprise-text-muted font-mono">
                      <span>Reported: {formatDate(v.date || v.reportedDate)}</span>
                      <span>•</span>
                      <span className="text-mgAmber-600 font-semibold">AI Risk: {v.riskScore}/100</span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <Badge size="sm">{v.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Completed Inspections */}
          <div className="mg-card p-5">
            <div className="flex items-center justify-between pb-3 border-b border-enterprise-border">
              <h3 className="text-sm font-bold text-enterprise-text uppercase tracking-wider flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-mgBlue-600" />
                <span>Recent Field Inspection History</span>
              </h3>
            </div>

            <div className="divide-y divide-enterprise-border mt-2">
              {inspections.slice(0, 3).map((insp) => (
                <div key={insp.inspectionId} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-enterprise-text">{insp.inspectionId}</span>
                      <span className="text-enterprise-text-secondary font-medium">{insp.mineName} — {insp.area}</span>
                    </div>
                    <p className="text-[11px] text-enterprise-text-muted mt-0.5">{insp.inspectionType}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge size="sm">{insp.overallResult}</Badge>
                    <span className="text-enterprise-text-muted font-mono text-[11px]">{formatDate(insp.date)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: AI Risk Spotlight & Quick Links */}
        <div className="space-y-4">
          <div className="mg-card p-5 border-t-4 border-t-mgAmber-500">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-mgAmber-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-mgAmber-600">
                AI-Assisted Risk Prioritization Radar
              </h4>
            </div>

            {openViolations.length > 0 ? (
              (() => {
                const topRisk = [...openViolations].sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0))[0];
                return (
                  <div className="p-3 bg-gray-50 rounded-lg border border-enterprise-border space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-enterprise-text truncate max-w-[170px]">
                        {topRisk.workerName ? `${topRisk.workerName}` : topRisk.category}
                      </span>
                      <span className="font-mono font-bold text-mgRed-600">{topRisk.riskScore || 85} / 100</span>
                    </div>
                    <p className="text-[11px] text-enterprise-text-secondary leading-relaxed">
                      {topRisk.description}
                    </p>
                    <div className="pt-2 border-t border-enterprise-border flex items-center justify-between text-[10px] text-enterprise-text-muted">
                      <span>{topRisk.mineName} ({topRisk.area})</span>
                      <Badge size="sm">{topRisk.riskLevel || topRisk.severity}</Badge>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg border border-enterprise-border text-center">
                <CheckCircle2 className="w-5 h-5 text-mgGreen-600 mx-auto mb-1" />
                <p className="text-xs font-bold text-enterprise-text">All Operations Nominal</p>
                <p className="text-[10px] text-enterprise-text-muted mt-0.5">No critical active compliance breaches detected.</p>
              </div>
            )}

            <p className="text-[11px] text-enterprise-text-muted mt-3 leading-relaxed">
              The AI Engine correlates worker technical designations against hazardous operational zones and certificate expiration buffers.
            </p>
          </div>

          {/* Quick Verifier Card */}
          <div className="mg-card p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-enterprise-text">
              Inspector Field Tools
            </h4>
            <button
              onClick={() => setShowVerifier(true)}
              className="w-full py-2.5 px-3 bg-white hover:bg-gray-50 border border-enterprise-border text-enterprise-text rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <QrCode className="w-4 h-4 text-mgBlue-600" />
              <span>Lookup / Verify Worker Certificate</span>
            </button>
            <button
              onClick={() => onNavigate('inspections')}
              className="w-full py-2.5 px-3 bg-white hover:bg-gray-50 border border-enterprise-border text-enterprise-text rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <ClipboardCheck className="w-4 h-4 text-mgAmber-600" />
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
