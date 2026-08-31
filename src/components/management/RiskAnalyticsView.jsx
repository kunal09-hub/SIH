import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../common/StatCard';
import Badge from '../common/Badge';
import {
  Activity,
  AlertTriangle,
  Flame,
  ShieldAlert,
  Sparkles,
  Zap,
  Building2,
  TrendingDown,
  TrendingUp,
  Info,
  Layers,
  ArrowRight,
  Gauge
} from 'lucide-react';
import { RiskDistributionChart, HazardCategoryBarChart } from './RiskTrendCharts';
import AIRiskCard from '../ai/AIRiskCard';
import MineDetailModal from './MineDetailModal';

export default function RiskAnalyticsView({ onNavigate, onSelectMine }) {
  const { mines, violations, correctiveActions } = useData();
  const { currentUser } = useAuth();
  const [selectedMine, setSelectedMine] = useState(null);

  // Compute aggregate risk metrics
  const criticalViolations = violations.filter(v => v.severity === 'CRITICAL' && v.status !== 'RESOLVED');
  const highRiskViolations = violations.filter(v => v.severity === 'HIGH' && v.status !== 'RESOLVED');
  const totalActiveThreats = criticalViolations.length + highRiskViolations.length;
  const highRiskMines = mines.filter(m => m.riskLevel === 'HIGH' || m.complianceScore < 75);

  // Weighted Org Composite Risk calculation (0-100)
  const averageCompliance = mines.reduce((acc, m) => acc + m.complianceScore, 0) / mines.length;
  const compositeRiskScore = Math.round(100 - averageCompliance + (criticalViolations.length * 8));

  // Mine AI Risk Breakdown Data
  const mineRiskProfiles = mines.map(m => {
    const mineViols = violations.filter(v => v.mineId === m.mineId && v.status !== 'RESOLVED');
    const hasCrit = mineViols.some(v => v.severity === 'CRITICAL');
    const hasHigh = mineViols.some(v => v.severity === 'HIGH');
    
    let calculatedAiScore = Math.round(100 - m.complianceScore);
    if (hasCrit) calculatedAiScore = Math.max(calculatedAiScore, 86);
    else if (hasHigh) calculatedAiScore = Math.max(calculatedAiScore, 68);

    let hazardDrivers = [];
    if (m.mineId === 'MINE-03') {
      hazardDrivers = [
        'Methane gas sensor calibration overdue in Deep Seam IV',
        'Ventilation airflow velocity discrepancy logged in Substation zone',
        'Critical violation escalation risk if unaddressed within 48h'
      ];
    } else if (m.mineId === 'MINE-01') {
      hazardDrivers = [
        'High voltage substation competency certificate expired for personnel',
        'Verification sign-off pending for electrical crew'
      ];
    } else if (m.mineId === 'MINE-02') {
      hazardDrivers = [
        'Heavy hauler Dumper D-08 reverse alarm interlock malfunction',
        'Workshop maintenance safety sign-off pending'
      ];
    } else {
      hazardDrivers = [
        'Routine operational compliance maintained above threshold',
        'Scheduled environmental monitoring within standard limits'
      ];
    }

    return {
      mine: m,
      aiScore: calculatedAiScore,
      riskLevel: calculatedAiScore >= 75 ? 'HIGH' : calculatedAiScore >= 50 ? 'MEDIUM' : 'LOW',
      hazardDrivers,
      activeThreatCount: mineViols.length,
      aiMitigation: m.complianceScore < 75
        ? 'Immediate DGMS compliance audit recommended; execute corrective action tickets.'
        : 'Maintain continuous automated sensor surveillance and periodic audit checks.'
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-2xl font-extrabold text-[#172033] tracking-tight">
              Corporate Risk Analytics & Hazard Intelligence
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 font-mono font-bold">
              Risk Engine Active
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Real-time hazard prioritization, multi-factor risk inference, and compliance breach forecasting.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-white border border-[#CBD5E1] shadow-sm text-xs text-[#64748B] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Bayesian Risk Model: <strong className="text-emerald-600">Optimal</strong></span>
          </div>
        </div>
      </div>

      {/* 4 Risk KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Composite Risk Index"
          value={`${compositeRiskScore}/100`}
          subtitle="Multi-Factor Hazard Exposure"
          icon={Gauge}
          color={compositeRiskScore > 40 ? 'red' : 'amber'}
        />
        <StatCard
          title="High Vulnerability Mines"
          value={highRiskMines.length}
          subtitle="Compliance < 75% Threshold"
          icon={AlertTriangle}
          color={highRiskMines.length > 0 ? 'red' : 'emerald'}
        />
        <StatCard
          title="Active High-Hazard Breaches"
          value={totalActiveThreats}
          subtitle={`${criticalViolations.length} Critical • ${highRiskViolations.length} High Severity`}
          icon={ShieldAlert}
          color="red"
        />
        <StatCard
          title="Predicted Risk Trajectory"
          value="+4.2%"
          subtitle="30-Day Exposure Forecast"
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Deep Risk Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Hazard Category Risk Exposure Bar Chart */}
        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#172033] flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Hazard Category Risk Vulnerability Index</span>
            </h3>
            <span className="text-[10px] text-[#64748B] font-mono">Weighted Risk Score (0-100)</span>
          </div>
          <HazardCategoryBarChart violations={violations} />
        </div>

        {/* Right: Severity & Consequence Breakdown */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#172033] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>Violation Risk Severity Distribution</span>
            </h3>
            <p className="text-[10px] text-[#64748B] mt-0.5">Active compliance breaches by danger level</p>
          </div>
          <RiskDistributionChart violations={violations} />
        </div>
      </div>

      {/* Mine-by-Mine AI Risk Evaluation Matrix */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
          <div>
            <h3 className="text-base font-bold text-[#172033] flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Mine-by-Mine AI Risk Prioritization Matrix</span>
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Automated multi-parameter risk evaluation per mining concession
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mineRiskProfiles.map(profile => {
            const m = profile.mine;
            return (
              <div
                key={m.mineId}
                className={`bg-white border rounded-2xl p-5 shadow-sm transition-all space-y-4 ${
                  profile.aiScore >= 75
                    ? 'border-red-300 ring-1 ring-red-200'
                    : profile.aiScore >= 50
                    ? 'border-amber-300'
                    : 'border-[#E2E8F0]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#172033] flex items-center gap-2">
                      {m.mineName}
                    </h4>
                    <p className="text-xs text-[#64748B] font-mono mt-0.5">{m.location}</p>
                  </div>
                  <Badge size="sm">{profile.riskLevel} RISK</Badge>
                </div>

                {/* Score Bar */}
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-[#64748B]">Hazard Score:</span>
                    <span className={`font-bold ${profile.aiScore >= 75 ? 'text-red-600' : profile.aiScore >= 50 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {profile.aiScore}/100
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        profile.aiScore >= 75 ? 'bg-red-500' : profile.aiScore >= 50 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${profile.aiScore}%` }}
                    />
                  </div>
                </div>

                {/* Hazard Factors */}
                <div className="space-y-1.5 text-xs">
                  <p className="text-[11px] font-bold text-[#334155] uppercase tracking-wider">Primary Risk Factors:</p>
                  <ul className="space-y-1">
                    {profile.hazardDrivers.map((h, i) => (
                      <li key={i} className="text-[11px] text-[#64748B] flex items-start gap-1.5 leading-relaxed">
                        <span className="text-amber-500 mt-0.5">•</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Mitigation & Footer */}
                <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
                  <span className="text-[#64748B] font-mono text-[10px]">
                    Compliance: <strong className="text-[#172033]">{m.complianceScore}%</strong>
                  </span>
                  <button
                    onClick={() => {
                      if (onSelectMine) onSelectMine(m);
                      else setSelectedMine(m);
                    }}
                    className="px-3 py-1.5 bg-[#F8FAFC] hover:bg-slate-100 text-[#172033] text-xs font-bold rounded-lg flex items-center gap-1 border border-[#CBD5E1] transition-colors"
                  >
                    <span>Audit Breakdown</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Early Warning Advisory Feed */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>Early-Warning Hazard Advisory & Prescriptive Actions</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-red-50/60 rounded-xl border border-red-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-red-700 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-600" /> High Risk Advisory: Mine Gamma
              </span>
              <Badge size="sm" variant="red">URGENT</Badge>
            </div>
            <p className="text-[#475569] leading-relaxed text-[11px]">
              Continuous gas sensor telemetry indicates escalating methane accumulation risk in Substation / Deep Seam IV. Immediate inspection dispatched under Regulatory Directive DIR-2026-003.
            </p>
          </div>

          <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-800 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-amber-600" /> Preventive Advisory: Competency Buffer
              </span>
              <Badge size="sm" variant="amber">PREVENTIVE</Badge>
            </div>
            <p className="text-[#475569] leading-relaxed text-[11px]">
              8 high-voltage certified electricians across Dhanbad and Raniganj reach renewal expiry window within 30 days. Safety desk notification triggered to avoid operational stop-work notices.
            </p>
          </div>
        </div>
      </div>

      {/* Mine Detail Modal */}
      {selectedMine && (
        <MineDetailModal
          isOpen={!!selectedMine}
          onClose={() => setSelectedMine(null)}
          mine={selectedMine}
        />
      )}
    </div>
  );
}
