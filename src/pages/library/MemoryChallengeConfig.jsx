import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Trash2, RefreshCw, Palette,
  Image as ImageIcon, Smile, ChevronDown, ChevronUp,
  Zap, Eye, Check, UploadCloud, Radio, Send,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { submitInstanceApi, fetchInstancesApi, publishInstanceApi } from '../../lib/api';

const RAILWAY_API = 'https://engagements-production.up.railway.app';
// Default master config — brands customize from a COPY of this, never from the stored template
export const MASTER_DEFAULT_CONFIG = {
  brandId: '',
  brandName: '',
  brandColor: '#4f46e5',
  brandLogo: '',
  gameTitle: 'Memory Challenge',
  headline: 'Find all matching pairs!',
  tagline: 'Flip the cards and match every pair!',
  rewardText: '\uD83C\uDF89 You Win! Amazing memory!',
  gridCols: 4,
  gridRows: 3,
  backgroundColor: '#12131f',
  bgGradient: 'from-slate-950 via-indigo-950 to-slate-950',
  backgroundImage: '',
  accentColor: '#ff6b35',
  tiles: [
    { id: 't1', label: 'Tile 1', content: '\uD83C\uDF55', type: 'emoji', imageUrl: '', backColor: '#232a52' },
    { id: 't2', label: 'Tile 2', content: '\uD83E\uDD64', type: 'emoji', imageUrl: '', backColor: '#3a2350' },
    { id: 't3', label: 'Tile 3', content: '\uD83D\uDEF5', type: 'emoji', imageUrl: '', backColor: '#232a52' },
    { id: 't4', label: 'Tile 4', content: '\uD83E\uDDC0', type: 'emoji', imageUrl: '', backColor: '#3a2350' },
    { id: 't5', label: 'Tile 5', content: '\uD83D\uDD25', type: 'emoji', imageUrl: '', backColor: '#232a52' },
    { id: 't6', label: 'Tile 6', content: '\uD83D\uDCB5', type: 'emoji', imageUrl: '', backColor: '#3a2350' },
  ],
};

const EMOJI_PRESETS = ['🍕','🥤','🛵','🧀','🔥','💵','⚽','🏆','🎯','🎁','⭐','🎵','🏅','🎮','🎪','🎨','🍔','🚀'];

const DEFAULT_TILE = (id) => ({
  id,
  label: 'Tile',
  content: '⭐',
  type: 'emoji',  // 'emoji' | 'image'
  imageUrl: '',
  backColor: '#232a52',
});



