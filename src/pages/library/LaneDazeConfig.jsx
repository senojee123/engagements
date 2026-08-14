import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Trash2, RefreshCw, Palette,
  Image as ImageIcon, Smile, ChevronDown, ChevronUp,
  Zap, Eye, Check, UploadCloud, Radio, Send, Trophy, Rocket
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { submitInstanceApi, fetchInstancesApi, publishInstanceApi } from '../../lib/api';

// Default master config for Lane Dash
export const MASTER_DEFAULT_LANE_CONFIG = {
  brandId: '',
  brandName: '',
  themeColor: '#ffe259', // Maps to gold1
  secondaryColor: '#ffa751', // Maps to gold2
  logoUrl: '', // Maps to sponsorLogoUrl
  gameTitle: 'Lane Dash',
  collectibleLabel: 'Coins',
  collectibleColor: '#ffd166',
  collectibleImageUrl: '', // Logo on the coin face
  scoreLabel: 'Score',
  multiplierLabel: 'multiplier',
  bestLabel: 'Best',
  billboards: [
    '/favicon.svg' // Fallback default billboard
  ],
  colors: {
    bg: '#0a0a14',
    gold1: '#ffe259',
    gold2: '#ffa751',
    accent3: '#ff5f8f',
    accent4: '#7c4dff',
    highlight: '#ffd166',
    multColor: '#7CFF9E',
    collectibleColor: '#ffd166'
  }
};

