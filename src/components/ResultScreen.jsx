import React from 'react';
import { applyBrandTheme } from '../game/config/CampaignConfig';

/**
 * ResultScreen Component
 * Displays completion state, final time, and campaign reward message.
 */
export default function ResultScreen({ campaign, totalSeconds, onPlayAgain }) {
  if (!campaign) return null;

  const brand = campaign.brand || {};
  const theme = campaign.theme || {};
  const reward = campaign.reward || {};
  const themeStyles = applyBrandTheme(theme);

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="min-h-[600px] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Glow Accent */}
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl opacity-30"
          style={{ backgroundColor: theme.primaryColor || '#0057FF' }}
        />

        <div className="relative z-10 space-y-6">
          {/* Brand Logo */}
          {brand.logo ? (
            <div className="w-20 h-20 mx-auto rounded-3xl p-3 bg-white border border-white/20 shadow-xl flex items-center justify-center">
              <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-4xl shadow-inner">
              🏆
            </div>
          )}

          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 font-mono">
              {brand.name || 'Brand Challenge'}
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mt-1">
              Completed!
            </h2>
          </div>

          {/* Time Stat Card */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-inner space-y-1">
            <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">Completion Time</span>
            <div className="text-4xl font-mono font-black text-white tracking-wider">
              {formattedTime}
            </div>
            <span className="text-xs text-slate-400">({totalSeconds} seconds)</span>
          </div>

          {/* Reward Card (from campaign.json) */}
          {reward.enabled && reward.message && (
            <div
              className="p-4 rounded-2xl border text-left space-y-1 shadow-md"
              style={{
                backgroundColor: `${theme.primaryColor || '#0057FF'}15`,
                borderColor: `${theme.primaryColor || '#0057FF'}40`,
              }}
            >
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-amber-400">
                <span>🎁</span> Campaign Reward Unlocked
              </div>
              <p className="text-sm font-semibold text-white leading-relaxed">
                {reward.message}
              </p>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={onPlayAgain}
            className="w-full py-4 px-6 rounded-2xl font-black text-lg shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
            style={themeStyles.buttonStyle}
          >
            <span>🔄</span> PLAY AGAIN
          </button>
        </div>
      </div>
    </div>
  );
}
