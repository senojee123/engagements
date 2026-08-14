import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap, Shield, Sparkles, Camera, CheckCircle2, QrCode, Hourglass, Check, X, RotateCcw, Brain } from 'lucide-react';

export default function GameplayMockup({ brand, templateId = 'product-rush' }) {
  // Runner Game State
  const [score, setScore] = useState(1450);
  const [powerUpActive, setPowerUpActive] = useState(false);
  const [comboMultiplier, setComboMultiplier] = useState(3);

  // Memory Challenge State
  const initialMemoryCards = [
    { id: 1, icon: brand.collectibleIcon || '🥤', symbol: 'Brand' },
    { id: 2, icon: '⚽', symbol: 'Ball' },
    { id: 3, icon: '🏆', symbol: 'Trophy' },
    { id: 4, icon: '⚡', symbol: 'Zap' },
    { id: 5, icon: '👟', symbol: 'Sneaker' },
    { id: 6, icon: '🚀', symbol: 'Rocket' },
    { id: 7, icon: brand.collectibleIcon || '🥤', symbol: 'Brand' },
    { id: 8, icon: '⚽', symbol: 'Ball' },
    { id: 9, icon: '🏆', symbol: 'Trophy' },
    { id: 10, icon: '⚡', symbol: 'Zap' },
    { id: 11, icon: '👟', symbol: 'Sneaker' },
    { id: 12, icon: '🚀', symbol: 'Rocket' },
  ];
  const [memoryCards, setMemoryCards] = useState(initialMemoryCards);
  const [flippedIndices, setFlippedIndices] = useState([0, 6]); // Start with 1 pair pre-matched/revealed for visual impact
  const [matchedIndices, setMatchedIndices] = useState([0, 6]);
  const [memoryScore, setMemoryScore] = useState(1200);
  const [memoryMoves, setMemoryMoves] = useState(4);

  const handleCardClick = (index) => {
    if (flippedIndices.includes(index) || matchedIndices.includes(index) || flippedIndices.length % 2 !== 0) {
      if (flippedIndices.length % 2 !== 0) {
        // One card is open, flip second
        const newFlipped = [...flippedIndices, index];
        setFlippedIndices(newFlipped);
        setMemoryMoves((prev) => prev + 1);

        const firstIndex = flippedIndices[flippedIndices.length - 1];
        if (memoryCards[firstIndex].symbol === memoryCards[index].symbol) {
          setMatchedIndices((prev) => [...prev, firstIndex, index]);
          setMemoryScore((prev) => prev + 350);
        } else {
          setTimeout(() => {
            setFlippedIndices((prev) => prev.filter((i) => i !== firstIndex && i !== index));
          }, 900);
        }
      }
      return;
    }
    setFlippedIndices((prev) => [...prev, index]);
  };

  const resetMemoryGame = () => {
    setFlippedIndices([0, 6]);
    setMatchedIndices([0, 6]);
    setMemoryScore(1200);
    setMemoryMoves(4);
  };

  // Selfie Wall Mock State
  const [pendingSelfie, setPendingSelfie] = useState({
    id: 1,
    name: 'Marcus Vance',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    time: 'Awaiting Acceptance',
  });
  const [approvedSelfies, setApprovedSelfies] = useState([
    { id: 2, name: 'Alex Morgan', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80' },
    { id: 3, name: 'Sarah Jenkins', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' },
  ]);

  // Reaction Wall State
  const [reactionsSent, setReactionsSent] = useState(84);
  const [floatingEmojis, setFloatingEmojis] = useState([]);

  // Live Poll State
  const [selectedOption, setSelectedOption] = useState(null);
  const [pollVotes, setPollVotes] = useState({ A: 58, B: 24, C: 18 });

  useEffect(() => {
    const interval = setInterval(() => {
      setScore((prev) => prev + Math.floor(Math.random() * 50) + 10);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const handleAcceptSelfie = () => {
    if (!pendingSelfie) return;
    setApprovedSelfies([pendingSelfie, ...approvedSelfies]);
    setPendingSelfie(null);
  };

  const triggerReaction = (emoji) => {
    setReactionsSent((prev) => prev + 1);
    const newEmoji = { id: Date.now(), emoji, left: Math.random() * 70 + 15 };
    setFloatingEmojis((prev) => [...prev.slice(-6), newEmoji]);
  };

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl transition-all duration-500 bg-gradient-to-b ${brand.gradientBg}`}
      style={{ minHeight: '420px' }}
    >
      {/* Top Header Bar */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between backdrop-blur-md bg-black/20">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-lg shadow-md border border-white/20"
            style={{ backgroundColor: brand.primaryColor, color: brand.secondaryColor }}
          >
            {brand.collectibleIcon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-white text-base tracking-tight">{brand.name}</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-md border border-cyan-700/60">
                {brand.themeBadge}
              </span>
            </div>
            <p className="text-xs text-white/70 italic mt-0.5">{brand.tagline}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800 uppercase">
            ● LIVE STADIUM STREAM
          </span>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 1. SELFIE WALL PREVIEW MOCKUP */}
      {/* ---------------------------------------------------- */}
      {templateId === 'selfie-wall' && (
        <div className="p-6 space-y-6 animate-in fade-in">
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-4 text-white">
            <div>
              <h3 className="text-xl font-extrabold text-white">Live Fan Selfie Wall & Moderation Queue</h3>
              <p className="text-xs text-cyan-300">Scan QR code → Upload selfie → Organizer Acceptance → Live Jumbotron Broadcast</p>
            </div>
            <div className="flex items-center gap-2 bg-white text-slate-950 px-3 py-1.5 rounded-xl font-mono text-xs font-bold shadow-lg">
              <QrCode className="w-4 h-4 text-indigo-600" />
              <span>fanforge.live/arena</span>
            </div>
          </div>

          {/* Incoming Moderation Queue Banner */}
          {pendingSelfie ? (
            <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-400/50 backdrop-blur-md flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-3">
                <img src={pendingSelfie.photo} alt="Pending" className="w-12 h-12 rounded-xl object-cover ring-2 ring-amber-400" />
                <div>
                  <p className="text-xs font-extrabold text-white">Incoming Selfie: {pendingSelfie.name}</p>
                  <p className="text-[11px] text-amber-200">Awaiting Platform Moderator Acceptance...</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAcceptSelfie}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-lg hover:bg-emerald-400"
                >
                  <Check className="w-4 h-4" /> ACCEPT & BROADCAST
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-semibold flex items-center justify-between">
              <span>All pending selfies approved! New incoming selfies will appear in the queue.</span>
              <button
                onClick={() => setPendingSelfie({
                  id: Date.now(),
                  name: 'Jordan Taylor',
                  photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
                  time: 'Just now'
                })}
                className="px-3 py-1 rounded-xl bg-white text-slate-950 font-bold text-xs"
              >
                Simulate New Selfie 📸
              </button>
            </div>
          )}

          {/* Approved Selfies Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {approvedSelfies.map((s) => (
              <div key={s.id} className="relative aspect-square rounded-2xl overflow-hidden border border-white/20 shadow-xl">
                <img src={s.photo} alt={s.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent p-3 flex flex-col justify-end">
                  <span className="text-xs font-bold text-white">{s.name}</span>
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Live on Jumbotron
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. REACTION WALL PREVIEW MOCKUP */}
      {/* ---------------------------------------------------- */}
      {templateId === 'reaction-wall' && (
        <div className="p-6 space-y-6 animate-in fade-in relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 text-white">
            <div>
              <h3 className="text-xl font-extrabold text-white">Live Crowd Reaction Wall Stream</h3>
              <p className="text-xs text-cyan-300">{reactionsSent} Real-Time Fan Reactions Broadcasted</p>
            </div>
          </div>

          <div className="relative h-44 rounded-3xl bg-black/40 border border-white/15 overflow-hidden p-4 flex flex-col justify-end">
            {floatingEmojis.map((item) => (
              <motion.div
                key={item.id}
                initial={{ y: 120, opacity: 1, scale: 0.8 }}
                animate={{ y: -160, opacity: 0, scale: 1.5 }}
                transition={{ duration: 2, ease: 'easeOut' }}
                className="absolute text-4xl pointer-events-none"
                style={{ left: `${item.left}%` }}
              >
                {item.emoji}
              </motion.div>
            ))}
            <p className="text-xs text-white/60 text-center font-mono">
              Tap reaction buttons below to burst emojis onto the live stream
            </p>
          </div>

          <div className="flex items-center justify-center gap-4">
            {['🔥', '👏', '🚀', '❤️', '⚡'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => triggerReaction(emoji)}
                className="px-5 py-3 rounded-2xl bg-white/20 hover:bg-white/30 border border-white/30 text-3xl shadow-xl active:scale-95 transition-all"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 3. LIVE POLL PREVIEW MOCKUP */}
      {/* ---------------------------------------------------- */}
      {templateId === 'live-poll' && (
        <div className="p-6 space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 text-white">
            <div>
              <h3 className="text-xl font-extrabold text-white">Real-Time Arena Live Poll</h3>
              <p className="text-xs text-cyan-300">Halftime Fan Vote Live Results</p>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-black/40 border border-white/15 space-y-4 text-white text-left">
            <h4 className="text-sm font-extrabold text-white">
              Who will win tonight's MVP Championship Award?
            </h4>

            <div className="space-y-3">
              {[
                { id: 'A', label: 'Alex Morgan (Apex)', pct: pollVotes.A },
                { id: 'B', label: 'Jordan Taylor (Strikers)', pct: pollVotes.B },
                { id: 'C', label: 'Sarah Jenkins (United)', pct: pollVotes.C },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedOption(opt.id)}
                  className={`w-full p-3 rounded-2xl border text-xs font-bold transition-all relative overflow-hidden flex items-center justify-between ${
                    selectedOption === opt.id
                      ? 'bg-indigo-600 border-cyan-400 text-white shadow-lg'
                      : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                  }`}
                >
                  <span className="z-10 relative">{opt.id}. {opt.label}</span>
                  <span className="z-10 relative font-mono font-extrabold text-cyan-300">{opt.pct}%</span>
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-white/20 transition-all duration-500"
                    style={{ width: `${opt.pct}%` }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 4. SPIN THE WHEEL TEMPLATE PREVIEW MOCKUP */}
      {/* ---------------------------------------------------- */}
      {(templateId === 'spin-wheel' || templateId === 'spin-the-wheel') && (
        <div className="p-6 space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 text-white">
            <div>
              <h3 className="text-xl font-extrabold text-white">Spin the Wheel Engagement Template</h3>
              <p className="text-xs text-cyan-300">Instant Winner Prize Wheel • Arena Fan Activation</p>
            </div>
            <span className="text-[10px] font-mono bg-indigo-900/80 text-cyan-300 px-3 py-1 rounded-full border border-indigo-700">
              TEMPLATE PREVIEW
            </span>
          </div>

          <div className="relative flex flex-col md:flex-row items-center justify-center gap-8 py-4">
            {/* Spinning Wheel Mock Design using template image */}
            <div className="relative w-52 h-52 rounded-full border-4 border-amber-400 shadow-2xl flex items-center justify-center overflow-hidden bg-slate-900 shrink-0">
              <motion.img
                src="/spin_wheel.jpg"
                alt="Spin the Wheel Template"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
                className="w-full h-full object-cover rounded-full"
              />
              {/* Center Spinner Cap */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-12 h-12 rounded-full bg-slate-950/90 border-2 border-amber-400 flex items-center justify-center text-amber-400 font-extrabold shadow-xl z-10 text-[11px] text-center">
                  SPIN!
                </div>
              </div>
              {/* Pointer indicator */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-0 h-0 border-l-8 border-r-8 border-t-[14px] border-l-transparent border-r-transparent border-t-amber-400 z-20" />
            </div>

            {/* Template Prize Segments Info */}
            <div className="space-y-2.5 text-left max-w-xs">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Customizable Wheel Segments</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-white/10 border border-white/15 text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                  <span>VIP Pass</span>
                </div>
                <div className="p-2 rounded-xl bg-white/10 border border-white/15 text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 shrink-0" />
                  <span>Free Drink</span>
                </div>
                <div className="p-2 rounded-xl bg-white/10 border border-white/15 text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                  <span>20% Off Merch</span>
                </div>
                <div className="p-2 rounded-xl bg-white/10 border border-white/15 text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-400 shrink-0" />
                  <span>Signed Jersey</span>
                </div>
              </div>
              <p className="text-[11px] text-indigo-200/80 pt-1">
                Configure custom prize odds, brand colors, and voucher codes inside the Visual Studio.
              </p>
            </div>
          </div>
        </div>
      )}



      {/* ---------------------------------------------------- */}
      {/* 5. PRODUCT RUSH / DEFAULT RUNNER GAME MOCKUP */}
      {/* ---------------------------------------------------- */}
      {templateId === 'product-rush' && (
        <div className="p-6 relative flex flex-col justify-between" style={{ minHeight: '340px' }}>
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-xs font-semibold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                Combo {comboMultiplier}x
              </span>
            </div>
          </div>

          <div className="my-8 relative h-36 rounded-2xl bg-black/30 backdrop-blur-xs border border-white/10 overflow-hidden flex items-center px-8 justify-between">
            <motion.div
              animate={{ x: [250, -50], opacity: [0, 1, 1, 0] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }}
              className="absolute right-20 top-6 flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20"
            >
              <span className="text-2xl">{brand.collectibleIcon}</span>
              <span className="text-xs font-bold text-cyan-300">{brand.collectiblePoints}</span>
            </motion.div>

            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 0.6 }}
              className="relative z-10 flex items-center gap-3 bg-white/20 backdrop-blur-md p-3 rounded-2xl border-2 border-cyan-400 shadow-xl"
            >
              <span className="text-4xl">{brand.runnerSprite}</span>
              <div className="flex flex-col text-left">
                <span className="text-xs font-extrabold text-white">Alex Morgan</span>
                <span className="text-[10px] text-cyan-300 font-semibold">{brand.collectibleName} Collector</span>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
