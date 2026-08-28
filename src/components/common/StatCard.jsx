import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'blue', trend, onClick, className = '' }) {
  const colorMap = {
    blue: 'border-t-mgBlue-500',
    emerald: 'border-t-mgGreen-500',
    green: 'border-t-mgGreen-500',
    amber: 'border-t-mgAmber-500',
    red: 'border-t-mgRed-500',
    purple: 'border-t-purple-500',
    navy: 'border-t-navy-800',
  };

  const textColorMap = {
    blue: 'text-mgBlue-600',
    emerald: 'text-mgGreen-600',
    green: 'text-mgGreen-600',
    amber: 'text-mgAmber-600',
    red: 'text-mgRed-600',
    purple: 'text-purple-600',
    navy: 'text-navy-800',
  };

  const iconBgMap = {
    blue: 'bg-mgBlue-50 text-mgBlue-600',
    emerald: 'bg-mgGreen-50 text-mgGreen-600',
    green: 'bg-mgGreen-50 text-mgGreen-600',
    amber: 'bg-mgAmber-50 text-mgAmber-600',
    red: 'bg-mgRed-50 text-mgRed-600',
    purple: 'bg-purple-50 text-purple-600',
    navy: 'bg-navy-800/10 text-navy-800',
  };

  return (
    <div 
      onClick={onClick}
      className={`group relative overflow-hidden bg-white rounded-lg border border-enterprise-border border-t-4 ${colorMap[color]} p-5 shadow-card transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5' : ''} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-enterprise-text-secondary">{title}</p>
          <p className={`mt-2 text-3xl font-extrabold tracking-tight ${textColorMap[color] || 'text-enterprise-text'}`}>{value}</p>
          {subtitle && (
            <p className="mt-1 text-xs text-enterprise-text-muted flex items-center gap-1">
              {subtitle}
            </p>
          )}
          {trend && (
            <p className="mt-2 text-xs font-medium text-enterprise-text-secondary">{trend}</p>
          )}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-lg ${iconBgMap[color]} transition-transform duration-200 group-hover:scale-110`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
