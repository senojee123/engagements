import React from 'react';
import {
  Palette,
  Image as ImageIcon,
  Sliders,
  Sparkles,
  Zap,
  Volume2,
  Settings2,
  Upload,
} from 'lucide-react';
import { useBuilder } from '../../context/BuilderContext';
import Switch from '../ui/Switch';

export default function RightPropertiesPanel({ activeTab }) {
  const {
    activeBrand,
    customBrand,
    updateCustomProperty,
    gameRules,
    updateGameRules,
  } = useBuilder();

  const handleLogoFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result;
        if (typeof dataUrl === 'string') {
          updateCustomProperty('logo', dataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-80 bg-slate-900 border-l border-slate-800 text-white shrink-0 h-[calc(100vh-4rem)] overflow-y-auto p-4 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-indigo-400" />
          <span>Properties Inspector</span>
        </h3>
        <span className="text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-md border border-cyan-800">
          Live Sync
        </span>
      </div>

      {/* Brand & Color Tokens Inspector */}
      {(activeTab === 'brand' || activeTab === 'all') && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
            <Palette className="w-4 h-4" /> Color Tokens & Identity
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-400">Brand Logo</label>
              <label className="cursor-pointer text-[11px] text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1">
                <Upload className="w-3 h-3" /> Upload File
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoFileUpload}
                />
              </label>
            </div>
            <input
              type="text"
              placeholder="Image URL or upload file"
              value={customBrand.logo}
              onChange={(e) => updateCustomProperty('logo', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Primary</label>
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
                <input
                  type="color"
                  value={customBrand.primaryColor}
                  onChange={(e) => updateCustomProperty('primaryColor', e.target.value)}
                  className="w-6 h-6 rounded-lg bg-transparent cursor-pointer border-0"
                />
                <span className="text-[10px] font-mono text-slate-300 uppercase">{customBrand.primaryColor}</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Secondary</label>
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
                <input
                  type="color"
                  value={customBrand.secondaryColor}
                  onChange={(e) => updateCustomProperty('secondaryColor', e.target.value)}
                  className="w-6 h-6 rounded-lg bg-transparent cursor-pointer border-0"
                />
                <span className="text-[10px] font-mono text-slate-300 uppercase">{customBrand.secondaryColor}</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Accent</label>
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
                <input
                  type="color"
                  value={customBrand.accentColor}
                  onChange={(e) => updateCustomProperty('accentColor', e.target.value)}
                  className="w-6 h-6 rounded-lg bg-transparent cursor-pointer border-0"
                />
                <span className="text-[10px] font-mono text-slate-300 uppercase">{customBrand.accentColor}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Collectibles & Sprites Inspector */}
      {(activeTab === 'assets' || activeTab === 'brand') && (
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
            <ImageIcon className="w-4 h-4" /> Collectibles & Sprites
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Collectible Item Name</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customBrand.collectibleIcon}
                onChange={(e) => updateCustomProperty('collectibleIcon', e.target.value)}
                className="w-12 text-center bg-slate-800 border border-slate-700 rounded-xl py-2 text-lg text-white"
              />
              <input
                type="text"
                value={customBrand.collectibleName}
                onChange={(e) => updateCustomProperty('collectibleName', e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Obstacle Trap Name</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customBrand.obstacleIcon}
                onChange={(e) => updateCustomProperty('obstacleIcon', e.target.value)}
                className="w-12 text-center bg-slate-800 border border-slate-700 rounded-xl py-2 text-lg text-white"
              />
              <input
                type="text"
                value={customBrand.obstacleName}
                onChange={(e) => updateCustomProperty('obstacleName', e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Power-up Booster</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customBrand.powerUpIcon}
                onChange={(e) => updateCustomProperty('powerUpIcon', e.target.value)}
                className="w-12 text-center bg-slate-800 border border-slate-700 rounded-xl py-2 text-lg text-white"
              />
              <input
                type="text"
                value={customBrand.powerUpName}
                onChange={(e) => updateCustomProperty('powerUpName', e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Game Physics & Rules Inspector */}
      {(activeTab === 'settings' || activeTab === 'all') && (
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <Sliders className="w-4 h-4" /> Game Rules & Physics
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400 font-medium">Game Duration</span>
              <span className="font-bold text-amber-400">{gameRules.gameDuration} seconds</span>
            </div>
            <input
              type="range"
              min={30}
              max={300}
              step={15}
              value={gameRules.gameDuration}
              onChange={(e) => updateGameRules('gameDuration', Number(e.target.value))}
              className="w-full accent-amber-400 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Player Lives</label>
              <select
                value={gameRules.lives}
                onChange={(e) => updateGameRules('lives', Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white"
              >
                <option value={1}>1 Life (Sudden Death)</option>
                <option value={3}>3 Lives (Standard)</option>
                <option value={5}>5 Lives (Casual)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Item Points</label>
              <input
                type="number"
                value={gameRules.rewardPointsPerItem}
                onChange={(e) => updateGameRules('rewardPointsPerItem', Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
            <div>
              <p className="text-xs font-bold text-white">Particle Effects</p>
              <p className="text-[10px] text-slate-400">Enable item sparkles</p>
            </div>
            <Switch
              checked={gameRules.particleEffects}
              onChange={(checked) => updateGameRules('particleEffects', checked)}
              label="Toggle particle effects"
            />
          </div>
        </div>
      )}

      {/* Audio Theme Inspector */}
      <div className="space-y-3 pt-4 border-t border-slate-800">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
          <Volume2 className="w-4 h-4" /> Audio & Sound Effects
        </div>
        <select
          value={customBrand.audioTheme}
          onChange={(e) => updateCustomProperty('audioTheme', e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white"
        >
          <option value="Upbeat Stadium Pop">Upbeat Stadium Pop</option>
          <option value="Electronic Dance">Electronic Dance (EDM)</option>
          <option value="High-Octane Rock">High-Octane Rock</option>
          <option value="Futuristic Cyber">Futuristic Cyber</option>
          <option value="Minimal Ambient">Minimal Ambient</option>
        </select>
      </div>
    </div>
  );
}
