import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Sparkles, QrCode, Smartphone, Heart, Flame, Zap, Trophy } from 'lucide-react';
import { useReactionWall } from '../../context/ReactionWallContext';

export default function ReactionWallDisplay({ isStandalonePage = false }) {
  const { activeReactions, totalCount, activeBrand } = useReactionWall();

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  const qrTargetUrl = `${currentOrigin}/fan-zone`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrTargetUrl)}`;

  return (
    <div
      className={`w-full ${
        isStandalonePage ? 'min-h-screen' : 'min-h-[580px]'
      } bg-slate-950 text-white font-sans flex flex-col justify-between p-6 sm:p-10 relative overflow-hidden select-none border border-slate-900 shadow-2xl`}
    >
      {/* Background Glow & FX */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rose-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* ---------------------------------------------------- */}
      {/* TOP HEADER: BRAND IDENTITY & LIVE STREAM BADGE */}
      {/* ---------------------------------------------------- */}
      <header className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md p-2 border border-white/20 flex items-center justify-center shrink-0 shadow-lg">
            <img src={activeBrand.logo} alt={activeBrand.name} className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold tracking-widest text-amber-400 uppercase font-mono">
                {activeBrand.name} STADIUM NETWORK
              </span>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse text-emerald-400" /> LIVE REACTION FEED
              </span>
            </div>
            <h2 className="text-sm font-bold text-slate-300">
              Live Fan Emoji Stream
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl text-right">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block font-mono">
              TOTAL FAN REACTIONS
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono tracking-tight flex items-center justify-end gap-1.5">
              🔥 {totalCount.toLocaleString()}
            </span>
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------- */}
      {/* MAIN CONTENT: FLOATING EMOJI STREAM (LEFT) + QR SIDEBAR (RIGHT) */}
      {/* ---------------------------------------------------- */}
      <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-stretch justify-center gap-8 max-w-7xl mx-auto w-full my-auto py-4">
        {/* LEFT SIDE: FLOATING EMOJI CANVAS CONTAINER */}
        <div className="flex-1 w-full relative min-h-[380px] bg-slate-900/60 rounded-3xl border-2 border-white/15 p-6 overflow-hidden flex flex-col justify-between shadow-2xl backdrop-blur-md">
          {/* Header Tag */}
          <div className="flex items-center justify-between z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-bold uppercase tracking-wider">
              🔥 LIVE MATCH FAN ENERGY
            </div>
            <span className="text-xs text-slate-400 font-mono font-semibold">
              {activeReactions.length} active particles on screen
            </span>
          </div>

          {/* Floating Emoji Particles Layer */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <AnimatePresence>
              {activeReactions.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ y: 350, opacity: 0, scale: 0.5, rotate: -15 }}
                  animate={{
                    y: -60,
                    opacity: [0, 1, 1, 0.8, 0],
                    scale: [0.6, 1.4, 1.2, 1.6, 1.8],
                    rotate: [-15, 10, -8, 12, 0],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 3.5, ease: 'easeOut' }}
                  className="absolute flex items-center gap-2 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
                  style={{ left: `${item.xOffset}%` }}
                >
                  <span className="text-4xl sm:text-6xl filter drop-shadow-lg">{item.emoji}</span>
                  {item.fanName && item.fanName !== 'Stadium Fan' && (
                    <span className="bg-slate-900/80 backdrop-blur-md text-cyan-300 border border-white/20 text-[10px] font-extrabold px-2 py-0.5 rounded-full whitespace-nowrap">
                      {item.fanName}
                    </span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Bottom Stream Bar */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" /> Emojis float live when fans react from mobile smartphones
            </span>
            <div className="flex gap-2 text-xl">
              <span>🔥</span>
              <span>👏</span>
              <span>🚀</span>
              <span>❤️</span>
              <span>⚡</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: QR CODE SIDEBAR (EXACT MATCH FOR USER SPECIFICATION) */}
        <div className="w-full lg:w-80 bg-slate-950/95 border-2 border-white/20 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-5 shadow-2xl shrink-0">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 font-mono flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> REACTION STREAM
            </span>
            <h3 className="text-xl font-black text-white uppercase tracking-tight">SCAN & SEND REACTIONS</h3>
          </div>

          <div className="w-48 h-48 bg-white p-2.5 rounded-2xl shadow-2xl border-2 border-white/40 flex items-center justify-center">
            <img src={qrImageUrl} alt="Scan QR Code to React" className="w-full h-full object-contain" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-extrabold border border-white/15">
              <Smartphone className="w-3.5 h-3.5" /> Scan & Express Match Energy
            </div>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              Point your phone camera at the QR code to burst 🔥 👏 🚀 ❤️ emojis live on the big screen!
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
          <QrCode className="w-4 h-4 text-amber-400" />
          <span>MATCH DAY REACTION STREAM • LIVE STADIUM FAN FEED</span>
        </div>

        <div className="font-extrabold text-white">
          POWERED BY FanForge Engagement OS ⚡
        </div>
      </footer>
    </div>
  );
}
