import React from 'react';

export default function Badge({ children, variant = 'default', size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px] font-semibold',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-semibold',
  };

  const variantClasses = {
    default: 'bg-gray-100 text-gray-600 border border-gray-200',
    green: 'bg-mgGreen-100 text-mgGreen-600 border border-green-200',
    amber: 'bg-mgAmber-100 text-mgAmber-600 border border-amber-200',
    red: 'bg-mgRed-100 text-mgRed-600 border border-red-200',
    blue: 'bg-mgBlue-100 text-mgBlue-600 border border-blue-200',
    purple: 'bg-purple-100 text-purple-600 border border-purple-200',
    navy: 'bg-navy-800 text-white border border-navy-700',
  };

  // Helper matching common statuses
  let selectedVariant = variant;
  const upper = String(children || '').toUpperCase();
  if (upper.includes('VALID') || upper.includes('PASSED') || upper.includes('RESOLVED') || upper.includes('COMPLETED') || upper.includes('VERIFIED') || upper === 'LOW') {
    selectedVariant = 'green';
  } else if (upper.includes('EXPIRING') || upper.includes('IN PROGRESS') || upper.includes('PENDING') || upper === 'MEDIUM' || upper.includes('WARNING') || upper.includes('ASSIGNED')) {
    selectedVariant = 'amber';
  } else if (upper.includes('EXPIRED') || upper.includes('FAILED') || upper.includes('OPEN') || upper === 'HIGH' || upper === 'CRITICAL' || upper.includes('OVERDUE')) {
    selectedVariant = 'red';
  } else if (upper.includes('VERIFICATION REQUIRED')) {
    selectedVariant = 'blue';
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full uppercase tracking-wider ${sizeClasses[size]} ${variantClasses[selectedVariant]} ${className}`}>
      {children}
    </span>
  );
}
