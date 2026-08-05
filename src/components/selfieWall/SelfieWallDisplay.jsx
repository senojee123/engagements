import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, QrCode, Camera, Sparkles, Trophy, Award, Zap, Star, Heart } from 'lucide-react';
import { useSelfieWall } from '../../context/SelfieWallContext';

const renderFrameIcon = (iconType, animation) => {
  const animClass = animation === 'bounce' ? 'animate-bounce' : animation === 'spin' ? 'animate-spin' : animation === 'pulse' ? 'animate-pulse' : '';
  switch (iconType) {
    case 'trophy': return <Trophy className={`w-4 h-4 text-amber-400 ${animClass}`} />;
    case 'award': return <Award className={`w-4 h-4 text-indigo-400 ${animClass}`} />;
    case 'zap': return <Zap className={`w-4 h-4 text-emerald-400 ${animClass}`} />;
    case 'shield': return <ShieldCheck className={`w-4 h-4 text-cyan-400 ${animClass}`} />;
    case 'star': return <Star className={`w-4 h-4 text-amber-400 fill-amber-400 ${animClass}`} />;
    case 'heart': return <Heart className={`w-4 h-4 text-rose-500 fill-rose-500 ${animClass}`} />;
    case 'sparkles':
    default: return <Sparkles className={`w-4 h-4 text-cyan-400 ${animClass}`} />;
  }
};

const getFrameConfig = (config, brand) => {
  const tagline = config?.tagline || brand?.tagline || 'JUST APPROVED ON STADIUM SCREEN';
  const borderColor = config?.borderColor || brand?.primaryColor || '#22d3ee';
  const glowColor = config?.glowColor || `${borderColor}b3`;
  const borderWidth = config?.borderWidth || '4px';

  return {
    cardClass: config?.bgType === 'glass' ? 'bg-slate-900/95 backdrop-blur-2xl shadow-2xl' : 'bg-black shadow-2xl',
    headerClass: 'font-mono font-black tracking-widest text-xs uppercase',
    headerStyle: { color: borderColor },
    icon: renderFrameIcon(config?.icon, config?.animation),
    tagline: tagline.toUpperCase(),
    borderStyle: {
      borderWidth,
      borderStyle: 'solid',
      borderColor,
      boxShadow: `0 0 90px ${glowColor}`,
    },
    animClass: config?.animation === 'pulse' ? 'animate-pulse' : '',
  };
};

