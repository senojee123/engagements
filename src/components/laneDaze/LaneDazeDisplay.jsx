import React, { useState, useEffect } from 'react';
import { Trophy, Zap, QrCode, Star, Sparkles, Smartphone, Flame, Award, ShieldCheck } from 'lucide-react';

const DEFAULT_LEADERBOARD = [
  { id: 1, rank: 1, name: 'Alex Morgan', score: 2850, time: '00:24s', badge: '🥇 Gold MVP', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', combo: '12x Combo', reward: 'VIP Coupon Claimed' },
  { id: 2, rank: 2, name: 'Marcus Vance', score: 2420, time: '00:27s', badge: '🥈 Silver Speedster', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', combo: '9x Combo', reward: 'Free Drink Unlocked' },
  { id: 3, rank: 3, name: 'Sarah Jenkins', score: 2190, time: '00:31s', badge: '🥉 Bronze Master', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80', combo: '8x Combo', reward: 'Reward Claimed' },
  { id: 4, rank: 4, name: 'Jordan Taylor', score: 1950, time: '00:34s', badge: 'Top 5', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', combo: '6x Combo', reward: '10% Off Merch' },
  { id: 5, rank: 5, name: 'Chris Hemsworth', score: 1720, time: '00:38s', badge: 'Top 5', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80', combo: '5x Combo', reward: 'Participant' },
  { id: 6, rank: 6, name: 'Emma Watson', score: 1580, time: '00:41s', badge: 'Challenger', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80', combo: '4x Combo', reward: 'Participant' },
];

export default function LaneDazeDisplay({ isStandalonePage = false, instanceConfig = null }) {
  const [leaderboard, setLeaderboard] = useState(DEFAULT_LEADERBOARD);

  // Active Brand Identity & Logo
  const [activeBrand, setActiveBrand] = useState(() => {
    try {
      const saved = localStorage.getItem('fanforge_active_brand');
      if (saved) return JSON.parse(saved);
    } catch (e) { }
    return {
      name: 'FanForge Stadium',
      logoUrl: '',
      primaryColor: '#4f46e5',
    };
  });

  // Sync active brand from instanceConfig prop if available
  useEffect(() => {
    if (instanceConfig) {
      setActiveBrand({
        name: instanceConfig.brandName || instanceConfig.gameTitle || 'FanForge Stadium',
        logoUrl: instanceConfig.logoUrl || instanceConfig.sponsorLogoUrl || '',
        primaryColor: instanceConfig.themeColor || '#4f46e5',
      });
    }
  }, [instanceConfig]);

  const fanzoneUrl = typeof window !== 'undefined' ? `${window.location.origin}/fan-zone` : 'https://fan-zone-five.vercel.app/';
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(fanzoneUrl)}`;

  // Listen for brand changes & fetch real scores from Supabase API
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'fanforge_active_brand' && e.newValue) {
        try {
          setActiveBrand(JSON.parse(e.newValue));
        } catch (err) { }
      }
    };
    window.addEventListener('storage', handleStorage);

    const fetchScores = () => {
      const url = 'https://awjaovibrslzghflwwin.supabase.co/rest/v1/scores?select=player_name,score&order=score.desc&limit=10';
      const headers = {
        'apikey': 'sb_publishable_OPviUM9Hl4QCxv6F3v2nAQ_F9tgHYeg',
        'Authorization': 'Bearer sb_publishable_OPviUM9Hl4QCxv6F3v2nAQ_F9tgHYeg'
      };

      fetch(url, { headers })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch');
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            const mapped = data.map((row, index) => ({
              id: index + 1,
              rank: index + 1,
              name: row.player_name || 'Anonymous',
              score: Number(row.score) || 0,
              time: '00:45s',
              badge: index === 0 ? 'Champion' : index < 3 ? 'Elite' : 'Runner',
              avatar: `https://images.unsplash.com/photo-${1535713875002-d1d0cf377fde}?auto=format&fit=crop&w=150&q=80`,
              combo: 'Active',
              reward: index === 0 ? 'Grand Prize' : 'Participant'
            }));
            setLeaderboard(mapped);
          }
        })
        .catch((err) => {
          console.warn('[Leaderboard] API fetch error:', err);
        });
    };

    fetchScores();
    const interval = setInterval(fetchScores, 6000); // Refresh every 6 seconds

    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className={`w-full min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white flex flex-col justify-between p-6 sm:p-10 relative overflow-hidden font-sans ${isStandalonePage ? '' : ''}`}>
      {/* Background Animated Neon Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e1b4b_1px,transparent_1px),linear-gradient(to_bottom,#1e1b4b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20 pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Banner */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-indigo-800/50 pb-6">
        <div className="flex items-center gap-4 text-left">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md p-2.5 border border-white/20 flex items-center justify-center text-slate-950 shadow-xl shadow-indigo-500/20 font-black text-2xl shrink-0">
            {activeBrand?.logoUrl ? (
              <img src={activeBrand.logoUrl} alt={activeBrand.name} className="w-full h-full object-contain" />
            ) : (
              <span className="text-3xl">🏎️</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white uppercase font-black">
                Lane Dash
              </h1>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
                ● LIVE STADIUM BROADCAST
              </span>
            </div>
            <p className="text-xs sm:text-sm text-indigo-200/80 font-medium mt-0.5">
              {activeBrand?.name || 'FanForge Stadium'} — 3-Lane Arcade Runner Championship
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 shadow-lg">
          <Trophy className="w-5 h-5 text-amber-400" />
          <div className="text-left">
            <p className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider">Top Stadium Record</p>
            <p className="text-sm font-extrabold text-white font-mono">{leaderboard[0].score} PTS</p>
          </div>
        </div>
      </div>

      {/* Main Content Area: Left Leaderboard & Right QR Code Panel */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 my-8 flex-1 items-center">
        {/* Left Column: The Stadium Leaderboard (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2 tracking-tight">
              <Award className="w-6 h-6 text-amber-400" /> Stadium Leaderboard Ranks
            </h2>
            <span className="text-xs text-indigo-300 font-semibold bg-indigo-900/60 px-3 py-1 rounded-full border border-indigo-700/60">
              Live Fan Scores
            </span>
          </div>

          <div className="space-y-3">
            {leaderboard.map((player) => {
              const isFirst = player.rank === 1;
              const isSecond = player.rank === 2;
              const isThird = player.rank === 3;

              return (
                <div
                  key={player.id}
                  className={`p-4 rounded-2xl border backdrop-blur-md flex items-center justify-between transition-all duration-300 ${isFirst
                      ? 'bg-gradient-to-r from-amber-500/25 via-indigo-900/60 to-slate-900 border-amber-400/60 shadow-lg shadow-amber-500/10 scale-[1.02]'
                      : isSecond
                        ? 'bg-slate-900/80 border-slate-400/40'
                        : isThird
                          ? 'bg-slate-900/70 border-amber-700/30'
                          : 'bg-slate-900/50 border-white/10'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank Badge */}
                    <div
                      className={`w-10 h-10 rounded-xl font-black text-sm flex items-center justify-center shrink-0 ${isFirst
                          ? 'bg-amber-400 text-slate-950 shadow-md'
                          : isSecond
                            ? 'bg-slate-300 text-slate-950'
                            : isThird
                              ? 'bg-amber-700 text-white'
                              : 'bg-white/10 text-indigo-200'
                        }`}
                    >
                      #{player.rank}
                    </div>

                    {/* Avatar */}
                    <img
                      src={player.avatar}
                      alt={player.name}
                      className="w-11 h-11 rounded-xl object-cover ring-2 ring-indigo-500/40 shrink-0"
                    />

                    {/* Info */}
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-white text-base leading-tight">{player.name}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-950 text-cyan-300 border border-indigo-800">
                          {player.badge}
                        </span>
                      </div>
                      <p className="text-xs text-indigo-300/80 mt-0.5 flex items-center gap-2">
                        <span className="flex items-center gap-1 text-amber-400 font-semibold">
                          <Flame className="w-3.5 h-3.5" /> {player.combo}
                        </span>
                        <span>• {player.reward}</span>
                      </p>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <div className="text-lg sm:text-xl font-black text-amber-400 font-mono tracking-tight">
                      {player.score.toLocaleString()} PTS
                    </div>
                    <div className="text-[10px] font-semibold text-indigo-300/70">{player.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: QR Code & Side Wording Panel (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="w-full bg-gradient-to-b from-indigo-900/60 via-slate-900/90 to-slate-950 p-6 sm:p-8 rounded-3xl border-2 border-cyan-400/40 shadow-2xl backdrop-blur-xl text-center space-y-6 relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-extrabold border border-cyan-400/30 uppercase tracking-wider">
              <Smartphone className="w-4 h-4" /> Scan to Play
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white tracking-tight leading-tight">
                SCAN QR CODE TO JOIN LANE DASH!
              </h3>
              <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed font-medium">
                Point your smartphone camera at the QR code below to enter the 3-lane arcade runner. Switch lanes to dodge hurdles, grab power-ups, and climb the live stadium leaderboard!
              </p>
            </div>

            {/* QR Code Container */}
            <div className="bg-white p-5 rounded-2xl shadow-2xl inline-block mx-auto border-4 border-indigo-500/30 group hover:scale-105 transition-transform duration-300">
              <img
                src={qrImageUrl}
                onError={(e) => { e.currentTarget.src = '/fanzone-qr.png'; }}
                alt="Lane Dash QR Code"
                className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-lg"
              />
              <div className="mt-2 text-slate-900 font-mono text-xs font-black tracking-wider uppercase">
                {fanzoneUrl.replace('https://', '').replace('http://', '')}
              </div>
            </div>

            {/* Bottom Instructions / Rewards Callout */}
            <div className="p-3.5 rounded-2xl bg-indigo-950/80 border border-indigo-700/50 flex items-center justify-center gap-2 text-xs font-bold text-amber-300">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Top 3 players win instant sponsor reward coupons on their phones!</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Ticker Bar */}
      <div className="relative z-10 border-t border-indigo-900/60 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-indigo-300/70 font-medium">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Powered by FanForge Stadium Engagement System</span>
        </div>
        <div className="font-mono">Real-Time Fan Connection • Room ID: LANE-DASH-77</div>
      </div>
    </div>
  );
}
