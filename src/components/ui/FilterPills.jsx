import React from 'react';

export default function FilterPills({ options, value, onChange, className = '' }) {
  return (
    <div className={`flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 ${className}`}>
      {options.map((opt) => {
        const optValue = typeof opt === 'string' ? opt : opt.value;
        const optLabel = typeof opt === 'string' ? opt : opt.label;
        const isActive = value === optValue;
        return (
          <button
            key={optValue}
            type="button"
            onClick={() => onChange(optValue)}
            aria-pressed={isActive}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
              isActive
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            {optLabel}
          </button>
        );
      })}
    </div>
  );
}
