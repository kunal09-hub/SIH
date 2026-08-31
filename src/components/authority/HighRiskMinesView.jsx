import React from 'react';
import { useData } from '../../context/DataContext';
import Badge from '../common/Badge';
import { AlertTriangle, ShieldAlert, ArrowRight } from 'lucide-react';

export default function HighRiskMinesView({ onSelectMine }) {
  const { mines, violations } = useData();
  const highRiskList = mines.filter(m => m.riskLevel === 'HIGH' || m.complianceScore < 75);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-2xl font-extrabold text-[#172033] tracking-tight flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <span>High-Risk Mines & Intervention Watchlist</span>
            </h2>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Mining concessions exhibiting compliance breaches below safety thresholds (Compliance &lt; 75%)
          </p>
        </div>
        <Badge size="md" variant="red">{highRiskList.length} High-Risk Units</Badge>
      </div>

      <div className="space-y-4">
        {highRiskList.map((m) => {
          const mineViolations = violations.filter(v => v.mineId === m.mineId && v.status !== 'RESOLVED');
          return (
            <div key={m.mineId} className="bg-white border border-red-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-[#E2E8F0]">
                <div>
                  <h3 className="text-base font-bold text-[#172033] flex items-center gap-2">
                    {m.mineName}
                    <Badge size="sm" variant="red">CRITICAL OVERSIGHT</Badge>
                  </h3>
                  <p className="text-xs text-[#64748B] font-mono mt-0.5">{m.location} • {m.type}</p>
                </div>
                <div className="text-left sm:text-right font-mono">
                  <span className="text-2xl font-extrabold text-red-600">{m.complianceScore}%</span>
                  <p className="text-[10px] text-[#64748B]">Compliance Score</p>
                </div>
              </div>

              <div className="text-xs space-y-2">
                <p className="font-semibold text-[#172033]">Active High-Consequence Violations ({mineViolations.length}):</p>
                {mineViolations.map(v => (
                  <div key={v.violationId} className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-xs flex justify-between items-center gap-2">
                    <div>
                      <span className="font-mono font-bold text-red-600">{v.violationId}</span>: <span className="text-[#334155]">{v.description}</span>
                    </div>
                    <Badge size="sm">{v.severity}</Badge>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-[#E2E8F0] flex justify-end">
                <button
                  onClick={() => onSelectMine && onSelectMine(m)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <span>Open Detailed Risk Audit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