export default function SelfieWallDisplay() {
  const { approvedSelfies = [], activeBrand, frameConfig } = useSelfieWall();
  const currentFrameConfig = getFrameConfig(frameConfig, activeBrand);
  const [spotlightQueue, setSpotlightQueue] = useState([]);
  const [currentSpotlight, setCurrentSpotlight] = useState(null);

  // Maintain unique photo indices assigned to each of the 6 grid slots
  const [slotIndices, setSlotIndices] = useState([0, 1, 2, 3, 4, 5]);
  const activeSlotRef = useRef(0);
  const isInitialLoadRef = useRef(true);
  const prevApprovedIdsRef = useRef(new Set(approvedSelfies.map((s) => s.id)));

  // 1. Detect newly approved selfies and add to spotlight queue (ignore initial existing photos on refresh)
  useEffect(() => {
    const currentApprovedIds = new Set(approvedSelfies.map((s) => s.id));

    if (isInitialLoadRef.current) {
      prevApprovedIdsRef.current = currentApprovedIds;
      if (approvedSelfies.length > 0) {
        isInitialLoadRef.current = false;
      }
      return;
    }

    const newSelfies = approvedSelfies.filter((s) => !prevApprovedIdsRef.current.has(s.id));

    if (newSelfies.length > 0) {
      setSpotlightQueue((prevQueue) => {
        const existingIds = new Set([
          ...prevQueue.map((s) => s.id),
          ...(currentSpotlight ? [currentSpotlight.id] : []),
        ]);
        const toAdd = newSelfies.filter((s) => !existingIds.has(s.id));
        return [...prevQueue, ...toAdd];
      });
    }
    prevApprovedIdsRef.current = currentApprovedIds;
  }, [approvedSelfies]);

  // Complete initial load phase shortly after mount so subsequent admin approvals trigger spotlight
  useEffect(() => {
    const timer = setTimeout(() => {
      isInitialLoadRef.current = false;
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // 2. Process queue sequentially (one photo at a time)
  useEffect(() => {
    if (!currentSpotlight && spotlightQueue.length > 0) {
      const nextSelfie = spotlightQueue[0];
      setCurrentSpotlight(nextSelfie);
      setSpotlightQueue((prev) => prev.slice(1));
    }
  }, [currentSpotlight, spotlightQueue]);

  // 3. Display each spotlight selfie for 3.5 seconds guaranteed before advancing
  useEffect(() => {
    if (currentSpotlight) {
      const timer = setTimeout(() => {
        setCurrentSpotlight(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [currentSpotlight]);

  // Exclude selfies that are still queued or active in spotlight popup
  // so they pop up FIRST, and only go to the wall grid after spotlight finishes
  const pendingSpotlightIds = new Set([
    ...spotlightQueue.map((s) => s.id),
    ...(currentSpotlight ? [currentSpotlight.id] : []),
  ]);

  const wallSelfies = approvedSelfies.filter((s) => !pendingSpotlightIds.has(s.id));

  // Reset slot indices to distinct positions [0, 1, 2, 3, 4, 5] whenever wallSelfies length is <= 6
  useEffect(() => {
    if (wallSelfies.length <= 6) {
      setSlotIndices([0, 1, 2, 3, 4, 5]);
    }
  }, [wallSelfies.length]);

  // 4. Staggered per-grid tile slideshow: rotate 1 grid slot every 2.8s when photos > 6
  // Rotate all 6 slots sequentially (0 -> 1 -> 2 -> 3 -> 4 -> 5 -> 0) with no duplicates.
  useEffect(() => {
    if (wallSelfies.length <= 6 || currentSpotlight) return;

    const interval = setInterval(() => {
      const slotToRotate = activeSlotRef.current;
      activeSlotRef.current = (slotToRotate + 1) % 6;

      setSlotIndices((prevIndices) => {
        const currentlyDisplayed = new Set(
          prevIndices
            .filter((_, idx) => idx !== slotToRotate)
            .map((i) => i % wallSelfies.length)
        );

        let candidate = (prevIndices[slotToRotate] + 1) % wallSelfies.length;
        let attempts = 0;
        while (currentlyDisplayed.has(candidate) && attempts < wallSelfies.length) {
          candidate = (candidate + 1) % wallSelfies.length;
          attempts++;
        }

        const nextIndices = [...prevIndices];
        nextIndices[slotToRotate] = candidate;
        return nextIndices;
      });
    }, 2800);

    return () => clearInterval(interval);
  }, [wallSelfies.length, currentSpotlight]);

  const brand = activeBrand || {
    name: 'Coca-Cola',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Coca-Cola_logo.svg',
  };

  // Map each of the 6 grid slots to a UNIQUE photo from wallSelfies (or null if slot index >= wallSelfies.length)
  const displayBoxes = Array.from({ length: 6 }, (_, slotIdx) => {
    if (wallSelfies.length === 0) return null;
    const photoIdx = slotIndices[slotIdx];
    if (typeof photoIdx === 'number' && photoIdx < wallSelfies.length) {
      return wallSelfies[photoIdx];
    }
    return null;
  });

  return (
    <div className="w-full min-h-screen bg-black text-white font-sans flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden">
      {/* TOP HEADER / BRANDING BAR */}
      <header className="flex items-center justify-between border-b border-white/10 pb-4 mb-4 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 p-2 flex items-center justify-center border border-white/20">
            <img src={brand.logo} alt={brand.name} className="max-h-full object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-white">{brand.name} FAN SELFIE WALL</h1>
            <p className="text-xs text-slate-400 font-mono">LIVE STADIUM BROADCAST</p>
          </div>
        </div>

        <span className="text-xs font-extrabold text-emerald-400 bg-emerald-950/80 px-3.5 py-1 rounded-full border border-emerald-700 animate-pulse">
          ● LIVE
        </span>
      </header>

      {/* MAIN CONTENT: 6-BOX GRID + QR CODE SIDEBAR */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 max-w-7xl mx-auto w-full my-auto z-20">
        {/* 6-BOX GRID (3 COLUMNS x 2 ROWS) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 flex-1 w-full max-w-4xl">
          {displayBoxes.map((photo, slotIdx) => (
            <div
              key={`slot-container-${slotIdx}`}
              className="relative aspect-square rounded-3xl overflow-hidden border-2 border-white/20 bg-slate-950 shadow-2xl flex flex-col items-center justify-center group"
            >
              <AnimatePresence mode="wait">
                {photo ? (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 w-full h-full"
                  >
                    <img
                      src={photo.photoUrl}
                      alt={photo.uploaderName || 'Fan Selfie'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />

                    {/* Brand Overlay Badge */}
                    <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/20 flex items-center gap-1.5 z-10">
                      <img src={brand.logo} alt="" className="w-3.5 h-3.5 object-contain" />
                      <span className="text-[10px] font-extrabold text-white">{brand.name}</span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={`empty-${slotIdx}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 text-center space-y-2"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto text-cyan-400 border border-white/15">
                      <Camera className="w-6 h-6 animate-pulse" />
                    </div>
                    <p className="text-xs font-extrabold text-white uppercase tracking-wider">YOUR SELFIE HERE</p>
                    <p className="text-[10px] text-slate-400 font-mono">Scan QR to appear on screen!</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* QR CODE SIDEBAR CONTAINER */}
        <div className="w-full lg:w-80 bg-slate-950 border-2 border-white/20 rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-6 shadow-2xl shrink-0">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 font-mono flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> FAN WALL
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight leading-none">
              SNAP & SHARE!
            </h2>
          </div>

          {/* QR Code Graphic Container */}
          <div className="p-3 bg-white rounded-2xl shadow-2xl flex flex-col items-center justify-center border-4 border-indigo-600">
            <img
              src="/fanzone-qr.png"
              alt="FanZone QR Code"
              className="w-44 h-44 object-contain rounded-lg"
            />
          </div>

          {/* Bottom QR Code Instruction Text */}
          <div className="space-y-1 pt-1">
            <p className="text-xs font-black text-slate-300 uppercase tracking-wider font-mono">
              SCAN TO ADD YOUR SELFIE
            </p>
            <p className="text-[11px] text-slate-500 font-mono font-bold uppercase tracking-widest pt-1">
              {approvedSelfies.length} PHOTOS
            </p>
          </div>
        </div>
      </main>

      {/* FOOTER BRANDING BAR */}
      <footer className="mt-4 border-t border-white/10 pt-3 flex items-center justify-between text-xs text-slate-500 font-mono z-20">
        <span>POWERED BY FANFORGE ENGAGEMENT OS</span>
        <div className="flex items-center gap-3">
          <span className="text-cyan-400 font-extrabold">{approvedSelfies.length} FAN PHOTOS BROADCASTED LIVE</span>
        </div>
      </footer>

      {/* NEWLY ACCEPTED SELFIE SPOTLIGHT POP-UP ANIMATION */}
      <AnimatePresence mode="wait">
        {currentSpotlight && (
          <motion.div
            key={currentSpotlight.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCurrentSpotlight(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6 cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.2, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.3, opacity: 0, y: -30 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={currentFrameConfig.borderStyle}
              className={`rounded-3xl max-w-xl w-full p-4 text-center relative overflow-hidden space-y-3 ${currentFrameConfig.cardClass} ${currentFrameConfig.animClass}`}
            >
              {/* Top Banner */}
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  {currentFrameConfig.icon}
                  <span className={currentFrameConfig.headerClass} style={currentFrameConfig.headerStyle}>
                    {currentFrameConfig.tagline}
                  </span>
                </div>
                {spotlightQueue.length > 0 && (
                  <span className="text-[11px] font-bold text-slate-300 bg-white/10 px-2.5 py-0.5 rounded-full font-mono">
                    +{spotlightQueue.length} next
                  </span>
                )}
              </div>

              {/* Spotlight Photo */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black">
                <img
                  src={currentSpotlight.photoUrl}
                  alt="Spotlight Selfie"
                  className="w-full h-full object-cover"
                />

                {/* Brand Overlay Badge on Spotlight Image */}
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 flex items-center gap-2 z-10">
                  <img src={brand.logo} alt="" className="w-4 h-4 object-contain" />
                  <span className="text-xs font-black text-white">{brand.name}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
