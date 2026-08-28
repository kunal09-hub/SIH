import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../common/StatCard';
import { Building2, Layers, AlertTriangle, ShieldCheck, Activity, Download } from 'lucide-react';
import { ComplianceTrendChart, RiskDistributionChart } from './RiskTrendCharts';
import MineComparisonTable from './MineComparisonTable';
import MineDetailModal from './MineDetailModal';

export default function ManagementDashboard({ onNavigate }) {
  const { mines, violations } = useData();
  const { currentUser } = useAuth();
  const [selectedMine, setSelectedMine] = useState(null);

  const avgCompliance = Math.round(mines.reduce((acc, m) => acc + m.complianceScore, 0) / mines.length);
  const totalOpenViolations = violations.filter(v => v.status !== 'RESOLVED').length;
  const highRiskMines = mines.filter(m => m.riskLevel === 'HIGH');
  const resolvedCount = violations.filter(v => v.status === 'RESOLVED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-enterprise-border">
        <div>
          <h2 className="text-xl font-bold text-enterprise-text flex items-center gap-2">
            <span>Corporate Mining Safety & Governance Executive Board</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-600 border border-purple-200 font-mono font-bold">
              HQ Dashboard
            </span>
          </h2>
          <p className="text-xs text-enterprise-text-muted mt-1">
            Executive Director: <strong className="text-enterprise-text">{currentUser?.name}</strong> • Multi-Mine Compliance Oversight
          </p>
        </div>

        <button
          onClick={() => onNavigate('compliance-reports')}
          className="px-4 py-2 bg-white hover:bg-gray-50 text-enterprise-text border border-enterprise-border font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 self-start sm:self-auto transition-colors"
        >
          <Download className="w-4 h-4 text-purple-600" />
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
        <div className="lg:col-span-2 mg-card p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-enterprise-text mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-mgBlue-600" />
            <span>4-Week Compliance Score Trajectory by Mine</span>
          </h3>
          <ComplianceTrendChart mines={mines} />
        </div>

        <div className="mg-card p-5 flex flex-col justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-enterprise-text mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-mgAmber-600" />
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
