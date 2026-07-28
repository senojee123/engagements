import React from 'react';
import { Smartphone, Monitor, Tv, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';
import MobilePhoneFrame from './MobilePhoneFrame';
import BigScreenStadiumFrame from './BigScreenStadiumFrame';
import { useBuilder } from '../../context/BuilderContext';

export default function CenterPreviewCanvas() {
  const { viewportMode, setViewportMode, activeBrand, customBrand } = useBuilder();

  return (
    <div className="flex-1 bg-slate-950 flex flex-col justify-between p-4 overflow-y-auto h-[calc(100vh-4rem)]">
      {/* Top Viewport Switcher Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 flex items-center justify-between shadow-xl mb-4 shrink-0">
        {/* Device Switcher Pills */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setViewportMode('mobile')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewportMode === 'mobile'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Mobile Phone</span>
          </button>

          <button
            type="button"
            onClick={() => setViewportMode('desktop')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewportMode === 'desktop'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Desktop Web</span>
          </button>

          <button
            type="button"
            onClick={() => setViewportMode('bigscreen')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewportMode === 'bigscreen'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>Big Screen Jumbotron</span>
          </button>
        </div>

        {/* Brand Theme Pill Badge */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold">
          <span className="text-slate-400">Theme:</span>
          <span
            className="px-3 py-1 rounded-full font-bold border border-white/20"
            style={{ backgroundColor: customBrand.primaryColor, color: customBrand.secondaryColor }}
          >
            {activeBrand.name}
          </span>
        </div>
      </div>

      {/* Canvas Viewport Renderer */}
      <div className="flex-1 flex items-center justify-center p-2 min-h-0">
        {viewportMode === 'mobile' && <MobilePhoneFrame />}
        {viewportMode === 'bigscreen' && <BigScreenStadiumFrame />}
        {viewportMode === 'desktop' && (
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-white text-center">
            <h3 className="text-xl font-bold text-white">Desktop Browser Preview</h3>
            <p className="text-xs text-slate-400">
              Full desktop web edition previewing auto-scaling browser viewport for {activeBrand.name}.
            </p>
            <BigScreenStadiumFrame />
          </div>
        )}
      </div>
    </div>
  );
}
