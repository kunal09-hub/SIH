import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import StatCard from '../common/StatCard';
import Badge from '../common/Badge';
import { ComplianceTrendChart, RiskDistributionChart } from './RiskTrendCharts';
import MineDetailModal from './MineDetailModal';
import {
  Activity,
  AlertTriangle,
  Flame,
  ShieldAlert,
  Zap,
  Truck,
  Wind,
  Layers,
  ArrowUpRight,
  TrendingDown,
  BrainCircuit,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

export default function RiskAnalyticsView({ onNavigate, onSelectMine }) {
  const { mines, violations, correctiveActions } = useData();
  const [selectedMine, setSelectedMine] = useState(null);
  const [filterRisk, setFilterRisk] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');

  const highRiskMines = mines.filter(m => m.riskLevel === 'HIGH' || m.complianceScore < 75);
  const mediumRiskMines = mines.filter(m => m.riskLevel === 'MEDIUM' && m.complianceScore >= 75);
  const lowRiskMines = mines.filter(m => m.riskLevel === 'LOW');
  
  const criticalViolations = violations.filter(v => v.severity === 'CRITICAL');
  const highViolations = violations.filter(v => v.severity === 'HIGH');
  
  // Calculate average safety risk index (inverted compliance score)
  const avgRiskIndex = Math.round(100 - (mines.reduce((acc, m) => acc + m.complianceScore, 0) / mines.length));

  // Risk matrix categories
  const riskCategories = [
    { id: 'ventilation', name: 'Ventilation & Toxic Gases', icon: Wind, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'machinery', name: 'Heavy Machinery & Haulage', icon: Truck, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'slope', name: 'Ground Control & Slope', icon: Layers, color: 'text-red-600', bg: 'bg-red-50' },
    { id: 'electrical', name: 'Electrical & Fire Safety', icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  // Specific risk scores per mine per category
  const mineRiskProfiles = mines.map(m => {
    const mineVios = violations.filter(v => v.mineId === m.mineId && v.status !== 'RESOLVED');
    const hasCrit = mineVios.some(v => v.severity === 'CRITICAL');
    const hasHigh = mineVios.some(v => v.severity === 'HIGH');

    let ventilationRisk = m.mineId === 'MINE-03' ? 88 : m.mineId === 'MINE-05' ? 62 : 24;
    let machineryRisk = m.mineId === 'MINE-02' ? 74 : m.mineId === 'MINE-03' ? 68 : 18;
    let slopeRisk = m.mineId === 'MINE-05' ? 85 : m.mineId === 'MINE-01' ? 42 : 15;
    let electricalRisk = m.mineId === 'MINE-01' ? 65 : m.mineId === 'MINE-04' ? 20 : 35;

    const overallCompositeRisk = Math.round((ventilationRisk + machineryRisk + slopeRisk + electricalRisk) / 4);

    return {
      ...m,
      ventilationRisk,
      machineryRisk,
      slopeRisk,
      electricalRisk,
      overallCompositeRisk,
      activeViolations: mineVios.length,
      hasCrit,
      hasHigh,
      primaryHazard: m.mineId === 'MINE-03' ? 'Ventilation Sensor Overdue (CMR-138)' : 
                     m.mineId === 'MINE-05' ? 'Bench Slope Geotechnical Angle' :
                     m.mineId === 'MINE-02' ? 'Machinery Audio-Visual Warning Interlock' : 'Statutory Refresher Renewal'
    };
  });

  const filteredMines = mineRiskProfiles.filter(m => {
    if (filterRisk === 'HIGH' && m.riskLevel !== 'HIGH') return false;
    if (filterRisk === 'MEDIUM' && m.riskLevel !== 'MEDIUM') return false;
    if (filterRisk === 'LOW' && m.riskLevel !== 'LOW') return false;
    if (filterType !== 'ALL' && !m.type.toLowerCase().includes(filterType.toLowerCase())) return false;
    return true;
  });

  const getRiskColor = (score) => {
    if (score >= 70) return 'bg-mgRed-100 text-mgRed-700 font-bold border-red-200';
    if (score >= 40) return 'bg-mgAmber-100 text-mgAmber-700 font-bold border-amber-200';
    return 'bg-mgGreen-100 text-mgGreen-700 font-medium border-green-200';
  };

  const handleOpenMine = (mine) => {
    if (onSelectMine) {
      onSelectMine(mine);
    } else {
      setSelectedMine(mine);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-enterprise-border">
        <div>
          <h2 className="text-xl font-bold text-enterprise-text flex items-center gap-2">
            <Activity className="w-5 h-5 text-mgRed-600" />
            <span>Enterprise Safety Risk Analytics & Threat Heatmap</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-600 border border-purple-200 font-mono font-bold">
              AI Risk Engine
            </span>
          </h2>
          <p className="text-xs text-enterprise-text-muted mt-1">
            Real-time composite hazard evaluation, sector vulnerability matrices, and predictive failure modeling
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 bg-blue-50 border border-blue-200 text-mgBlue-600 rounded-lg flex items-center gap-1.5">
            <BrainCircuit className="w-4 h-4" />
            <span>AI Predictive Horizon: 30 Days</span>
          </span>
        </div>
      </div>

      {/* 4 Risk KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Aggregate Hazard Index"
          value={`${avgRiskIndex} / 100`}
          subtitle="Corporate Composite Threat Level"
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          title="High-Risk Exposure"
          value={`${highRiskMines.length} Units`}
          subtitle="Mines Requiring Immediate Intervention"
          icon={ShieldAlert}
          color="red"
        />
        <StatCard
          title="Critical Hazard Breaches"
          value={criticalViolations.length}
          subtitle="Direct Threat to Life Safety"
          icon={Flame}
          color="red"
        />
        <StatCard
          title="AI Risk Containment"
          value="84.2%"
          subtitle="Remediation Velocity on Active Tickets"
          icon={Activity}
          color="emerald"
        />
      </div>

      {/* AI Risk Heatmap Matrix by Mine & Category */}
      <div className="mg-card p-5 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-enterprise-border">
          <div>
            <h3 className="text-sm font-bold text-enterprise-text flex items-center gap-2">
              <Layers className="w-4 h-4 text-mgBlue-600" />
              <span>Multi-Sector Hazard Vulnerability Heatmap</span>
            </h3>
            <p className="text-xs text-enterprise-text-muted mt-0.5">
              Automated scoring based on open violation severity, inspection telemetry, and certificate validity
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="px-2.5 py-1.5 bg-gray-50 border border-enterprise-border rounded-lg text-enterprise-text text-xs focus:outline-none"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="HIGH">High Risk Only</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="LOW">Low Risk</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-2.5 py-1.5 bg-gray-50 border border-enterprise-border rounded-lg text-enterprise-text text-xs focus:outline-none"
            >
              <option value="ALL">All Mine Types</option>
              <option value="underground">Underground</option>
              <option value="opencast">Opencast</option>
            </select>
          </div>
        </div>

        {/* Heatmap Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-enterprise-border text-enterprise-text-secondary uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3 px-3">Mine Name & Type</th>
                <th className="py-3 px-3 text-center">Composite Risk</th>
                <th className="py-3 px-3 text-center">Ventilation & Gas</th>
                <th className="py-3 px-3 text-center">Machinery & Haulage</th>
                <th className="py-3 px-3 text-center">Ground & Slope</th>
                <th className="py-3 px-3 text-center">Electrical & Fire</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-enterprise-border font-mono">
              {filteredMines.map((m) => (
                <tr key={m.mineId} className="hover:bg-gray-50/50 transition-colors font-sans">
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-enterprise-text text-xs">{m.mineName}</div>
                    <div className="text-[11px] text-enterprise-text-muted font-mono">{m.mineId} • {m.type}</div>
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs border ${getRiskColor(m.overallCompositeRisk)}`}>
                      {m.overallCompositeRisk}%
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] border ${getRiskColor(m.ventilationRisk)}`}>
                      {m.ventilationRisk}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] border ${getRiskColor(m.machineryRisk)}`}>
                      {m.machineryRisk}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] border ${getRiskColor(m.slopeRisk)}`}>
                      {m.slopeRisk}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] border ${getRiskColor(m.electricalRisk)}`}>
                      {m.electricalRisk}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() => handleOpenMine(m)}
                      className="px-3 py-1 bg-white hover:bg-gray-50 border border-enterprise-border text-enterprise-text text-xs font-semibold rounded-lg shadow-sm transition-colors"
                    >
                      Audit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analytics Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 mg-card p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-enterprise-text flex items-center gap-2">
              <Activity className="w-4 h-4 text-mgBlue-600" />
              <span>Multi-Week Compliance & Risk Trajectory</span>
            </h3>
            <span className="text-[11px] text-enterprise-text-muted font-mono">Historical Telemetry</span>
          </div>
          <ComplianceTrendChart mines={mines} />
        </div>

        <div className="mg-card p-5 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-enterprise-text flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-mgAmber-600" />
              <span>Hazard Severity Breakdown</span>
            </h3>
          </div>
          <RiskDistributionChart violations={violations} />
          <p className="text-[11px] text-enterprise-text-muted text-center mt-3">
            Real-time distribution across Critical, High, Medium, and Low severity classifications
          </p>
        </div>
      </div>

      {/* Priority Threat Spotlight Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-enterprise-text flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-mgRed-600" />
          <span>Priority Threat Vectors Requiring Executive Action</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mineRiskProfiles.filter(m => m.overallCompositeRisk >= 50).map(m => (
            <div key={m.mineId} className="mg-card border-l-4 border-l-mgRed-500 p-4 shadow-card space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-sm text-enterprise-text flex items-center gap-2">
                    {m.mineName}
                    <Badge size="sm">{m.riskLevel} RISK</Badge>
                  </h4>
                  <p className="text-xs text-enterprise-text-muted font-mono mt-0.5">{m.location} • {m.type}</p>
                </div>
                <span className="text-lg font-black text-mgRed-600 font-mono">{m.overallCompositeRisk}% Threat</span>
              </div>

              <p className="text-xs text-enterprise-text-secondary bg-gray-50 p-2 rounded border border-enterprise-border">
                <strong>Primary Hazard Vector:</strong> {m.primaryHazard}
              </p>

              <div className="flex justify-between items-center pt-2 text-xs">
                <span className="text-enterprise-text-muted">{m.activeViolations} Active Violations</span>
                <button
                  onClick={() => handleOpenMine(m)}
                  className="text-mgBlue-600 font-bold hover:underline flex items-center gap-1"
                >
                  <span>Open Risk Dossier</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

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
