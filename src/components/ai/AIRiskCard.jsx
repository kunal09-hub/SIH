import React from 'react';
import { Sparkles, AlertTriangle, CheckCircle2, Info, ArrowUpRight } from 'lucide-react';
import Badge from '../common/Badge';

export default function AIRiskCard({ score = 75, level = 'HIGH', explanation = '', reasons = [], onOpenExplainer, compact = false }) {
  let scoreColor = 'text-emerald-700';
  let barColor = 'bg-emerald-500';

  if (score >= 75) {
    scoreColor = 'text-red-600';
    barColor = 'bg-red-500';
  } else if (score >= 50) {
    scoreColor = 'text-amber-600';
    barColor = 'bg-amber-500';
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
        <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
        <span className="text-[11px] font-mono text-[#64748B]">AI Risk Score:</span>
        <span className={`text-xs font-bold font-mono ${scoreColor}`}>{score}/100</span>
        <Badge size="sm">{level}</Badge>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#172033] flex items-center gap-1.5">
              AI-Assisted Risk Prioritization
            </h4>
            <p className="text-[10px] text-[#64748B]">Dynamic Risk Factor Calculation</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className={`text-xl font-extrabold font-mono ${scoreColor}`}>{score}</span>
            <span className="text-xs text-[#94A3B8] font-mono">/100</span>
          </div>
          <Badge size="sm">{level} RISK</Badge>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3 w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
        <div 
          className={`h-full ${barColor} transition-all duration-500 rounded-full`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Explanation Text */}
      {explanation && (
        <div className="mt-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#475569] leading-relaxed">
          <p className="font-bold text-[#172033] mb-1 flex items-center gap-1 text-[11px] uppercase tracking-wider">
            <Info className="w-3 h-3 text-blue-600" />
            AI Rationale Breakdown:
          </p>
          <p className="text-[11px] text-[#64748B]">{explanation}</p>
        </div>
      )}

      {reasons && reasons.length > 0 && (
        <ul className="mt-2 space-y-1">
          {reasons.map((r, i) => (
            <li key={i} className="text-[11px] text-[#64748B] flex items-start gap-1.5">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
