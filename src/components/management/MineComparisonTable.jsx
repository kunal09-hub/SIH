import React from 'react';
import Badge from '../common/Badge';
import { Layers, ArrowRight } from 'lucide-react';

export default function MineComparisonTable({ mines, onSelectMine }) {
  return (
    <div className="mg-card overflow-hidden shadow-card">
      <div className="p-4 border-b border-enterprise-border flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-enterprise-text-secondary flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-600" />
          <span>Fictional Demonstration Mines Benchmark (5 Mines)</span>
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 border-b border-enterprise-border text-[10px] font-bold uppercase tracking-wider text-enterprise-text-muted">
            <tr>
              <th className="p-3.5">Mine Name & ID</th>
              <th className="p-3.5">Coalfield Location</th>
              <th className="p-3.5">Compliance Score</th>
              <th className="p-3.5">Risk Rating</th>
              <th className="p-3.5">Active Violations</th>
              <th className="p-3.5">Safety Officer</th>
              <th className="p-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-enterprise-border">
            {mines.map((m) => (
              <tr key={m.mineId} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-3.5">
                  <p className="font-bold text-enterprise-text text-xs">{m.mineName}</p>
                  <p className="text-[10px] text-enterprise-text-muted font-mono">{m.mineId} • {m.type}</p>
                </td>
                <td className="p-3.5 text-enterprise-text-secondary">
                  {m.location}
                </td>
                <td className="p-3.5">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono font-extrabold text-sm ${m.complianceScore >= 80 ? 'text-mgGreen-600' : m.complianceScore >= 70 ? 'text-mgAmber-600' : 'text-mgRed-600'}`}>
                      {m.complianceScore}%
                    </span>
                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${m.complianceScore >= 80 ? 'bg-mgGreen-500' : m.complianceScore >= 70 ? 'bg-mgAmber-500' : 'bg-mgRed-500'}`}
                        style={{ width: `${m.complianceScore}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="p-3.5">
                  <Badge size="sm">{m.riskLevel}</Badge>
                </td>
                <td className="p-3.5">
                  <span className={`font-mono font-bold ${m.activeViolations > 0 ? 'text-mgRed-600' : 'text-mgGreen-600'}`}>
                    {m.activeViolations} Active
                  </span>
                </td>
                <td className="p-3.5 text-enterprise-text-muted text-[11px]">
                  {m.officer?.split('(')[0]}
                </td>
                <td className="p-3.5 text-right">
                  <button
                    onClick={() => onSelectMine(m)}
                    className="px-3 py-1.5 bg-white hover:bg-purple-600 text-enterprise-text hover:text-white border border-enterprise-border font-bold rounded-lg text-xs transition-colors flex items-center gap-1 ml-auto shadow-sm"
                  >
                    <span>Audit</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
