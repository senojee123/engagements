import React, { useEffect, useState } from 'react';

import { fetchGameConfigApi } from '../../lib/api';

const FIREBASE_DB_URL = "https://memory-challenge-9cfa8-default-rtdb.asia-southeast1.firebasedatabase.app/scores.json";

const MEDALS = { 0: '🥇', 1: '🥈', 2: '🥉' };
const TOP_CLASS = {
  0: 'bg-gradient-to-r from-amber-500/30 to-amber-900/20 border-amber-400/80 text-amber-300 shadow-[0_0_18px_rgba(217,171,82,0.32)]',
  1: 'bg-gradient-to-r from-slate-400/20 to-slate-800/20 border-slate-300/80 text-slate-200 shadow-[0_0_12px_rgba(201,208,224,0.25)]',
  2: 'bg-gradient-to-r from-amber-700/20 to-amber-950/20 border-amber-600/80 text-amber-400 shadow-[0_0_12px_rgba(208,137,90,0.24)]'
};

function fmt(s) {
  if (!s) return '00:00';
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}

export default function MemoryChallengeDisplay({
  isStandalonePage = false,
  isMasterDefault = false,
  instanceConfig = null,
  instanceId = null,
}) {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gameConfig, setGameConfig] = useState(
    isMasterDefault
      ? {
          gameTitle: 'Memory Challenge Leaderboard',
          headline: 'Find all matching pairs!',
          bgGradient: 'from-slate-950 via-indigo-950 to-slate-950',
          backgroundColor: '#12131f',
        }
      : instanceConfig || null
  );

  const targetUrl = typeof window !== 'undefined' ? `${window.location.origin}/fan-zone` : 'https://fan-zone-five.vercel.app/fan-zone';
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(targetUrl)}`;

  useEffect(() => {
    if (instanceConfig) {
      setGameConfig(instanceConfig);
    }
  }, [instanceConfig]);

  useEffect(() => {
    if (isMasterDefault) return;
    if (instanceConfig) return;

    fetchGameConfigApi('memory-challenge', { instanceId })
      .then((cfg) => {
        if (cfg) setGameConfig(cfg);
      })
      .catch(() => {});
  }, [isMasterDefault, instanceConfig, instanceId]);

  useEffect(() => {
    const fetchScores = () => {
      fetch(FIREBASE_DB_URL)
        .then((r) => r.json())
        .then((data) => {
          if (!data) {
            setScores([]);
          } else {
            const sorted = Object.values(data)
              .sort((a, b) => b.score - a.score || a.seconds - b.seconds)
              .slice(0, 10);
            setScores(sorted);
          }
        })
        .catch((err) => console.error('Firebase REST error:', err))
        .finally(() => setLoading(false));
    };

    fetchScores();
    const interval = setInterval(fetchScores, 2000);
    return () => clearInterval(interval);
  }, []);

  const bgGradient = gameConfig?.bgGradient || 'from-slate-950 via-indigo-950 to-slate-950';
  const customBgColor = gameConfig?.backgroundColor || '#12131f';
  const customBgImage = gameConfig?.backgroundImage || '';
  const displayTitle = gameConfig?.gameTitle || gameConfig?.headline || 'Memory Challenge Leaderboard';

  return (
    <div
      className={`relative w-full ${isStandalonePage ? 'min-h-screen' : 'min-h-[600px] rounded-3xl'} bg-gradient-to-br ${bgGradient} text-[#f5efe0] font-sans flex flex-col p-6 sm:p-8 overflow-hidden shadow-2xl border border-amber-500/30`}
      style={{
        backgroundColor: customBgColor,
        backgroundImage: customBgImage ? `url("${customBgImage}")` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Confetti / Particle Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center mb-6 gap-1">
        <span className="text-3xl animate-bounce">👑</span>
        <h1 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-wider bg-gradient-to-r from-[#ffe08a] via-[#ff6b35] to-[#c77dff] bg-clip-text text-transparent drop-shadow-md font-serif">
          {gameConfig?.gameTitle || 'Memory Challenge Leaderboard'}
        </h1>
        {gameConfig?.headline && (
          <p className="text-xs sm:text-sm font-semibold text-amber-200/90 tracking-wide mt-0.5">
            {gameConfig.headline}
          </p>
        )}
      </div>

      {/* Two Columns */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 flex-1 items-start">
        {/* Left Column: Leaderboard Panel */}
        <div className="bg-gradient-to-br from-[#1e2048]/90 to-[#2e1a44]/90 border border-[#d9ab52]/40 rounded-3xl p-5 sm:p-6 backdrop-blur-xl shadow-[0_0_50px_rgba(199,125,255,0.12)] flex flex-col space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest text-[#d9ab52] border-b border-white/10 pb-3">
            <span>🏅 Top Players</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shadow-[0_0_8px_#4cde80]" />
            <span className="text-emerald-400 text-xs font-black tracking-widest">LIVE</span>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[440px] pr-1">
            {loading ? (
              <div className="text-center py-8 text-sm text-[#a6a9c8]">Loading live scores...</div>
            ) : scores.length === 0 ? (
              <div className="text-center py-8 text-sm text-[#a6a9c8] border border-dashed border-white/20 rounded-2xl">
                No scores yet — scan the QR to play! 🍕
              </div>
            ) : (
              scores.map((entry, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3.5 p-3 rounded-2xl border transition-all ${
                    TOP_CLASS[idx] || 'bg-white/5 border-white/10 text-[#f5efe0]'
                  }`}
                >
                  <span className={`w-8 text-center font-black text-lg ${idx < 3 ? 'text-xl' : 'text-[#a6a9c8]'}`}>
                    {MEDALS[idx] || idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate text-[#f5efe0]">{entry.name}</div>
                    <div className="text-xs text-[#a6a9c8]">{entry.moves || 0} moves · {fmt(entry.seconds)}</div>
                  </div>
                  <div className="font-black text-base font-serif text-[#ffd166] drop-shadow-[0_0_10px_rgba(255,209,102,0.35)]">
                    {entry.score || 0} pts
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: QR Panel */}
        <div className="bg-gradient-to-br from-[#1e2048]/90 to-[#2e1a44]/90 border border-[#d9ab52]/40 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-[0_0_50px_rgba(199,125,255,0.12)] flex flex-col items-center justify-center text-center space-y-6">
          <div className="space-y-1">
            <span className="text-3xl block animate-pulse">📱</span>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-widest bg-gradient-to-r from-[#ffe08a] to-[#ff6b35] bg-clip-text text-transparent font-serif">
              Scan to Play
            </h2>
          </div>

          {/* QR Code Glowing Frame */}
          <div className="relative p-3 bg-white rounded-2xl shadow-[0_0_0_3px_rgba(217,171,82,0.6),0_0_28px_rgba(217,171,82,0.35),0_0_60px_rgba(199,125,255,0.18)] transition-all">
            <img
              src="/assets/memory_challenge_qr.png"
              onError={(e) => { e.target.src = '/memory-qr.png'; }}
              alt="Scan QR Code to Play Memory Challenge"
              className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-xl"
            />
          </div>

          <p className="text-xs sm:text-sm text-[#a6a9c8] max-w-xs font-medium">
            Scan with your mobile phone camera to match tiles, earn points, and get on the leaderboard!
          </p>
        </div>
      </div>
    </div>
  );
}

