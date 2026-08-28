import React from 'react';
import { Sparkles, AlertTriangle, CheckCircle2, Info, ArrowUpRight } from 'lucide-react';
import Badge from '../common/Badge';

export default function AIRiskCard({ score = 75, level = 'HIGH', explanation = '', reasons = [], onOpenExplainer, compact = false }) {
  let scoreColor = 'text-mgGreen-600';
  let barColor = 'bg-mgGreen-500';
  let badgeVariant = 'green';

  if (score >= 75) {
    scoreColor = 'text-mgRed-600';
    barColor = 'bg-mgRed-500';
    badgeVariant = 'red';
  } else if (score >= 50) {
    scoreColor = 'text-mgAmber-600';
    barColor = 'bg-mgAmber-500';
    badgeVariant = 'amber';
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-enterprise-border">
        <Sparkles className="w-3.5 h-3.5 text-mgAmber-600 shrink-0" />
        <span className="text-[11px] font-mono text-enterprise-text-secondary">AI Risk Score:</span>
        <span className={`text-xs font-bold font-mono ${scoreColor}`}>{score}/100</span>
        <Badge size="sm">{level}</Badge>
      </div>
    );
  }

  return (
    <div className="mg-card p-4 shadow-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-mgAmber-50 text-mgAmber-600 border border-amber-200">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-enterprise-text flex items-center gap-1.5">
              AI-Assisted Risk Prioritization
            </h4>
            <p className="text-[10px] text-enterprise-text-muted">Dynamic Risk Factor Calculation</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className={`text-xl font-extrabold font-mono ${scoreColor}`}>{score}</span>
            <span className="text-xs text-enterprise-text-muted font-mono">/100</span>
          </div>
          <Badge size="sm">{level} RISK</Badge>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${barColor} transition-all duration-500 rounded-full`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Explanation Text */}
      {explanation && (
        <div className="mt-3 p-2.5 rounded-lg bg-gray-50 border border-enterprise-border text-xs text-enterprise-text-secondary leading-relaxed font-sans">
          <p className="font-semibold text-enterprise-text mb-1 flex items-center gap-1 text-[11px] uppercase tracking-wider">
            <Info className="w-3 h-3 text-mgBlue-600" />
            AI Rationale Breakdown:
          </p>
          <p className="text-[11px] text-enterprise-text-secondary">{explanation}</p>
        </div>
      )}

      {reasons && reasons.length > 0 && (
        <ul className="mt-2 space-y-1">
          {reasons.map((r, i) => (
            <li key={i} className="text-[11px] text-enterprise-text-muted flex items-start gap-1.5">
              <span className="text-mgAmber-600 mt-0.5">•</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
