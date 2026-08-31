import React from 'react';
import Badge from '../common/Badge';
import { Layers, ArrowRight } from 'lucide-react';

export default function MineComparisonTable({ mines, onSelectMine }) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#172033] flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <span>Mining Concessions Compliance Benchmark</span>
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
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
          <tbody className="divide-y divide-[#E2E8F0]">
            {mines.map((m) => (
              <tr key={m.mineId} className="hover:bg-[#F8FAFC] transition-colors">
                <td className="p-3.5">
                  <p className="font-bold text-[#172033] text-xs">{m.mineName}</p>
                  <p className="text-[10px] text-[#64748B] font-mono">{m.mineId} • {m.type}</p>
                </td>
                <td className="p-3.5 text-[#475569]">
                  {m.location}
                </td>
                <td className="p-3.5">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono font-extrabold text-sm ${m.complianceScore >= 80 ? 'text-emerald-600' : m.complianceScore >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                      {m.complianceScore}%
                    </span>
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${m.complianceScore >= 80 ? 'bg-emerald-500' : m.complianceScore >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${m.complianceScore}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="p-3.5">
                  <Badge size="sm">{m.riskLevel}</Badge>
                </td>
                <td className="p-3.5">
                  <span className={`font-mono font-bold ${m.activeViolations > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {m.activeViolations} Active
                  </span>
                </td>
                <td className="p-3.5 text-[#64748B] text-[11px]">
                  {m.officer?.split('(')[0]}
                </td>
                <td className="p-3.5 text-right">
                  <button
                    onClick={() => onSelectMine(m)}
                    className="px-3 py-1.5 bg-[#F8FAFC] hover:bg-blue-50 text-[#172033] hover:text-blue-600 font-bold rounded-lg text-xs border border-[#CBD5E1] transition-colors inline-flex items-center gap-1"
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
