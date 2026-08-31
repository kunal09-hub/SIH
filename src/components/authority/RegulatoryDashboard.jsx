import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../common/StatCard';
import Badge from '../common/Badge';
import { Landmark, Scale, AlertTriangle, ShieldCheck, FileText, ArrowRight } from 'lucide-react';
import MineComparisonTable from '../management/MineComparisonTable';
import MineDetailModal from '../management/MineDetailModal';
import IssueDirectiveModal from './IssueDirectiveModal';

export default function RegulatoryDashboard({ onNavigate }) {
  const { mines, violations, correctiveActions } = useData();
  const { currentUser } = useAuth();
  const [selectedMine, setSelectedMine] = useState(null);
  const [showDirectiveModal, setShowDirectiveModal] = useState(false);

  const highRiskMines = mines.filter(m => m.complianceScore < 75);
  const criticalViolations = violations.filter(v => v.severity === 'CRITICAL');
  const nationalAvg = Math.round(mines.reduce((acc, m) => acc + m.complianceScore, 0) / mines.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-2xl font-extrabold text-[#172033] tracking-tight">
              Regulatory Authority Surveillance
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-bold">
              National Oversight
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Regional Director: <strong>{currentUser?.name}</strong> • National Mining Surveillance & Statutory Enforcement
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDirectiveModal(true)}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Scale className="w-4 h-4" />
            <span>Issue Compliance Directive</span>
          </button>
        </div>
      </div>

      {/* Top 4 Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="National Safety Index"
          value={`${nationalAvg}%`}
          subtitle="Regulatory Benchmark Threshold"
          icon={Landmark}
          color="emerald"
        />
        <StatCard
          title="Mines Flagged High Risk"
          value={highRiskMines.length}
          subtitle="Requires Special Audit"
          icon={AlertTriangle}
          color={highRiskMines.length > 0 ? 'red' : 'emerald'}
        />
        <StatCard
          title="Critical Violations"
          value={criticalViolations.length}
          subtitle="Immediate Life Hazard Breaches"
          icon={Scale}
          color="amber"
        />
        <StatCard
          title="Total Monitored Units"
          value={mines.length}
          subtitle="Opencast & Underground Concessions"
          icon={ShieldCheck}
          color="blue"
        />
      </div>

      {/* High-Risk Spotlight Banner (e.g. Mine Gamma at 61%) */}
      {highRiskMines.length > 0 && (
        <div className="p-4 sm:p-5 bg-red-50/80 border border-red-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-red-100 text-red-600 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-red-800">
                Statutory Warning: {highRiskMines[0].mineName} Compliance Index at {highRiskMines[0].complianceScore}%
              </h4>
              <p className="text-xs text-[#475569] mt-1 leading-relaxed">
                Mine Gamma has repeatedly flagged ventilation and blasting safety concerns. AI-assisted analysis recommends a focused audit inspection.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowDirectiveModal(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm shrink-0 transition-colors"
          >
            Issue Formal Notice
          </button>
        </div>
      )}

      {/* Mine Comparison Table */}
      <MineComparisonTable
        mines={mines}
        onSelectMine={(m) => setSelectedMine(m)}
      />

      <MineDetailModal
        isOpen={!!selectedMine}
        onClose={() => setSelectedMine(null)}
        mine={selectedMine}
      />
      <IssueDirectiveModal
        isOpen={showDirectiveModal}
        onClose={() => setShowDirectiveModal(false)}
      />
    </div>
  );
}
