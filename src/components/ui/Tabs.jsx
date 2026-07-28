import React from 'react';

export default function Tabs({ tabs, activeTab, onChange, className = '' }) {
  return (
    <div
      role="tablist"
      className={`border-b border-slate-200 flex items-center gap-6 text-sm font-medium text-slate-600 overflow-x-auto ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`pb-3 flex items-center gap-2 whitespace-nowrap transition-colors border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-t-md ${
              isActive
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            {tab.icon && <tab.icon className="w-4 h-4" />}
            <span className="capitalize">{tab.label}</span>
            {tab.badge && (
              <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
