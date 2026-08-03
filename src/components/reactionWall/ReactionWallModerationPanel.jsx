import React, { useState } from 'react';
import {
  Flame,
  Tv,
  RotateCcw,
  Sparkles,
  Zap,
  TrendingUp,
  Smile,
  Trash2,
  Settings,
  Save,
  Image as ImageIcon,
  Upload,
} from 'lucide-react';
import Button from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import Badge from '../ui/Badge';
import { useReactionWall } from '../../context/ReactionWallContext';
import { useToast } from '../../context/ToastContext';

export default function ReactionWallModerationPanel() {
  const {
    activeReactions,
    totalCount,
    isReactionWallActive,
    emitReaction,
    launchReactionWall,
    stopReactionWall,
    clearReactions,
    resetTotalCount,
    frameConfig,
    updateFrameConfig,
  } = useReactionWall();

  const toast = useToast();

  const [formConfig, setFormConfig] = useState({
    networkTitle: frameConfig?.networkTitle || 'STADIUM FAN NETWORK',
    headerTagline: frameConfig?.headerTagline || '🔥 LIVE FAN ENERGY',
    footerText: frameConfig?.footerText || 'FAN REACTION STREAM • LIVE STADIUM FAN FEED',
    qrTitle: frameConfig?.qrTitle || 'SCAN & SEND REACTIONS',
    qrSubtitle: frameConfig?.qrSubtitle || 'Point your phone camera at the QR code to burst emojis live on the big screen!',
    logoUrl: frameConfig?.logoUrl || '',
  });

  const handleLogoFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image file size must be less than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        const result = evt.target?.result;
        if (typeof result === 'string') {
          setFormConfig((prev) => ({ ...prev, logoUrl: result }));
          toast.success('Brand logo image uploaded!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveFrame = (e) => {
    e.preventDefault();
    updateFrameConfig(formConfig);
    toast.success('Live frame settings updated and broadcasted to display screen!');
  };

  const sampleEmojis = ['🔥', '👏', '🚀', '❤️', '⚡', '🎉', '🏆', '⚽'];

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" /> Reaction Wall Organizer Desk
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Trigger test emoji bursts, customize display frame overlay, or launch the stadium screen.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            icon={Trash2}
            onClick={() => {
              clearReactions();
              toast.info('Cleared floating reactions on display screen.');
            }}
          >
            Clear Screen Particles
          </Button>

          {isReactionWallActive ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                stopReactionWall();
                toast.info('Stopped Reaction Wall display screen.');
              }}
              className="bg-amber-500/10 text-amber-600 border-amber-500/30 font-bold"
            >
              Stop Reaction Screen
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              icon={Tv}
              onClick={() => {
                launchReactionWall();
                toast.success('Live Reaction Wall launched to stadium screen!');
              }}
            >
              Launch Reaction Wall to Screen
            </Button>
          )}
        </div>
      </div>

      {/* Frame Customizer Card */}
      <Card className="border-slate-200/80 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <Badge variant="indigo" size="sm">
              Screen Frame Branding
            </Badge>
            <CardTitle className="text-lg text-slate-900 mt-1 flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-600" /> Customize Reaction Wall Overlay & Texts
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveFrame} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Network / Event Title</label>
                <input
                  type="text"
                  value={formConfig.networkTitle}
                  onChange={(e) => setFormConfig({ ...formConfig, networkTitle: e.target.value })}
                  placeholder="e.g. STADIUM FAN NETWORK"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Header Tagline Badge</label>
                <input
                  type="text"
                  value={formConfig.headerTagline}
                  onChange={(e) => setFormConfig({ ...formConfig, headerTagline: e.target.value })}
                  placeholder="e.g. 🔥 LIVE FAN ENERGY"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Footer Overlay Text</label>
                <input
                  type="text"
                  value={formConfig.footerText}
                  onChange={(e) => setFormConfig({ ...formConfig, footerText: e.target.value })}
                  placeholder="e.g. REACTION STREAM • LIVE FAN FEED"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Custom Brand Logo (Upload Image or Paste URL)
                </label>
                <div className="flex items-center gap-2">
                  {formConfig.logoUrl ? (
                    <div className="w-10 h-10 rounded-xl bg-slate-900 p-1 border border-slate-300 flex items-center justify-center shrink-0 relative group">
                      <img src={formConfig.logoUrl} alt="Logo preview" className="w-full h-full object-contain" />
                      <button
                        type="button"
                        onClick={() => setFormConfig({ ...formConfig, logoUrl: '' })}
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs hover:bg-rose-600"
                        title="Remove Logo"
                      >
                        ✕
                      </button>
                    </div>
                  ) : null}

                  <input
                    type="text"
                    value={formConfig.logoUrl}
                    onChange={(e) => setFormConfig({ ...formConfig, logoUrl: e.target.value })}
                    placeholder="Paste URL or click Upload..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 min-w-0"
                  />

                  <label className="px-3 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">QR Card Heading</label>
                <input
                  type="text"
                  value={formConfig.qrTitle}
                  onChange={(e) => setFormConfig({ ...formConfig, qrTitle: e.target.value })}
                  placeholder="e.g. SCAN & SEND REACTIONS"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">QR Card Instructions</label>
                <input
                  type="text"
                  value={formConfig.qrSubtitle}
                  onChange={(e) => setFormConfig({ ...formConfig, qrSubtitle: e.target.value })}
                  placeholder="e.g. Point your phone camera to send emojis live!"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="primary" size="sm" icon={Save}>
                Save & Broadcast Frame Settings
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Main Grid: Trigger Controls & Live Reaction Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Fast Reaction Emitter Buttons */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200/80 shadow-xs">
            <CardHeader>
              <Badge variant="indigo" size="sm">
                Instant Emoji Emitter Test
              </Badge>
              <CardTitle className="text-lg text-slate-900 mt-1">
                Trigger Live Fan Reaction Burst
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <p className="text-xs text-slate-500">
                Tap any emoji button below to instantly burst particles across connected venue screens over WebSockets.
              </p>

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                {sampleEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      emitReaction(emoji, '');
                      toast.success(`Emitted ${emoji} reaction to screen!`);
                    }}
                    className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-3xl shadow-2xs hover:scale-105 active:scale-95 transition-all text-center"
                    title={`Emit ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between text-xs font-semibold text-amber-900 gap-2">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" /> Active Screen Particles: <span className="font-mono font-black text-amber-700">{activeReactions.length}</span>
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-amber-800">Total Stream Count: {totalCount.toLocaleString()}</span>
                  <button
                    type="button"
                    onClick={() => {
                      resetTotalCount();
                      toast.success('Total stream count erased to 0.');
                    }}
                    className="px-2.5 py-1 text-[11px] font-bold bg-amber-200/80 hover:bg-amber-300 text-amber-950 rounded-lg border border-amber-300 transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                    title="Erase total reaction count to 0"
                  >
                    <RotateCcw className="w-3 h-3 text-amber-900" />
                    <span>Erase Count</span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Column: Live Stream History */}
        <div className="space-y-4">
          <Card className="border-slate-200/80 shadow-xs">
            <CardHeader>
              <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-500" /> Recent Fan Reactions Feed
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {activeReactions.length > 0 ? (
                activeReactions.slice(-10).reverse().map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{item.emoji}</span>
                      <span className="font-extrabold text-slate-800">{item.fanName}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">Just now</span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400 font-mono">
                  No active emojis floating. Tap buttons to emit!
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
