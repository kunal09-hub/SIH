import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../common/StatCard';
import Badge from '../common/Badge';
import { Landmark, Scale, AlertTriangle, ShieldCheck } from 'lucide-react';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-enterprise-border">
        <div>
          <h2 className="text-xl font-bold text-enterprise-text flex items-center gap-2">
            <span>Regulatory Authority — Compliance Surveillance</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-mgGreen-100 text-mgGreen-600 border border-green-200 font-mono font-bold">
              National Oversight
            </span>
          </h2>
          <p className="text-xs text-enterprise-text-muted mt-1">
            Regional Director: <strong className="text-enterprise-text">{currentUser?.name}</strong> • AI-Assisted Compliance Monitoring (Prototype)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDirectiveModal(true)}
            className="px-3.5 py-2 bg-mgRed-600 hover:bg-mgRed-500 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Scale className="w-4 h-4" />
            <span>Issue Regulatory Compliance Notice</span>
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
          subtitle="Immediate Life Hazard"
          icon={Scale}
          color="amber"
        />
        <StatCard
          title="Total Monitored Units"
          value={mines.length}
          subtitle="Opencast & Underground"
          icon={ShieldCheck}
          color="blue"
        />
      </div>

      {/* High-Risk Spotlight Banner */}
      {highRiskMines.length > 0 && (
        <div className="p-4 bg-mgRed-50 border border-red-200 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-mgRed-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-mgRed-600">
                Statutory Warning: {highRiskMines[0].mineName} Compliance Index at {highRiskMines[0].complianceScore}%
              </h4>
              <p className="text-xs text-enterprise-text-secondary mt-1 leading-relaxed">
                Demo Mine Gamma has repeatedly flagged ventilation and blasting safety concerns. AI-assisted analysis recommends a focused audit inspection.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowDirectiveModal(true)}
            className="px-4 py-2 bg-mgRed-600 hover:bg-mgRed-500 text-white font-bold text-xs rounded-lg shadow-sm shrink-0 transition-colors"
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
