import React from 'react';

export default function Badge({ children, variant = 'default', size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] font-bold',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-xs font-bold',
  };

  const variantClasses = {
    default: 'bg-slate-100 text-[#475569] border border-slate-200',
    green: 'bg-emerald-50 text-[#16A34A] border border-emerald-200',
    amber: 'bg-amber-50 text-[#D97706] border border-amber-200',
    red: 'bg-red-50 text-[#DC2626] border border-red-200',
    blue: 'bg-blue-50 text-[#2563EB] border border-blue-200',
    purple: 'bg-purple-50 text-[#7C3AED] border border-purple-200',
  };

  // Helper matching common statuses
  let selectedVariant = variant;
  const upper = String(children || '').toUpperCase();
  if (
    upper.includes('VALID') ||
    upper.includes('PASSED') ||
    upper.includes('RESOLVED') ||
    upper.includes('COMPLETED') ||
    upper.includes('COMPLIANT') ||
    upper.includes('VERIFIED') ||
    upper === 'LOW'
  ) {
    selectedVariant = 'green';
  } else if (
    upper.includes('EXPIRING') ||
    upper.includes('IN PROGRESS') ||
    upper.includes('PENDING') ||
    upper === 'MEDIUM' ||
    upper.includes('WARNING')
  ) {
    selectedVariant = 'amber';
  } else if (
    upper.includes('EXPIRED') ||
    upper.includes('FAILED') ||
    upper.includes('OPEN') ||
    upper === 'HIGH' ||
    upper === 'CRITICAL' ||
    upper.includes('OVERDUE') ||
    upper.includes('URGENT')
  ) {
    selectedVariant = 'red';
  } else if (
    upper.includes('ACTIVE') ||
    upper.includes('VERIFICATION REQUIRED') ||
    upper.includes('INSPECTOR') ||
    upper.includes('OFFICER')
  ) {
    selectedVariant = 'blue';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full uppercase tracking-wider ${
        sizeClasses[size]
      } ${variantClasses[selectedVariant] || variantClasses.default} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80"></span>
      {children}
    </span>
  );
}
