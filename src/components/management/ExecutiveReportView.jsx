import React from 'react';
import { useData } from '../../context/DataContext';
import { formatDate } from '../../utils/dateHelpers';
import Badge from '../common/Badge';
import { Download, Printer, ShieldCheck, Shield } from 'lucide-react';

export default function ExecutiveReportView() {
  const { mines, violations, correctiveActions, workers } = useData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-2xl font-extrabold text-[#172033] tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
              <span>Executive Mine Compliance Scorecard & Report</span>
            </h2>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Generated statutory executive summary report for multi-mine compliance tracking and DGMS board review.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 self-start sm:self-auto transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Printable Paper Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-extrabold text-2xl shadow-sm">
              <Shield className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#172033]">MINING COMPLIANCE & SAFETY AUDIT REPORT</h3>
              <p className="text-xs text-[#64748B]">MineGuard Governance Platform • Statutory Safety Directive Documentation</p>
            </div>
          </div>
          <div className="text-right text-xs font-mono text-[#64748B]">
            <p>Report Date: {new Date().toLocaleDateString('en-GB')}</p>
            <p className="text-emerald-600 font-bold">Status: VERIFIED AUDIT</p>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600">1. Executive Governance Summary</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <span className="text-[#64748B] text-[10px] font-bold uppercase">Total Mines Audited</span>
              <p className="font-extrabold text-[#172033] text-xl mt-0.5">{mines.length}</p>
            </div>
            <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <span className="text-[#64748B] text-[10px] font-bold uppercase">Average Compliance</span>
              <p className="font-extrabold text-emerald-600 text-xl mt-0.5">
                {Math.round(mines.reduce((a,b)=>a+b.complianceScore,0)/mines.length)}%
              </p>
            </div>
            <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <span className="text-[#64748B] text-[10px] font-bold uppercase">Active Violations</span>
              <p className="font-extrabold text-red-600 text-xl mt-0.5">{violations.filter(v=>v.status!=='RESOLVED').length}</p>
            </div>
            <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <span className="text-[#64748B] text-[10px] font-bold uppercase">Total Monitored Crew</span>
              <p className="font-extrabold text-[#172033] text-xl mt-0.5">{workers.length}</p>
            </div>
          </div>
        </div>

        {/* Section 2: Mine Level Table */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600">2. Mine-by-Mine Compliance Breakdown</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-[#E2E8F0] rounded-xl overflow-hidden">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[10px] font-bold uppercase text-[#64748B]">
                <tr>
                  <th className="p-3">Mine Name</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Risk Level</th>
                  <th className="p-3">Safety Officer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[11px]">
                {mines.map(m => (
                  <tr key={m.mineId} className="hover:bg-[#F8FAFC]">
                    <td className="p-3 font-bold text-[#172033]">{m.mineName}</td>
                    <td className="p-3 text-[#475569]">{m.location}</td>
                    <td className="p-3 font-mono font-bold text-emerald-600">{m.complianceScore}%</td>
                    <td className="p-3"><Badge size="sm">{m.riskLevel}</Badge></td>
                    <td className="p-3 text-[#64748B]">{m.officer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Statutory Certification Sign-Off */}
        <div className="pt-6 border-t border-[#E2E8F0] grid grid-cols-2 gap-8 text-xs text-[#64748B]">
          <div>
            <p className="font-bold text-[#172033]">Statutory Mine Inspector:</p>
            <p className="mt-4 font-mono text-[#334155]">Rajesh Kumar (INS-001)</p>
            <p className="text-[10px] text-[#94A3B8]">Regulatory Inspection Authority</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-[#172033]">Director General Safety:</p>
            <p className="mt-4 font-mono text-[#334155]">Dr. Arindam Sen</p>
            <p className="text-[10px] text-[#94A3B8]">Directorate General of Mines Safety (DGMS)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
