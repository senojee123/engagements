import React from 'react';

const variantStyles = {
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
  cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200/80',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  amber: 'bg-amber-50 text-amber-700 border-amber-200/80',
  rose: 'bg-rose-50 text-rose-700 border-rose-200/80',
  purple: 'bg-purple-50 text-purple-700 border-purple-200/80',
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
};

const dotColors = {
  indigo: 'bg-indigo-500',
  cyan: 'bg-cyan-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  purple: 'bg-purple-500',
  slate: 'bg-slate-400',
};

export default function Badge({
  children,
  variant = 'indigo',
  showDot = false,
  size = 'md',
  className = '',
}) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${variantStyles[variant]} ${sizeClasses} ${className}`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || 'bg-indigo-500'}`} />
      )}
      {children}
    </span>
  );
}
