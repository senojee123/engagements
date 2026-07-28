import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Zap,
  Sparkles,
  Camera,
  Heart,
  Flame,
  ThumbsUp,
  BarChart2,
  CheckCircle2,
  Clock,
  Send,
  UploadCloud,
  QrCode,
  ShieldCheck,
  Hourglass,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { useBuilder } from '../../context/BuilderContext';

export default function MobilePhoneFrame() {
  const { customBrand, activeBrand, playerStage, setPlayerStage, gameRules, activeTemplateId } = useBuilder();

  // ------------------------------------------------------------------
  // Selfie Wall Interactive Journey State
  // ------------------------------------------------------------------
  // Stages: 'landing' -> 'capture' -> 'preview' -> 'pending' -> 'approved'
  const [selfieStep, setSelfieStep] = useState('landing');
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  );

  // Reaction Wall State
  const [reactionsSent, setReactionsSent] = useState(42);
  const [activeFloatingEmojis, setActiveFloatingEmojis] = useState([]);

  // Live Poll State
  const [selectedOption, setSelectedOption] = useState(null);
  const [pollVotes, setPollVotes] = useState({ A: 58, B: 24, C: 18 });

  const triggerReaction = (emoji) => {
    setReactionsSent((prev) => prev + 1);
    const newEmoji = { id: Date.now(), emoji, left: Math.random() * 70 + 15 };
    setActiveFloatingEmojis((prev) => [...prev.slice(-6), newEmoji]);
  };

  return (
    <div className="relative mx-auto w-[310px] h-[620px] bg-slate-950 rounded-[48px] p-3 shadow-2xl ring-1 ring-slate-800 border-4 border-slate-900 flex flex-col justify-between overflow-hidden">
      {/* Phone Dynamic Island / Camera Notch */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-900 rounded-full z-40 flex items-center justify-center">
        <div className="w-2.5 h-2.5 rounded-full bg-slate-800 mr-2" />
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-900" />
      </div>

      {/* Screen Frame Container */}
      <div
        className={`w-full h-full rounded-[38px] overflow-hidden flex flex-col justify-between pt-7 pb-4 px-4 relative bg-gradient-to-b ${customBrand.bgGradient}`}
        style={{ color: customBrand.secondaryColor }}
      >
        {/* ---------------------------------------------------- */}
        {/* 1. SELFIE WALL PLAYER JOURNEY */}
        {/* ---------------------------------------------------- */}
        {activeTemplateId === 'selfie-wall' && (
          <div className="flex-1 flex flex-col justify-between py-2 text-center animate-in fade-in">
            {/* Top Brand Header */}
            <div className="space-y-1">
              <div className="w-9 h-9 rounded-2xl bg-white/10 backdrop-blur-md mx-auto flex items-center justify-center p-2 border border-white/20">
                <img src={customBrand.logo} alt="Brand" className="max-h-full object-contain" />
              </div>
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                {activeBrand.name} Event Portal
              </h4>
              <p className="text-[10px] text-cyan-300 font-medium">Metropolis Arena Live Fan Zone</p>
            </div>

            {/* STEP 1: MOBILE EVENT LANDING PAGE (Scanned from Jumbotron QR Code) */}
            {selfieStep === 'landing' && (
              <div className="space-y-3 my-auto animate-in fade-in">
                <div className="p-3 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 text-left space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-cyan-300 uppercase">Scanned Event Portal</span>
                    <span className="text-[9px] bg-emerald-500 text-white font-bold px-1.5 py-0.5 rounded">
                      ● 3 ACTIVE ENGAGEMENTS
                    </span>
                  </div>
                  <h5 className="text-xs font-extrabold text-white">Select Live Fan Engagement:</h5>
                </div>

                <div className="space-y-2">
                  {/* Selfie Wall Option */}
                  <button
                    onClick={() => setSelfieStep('capture')}
                    className="w-full p-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white text-left shadow-lg border border-white/30 flex items-center justify-between group hover:scale-102 transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-lg">
                        📸
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-white">Live Fan Selfie Wall</p>
                        <p className="text-[10px] text-cyan-100">Send photo to Big Screen</p>
                      </div>
                    </div>
                    <span className="text-[9px] bg-white text-indigo-900 font-extrabold px-2 py-0.5 rounded-full uppercase">
                      ACTIVE ●
                    </span>
                  </button>

                  {/* Other Active Engagements */}
                  <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-left flex items-center justify-between opacity-80">
                    <div className="flex items-center gap-2">
                      <span>🔥</span>
                      <span className="text-xs font-bold text-white">Live Crowd Reaction Wall</span>
                    </div>
                    <span className="text-[9px] text-cyan-300">Active</span>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-left flex items-center justify-between opacity-80">
                    <div className="flex items-center gap-2">
                      <span>📊</span>
                      <span className="text-xs font-bold text-white">Real-Time Stadium Live Poll</span>
                    </div>
                    <span className="text-[9px] text-cyan-300">Active</span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: CAPTURE / UPLOAD SELFIE */}
            {selfieStep === 'capture' && (
              <div className="space-y-3 my-auto animate-in zoom-in">
                <div className="w-full aspect-square rounded-3xl bg-slate-900 border-2 border-white/20 flex flex-col items-center justify-center p-3 shadow-2xl relative overflow-hidden">
                  <div className="space-y-2 text-center">
                    <div className="w-14 h-14 rounded-full bg-indigo-600/40 border-2 border-indigo-400 flex items-center justify-center mx-auto animate-pulse">
                      <Camera className="w-7 h-7 text-white" />
                    </div>
                    <p className="text-xs font-extrabold text-white">Capture Live Fan Selfie</p>
                    <p className="text-[10px] text-white/70">Align face inside camera frame</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => setSelfieStep('preview')}
                    className="w-full py-2.5 rounded-xl font-extrabold text-xs bg-white text-slate-950 shadow-lg"
                  >
                    Snap Selfie 📸
                  </button>
                  <button
                    onClick={() => setSelfieStep('landing')}
                    className="text-[10px] text-white/70 hover:underline"
                  >
                    ← Back to Active Engagements
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PREVIEW & CUSTOMIZE STICKER */}
            {selfieStep === 'preview' && (
              <div className="space-y-3 my-auto animate-in zoom-in">
                <div className="w-full aspect-square rounded-3xl overflow-hidden relative border-2 border-cyan-400 shadow-2xl">
                  <img src={capturedPhotoUrl} alt="Captured Selfie" className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-md p-2 rounded-xl border border-white/20 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <img src={customBrand.logo} alt="Logo" className="w-4 h-4 object-contain" />
                      <span className="text-[10px] font-bold text-white">{activeBrand.name} Fan</span>
                    </div>
                    <span className="text-[9px] bg-cyan-500 text-slate-950 font-bold px-1.5 py-0.5 rounded">
                      STADIUM BADGE
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <button
                    onClick={() => setSelfieStep('pending')}
                    className="w-full py-2.5 rounded-xl font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
                    style={{ backgroundColor: customBrand.primaryColor, color: customBrand.secondaryColor }}
                  >
                    <Send className="w-4 h-4" /> Send to Moderator Queue
                  </button>
                  <button
                    onClick={() => setSelfieStep('capture')}
                    className="text-[10px] text-white/70 hover:underline"
                  >
                    Retake Photo
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: WAITING FOR ORGANIZER PLATFORM APPROVAL */}
            {selfieStep === 'pending' && (
              <div className="space-y-3 my-auto animate-in zoom-in text-center p-3 rounded-3xl bg-black/40 border border-amber-400/40">
                <div className="w-12 h-12 rounded-full bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center mx-auto text-amber-300 animate-spin">
                  <Hourglass className="w-6 h-6" />
                </div>
                <h5 className="text-xs font-extrabold text-white">Selfie Sent to Moderator!</h5>
                <p className="text-[10px] text-amber-200 leading-relaxed">
                  Your photo is currently queued in the FanForge Organizer Platform for review.
                </p>
                <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-800 text-[10px] font-mono text-amber-300">
                  Status: PENDING ORGANIZER APPROVAL...
                </div>
                <button
                  onClick={() => setSelfieStep('approved')}
                  className="w-full py-2 rounded-xl font-bold text-[11px] bg-emerald-500 text-slate-950 shadow-md mt-2"
                >
                  Simulate Admin Accept ✅
                </button>
              </div>
            )}

            {/* STEP 5: APPROVED & BROADCAST LIVE ON BIG SCREEN */}
            {selfieStep === 'approved' && (
              <div className="space-y-3 my-auto animate-in zoom-in text-center p-3 rounded-3xl bg-emerald-950/60 border border-emerald-400">
                <div className="w-12 h-12 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center mx-auto shadow-xl">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h5 className="text-xs font-extrabold text-white">ACCEPTED & BROADCAST LIVE!</h5>
                <p className="text-[10px] text-emerald-200">
                  Your selfie is now live on the Metropolis Arena Big Screen Mosaic!
                </p>
                <button
                  onClick={() => setSelfieStep('landing')}
                  className="w-full py-2 rounded-xl font-bold text-xs bg-white text-slate-950 shadow-lg mt-2"
                >
                  Back to Portal
                </button>
              </div>
            )}

            {/* Journey Step Indicator Pill */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[9px] text-white/70">
              <span>Fan Journey Step:</span>
              <div className="flex gap-1">
                {['landing', 'capture', 'preview', 'pending', 'approved'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setSelfieStep(st)}
                    className={`px-1 rounded capitalize ${
                      selfieStep === st ? 'bg-white text-slate-950 font-bold' : 'hover:bg-white/10'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* 2. REACTION WALL PREVIEW */}
        {/* ---------------------------------------------------- */}
        {activeTemplateId === 'reaction-wall' && (
          <div className="flex-1 flex flex-col justify-between py-2 text-center animate-in fade-in relative overflow-hidden">
            <div className="space-y-1 z-10">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md mx-auto flex items-center justify-center p-2 border border-white/20">
                <img src={customBrand.logo} alt="Brand" className="max-h-full object-contain" />
              </div>
              <h4 className="text-sm font-extrabold text-white">Live Crowd Reaction Wall</h4>
              <p className="text-[11px] text-cyan-300 font-semibold">{reactionsSent} Crowd Reactions Sent!</p>
            </div>

            <div className="relative my-auto w-full h-52 rounded-3xl bg-black/30 border border-white/10 overflow-hidden p-2 flex flex-col justify-end">
              {activeFloatingEmojis.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ y: 150, opacity: 1, scale: 0.8 }}
                  animate={{ y: -180, opacity: 0, scale: 1.4 }}
                  transition={{ duration: 2, ease: 'easeOut' }}
                  className="absolute text-3xl pointer-events-none"
                  style={{ left: `${item.left}%` }}
                >
                  {item.emoji}
                </motion.div>
              ))}
              <p className="text-[10px] text-white/50 text-center mb-2 font-mono">
                Tap buttons below to burst reactions onto stage displays
              </p>
            </div>

            <div className="grid grid-cols-5 gap-2 z-10">
              {['🔥', '👏', '🚀', '❤️', '⚡'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => triggerReaction(emoji)}
                  className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md hover:bg-white/30 border border-white/30 text-2xl shadow-lg active:scale-95 transition-all"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* 3. LIVE POLL PREVIEW */}
        {/* ---------------------------------------------------- */}
        {activeTemplateId === 'live-poll' && (
          <div className="flex-1 flex flex-col justify-between py-2 text-center animate-in fade-in">
            <div className="space-y-1">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md mx-auto flex items-center justify-center p-2 border border-white/20">
                <img src={customBrand.logo} alt="Brand" className="max-h-full object-contain" />
              </div>
              <h4 className="text-sm font-extrabold text-white">Real-Time Stadium Live Poll</h4>
              <p className="text-[11px] text-cyan-300 font-semibold">Halftime Fan Vote</p>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/15 text-left space-y-3">
              <p className="text-xs font-extrabold text-white leading-snug">
                Who will win the MVP title at the end of tonight's championship game?
              </p>

              {[
                { id: 'A', text: 'Alex Morgan (Apex)', pct: pollVotes.A },
                { id: 'B', text: 'Jordan Taylor (Strikers)', pct: pollVotes.B },
                { id: 'C', text: 'Sarah Jenkins (United)', pct: pollVotes.C },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedOption(opt.id)}
                  className={`w-full p-2.5 rounded-xl border text-xs font-semibold text-left transition-all relative overflow-hidden flex items-center justify-between ${
                    selectedOption === opt.id
                      ? 'bg-indigo-600 border-cyan-400 text-white font-bold shadow-md'
                      : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                  }`}
                >
                  <span className="z-10 relative">{opt.id}. {opt.text}</span>
                  <span className="z-10 relative font-mono font-bold text-cyan-300">{opt.pct}%</span>
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-white/15 transition-all duration-500"
                    style={{ width: `${opt.pct}%` }}
                  />
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {selectedOption ? (
                <div className="p-2 rounded-xl bg-emerald-500/30 border border-emerald-400 text-emerald-200 text-xs font-bold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Vote Recorded Live!
                </div>
              ) : (
                <p className="text-[10px] text-white/60">Tap any candidate option above to register your stadium vote.</p>
              )}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* 4. PRODUCT RUSH PREVIEW */}
        {/* ---------------------------------------------------- */}
        {activeTemplateId === 'product-rush' && (
          <div className="flex-1 flex flex-col justify-between py-2 animate-in fade-in">
            <div className="flex items-center justify-between bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
              <span className="text-xs font-bold text-cyan-300 font-mono">1,450 PTS</span>
              <span className="text-[11px] font-semibold text-white flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" /> {gameRules.gameDuration}s
              </span>
            </div>

            <div className="relative h-44 rounded-2xl bg-black/30 border border-white/10 overflow-hidden flex items-center justify-between px-4 my-2">
              <motion.div
                animate={{ x: [120, -20] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
                className="absolute right-4 top-8 flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg text-xs"
              >
                <span>{customBrand.collectibleIcon}</span>
                <span className="text-[10px] font-bold text-cyan-300">+{gameRules.rewardPointsPerItem}</span>
              </motion.div>

              <motion.div
                animate={{ x: [180, -40] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'linear', delay: 0.7 }}
                className="absolute right-8 top-24 flex items-center gap-1 bg-rose-500/30 backdrop-blur-md px-2 py-1 rounded-lg text-xs text-rose-200"
              >
                <span>{customBrand.obstacleIcon}</span>
              </motion.div>

              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="text-3xl"
              >
                {activeBrand.runnerSprite}
              </motion.div>
            </div>

            <button
              onClick={() => setPlayerStage('winner')}
              className="w-full py-2 rounded-xl font-bold text-xs shadow-lg transition-all"
              style={{ backgroundColor: customBrand.primaryColor, color: customBrand.secondaryColor }}
            >
              Finish & Claim Prize
            </button>
          </div>
        )}

        {/* Device Footer Info */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-white/60">
          <span>Target: {activeBrand.name}</span>
          <span className="font-mono text-cyan-300">FanForge Live Engine</span>
        </div>
      </div>
    </div>
  );
}
