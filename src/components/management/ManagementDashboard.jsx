import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../common/StatCard';
import Badge from '../common/Badge';
import { Building2, Layers, AlertTriangle, ShieldCheck, Activity, FileText, ArrowRight, Download } from 'lucide-react';
import { ComplianceTrendChart, RiskDistributionChart } from './RiskTrendCharts';
import MineComparisonTable from './MineComparisonTable';
import MineDetailModal from './MineDetailModal';

export default function ManagementDashboard({ onNavigate }) {
  const { mines, violations, correctiveActions, certificates, workers } = useData();
  const { currentUser } = useAuth();
  const [selectedMine, setSelectedMine] = useState(null);

  const avgCompliance = Math.round(mines.reduce((acc, m) => acc + m.complianceScore, 0) / mines.length);
  const totalOpenViolations = violations.filter(v => v.status !== 'RESOLVED').length;
  const highRiskMines = mines.filter(m => m.riskLevel === 'HIGH');
  const resolvedCount = violations.filter(v => v.status === 'RESOLVED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-2xl font-extrabold text-[#172033] tracking-tight">
              Executive Safety & Governance Board
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 font-mono font-bold">
              HQ Directorate
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Executive Director: <strong>{currentUser?.name}</strong> • Multi-Concession Compliance Portfolio
          </p>
        </div>

        <button
          onClick={() => onNavigate('compliance-reports')}
          className="px-4 py-2.5 bg-white hover:bg-slate-50 text-[#172033] border border-[#CBD5E1] font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 self-start sm:self-auto transition-colors"
        >
          <Download className="w-4 h-4 text-blue-600" />
          <span>Export Compliance Scorecard</span>
        </button>
      </div>

      {/* 4 KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Org Compliance"
          value={`${avgCompliance}%`}
          subtitle="Average Across 5 Coalfields"
          icon={Building2}
          color="emerald"
        />
        <StatCard
          title="Monitored Mines"
          value={mines.length}
          subtitle={`${highRiskMines.length} Classified High Risk`}
          icon={Layers}
          color={highRiskMines.length > 0 ? 'amber' : 'blue'}
        />
        <StatCard
          title="Open Compliance Breaches"
          value={totalOpenViolations}
          subtitle="Active Corrective Remediation"
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Resolved Safety Tickets"
          value={resolvedCount}
          subtitle="Formally Verified Closures"
          icon={ShieldCheck}
          color="purple"
        />
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#172033] mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <span>4-Week Compliance Score Trajectory by Mine</span>
          </h3>
          <ComplianceTrendChart mines={mines} />
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#172033] mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Violation Severity Breakdown</span>
          </h3>
          <RiskDistributionChart violations={violations} />
        </div>
      </div>

      {/* Comparison Benchmark Table */}
      <MineComparisonTable
        mines={mines}
        onSelectMine={(mine) => setSelectedMine(mine)}
      />

      <MineDetailModal
        isOpen={!!selectedMine}
        onClose={() => setSelectedMine(null)}
        mine={selectedMine}
      />
    </div>
  );
}
