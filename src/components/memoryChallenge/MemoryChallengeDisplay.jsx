import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, QrCode, Sparkles, Flame, Clock, Award, ShieldCheck, Zap, Smartphone, ArrowRight } from 'lucide-react';
import { useMemoryChallenge } from '../../context/MemoryChallengeContext';

export default function MemoryChallengeDisplay({ isStandalonePage = false }) {
  const { leaderboard, activeBrand, customization } = useMemoryChallenge();

  const brand = activeBrand || {
    name: 'Stadium Arena',
    primaryColor: '#4f46e5',
    secondaryColor: '#ffffff',
    gradientBg: 'from-slate-950 via-indigo-950 to-slate-950',
    tagline: 'Interactive Stadium Memory Experience',
    themeBadge: 'LIVE MATCHDAY MODE',
  };

  const c = customization || {
    headline: 'Scan to Play Memory Challenge!',
    description: 'Test your memory on the big screen! Scan the QR code on your mobile phone to flip & match sponsor tiles, earn instant rewards, and climb the stadium leaderboard!',
    leaderboardTitle: 'Stadium Memory Leaderboard',
    venueName: 'Metropolis Arena Stadium Broadcast',
    badgeText: 'LIVE ARENA DISPLAY',
    logoUrl: '',
    logoText: 'Memory Challenge',
  };

  const targetUrl = typeof window !== 'undefined' ? `${window.location.origin}/fan-zone` : 'https://fanforge.live/fan-zone';
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(targetUrl)}`;
  const displayHost = typeof window !== 'undefined' ? window.location.host : 'fanforge.live';

  return (
    <div
      className={`relative w-full ${
        isStandalonePage ? 'min-h-screen' : 'min-h-[580px] rounded-3xl overflow-hidden'
      } bg-gradient-to-br ${brand.gradientBg || 'from-slate-950 via-indigo-950 to-slate-950'} text-white flex flex-col justify-between p-6 sm:p-8 border border-white/10 shadow-2xl overflow-hidden`}
    >
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/15 pb-5">
        <div className="flex items-center gap-4">
          {c.logoUrl ? (
            <div className="w-12 h-12 rounded-2xl bg-white p-2 border border-white/20 shadow-lg shrink-0 flex items-center justify-center overflow-hidden">
              <img src={c.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/90 text-white flex items-center justify-center font-black text-xl shadow-lg border border-white/20 shrink-0">
              <Sparkles className="w-6 h-6 text-cyan-300" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">{c.logoText || 'Memory Challenge'}</h2>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-300 bg-cyan-950/80 px-2.5 py-0.5 rounded-md border border-cyan-700/60">
                {c.badgeText || 'LIVE ARENA DISPLAY'}
              </span>
            </div>
            <p className="text-xs text-indigo-200/80 font-medium">{c.venueName || 'Metropolis Arena Stadium Broadcast'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-extrabold text-emerald-400 bg-emerald-950/90 px-3.5 py-1.5 rounded-full border border-emerald-700 flex items-center gap-2 tracking-wider shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            ● LIVE STADIUM SCREEN
          </span>
        </div>
      </div>

      {/* Main Grid Content: Leaderboard (Main) + Side QR Code & Wordings */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 my-6 items-stretch flex-1">
        {/* LEFT COLUMN: LIVE LEADERBOARD (7 Columns) */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-black/40 backdrop-blur-xl rounded-3xl p-6 border border-white/15 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <Trophy className="w-6 h-6 text-amber-400 fill-amber-400" />
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">{c.leaderboardTitle || 'Stadium Memory Leaderboard'}</h3>
                <p className="text-xs text-cyan-300 font-medium">Real-Time Top Performers & Match Speedsters</p>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold text-slate-400 bg-white/10 px-3 py-1 rounded-full border border-white/10">
              4,820 Contestants
            </span>
          </div>

          {/* Leaderboard Table / Cards */}
          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[380px] pr-1">
            {leaderboard.map((item) => {
              const isTop3 = item.rank <= 3;
              const rankColor =
                item.rank === 1
                  ? 'from-amber-500/30 to-amber-900/40 border-amber-400/60 text-amber-300'
                  : item.rank === 2
                  ? 'from-slate-400/30 to-slate-800/40 border-slate-300/60 text-slate-200'
                  : item.rank === 3
                  ? 'from-amber-700/30 to-amber-950/40 border-amber-600/60 text-amber-400'
                  : 'bg-white/5 border-white/10 text-white';

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-3 rounded-2xl border backdrop-blur-md flex items-center justify-between transition-all bg-gradient-to-r ${rankColor}`}
                >
                  <div className="flex items-center gap-3.5">
                    <span
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shadow-md ${
                        item.rank === 1
                          ? 'bg-amber-400 text-slate-950'
                          : item.rank === 2
                          ? 'bg-slate-300 text-slate-950'
                          : item.rank === 3
                          ? 'bg-amber-600 text-white'
                          : 'bg-white/10 text-white'
                      }`}
                    >
                      #{item.rank}
                    </span>

                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-10 h-10 rounded-xl object-cover ring-2 ring-white/20 shadow-md"
                    />

                    <div>
                      <h4 className="text-sm font-extrabold text-white leading-tight">{item.name}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-indigo-200/80">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-cyan-300" /> {item.time}
                        </span>
                        <span>•</span>
                        <span className="text-cyan-300 font-semibold">{item.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-black text-amber-300 font-mono tracking-tight">
                      {item.score.toLocaleString()} PTS
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800">
                      {item.badge}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Fastest Match Time: 00:24s</span>
            <span className="text-cyan-300 font-bold">Updated Live over WebSockets</span>
          </div>
        </div>

        {/* RIGHT COLUMN: SIDE QR CODE & WORDINGS CARD (5 Columns) */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-gradient-to-b from-indigo-950/90 via-slate-900/90 to-indigo-950/90 backdrop-blur-xl rounded-3xl p-6 border-2 border-cyan-400/40 shadow-2xl relative overflow-hidden text-left space-y-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/20 rounded-full blur-2xl pointer-events-none" />

          {/* Heading Wording */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-400/20 text-cyan-300 text-xs font-extrabold border border-cyan-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>FAN ENGAGEMENT CHALLENGE</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              {c.headline || 'Scan to Play Memory Challenge!'}
            </h3>
            <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed font-medium">
              {c.description || 'Test your memory on the big screen! Scan the QR code on your mobile phone to flip & match sponsor tiles, earn instant rewards, and climb the stadium leaderboard!'}
            </p>
          </div>

          {/* QR Code Prominent Visual Card */}
          <div className="bg-white p-4 rounded-3xl border-4 border-cyan-400/60 shadow-2xl flex items-center justify-center my-auto group hover:scale-[1.02] transition-transform flex-1">
            <img
              src="/fanzone-qr.png"
              alt="Scan QR Code to Play"
              className="w-64 h-64 sm:w-72 sm:h-72 object-contain rounded-xl group-hover:scale-105 transition-transform"
            />
          </div>
        </div>
      </div>

      {/* Bottom Venue Footer */}
      <div className="relative z-10 pt-4 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between text-xs text-indigo-200/70 gap-2 font-medium">
        <span>Venue: {c.venueName || 'Metropolis Arena Stadium Jumbotron Display'}</span>
        <span className="text-cyan-300 font-mono">Res: 3840x2160 4K UHD Broadcast • 60 FPS</span>
      </div>
    </div>
  );
}