export default function LaneDazeConfig({ onSubmitted }) {
  const navigate = useNavigate();
  const toast = useToast();
  const authContext = useAuth();
  const currentUser = authContext?.user;
  
  const [config, setConfig] = useState(MASTER_DEFAULT_LANE_CONFIG);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastPublishedVersion, setLastPublishedVersion] = useState(null);
  
  const fileRefs = useRef({});
  const brandDraftKey = currentUser?.id ? `fanforge_ld_draft_${currentUser.id}` : null;

  // Load the brand's OWN instance config
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const loadConfig = async () => {
      const userId = currentUser?.id;
      if (!userId) {
        if (isMounted) {
          setConfig({ ...MASTER_DEFAULT_LANE_CONFIG });
          setIsLoading(false);
        }
        return;
      }

      try {
        const instances = await fetchInstancesApi({ appId: 'lane-daze', userId });
        if (instances && instances.length > 0 && isMounted) {
          const inst = instances[0];
          const instConfig = inst?.config;
          if (instConfig) {
            setConfig({ ...MASTER_DEFAULT_LANE_CONFIG, ...instConfig });
            try { localStorage.setItem(`fanforge_ld_draft_${userId}`, JSON.stringify(instConfig)); } catch (e) {}
          } else if (isMounted) {
            setConfig({ ...MASTER_DEFAULT_LANE_CONFIG });
          }
        } else if (isMounted) {
          setConfig({ ...MASTER_DEFAULT_LANE_CONFIG });
          try {
            localStorage.removeItem(`fanforge_ld_draft_${userId}`);
          } catch (e) {}
        }
      } catch (e) {
        if (isMounted) setConfig({ ...MASTER_DEFAULT_LANE_CONFIG });
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadConfig();
    return () => { isMounted = false; };
  }, [currentUser?.id]);

  const updateField = (field, value) => {
    setConfig((prev) => {
      const updated = { ...prev, [field]: value };
      if (brandDraftKey) {
        try { localStorage.setItem(brandDraftKey, JSON.stringify(updated)); } catch (e) {}
      }
      return updated;
    });
    setSaved(false);
  };

  const updateColorField = (colorName, value) => {
    setConfig((prev) => {
      const updatedColors = { ...prev.colors, [colorName]: value };
      const updated = { ...prev, colors: updatedColors };
      if (colorName === 'gold1') updated.themeColor = value;
      if (colorName === 'gold2') updated.secondaryColor = value;
      if (brandDraftKey) {
        try { localStorage.setItem(brandDraftKey, JSON.stringify(updated)); } catch (e) {}
      }
      return updated;
    });
    setSaved(false);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      updateField('logoUrl', ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCoinFaceUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      updateField('collectibleImageUrl', ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleBillboardUpload = (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const newBillboards = [...config.billboards];
      newBillboards[index] = ev.target.result;
      updateField('billboards', newBillboards);
    };
    reader.readAsDataURL(file);
  };

  const addBillboardSlot = () => {
    updateField('billboards', [...config.billboards, '/favicon.svg']);
  };

  const removeBillboardSlot = (index) => {
    const newBillboards = config.billboards.filter((_, idx) => idx !== index);
    updateField('billboards', newBillboards);
  };

  const handleSaveAndSendForApproval = async () => {
    setIsSaving(true);
    const userId = currentUser?.id || 'default-brand';
    const brandName = currentUser?.company || currentUser?.name || 'Brand Account';
    try {
      if (brandDraftKey) {
        try { localStorage.setItem(brandDraftKey, JSON.stringify(config)); } catch (e) {}
      }

      const searchParams = new URLSearchParams(window.location.search);
      const urlInstanceId = searchParams.get('instanceId');
      const configWithBrand = { ...config, brandId: userId, userId };

      const res = await submitInstanceApi({
        instanceId: urlInstanceId || undefined,
        templateId: 'lane-daze',
        appId: 'lane-daze',
        userId,
        brandId: userId,
        brandName,
        title: config.gameTitle || `${brandName} Lane Dash`,
        status: 'pending',
        config: configWithBrand,
      });

      toast.success(`Customization saved & submitted! ID: ${(res.instanceId || '').slice(0, 14)}... Waiting for Admin approval.`);
      setSaved(true);
      if (onSubmitted) onSubmitted();
      setTimeout(() => navigate('/my-engagements'), 1200);
    } catch (err) {
      toast.error(err.message || 'Failed to submit customization for approval.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const urlInstanceId = searchParams.get('instanceId');

      let targetId = urlInstanceId;
      if (!targetId && currentUser?.id) {
        const instances = await fetchInstancesApi({ appId: 'lane-daze', userId: currentUser.id });
        if (instances && instances.length > 0) {
          targetId = instances[0].instanceId || instances[0].id;
        }
      }

      if (!targetId) {
        throw new Error('No active engagement instance found to publish.');
      }

      const res = await publishInstanceApi(targetId);
      setLastPublishedVersion({ id: res.instanceId, at: res.publishedAt });
      toast.success(`Published version ${res.instanceId.slice(0, 8)} — live on FanZone! 🚀`);
    } catch (err) {
      toast.error(err.message || 'Failed to publish. Check your connection.');
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-slate-500 flex items-center gap-2 text-sm">
          <RefreshCw className="w-4 h-4 animate-spin" /> Loading current config...
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Left Column: Form Settings (8 columns) */}
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Palette className="w-5 h-5 text-indigo-600" /> Customize Lane Dash Branding
              </h2>
              <p className="text-xs text-slate-500">Configure your sponsor logos, texts, colors, and billboard ad spaces.</p>
            </div>
            {saved && (
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                ✓ All Changes Saved
              </span>
            )}
          </div>

          {/* Section 1: Typography & Copy */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">General & Copy Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Game Title (UI Name)</label>
                <input
                  type="text"
                  value={config.gameTitle}
                  onChange={(e) => updateField('gameTitle', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Collectible Item Name (e.g. Coins, Pizzas)</label>
                <input
                  type="text"
                  value={config.collectibleLabel}
                  onChange={(e) => updateField('collectibleLabel', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Score HUD Label</label>
                <input
                  type="text"
                  value={config.scoreLabel}
                  onChange={(e) => updateField('scoreLabel', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Multiplier HUD Label</label>
                <input
                  type="text"
                  value={config.multiplierLabel}
                  onChange={(e) => updateField('multiplierLabel', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Sponsor Assets (Logos & Images) */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sponsor Assets</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sponsor Logo */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Sponsor Logo (Overlay Screen)</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                    {config.logoUrl ? (
                      <img src={config.logoUrl} alt="Sponsor Logo" className="w-full h-full object-contain" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="file"
                      accept="image/*"
                      ref={(el) => (fileRefs.current.logo = el)}
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileRefs.current.logo?.click()}
                      className="w-full py-2 px-3 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <UploadCloud className="w-4 h-4 text-slate-500" /> Upload Logo
                    </button>
                    <p className="text-[10px] text-slate-400">Fits transparent PNGs best. Max size: 2MB.</p>
                  </div>
                </div>
              </div>

              {/* Coin Face Image */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Collectible Face Logo (3D Coin Medallion)</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                    {config.collectibleImageUrl ? (
                      <img src={config.collectibleImageUrl} alt="Coin Face" className="w-full h-full object-contain" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="file"
                      accept="image/*"
                      ref={(el) => (fileRefs.current.coin = el)}
                      onChange={handleCoinFaceUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileRefs.current.coin?.click()}
                      className="w-full py-2 px-3 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <UploadCloud className="w-4 h-4 text-slate-500" /> Upload Coin Icon
                    </button>
                    <p className="text-[10px] text-slate-400">Centered square medallion overlay on 3D coin mesh.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: CSS Theme Colors */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Theme Color Palette</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Road/UI Base BG</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.colors.bg}
                    onChange={(e) => updateColorField('bg', e.target.value)}
                    className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer overflow-hidden p-0"
                  />
                  <span className="text-xs font-mono font-semibold text-slate-700">{config.colors.bg.toUpperCase()}</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Primary Brand Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.colors.gold1}
                    onChange={(e) => updateColorField('gold1', e.target.value)}
                    className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer overflow-hidden p-0"
                  />
                  <span className="text-xs font-mono font-semibold text-slate-700">{config.colors.gold1.toUpperCase()}</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Secondary Accent</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.colors.gold2}
                    onChange={(e) => updateColorField('gold2', e.target.value)}
                    className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer overflow-hidden p-0"
                  />
                  <span className="text-xs font-mono font-semibold text-slate-700">{config.colors.gold2.toUpperCase()}</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Collectible Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.collectibleColor}
                    onChange={(e) => {
                      updateField('collectibleColor', e.target.value);
                      updateColorField('collectibleColor', e.target.value);
                    }}
                    className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer overflow-hidden p-0"
                  />
                  <span className="text-xs font-mono font-semibold text-slate-700">{config.collectibleColor.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Billboard Ads */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Billboard Ads (In-game Ad Slots)</h3>
              <button
                type="button"
                onClick={addBillboardSlot}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Ad (Image/Video)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {config.billboards.map((url, idx) => {
                const isVideo = url && (
                  url.startsWith('data:video/') || 
                  url.toLowerCase().endsWith('.mp4') || 
                  url.toLowerCase().endsWith('.webm') || 
                  url.toLowerCase().endsWith('.mov') ||
                  url.includes('video')
                );
                return (
                  <div key={idx} className="p-4 border border-slate-200 rounded-2xl bg-slate-50 space-y-3.5 relative group">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Ad Slot #{idx + 1}</span>
                      {config.billboards.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBillboardSlot(idx)}
                          className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="w-full h-28 border border-slate-200 bg-white rounded-xl flex items-center justify-center overflow-hidden relative">
                      {url ? (
                        isVideo ? (
                          <video 
                            src={url} 
                            className="w-full h-full object-contain" 
                            muted 
                            loop 
                            autoPlay 
                            playsInline 
                          />
                        ) : (
                          <img src={url} alt={`Ad Banner ${idx + 1}`} className="w-full h-full object-contain" />
                        )
                      ) : (
                        <ImageIcon className="w-8 h-8 text-slate-300" />
                      )}
                    </div>

                    <div className="space-y-2.5">
                      <div>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          ref={(el) => (fileRefs.current[`billboard_${idx}`] = el)}
                          onChange={(e) => handleBillboardUpload(idx, e)}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileRefs.current[`billboard_${idx}`]?.click()}
                          className="w-full py-2 px-3 border border-slate-200 bg-white rounded-lg text-xs font-bold hover:bg-slate-50 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <UploadCloud className="w-4 h-4 text-slate-500" /> Upload Image / Video
                        </button>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase">Or Paste Hosted Video/Image URL</label>
                        <input
                          type="text"
                          value={url.startsWith('data:') ? '' : url}
                          placeholder="https://yoursite.com/looping-ad.mp4"
                          onChange={(e) => {
                            const newBillboards = [...config.billboards];
                            newBillboards[idx] = e.target.value;
                            updateField('billboards', newBillboards);
                          }}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-[11px] font-medium"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleSaveAndSendForApproval}
              disabled={isSaving}
              className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Save & Send for Approval
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Live Broadcast controls & Summary (4 columns) */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 text-white space-y-6">
          <div className="space-y-2">
            <span className="bg-indigo-950 text-indigo-400 border border-indigo-900 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
              Engagement Live Stream
            </span>
            <h3 className="text-lg font-extrabold text-white">Broadcast Control Center</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Once the administrator approves your customization, publish this configuration to push it live to stadium displays.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3 font-mono text-xs text-indigo-300">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-extrabold text-amber-400">Waiting for Save</span>
            </div>
            {lastPublishedVersion && (
              <div className="space-y-1.5 border-t border-slate-800 pt-2 text-[10px]">
                <div className="flex justify-between">
                  <span>Version ID:</span>
                  <span className="text-white text-right break-all">{lastPublishedVersion.id.slice(0, 14)}...</span>
                </div>
                <div className="flex justify-between">
                  <span>Published:</span>
                  <span className="text-white">{new Date(lastPublishedVersion.at * 1000).toLocaleTimeString()}</span>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handlePublish}
            disabled={isPublishing}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isPublishing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Deploying...
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4" /> Publish Live to Jumbotron
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
