import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useSelfieWall } from '../context/SelfieWallContext';
import { useToast } from '../context/ToastContext';
import {
  Tv,
  ExternalLink,
  Plus,
  Trash2,
  Image as ImageIcon,
  Upload,
  Sparkles,
  CheckCircle2,
  ArrowDown,
  Info,
  Building,
  Play,
  Square,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';

const BRAND_PRESETS = [
  { name: 'Dialog Axiata', logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=200&q=80' },
  { name: 'Samsung', logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80' },
  { name: 'Coca-Cola', logo: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=200&q=80' },
  { name: 'Pepsi', logo: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&w=200&q=80' },
  { name: 'Red Bull', logo: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=200&q=80' },
  { name: 'Sony', logo: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=200&q=80' },
];

export default function IdleScreenSettings() {
  const { idleScreenConfig, updateIdleConfig, addSponsorLogo, removeSponsorLogo } = useApp();
  const { isSelfieWallActive, launchSelfieWall, stopSelfieWall } = useSelfieWall();
  const toast = useToast();

  const [newSponsorName, setNewSponsorName] = useState('');
  const [newSponsorLogo, setNewSponsorLogo] = useState('');

  const handleUpdate = (fields) => {
    updateIdleConfig(fields);
    toast.success('Idle screen config updated!');
  };

  const handleAddSponsor = (e) => {
    e.preventDefault();
    if (!newSponsorName.trim()) {
      toast.error('Please enter a sponsor name');
      return;
    }
    addSponsorLogo({
      name: newSponsorName.trim(),
      logo: newSponsorLogo.trim() || 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=200&q=80',
    });
    setNewSponsorName('');
    setNewSponsorLogo('');
    toast.success(`Sponsor "${newSponsorName}" added!`);
  };

  const handleAddPreset = (preset) => {
    addSponsorLogo(preset);
    toast.success(`Added ${preset.name} logo to idle screen!`);
  };

  const handleEventLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result;
        updateIdleConfig({ eventLogo: dataUrl });
        toast.success('Event logo uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSponsorLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewSponsorLogo(event.target?.result);
        toast.info('Logo image loaded. Enter name & click Add Sponsor.');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* ---------------------------------------------------- */}
      {/* PAGE HEADER */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Idle Screen Manager</h1>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full uppercase">
              Stadium Display
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Configure your event's live idle screen layout, logos, sponsor branding, and waiting status messages.
          </p>
        </div>

        <a
          href="/idle-display"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 shrink-0"
        >
          <Tv className="w-4 h-4" /> Open Fullscreen Display <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* ---------------------------------------------------- */}
      {/* MAIN TWO-COLUMN GRID: CONFIG & MINI PREVIEW */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: SETTINGS FORMS */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. EVENT LOGO & TITLES */}
          <Card className="p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                  1
                </div>
                <h3 className="text-base font-extrabold text-slate-900">Event Logo & Header</h3>
              </div>
            </div>

            <div className="space-y-4">
              {/* Event Logo Preview & Upload */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-2">
                  Event Logo Picture
                </label>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-md">
                    {idleScreenConfig.eventLogo ? (
                      <img src={idleScreenConfig.eventLogo} alt="Event Logo" className="max-h-full max-w-full object-contain p-1" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-500" />
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer px-4 py-2 rounded-xl bg-white border border-slate-300 hover:border-indigo-500 text-slate-700 text-xs font-bold shadow-xs hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-indigo-600" /> Upload Logo Picture
                        <input type="file" accept="image/*" className="hidden" onChange={handleEventLogoUpload} />
                      </label>
                    </div>
                    <Input
                      placeholder="Or enter logo Image URL..."
                      value={idleScreenConfig.eventLogo || ''}
                      onChange={(e) => handleUpdate({ eventLogo: e.target.value })}
                      className="text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Event Title */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                  Welcome Header Title
                </label>
                <Input
                  value={idleScreenConfig.eventTitle || ''}
                  onChange={(e) => handleUpdate({ eventTitle: e.target.value })}
                  placeholder="e.g. Welcome to Dialog Family Day 2026"
                  className="font-extrabold text-slate-900"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                  Tagline / Subtitle
                </label>
                <Input
                  value={idleScreenConfig.subtitle || ''}
                  onChange={(e) => handleUpdate({ subtitle: e.target.value })}
                  placeholder="e.g. Interactive Experiences Powered by FanForge"
                />
              </div>
            </div>
          </Card>

          {/* 2. WAITING STATUS MESSAGE */}
          <Card className="p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Waiting Status Messages</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                  Main Message
                </label>
                <Input
                  value={idleScreenConfig.messageTitle || ''}
                  onChange={(e) => handleUpdate({ messageTitle: e.target.value })}
                  placeholder="e.g. Experience starts soon..."
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                  Sub-message
                </label>
                <Input
                  value={idleScreenConfig.messageSubtitle || ''}
                  onChange={(e) => handleUpdate({ messageSubtitle: e.target.value })}
                  placeholder="e.g. Organizer will launch an activity shortly"
                />
              </div>
            </div>
          </Card>

          {/* 3. SPONSOR LOGOS MANAGER */}
          <Card className="p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Sponsor Logos</h3>
                  <p className="text-xs text-slate-500">Logos will display in the bottom footer row of the screen</p>
                </div>
              </div>
            </div>

            {/* Quick Add Presets */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500">Quick Add Popular Brand Logos:</span>
              <div className="flex flex-wrap gap-2">
                {BRAND_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleAddPreset(preset)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3 h-3 text-indigo-600" /> {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Sponsor Add Form */}
            <form onSubmit={handleAddSponsor} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block">
                Add Custom Sponsor Logo
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  placeholder="Sponsor Name (e.g. Dialog)"
                  value={newSponsorName}
                  onChange={(e) => setNewSponsorName(e.target.value)}
                />
                <Input
                  placeholder="Image URL"
                  value={newSponsorLogo}
                  onChange={(e) => setNewSponsorLogo(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors inline-flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5 text-indigo-600" /> Upload Image File
                  <input type="file" accept="image/*" className="hidden" onChange={handleSponsorLogoUpload} />
                </label>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Sponsor Logo
                </button>
              </div>
            </form>

            {/* Current Sponsor List */}
            <div className="space-y-2">
              <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                Active Sponsor Logos ({idleScreenConfig.sponsorLogos?.length || 0})
              </span>

              {(!idleScreenConfig.sponsorLogos || idleScreenConfig.sponsorLogos.length === 0) ? (
                <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-2xl text-xs text-slate-400">
                  No sponsor logos added yet. Click a quick preset or add one above!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {idleScreenConfig.sponsorLogos.map((sp) => (
                    <div
                      key={sp.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-2xs group hover:border-slate-300"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 p-1 flex items-center justify-center overflow-hidden shrink-0">
                          <img src={sp.logo} alt={sp.name} className="max-h-full max-w-full object-contain" />
                        </div>
                        <span className="text-xs font-extrabold text-slate-800">{sp.name}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          removeSponsorLogo(sp.id);
                          toast.info(`Removed ${sp.name} logo.`);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Remove sponsor logo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: LIVE MINIATURE PREVIEW FRAME */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Tv className="w-4 h-4 text-indigo-600" /> Real-time Screen Preview
              </span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                LIVE SYNC
              </span>
            </div>

            {/* Embedded Screen Container matching mockup */}
            <div className="rounded-3xl bg-[#121212] p-6 text-white border-4 border-slate-800 shadow-2xl space-y-6 text-center relative overflow-hidden font-mono">
              {/* Event Logo Placeholder */}
              <div className="pt-2 flex flex-col items-center">
                {idleScreenConfig.eventLogo ? (
                  <div className="w-24 h-16 rounded-xl bg-slate-900 border border-white/20 p-1.5 flex items-center justify-center overflow-hidden shadow-lg">
                    <img src={idleScreenConfig.eventLogo} alt="Event Logo" className="max-h-full max-w-full object-contain" />
                  </div>
                ) : (
                  <div className="px-4 py-1.5 rounded-lg border border-dashed border-white/40 text-xs font-bold tracking-widest text-slate-300">
                    EVENT LOGO
                  </div>
                )}
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {idleScreenConfig.eventTitle || 'Welcome to Dialog Family Day 2026'}
                </h2>
                <p className="text-xs text-slate-400 font-sans">
                  {idleScreenConfig.subtitle || 'Interactive Experiences Powered by FanForge'}
                </p>
              </div>

              {/* Activity Pills Row */}
              <div className="flex items-center justify-center flex-wrap gap-2 text-xs font-sans">
                <span className="px-2.5 py-1 rounded-lg bg-white/10 text-white flex items-center gap-1 font-medium">
                  👾 Games
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white/10 text-white flex items-center gap-1 font-medium">
                  📷 Selfies
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white/10 text-white flex items-center gap-1 font-medium">
                  🎁 Rewards
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white/10 text-white flex items-center gap-1 font-medium">
                  🏆 Challenges
                </span>
              </div>

              {/* Down Arrow & Status Message */}
              <div className="py-2 space-y-3 flex flex-col items-center">
                <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white/80 animate-bounce">
                  <ArrowDown className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-white">
                    {idleScreenConfig.messageTitle || 'Experience starts soon...'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {idleScreenConfig.messageSubtitle || 'Organizer will launch an activity shortly'}
                  </p>
                </div>
              </div>

              {/* Divider & Footer Bar */}
              <div className="pt-4 border-t border-white/20">
                {/* Sponsor Logos Row */}
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  {idleScreenConfig.sponsorLogos && idleScreenConfig.sponsorLogos.length > 0 ? (
                    idleScreenConfig.sponsorLogos.map((sp) => (
                      <div key={sp.id} className="h-8 px-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-2">
                        <img src={sp.logo} alt={sp.name} className="h-5 w-auto object-contain" />
                        <span className="text-[10px] font-bold text-white font-sans">{sp.name}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-500 italic">No sponsor logos added</span>
                  )}
                </div>
              </div>
            </div>

            <a
              href="/idle-display"
              target="_blank"
              rel="noreferrer"
              className="mt-4 w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <Tv className="w-4 h-4 text-indigo-400" /> Open Fullscreen Display in New Tab
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