export default function MemoryChallengeConfig({ onSubmitted }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const [config, setConfig] = useState(MASTER_DEFAULT_CONFIG);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastPublishedVersion, setLastPublishedVersion] = useState(null);
  const [expandedTile, setExpandedTile] = useState(null);
  const fileRefs = useRef({});

  const brandDraftKey = user?.id ? `fanforge_mc_draft_${user.id}` : null;

  // Load the brand's OWN instance config (never the global master template)
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const loadConfig = async () => {
      const userId = user?.id;
      if (!userId) {
        if (isMounted) {
          setConfig({ ...MASTER_DEFAULT_CONFIG });
          setIsLoading(false);
        }
        return;
      }

      try {
        const instances = await fetchInstancesApi({ appId: 'memory-challenge', userId });
        if (instances && instances.length > 0 && isMounted) {
          const inst = instances[0];
          const instConfig = inst?.config;
          if (instConfig && instConfig.tiles && instConfig.tiles.length > 0) {
            setConfig({ ...MASTER_DEFAULT_CONFIG, ...instConfig });
            try { localStorage.setItem(`fanforge_mc_draft_${userId}`, JSON.stringify(instConfig)); } catch (e) {}
          } else if (isMounted) {
            setConfig({ ...MASTER_DEFAULT_CONFIG });
          }
        } else if (isMounted) {
          // If no active backend instance exists, reset to fresh MASTER_DEFAULT_CONFIG
          setConfig({ ...MASTER_DEFAULT_CONFIG });
          try {
            localStorage.removeItem(`fanforge_mc_draft_${userId}`);
            localStorage.removeItem('fanforge_memory_customization');
            localStorage.removeItem('fanforge_game_config_memory-challenge');
          } catch (e) {}
        }
      } catch (e) {
        if (isMounted) setConfig({ ...MASTER_DEFAULT_CONFIG });
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadConfig();
    return () => { isMounted = false; };
  }, [user?.id]);

  const updateField = (field, value) => {
    setConfig((prev) => {
      const updated = { ...prev, [field]: value };
      // Cache scoped to this brand — NEVER writes to global game config
      if (brandDraftKey) {
        try { localStorage.setItem(brandDraftKey, JSON.stringify(updated)); } catch (e) {}
      }
      return updated;
    });
    setSaved(false);
  };

  const updateTile = (id, field, value) => {
    setConfig((prev) => {
      const updated = {
        ...prev,
        tiles: prev.tiles.map((t) => (t.id === id ? { ...t, [field]: value } : t)),
      };
      if (brandDraftKey) {
        try { localStorage.setItem(brandDraftKey, JSON.stringify(updated)); } catch (e) {}
      }
      return updated;
    });
    setSaved(false);
  };

  const addTile = () => {
    const newId = `t${Date.now()}`;
    setConfig((prev) => {
      const updated = {
        ...prev,
        tiles: [...prev.tiles, DEFAULT_TILE(newId)],
      };
      if (brandDraftKey) {
        try { localStorage.setItem(brandDraftKey, JSON.stringify(updated)); } catch (e) {}
      }
      return updated;
    });
    setExpandedTile(newId);
    setSaved(false);
  };

  const removeTile = (id) => {
    setConfig((prev) => {
      const updated = {
        ...prev,
        tiles: prev.tiles.filter((t) => t.id !== id),
      };
      if (brandDraftKey) {
        try { localStorage.setItem(brandDraftKey, JSON.stringify(updated)); } catch (e) {}
      }
      return updated;
    });
    setSaved(false);
  };

  const handleImageUpload = (tileId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      updateTile(tileId, 'imageUrl', ev.target.result);
      updateTile(tileId, 'type', 'image');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAndSendForApproval = async () => {
    if (config.tiles.length < 2) {
      toast.error('Add at least 2 tiles before saving.');
      return;
    }
    setIsSaving(true);
    const userId = user?.id || '';
    const brandName = user?.company || user?.name || config.brandName || 'Brand Account';
    try {
      // Save brand-scoped draft (does NOT write to global game config)
      if (brandDraftKey) {
        try { localStorage.setItem(brandDraftKey, JSON.stringify(config)); } catch (e) {}
      }

      const searchParams = new URLSearchParams(window.location.search);
      const urlInstanceId = searchParams.get('instanceId');
      const configWithBrand = { ...config, brandId: userId, userId };

      const res = await submitInstanceApi({
        instanceId: urlInstanceId || undefined,
        templateId: 'memory-challenge',
        appId: 'memory-challenge',
        userId,
        brandId: userId,
        brandName,
        title: config.gameTitle || (brandName !== 'Brand Account' ? `${brandName} Memory Challenge` : 'Memory Challenge'),
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
    if (config.tiles.length < 2) {
      toast.error('Add at least 2 tiles before publishing.');
      return;
    }
    setIsPublishing(true);
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const urlInstanceId = searchParams.get('instanceId');

      let targetId = urlInstanceId;
      if (!targetId && user?.id) {
        const instances = await fetchInstancesApi({ appId: 'memory-challenge', userId: user.id });
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

  const totalCards = config.gridCols * config.gridRows;
  const pairsNeeded = totalCards / 2;
  const tilesOk = config.tiles.length >= pairsNeeded;

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
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            🧩 Memory Challenge — Brand Tile Editor
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Customise what appears on the game tiles. Changes broadcast live to the game instantly.
          </p>
        </div>
      </div>

      {/* Grid sizing & tile count status */}
      <div className={`rounded-2xl border px-4 py-3 text-sm font-medium flex items-center gap-2 ${
        tilesOk
          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
          : 'bg-amber-50 border-amber-200 text-amber-700'
      }`}>
        {tilesOk ? <Check className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
        Grid: {config.gridCols}×{config.gridRows} = {totalCards} cards = {pairsNeeded} pairs needed.
        You have <strong className="mx-1">{config.tiles.length}</strong> tile{config.tiles.length !== 1 ? 's' : ''}.
        {!tilesOk && <span className="ml-1 text-amber-700">Add {pairsNeeded - config.tiles.length} more tile(s).</span>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ─── LEFT: Brand & Game Settings ─── */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Palette className="w-4 h-4 text-indigo-500" /> Brand & Game Settings
            </h3>

            {/* Game Name / Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Custom Game Name / Title</label>
              <input
                type="text"
                value={config.gameTitle || ''}
                onChange={(e) => updateField('gameTitle', e.target.value)}
                placeholder="e.g. Memory Challenge 3D"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Brand Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Brand Name</label>
              <input
                type="text"
                value={config.brandName}
                onChange={(e) => updateField('brandName', e.target.value)}
                placeholder="e.g. Dialog 5G"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Brand Logo URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Brand Logo URL</label>
              <input
                type="text"
                value={config.brandLogo}
                onChange={(e) => updateField('brandLogo', e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Background Theme & Background Image */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Background Theme</label>
                <select
                  value={config.bgGradient || 'from-slate-950 via-indigo-950 to-slate-950'}
                  onChange={(e) => updateField('bgGradient', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="from-slate-950 via-indigo-950 to-slate-950">Midnight Stadium (Default)</option>
                  <option value="from-purple-950 via-slate-950 to-indigo-950">Neon Purple Arena</option>
                  <option value="from-emerald-950 via-slate-950 to-teal-950">Emerald Matchday</option>
                  <option value="from-red-950 via-slate-950 to-amber-950">Crimson Arena</option>
                  <option value="from-slate-900 via-slate-950 to-slate-900">Dark Obsidian</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Background Image URL (Optional)</label>
                <input
                  type="text"
                  value={config.backgroundImage || ''}
                  onChange={(e) => updateField('backgroundImage', e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Colors row */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Brand Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={config.brandColor} onChange={(e) => updateField('brandColor', e.target.value)} className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer p-0.5" />
                  <span className="text-xs text-slate-400 font-mono">{config.brandColor}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Accent</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={config.accentColor} onChange={(e) => updateField('accentColor', e.target.value)} className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer p-0.5" />
                  <span className="text-xs text-slate-400 font-mono">{config.accentColor}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Background Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={config.backgroundColor} onChange={(e) => updateField('backgroundColor', e.target.value)} className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer p-0.5" />
                  <span className="text-xs text-slate-400 font-mono">{config.backgroundColor}</span>
                </div>
              </div>
            </div>

            {/* Text fields */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Game Headline</label>
              <input type="text" value={config.headline} onChange={(e) => updateField('headline', e.target.value)} placeholder="Find all matching pairs!" className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Tagline (below headline)</label>
              <input type="text" value={config.tagline} onChange={(e) => updateField('tagline', e.target.value)} placeholder="Flip the cards and match every pair!" className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Win Message</label>
              <input type="text" value={config.rewardText} onChange={(e) => updateField('rewardText', e.target.value)} placeholder="🎉 You Win!" className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            {/* Grid size */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Grid Columns</label>
                <select value={config.gridCols} onChange={(e) => updateField('gridCols', Number(e.target.value))} className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {[2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Grid Rows</label>
                <select value={config.gridRows} onChange={(e) => updateField('gridRows', Number(e.target.value))} className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {[2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4 text-indigo-500" /> Tile Preview
            </h3>
            <div
              className="rounded-2xl p-4"
              style={{ backgroundColor: config.backgroundColor }}
            >
              {config.brandLogo && (
                <img src={config.brandLogo} alt="" className="h-8 object-contain mx-auto mb-3" />
              )}
              <p className="text-center text-xs font-bold mb-3" style={{ color: config.accentColor }}>
                {config.headline}
              </p>
              <div
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${Math.min(config.gridCols, 6)}, 1fr)` }}
              >
                {config.tiles.slice(0, Math.min(config.tiles.length, config.gridCols * config.gridRows)).map((tile) => (
                  <div
                    key={tile.id}
                    className="aspect-[3/4] rounded-xl flex items-center justify-center text-lg overflow-hidden"
                    style={{ backgroundColor: tile.backColor }}
                  >
                    {tile.type === 'image' && tile.imageUrl ? (
                      <img src={tile.imageUrl} alt={tile.label} className="w-full h-full object-cover" />
                    ) : (
                      <span>{tile.content}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ─── RIGHT: Tile Editor ─── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Smile className="w-4 h-4 text-indigo-500" /> Tiles ({config.tiles.length})
            </h3>
            <button
              onClick={addTile}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-all border border-indigo-200"
            >
              <Plus className="w-3.5 h-3.5" /> Add Tile
            </button>
          </div>

          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {config.tiles.map((tile, idx) => (
              <div key={tile.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                {/* Tile header row */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setExpandedTile(expandedTile === tile.id ? null : tile.id)}
                >
                  {/* Preview chip */}
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 overflow-hidden"
                    style={{ backgroundColor: tile.backColor }}
                  >
                    {tile.type === 'image' && tile.imageUrl ? (
                      <img src={tile.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      tile.content
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{tile.label || `Tile ${idx + 1}`}</p>
                    <p className="text-xs text-slate-400">{tile.type === 'image' ? 'Image tile' : `Emoji: ${tile.content}`}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); removeTile(tile.id); }}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {expandedTile === tile.id
                      ? <ChevronUp className="w-4 h-4 text-slate-400" />
                      : <ChevronDown className="w-4 h-4 text-slate-400" />
                    }
                  </div>
                </div>

                {/* Expanded editor */}
                {expandedTile === tile.id && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-3">
                    {/* Label */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Tile Label</label>
                      <input
                        type="text"
                        value={tile.label}
                        onChange={(e) => updateTile(tile.id, 'label', e.target.value)}
                        placeholder="e.g. Dialog 5G Logo"
                        className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Type toggle */}
                    <div className="flex rounded-xl border border-slate-200 overflow-hidden text-xs font-bold">
                      <button
                        onClick={() => updateTile(tile.id, 'type', 'emoji')}
                        className={`flex-1 py-2 flex items-center justify-center gap-1.5 transition-colors ${tile.type === 'emoji' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                      >
                        <Smile className="w-3.5 h-3.5" /> Emoji
                      </button>
                      <button
                        onClick={() => updateTile(tile.id, 'type', 'image')}
                        className={`flex-1 py-2 flex items-center justify-center gap-1.5 transition-colors ${tile.type === 'image' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                      >
                        <ImageIcon className="w-3.5 h-3.5" /> Image
                      </button>
                    </div>

                    {/* Emoji picker */}
                    {tile.type === 'emoji' && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Emoji</label>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {EMOJI_PRESETS.map((em) => (
                            <button
                              key={em}
                              onClick={() => updateTile(tile.id, 'content', em)}
                              className={`w-8 h-8 text-base rounded-lg border transition-all ${tile.content === em ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-300' : 'border-slate-200 hover:border-indigo-300'}`}
                            >
                              {em}
                            </button>
                          ))}
                        </div>
                        <input
                          type="text"
                          value={tile.content}
                          onChange={(e) => updateTile(tile.id, 'content', e.target.value)}
                          placeholder="Or type any emoji..."
                          className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          maxLength={4}
                        />
                      </div>
                    )}

                    {/* Image upload */}
                    {tile.type === 'image' && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Image</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={tile.imageUrl}
                            onChange={(e) => updateTile(tile.id, 'imageUrl', e.target.value)}
                            placeholder="https://... or upload below"
                            className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <label className="mt-2 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-400 cursor-pointer text-xs text-slate-500 hover:text-indigo-600 transition-colors">
                          <UploadCloud className="w-4 h-4" /> Upload image
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(tile.id, e)}
                          />
                        </label>
                        {tile.imageUrl && (
                          <img src={tile.imageUrl} alt="" className="mt-2 h-16 w-full object-contain rounded-xl border border-slate-200" />
                        )}
                      </div>
                    )}

                    {/* Back color */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Card Back Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={tile.backColor}
                          onChange={(e) => updateTile(tile.id, 'backColor', e.target.value)}
                          className="w-9 h-9 rounded-xl border border-slate-200 cursor-pointer p-0.5"
                        />
                        <span className="text-xs text-slate-400 font-mono">{tile.backColor}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="sticky bottom-4 bg-white rounded-2xl border border-slate-200 shadow-xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-slate-500">
            <strong className="text-slate-800">{config.tiles.length} tiles</strong> configured for {config.brandName || 'your brand'}.
            {!tilesOk && <span className="text-amber-600 ml-2">⚠ Need {pairsNeeded} tiles for {config.gridCols}×{config.gridRows} grid.</span>}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveAndSendForApproval}
              disabled={isSaving || !tilesOk}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-extrabold text-sm shadow-lg transition-all ${
                saved
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              } disabled:opacity-50`}
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : saved ? (
                <Check className="w-4 h-4" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {isSaving ? 'Submitting...' : saved ? 'Submitted for Approval!' : 'Save & Send for Approval'}
            </button>
          </div>
        </div>

        {lastPublishedVersion && (
          <p className="text-xs text-slate-400">
            Last published as version <span className="font-mono">{lastPublishedVersion.id.slice(0, 8)}</span> at{' '}
            {new Date(lastPublishedVersion.at * 1000).toLocaleString()}.
          </p>
        )}
      </div>
    </div>
  );
}
