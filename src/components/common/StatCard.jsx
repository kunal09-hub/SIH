import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'blue', trend, onClick, className = '' }) {
  const iconBgMap = {
    blue: 'bg-blue-50 text-blue-600 border border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border border-amber-100',
    red: 'bg-red-50 text-red-600 border border-red-100',
    purple: 'bg-purple-50 text-purple-600 border border-purple-100',
  };

  return (
    <div 
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.05)] transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">{title}</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#172033] font-mono tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-[#64748B] flex items-center gap-1 font-medium pt-0.5">
              {subtitle}
            </p>
          )}
          {trend && (
            <p className="text-xs font-semibold text-blue-600 pt-1">{trend}</p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${iconBgMap[color] || iconBgMap.blue} shrink-0 shadow-sm`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
