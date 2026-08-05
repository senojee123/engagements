import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Star,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Filter,
  CheckSquare,
  Square,
  Eye,
  RefreshCcw,
  Palette,
} from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Input from '../ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import Tabs from '../ui/Tabs';
import { useSelfieWall, PRESET_FRAME_CONFIGS } from '../../context/SelfieWallContext';
import { useToast } from '../../context/ToastContext';

export default function SelfieModerationPanel() {
  const {
    selfies,
    approvedSelfies,
    pendingSelfies,
    flaggedSelfies,
    rejectedSelfies,
    featuredSelfies,
    activeBrand,
    frameConfig = {},
    updateFrameConfig,
    frameStyle = 'stadium-glow',
    setFrameStyle,
    frameTagline = '',
    setFrameTagline,
    approveSelfie,
    rejectSelfie,
    toggleFeatured,
    deleteSelfie,
    bulkApprove,
    bulkReject,
    aiAutoApprove,
    setAiAutoApprove,
    aiSensitivity,
    setAiSensitivity,
    resetAllSelfies,
  } = useSelfieWall();

  const toast = useToast();
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedIds, setSelectedIds] = useState([]);
  const [previewPhoto, setPreviewPhoto] = useState(null);

  // Tab Dataset mapping
  const getTabSelfies = () => {
    switch (activeTab) {
      case 'pending':
        return pendingSelfies;
      case 'approved':
        return approvedSelfies;
      case 'flagged':
        return flaggedSelfies;
      case 'rejected':
        return rejectedSelfies;
      case 'featured':
        return featuredSelfies;
      default:
        return selfies;
    }
  };

  const currentTabSelfies = getTabSelfies();

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === currentTabSelfies.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentTabSelfies.map((s) => s.id));
    }
  };

  const handleBulkApprove = () => {
    if (selectedIds.length === 0) return;
    bulkApprove(selectedIds);
    toast.success(`Approved ${selectedIds.length} selfies to Big Screen!`);
    setSelectedIds([]);
  };

  const handleBulkReject = () => {
    if (selectedIds.length === 0) return;
    bulkReject(selectedIds);
    toast.info(`Rejected ${selectedIds.length} selfies`);
    setSelectedIds([]);
  };

  return (
    <div className="space-y-6">
      {/* Top AI Engine & Auto-Moderation Control Bar */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold mb-1">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>AI IMAGE ANALYSIS & MODERATION ENGINE</span>
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            Selfie Wall Live Moderation Queue
          </h2>
          <p className="text-xs text-indigo-200/80 mt-0.5">
            Real-time WebSocket stream inspecting incoming fan uploads before stadium broadcast.
          </p>
        </div>

        {/* AI Auto-Approve Switcher */}
        <div className="flex flex-wrap items-center gap-4 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-white flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={aiAutoApprove}
                onChange={(e) => setAiAutoApprove(e.target.checked)}
                className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
              />
              <span>AI Auto-Approve Low Risk Photos</span>
            </label>
          </div>

          <div className="h-6 w-px bg-white/20 hidden sm:block" />

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-300 font-medium">Safety Threshold:</span>
            <span className="font-mono font-bold text-cyan-300">{aiSensitivity}%</span>
          </div>

          <button
            onClick={() => {
              resetAllSelfies();
              toast.info('Reset moderation dataset');
            }}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white"
            title="Reset Moderation Queue"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Brand Spotlight Frame Customizer Box */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Spotlight Popup Frame Customizer</h3>
              <p className="text-xs text-slate-500">Fully customize colors, glow, icons, taglines, and animations for live big-screen popups.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="indigo" size="sm">
              Preset: {frameStyle.toUpperCase()}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                updateFrameConfig(PRESET_FRAME_CONFIGS['stadium-glow']);
                toast.info('Reset frame to default Stadium Glow');
              }}
              icon={RefreshCcw}
              className="text-xs"
            >
              Reset
            </Button>
          </div>
        </div>

        {/* 1. Quick Presets Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            1. Frame Style Presets
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { id: 'stadium-glow', name: 'Stadium Glow', color: 'border-cyan-400 text-cyan-700 bg-cyan-50' },
              { id: 'gold-vip', name: 'Gold VIP', color: 'border-amber-400 text-amber-700 bg-amber-50' },
              { id: 'brand-signature', name: 'Brand Signature', color: 'border-indigo-400 text-indigo-700 bg-indigo-50' },
              { id: 'minimal-dark', name: 'Minimal Dark', color: 'border-slate-400 text-slate-700 bg-slate-100' },
              { id: 'cyber-pulse', name: 'Cyber Pulse', color: 'border-emerald-400 text-emerald-700 bg-emerald-50' },
            ].map((styleOption) => {
              const isSelected = frameStyle === styleOption.id;
              return (
                <button
                  key={styleOption.id}
                  type="button"
                  onClick={() => {
                    setFrameStyle(styleOption.id);
                    toast.success(`Applied ${styleOption.name} spotlight frame style!`);
                  }}
                  className={`p-3 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? `${styleOption.color} ring-2 ring-indigo-500 shadow-xs font-bold`
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-extrabold truncate">{styleOption.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono mt-1">
                    {isSelected ? '✓ Active Preset' : 'Apply Preset'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Fine-Grained Customization & Live Preview Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-3 border-t border-slate-100">
          {/* Controls Column */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              2. Custom Color, Icon & Border Fine-Tuning
            </h4>

            {/* Custom Border Color Swatches */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">Border & Glow Accent Color</label>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { name: 'Stadium Cyan', hex: '#22d3ee', glow: 'rgba(34,211,238,0.8)' },
                  { name: 'Gold Champion', hex: '#fbbf24', glow: 'rgba(251,191,36,0.85)' },
                  { name: 'Brand Indigo', hex: '#6366f1', glow: 'rgba(99,102,241,0.8)' },
                  { name: 'Neon Emerald', hex: '#10b981', glow: 'rgba(16,185,129,0.8)' },
                  { name: 'Vibrant Rose', hex: '#f43f5e', glow: 'rgba(244,63,94,0.8)' },
                  { name: 'Royal Purple', hex: '#a855f7', glow: 'rgba(168,85,247,0.8)' },
                  { name: 'Active Brand', hex: activeBrand?.primaryColor || '#22d3ee', glow: `${activeBrand?.primaryColor || '#22d3ee'}b3` },
                ].map((colorSwatch) => (
                  <button
                    key={colorSwatch.name}
                    type="button"
                    onClick={() => updateFrameConfig({ borderColor: colorSwatch.hex, glowColor: colorSwatch.glow, style: 'custom' })}
                    className={`w-7 h-7 rounded-full border-2 transition-transform active:scale-95 flex items-center justify-center ${
                      frameConfig.borderColor === colorSwatch.hex ? 'ring-2 ring-indigo-600 scale-110' : 'border-white shadow-xs'
                    }`}
                    style={{ backgroundColor: colorSwatch.hex }}
                    title={colorSwatch.name}
                  />
                ))}

                {/* Color Hex Input */}
                <input
                  type="color"
                  value={frameConfig.borderColor || '#22d3ee'}
                  onChange={(e) => updateFrameConfig({ borderColor: e.target.value, glowColor: `${e.target.value}cc`, style: 'custom' })}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200"
                  title="Pick Custom Color"
                />
              </div>
            </div>

            {/* Custom Icon & Animation Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">Header Overlay Icon</label>
                <select
                  value={frameConfig.icon || 'sparkles'}
                  onChange={(e) => updateFrameConfig({ icon: e.target.value, style: 'custom' })}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white"
                >
                  <option value="sparkles">✨ Sparkles (Stadium Default)</option>
                  <option value="trophy">🏆 Trophy (VIP Champion)</option>
                  <option value="award">🎗️ Award Badge</option>
                  <option value="zap">⚡ Zap Neon</option>
                  <option value="shield">🛡️ Shield Check</option>
                  <option value="star">⭐ Star Badge</option>
                  <option value="heart">❤️ Heart Fan Love</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">Border Width / Thickness</label>
                <select
                  value={frameConfig.borderWidth || '4px'}
                  onChange={(e) => updateFrameConfig({ borderWidth: e.target.value, style: 'custom' })}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white"
                >
                  <option value="2px">2px Thin Border</option>
                  <option value="4px">4px Standard Stadium Border</option>
                  <option value="8px">8px Heavy Stadium Border</option>
                </select>
              </div>
            </div>

            {/* Custom Tagline Input */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">Frame Banner Tagline</label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder={`Tagline (Default: ${activeBrand?.tagline || 'JUST APPROVED ON STADIUM SCREEN'})`}
                  value={frameConfig.tagline || ''}
                  onChange={(e) => updateFrameConfig({ tagline: e.target.value, style: 'custom' })}
                  className="text-xs"
                />
                {frameConfig.tagline && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateFrameConfig({ tagline: '' })}
                    className="text-xs shrink-0"
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 text-white flex flex-col justify-between space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-300 font-mono">
                LIVE POPUP PREVIEW
              </span>
              <span className="text-[10px] text-slate-400 font-mono">STADIUM DISPLAY</span>
            </div>

            {/* Simulated Live Frame Card */}
            <div
              style={{
                borderColor: frameConfig.borderColor || '#22d3ee',
                borderWidth: frameConfig.borderWidth || '4px',
                borderStyle: 'solid',
                boxShadow: `0 0 40px ${frameConfig.glowColor || 'rgba(34,211,238,0.7)'}`,
              }}
              className="bg-black rounded-2xl p-3 space-y-2 relative transition-all"
            >
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="truncate font-mono uppercase" style={{ color: frameConfig.borderColor || '#22d3ee' }}>
                  {frameConfig.tagline || activeBrand?.tagline || 'JUST APPROVED ON STADIUM SCREEN'}
                </span>
              </div>

              <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-white/20 bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80"
                  alt="Live Preview Selfie"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/20 text-[9px] font-bold text-white flex items-center gap-1">
                  <img src={activeBrand.logo} alt="" className="w-3 h-3 object-contain" />
                  <span>{activeBrand.name}</span>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 text-center font-mono">
              Live broadcast frame rendered in real-time.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs & Bulk Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Tabs
          tabs={[
            { id: 'pending', label: `Pending Queue (${pendingSelfies.length})` },
            { id: 'flagged', label: `AI Flagged (${flaggedSelfies.length})` },
            { id: 'approved', label: `Approved (${approvedSelfies.length})` },
            { id: 'featured', label: `Featured ⭐ (${featuredSelfies.length})` },
            { id: 'rejected', label: `Rejected (${rejectedSelfies.length})` },
          ]}
          activeTab={activeTab}
          onChange={(tab) => {
            setActiveTab(tab);
            setSelectedIds([]);
          }}
        />

        {/* Bulk Actions */}
        <div className="flex items-center gap-2">
          {currentTabSelfies.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              icon={selectedIds.length === currentTabSelfies.length ? CheckSquare : Square}
              onClick={handleSelectAll}
            >
              {selectedIds.length === currentTabSelfies.length ? 'Deselect All' : 'Select All'}
            </Button>
          )}

          {selectedIds.length > 0 && (
            <>
              <Button variant="primary" size="sm" icon={CheckCircle2} onClick={handleBulkApprove}>
                Approve ({selectedIds.length})
              </Button>
              <Button variant="rose" size="sm" icon={XCircle} onClick={handleBulkReject}>
                Reject ({selectedIds.length})
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Moderation Cards Grid */}
      {currentTabSelfies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {currentTabSelfies.map((photo) => {
            const isSelected = selectedIds.includes(photo.id);
            return (
              <Card
                key={photo.id}
                className={`overflow-hidden transition-all flex flex-col justify-between ${
                  isSelected ? 'ring-2 ring-indigo-600 border-indigo-500 bg-indigo-50/20' : ''
                }`}
              >
                <div className="relative aspect-square bg-slate-900 overflow-hidden">
                  <img
                    src={photo.photoUrl}
                    alt={photo.uploaderName}
                    className="w-full h-full object-cover"
                  />

                  {/* Multi-Select Checkbox Overlay */}
                  <button
                    onClick={() => handleToggleSelect(photo.id)}
                    className={`absolute top-3 left-3 p-1 rounded-lg backdrop-blur-md transition-all ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-black/50 text-white hover:bg-black/80'
                    }`}
                  >
                    {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  </button>

                  {/* AI Safety Score Badge */}
                  <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-md backdrop-blur-md text-white ${
                        photo.aiSafetyScore >= 80
                          ? 'bg-emerald-600'
                          : photo.aiSafetyScore >= 50
                          ? 'bg-amber-500'
                          : 'bg-rose-600'
                      }`}
                    >
                      AI Safety: {photo.aiSafetyScore}%
                    </span>
                  </div>

                  {/* Featured Badge */}
                  {photo.isFeatured && (
                    <span className="absolute bottom-3 left-3 bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-md flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" /> Featured
                    </span>
                  )}
                </div>

                <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-sm truncate">{photo.uploaderName}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">{photo.uploadTime}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{photo.caption}</p>

                    {/* AI Risk Flags */}
                    {photo.aiFlags && photo.aiFlags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {photo.aiFlags.map((flag, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200"
                          >
                            ⚠️ {flag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Single Action Bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {photo.status !== 'approved' && (
                        <button
                          onClick={() => {
                            approveSelfie(photo.id);
                            toast.success(`Approved ${photo.uploaderName}'s selfie! Broadcasted to Jumbotron.`);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                          title="Approve & Send to Big Screen"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Approve
                        </button>
                      )}

                      {photo.status !== 'rejected' && (
                        <button
                          onClick={() => {
                            rejectSelfie(photo.id);
                            toast.info(`Rejected photo from ${photo.uploaderName}`);
                          }}
                          className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                          title="Reject Photo"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => toggleFeatured(photo.id)}
                        className={`p-1.5 rounded-xl transition-colors ${
                          photo.isFeatured ? 'bg-amber-50 text-amber-600' : 'text-slate-400 hover:bg-slate-100'
                        }`}
                        title="Toggle Featured Spotlight"
                      >
                        <Star className={`w-4 h-4 ${photo.isFeatured ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <button
                      onClick={() => deleteSelfie(photo.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete Permanently"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No selfies in this moderation queue</h3>
          <p className="text-xs text-slate-500">
            Incoming fan uploads from the mobile web event portal will appear here in real-time.
          </p>
        </div>
      )}
    </div>
  );
}
