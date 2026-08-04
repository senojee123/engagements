import React from 'react';
import {
  Info,
  Shield,
  Image as ImageIcon,
  Sliders,
  Monitor,
  Code,
  Save,
  Sparkles,
  Camera,
  Heart,
  BarChart2,
  Gamepad2,
  CheckCircle2,
  Brain,
} from 'lucide-react';
import { useBuilder } from '../../context/BuilderContext';
import { useToast } from '../../context/ToastContext';

export default function LeftPanelNav({ activeTab, setActiveTab, onOpenJsonModal }) {
  const { availableBrands, activeBrand, switchBrand, activeTemplateId, setActiveTemplateId } = useBuilder();
  const toast = useToast();

  const engagementTypes = [
    { id: 'selfie-wall', name: 'Selfie Wall', icon: Camera },
    { id: 'reaction-wall', name: 'Reaction Wall', icon: Heart },
    { id: 'live-poll', name: 'Live Poll', icon: BarChart2 },
    { id: 'product-rush', name: 'Product Rush', icon: Gamepad2 },
    { id: 'memory-challenge', name: 'Memory Challenge', icon: Brain },
  ];

  const navItems = [
    { id: 'brand', label: 'Brand Engine', icon: Shield, badge: 'Core' },
    { id: 'assets', label: 'Assets & Sprites', icon: ImageIcon },
    { id: 'settings', label: 'Physics & Rules', icon: Sliders },
    { id: 'outputs', label: 'Deploy Targets', icon: Monitor },
    { id: 'info', label: 'Template Details', icon: Info },
  ];

  const activeTemplateName =
    activeTemplateId === 'selfie-wall'
      ? 'Live Fan Selfie Wall'
      : activeTemplateId === 'reaction-wall'
      ? 'Live Crowd Reaction Wall'
      : activeTemplateId === 'live-poll'
      ? 'Real-Time Stadium Live Poll'
      : activeTemplateId === 'memory-challenge'
      ? 'Memory Challenge'
      : 'Product Rush';

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 text-white flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="p-4 space-y-5">
        {/* Active Template Header */}
        <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md shrink-0">
            FF
          </div>
          <div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
              <Sparkles className="w-3 h-3" /> Visual Studio
            </div>
            <h3 className="font-extrabold text-white text-sm tracking-tight leading-tight truncate max-w-[130px]">
              {activeTemplateName}
            </h3>
            <p className="text-[11px] text-slate-400">Enterprise Template</p>
          </div>
        </div>

        {/* Engagement Type Switcher */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-1">
            Active Engagement Type
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {engagementTypes.map((eng) => {
              const isSelected = activeTemplateId === eng.id;
              const Icon = eng.icon;
              return (
                <button
                  key={eng.id}
                  type="button"
                  onClick={() => {
                    setActiveTemplateId(eng.id);
                    toast.info(`Loaded ${eng.name} studio environment`);
                  }}
                  className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-500 font-bold shadow-xs'
                      : 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{eng.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Brand Switcher Buttons */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-1">
            Brand Engine Quick Switch
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {availableBrands.map((brand) => {
              const isSelected = activeBrand.id === brand.id;
              return (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => {
                    switchBrand(brand.id);
                    toast.info(`Switched brand theme to ${brand.name}`);
                  }}
                  className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-between border transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-500 font-bold shadow-xs'
                      : 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="truncate">{brand.name}</span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-300 shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="space-y-1 pt-2 border-t border-slate-800">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-1 mb-2">
            Inspector Tabs
          </label>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600/90 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-300' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800/60 px-1.5 py-0.5 rounded-md">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Save & Export Footer */}
      <div className="p-4 border-t border-slate-800 space-y-2 bg-slate-950/60">
        <button
          onClick={onOpenJsonModal}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
        >
          <Code className="w-4 h-4 text-cyan-400" />
          <span>Export JSON Config</span>
        </button>

        <button
          onClick={() => toast.success('Template configuration saved to cloud!')}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>Save Configuration</span>
        </button>
      </div>
    </div>
  );
}
