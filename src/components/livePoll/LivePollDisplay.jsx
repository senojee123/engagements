import React from 'react';
import { motion } from 'framer-motion';
import { Vote, Radio, Sparkles, QrCode, Trophy, TrendingUp, Smartphone } from 'lucide-react';
import { useLivePoll } from '../../context/LivePollContext';

export default function LivePollDisplay({ isStandalonePage = false }) {
  const { activePoll, activeBrand } = useLivePoll();

  const brand = activeBrand || {
    name: 'Coca-Cola',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Coca-Cola_logo.svg',
  };

  const totalVotes = activePoll?.totalVotes || 0;
  const options = Array.isArray(activePoll?.options) ? activePoll.options : [];

  // Find leading option
  let leadingOptionId = null;
  let maxVotes = -1;
  options.forEach((opt) => {
    const votes = opt?.votes || 0;
    if (votes > maxVotes && votes > 0) {
      maxVotes = votes;
      leadingOptionId = opt?.id;
    }
  });

  const getOptionColorClass = (colorName, isLeading) => {
    const map = {
      emerald: {
        bar: 'bg-emerald-500',
        bg: 'bg-emerald-950/40 border-emerald-500/40',
        badge: 'bg-emerald-500 text-slate-950',
        text: 'text-emerald-400',
      },
      indigo: {
        bar: 'bg-indigo-500',
        bg: 'bg-indigo-950/40 border-indigo-500/40',
        badge: 'bg-indigo-500 text-white',
        text: 'text-indigo-400',
      },
      amber: {
        bar: 'bg-amber-500',
        bg: 'bg-amber-950/40 border-amber-500/40',
        badge: 'bg-amber-500 text-slate-950',
        text: 'text-amber-400',
      },
      rose: {
        bar: 'bg-rose-500',
        bg: 'bg-rose-950/40 border-rose-500/40',
        badge: 'bg-rose-500 text-white',
        text: 'text-rose-400',
      },
      cyan: {
        bar: 'bg-cyan-500',
        bg: 'bg-cyan-950/40 border-cyan-500/40',
        badge: 'bg-cyan-500 text-slate-950',
        text: 'text-cyan-400',
      },
    };

    const fallback = map.indigo;
    const item = map[colorName] || fallback;
    return item;
  };

  const fanzoneUrl = import.meta.env.VITE_FANZONE_URL || 'https://fan-zone-five.vercel.app/';
  const qrTargetUrl = fanzoneUrl;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(fanzoneUrl)}`;

  return (
    <div
      className={`w-full ${
        isStandalonePage ? 'min-h-screen' : 'min-h-[580px]'
      } bg-slate-950 text-white font-sans flex flex-col justify-between p-6 sm:p-10 relative overflow-hidden select-none border border-slate-900 shadow-2xl`}
    >
      {/* Background Gradient Blurs & Grid Lines */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* ---------------------------------------------------- */}
      {/* TOP HEADER: BRAND LOGO & LIVE TICKER */}
      {/* ---------------------------------------------------- */}
      <header className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md p-2 border border-white/20 flex items-center justify-center shrink-0 shadow-lg">
            <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold tracking-widest text-cyan-400 uppercase font-mono">
                {brand.name} STADIUM NETWORK
              </span>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse text-emerald-400" /> LIVE BROADCAST
              </span>
            </div>
            <h2 className="text-sm font-bold text-slate-300">
              {activePoll?.category || 'Halftime Fan Poll'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl text-right">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block font-mono">
              TOTAL FAN VOTES
            </span>
            <span className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight flex items-center justify-end gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              {totalVotes.toLocaleString()}
            </span>
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------- */}
      {/* MAIN SIDE-BY-SIDE CONTENT: POLL (LEFT) + QR CODE (RIGHT) */}
      {/* ---------------------------------------------------- */}
      <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-stretch justify-center gap-8 max-w-7xl mx-auto w-full my-auto py-4">
        {/* LEFT SIDE: POLL QUESTION & ANIMATED PROGRESS BARS */}
        <div className="flex-1 w-full space-y-6 flex flex-col justify-center">
          <div className="space-y-2 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-bold uppercase tracking-wider">
              <Vote className="w-3.5 h-3.5" /> LIVE MATCH DAY POLL
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight uppercase drop-shadow-md">
              {activePoll?.question || 'No active poll right now'}
            </h1>
          </div>

          {/* Option Progress Bars */}
          <div className="space-y-3.5">
            {!activePoll && (
              <p className="text-sm text-slate-400">Waiting for the next poll to launch...</p>
            )}
            {options.map((option, idx) => {
              const optId = String(option?.id || idx + 1);
              const optVotes = option?.votes || 0;
              const percentage = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0;
              const isLeading = option?.id === leadingOptionId;
              const styleTheme = getOptionColorClass(option?.color, isLeading);

              return (
                <div
                  key={optId}
                  className={`relative rounded-3xl p-4 border transition-all duration-300 ${styleTheme.bg} ${
                    isLeading ? 'ring-2 ring-emerald-400/50 shadow-lg shadow-emerald-900/20' : ''
                  }`}
                >
                  {/* Background Animated Bar */}
                  <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full opacity-25 ${styleTheme.bar}`}
                    />
                  </div>

                  {/* Option Header & Vote Info */}
                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-8 h-8 rounded-xl font-mono font-black text-xs flex items-center justify-center shrink-0 shadow-md ${styleTheme.badge}`}
                      >
                        {optId.startsWith('opt-') ? optId.replace('opt-', '#') : `#${optId}`}
                      </span>
                      <span className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                        {option?.text || ''}
                        {isLeading && (
                          <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                            <Trophy className="w-3 h-3 fill-slate-950" /> LEADING
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 font-mono">
                      <span className="text-xs font-semibold text-slate-400">
                        {optVotes.toLocaleString()} votes
                      </span>
                      <span className={`text-xl sm:text-2xl font-black ${styleTheme.text}`}>
                        {percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT SIDE: QR CODE SIDEBAR (JUST LIKE SELFIE WALL) */}
        <div className="w-full lg:w-80 bg-slate-950/90 border-2 border-white/20 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-5 shadow-2xl shrink-0">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 font-mono flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> CAST YOUR VOTE LIVE
            </span>
            <h3 className="text-xl font-black text-white uppercase tracking-tight">SCAN TO VOTE</h3>
          </div>

          <div className="w-48 h-48 bg-white p-2.5 rounded-2xl shadow-2xl border-2 border-white/40 flex items-center justify-center">
            <img src="/fanzone-qr.png" alt="Scan QR Code to Vote" className="w-full h-full object-contain" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-extrabold border border-white/15">
              <Smartphone className="w-3.5 h-3.5" /> Mobile Event Portal
            </div>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              Point your phone camera at the QR code to open the Fan Zone & cast your vote live!
            </p>
          </div>

          <div className="pt-2 border-t border-white/10 w-full text-center">
            <span className="text-[10px] font-mono font-bold text-slate-400 block truncate">
              {qrTargetUrl}
            </span>
          </div>
        </div>
      </main>

      {/* ---------------------------------------------------- */}
      {/* BOTTOM FOOTER */}
      {/* ---------------------------------------------------- */}
      <footer className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <QrCode className="w-4 h-4 text-cyan-400" />
          <span>MATCH DAY FAN ENGAGEMENT • LIVE STADIUM POLL</span>
        </div>

        <div className="font-extrabold text-white">
          POWERED BY FanForge Engagement OS ⚡
        </div>
      </footer>
    </div>
  );
}
