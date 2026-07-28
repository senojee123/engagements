import React, { useState, useEffect } from 'react';
import { Sparkles, Check } from 'lucide-react';
import { fetchBrandKits } from '../../lib/api';

export default function BrandSwitcher({ activeBrand, onSelectBrand }) {
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    let cancelled = false;
    fetchBrandKits().then((data) => {
      if (cancelled) return;
      setBrands(data);
      if (!activeBrand && data.length > 0) {
        onSelectBrand(data[0]);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!activeBrand || brands.length === 0) {
    return (
      <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-800 text-white shadow-xl h-24 animate-pulse" />
    );
  }

  return (
    <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-800 text-white shadow-xl space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-tight">
              Live Brand Customization Engine
            </h4>
            <p className="text-xs text-slate-400">
              Click any brand preset below to transform colors, logos, collectibles, obstacles, and UI theme.
            </p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-full border border-cyan-800/80 shrink-0">
          Active: {activeBrand.name}
        </span>
      </div>

      {/* Brand Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 pt-1">
        {brands.map((brand) => {
          const isSelected = activeBrand.id === brand.id;
          return (
            <button
              key={brand.id}
              type="button"
              onClick={() => onSelectBrand(brand)}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-white text-slate-950 border-white ring-2 ring-cyan-400 font-bold shadow-lg scale-105'
                  : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="w-7 h-7 flex items-center justify-center mb-1">
                <span className="text-lg">{brand.collectibleIcon}</span>
              </div>
              <span className="text-xs font-semibold truncate w-full">{brand.name}</span>
              {isSelected && (
                <span className="text-[10px] text-indigo-600 font-extrabold mt-0.5 flex items-center gap-0.5">
                  <Check className="w-3 h-3 stroke-[3]" /> Active
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
