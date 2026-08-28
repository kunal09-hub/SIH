import React from 'react';
import { useData } from '../../context/DataContext';
import { formatDate } from '../../utils/dateHelpers';
import Badge from '../common/Badge';
import { Download, Printer, ShieldCheck, Flame } from 'lucide-react';

export default function ExecutiveReportView() {
  const { mines, violations, correctiveActions, workers } = useData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-enterprise-border">
        <div>
          <h2 className="text-xl font-bold text-enterprise-text flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-mgGreen-600" />
            <span>Executive Mine Compliance Scorecard & Summary Report (Prototype)</span>
          </h2>
          <p className="text-xs text-enterprise-text-muted mt-1">
            Generated executive summary report for compliance tracking and board review (SIH Prototype)
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-mgBlue-600 hover:bg-mgBlue-500 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 self-start sm:self-auto transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Printable Paper Card */}
      <div className="bg-white border border-enterprise-border rounded-2xl p-6 sm:p-8 shadow-card space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-enterprise-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-navy-800 flex items-center justify-center text-white font-extrabold text-2xl shadow-sm">
              <Flame className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black text-enterprise-text">MINING COMPLIANCE & SAFETY AUDIT REPORT</h3>
              <p className="text-xs text-enterprise-text-muted">MineGuard AI Governance System • SIH PS26024 Prototype</p>
            </div>
          </div>
          <div className="text-right text-xs font-mono text-enterprise-text-muted">
            <p>Report Date: {new Date().toLocaleDateString('en-GB')}</p>
            <p>Status: SYSTEM GENERATED (Prototype)</p>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-mgBlue-600">1. Executive Governance Summary</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-gray-50 rounded-lg border border-enterprise-border">
              <span className="text-enterprise-text-muted text-[10px]">Total Mines Audited</span>
              <p className="font-bold text-enterprise-text text-lg mt-0.5">{mines.length}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-enterprise-border">
              <span className="text-enterprise-text-muted text-[10px]">Average Compliance</span>
              <p className="font-bold text-mgGreen-600 text-lg mt-0.5">
                {Math.round(mines.reduce((a,b)=>a+b.complianceScore,0)/mines.length)}%
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-enterprise-border">
              <span className="text-enterprise-text-muted text-[10px]">Active Violations</span>
              <p className="font-bold text-mgRed-600 text-lg mt-0.5">{violations.filter(v=>v.status!=='RESOLVED').length}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-enterprise-border">
              <span className="text-enterprise-text-muted text-[10px]">Total Monitored Crew</span>
              <p className="font-bold text-enterprise-text text-lg mt-0.5">{workers.length}</p>
            </div>
          </div>
        </div>

        {/* Section 2: Mine Level Table */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-mgBlue-600">2. Mine-by-Mine Compliance Breakdown</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-enterprise-border rounded-lg overflow-hidden">
              <thead className="bg-gray-50 border-b border-enterprise-border text-[10px] font-bold uppercase text-enterprise-text-muted">
                <tr>
                  <th className="p-2.5">Mine Name</th>
                  <th className="p-2.5">Location</th>
                  <th className="p-2.5">Score</th>
                  <th className="p-2.5">Risk Level</th>
                  <th className="p-2.5">Safety Officer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-enterprise-border text-[11px]">
                {mines.map(m => (
                  <tr key={m.mineId}>
                    <td className="p-2.5 font-bold text-enterprise-text">{m.mineName}</td>
                    <td className="p-2.5 text-enterprise-text-secondary">{m.location}</td>
                    <td className="p-2.5 font-mono font-bold text-mgGreen-600">{m.complianceScore}%</td>
                    <td className="p-2.5"><Badge size="sm">{m.riskLevel}</Badge></td>
                    <td className="p-2.5 text-enterprise-text-muted">{m.officer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Statutory Certification Sign-Off */}
        <div className="pt-6 border-t border-enterprise-border grid grid-cols-2 gap-8 text-xs text-enterprise-text-muted">
          <div>
            <p className="font-bold text-enterprise-text">Statutory Mine Inspector:</p>
            <p className="mt-4 font-mono text-enterprise-text-secondary">Rajesh Kumar (INS-001)</p>
            <p className="text-[10px]">Regulatory Inspection Authority (Demo)</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-enterprise-text">Director General Safety:</p>
            <p className="mt-4 font-mono text-enterprise-text-secondary">Dr. Arindam Sen</p>
            <p className="text-[10px]">Directorate General of Mines Safety</p>
          </div>
        </div>
      </div>
    </div>
  );
}
