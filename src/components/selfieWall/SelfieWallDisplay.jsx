import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, QrCode, Camera, Sparkles, CheckCircle2, Zap } from 'lucide-react';
import { useSelfieWall } from '../../context/SelfieWallContext';

export default function SelfieWallDisplay() {
  const { approvedSelfies = [], activeBrand } = useSelfieWall();
  const [spotlightSelfie, setSpotlightSelfie] = useState(null);
  const prevApprovedIdsRef = useRef(new Set(approvedSelfies.map((s) => s.id)));

  // 1. Detect newly approved selfies
  useEffect(() => {
    const currentApprovedIds = new Set(approvedSelfies.map((s) => s.id));
    const newSelfies = approvedSelfies.filter((s) => !prevApprovedIdsRef.current.has(s.id));

    if (newSelfies.length > 0) {
      setSpotlightSelfie(newSelfies[0]);
    }
    prevApprovedIdsRef.current = currentApprovedIds;
  }, [approvedSelfies]);

  // 2. Dismiss spotlight pop-up after 3 seconds guaranteed
  useEffect(() => {
    if (spotlightSelfie) {
      const timer = setTimeout(() => {
        setSpotlightSelfie(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [spotlightSelfie]);

  const brand = activeBrand || {
    name: 'Coca-Cola',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Coca-Cola_logo.svg',
  };

  // Always render exactly 6 boxes for selfies
  const displayBoxes = Array.from({ length: 6 }, (_, index) => approvedSelfies[index] || null);

  return (
    <div className="w-full min-h-screen bg-black text-white font-sans flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden">
      {/* ---------------------------------------------------- */}
      {/* TOP HEADER / BRANDING BAR */}
      {/* ---------------------------------------------------- */}
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

      {/* ---------------------------------------------------- */}
      {/* MAIN CONTENT: 6-BOX GRID + QR CODE SIDEBAR */}
      {/* ---------------------------------------------------- */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 max-w-7xl mx-auto w-full my-auto z-20">
        {/* 6-BOX GRID (3 COLUMNS x 2 ROWS) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 flex-1 w-full max-w-4xl">
          <AnimatePresence>
            {displayBoxes.map((photo, idx) => (
              <motion.div
                key={photo ? photo.id : `empty-${idx}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="relative aspect-square rounded-3xl overflow-hidden border-2 border-white/20 bg-slate-950 shadow-2xl flex flex-col items-center justify-center group"
              >
                {photo ? (
                  <>
                    <img
                      src={photo.photoUrl}
                      alt={photo.uploaderName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Brand Overlay Badge */}
                    <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/20 flex items-center gap-1.5">
                      <img src={brand.logo} alt="" className="w-3.5 h-3.5 object-contain" />
                      <span className="text-[10px] font-extrabold text-white">{brand.name}</span>
                    </div>

                    {/* Fan Caption Badge */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-4 flex flex-col justify-end text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-extrabold text-white truncate">{photo.uploaderName}</span>
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      </div>
                      <p className="text-[11px] text-cyan-300 font-medium truncate mt-0.5">{photo.caption}</p>
                    </div>
                  </>
                ) : (
                  <div className="p-4 text-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto text-cyan-400 border border-white/15">
                      <Camera className="w-6 h-6 animate-pulse" />
                    </div>
                    <p className="text-xs font-extrabold text-white uppercase tracking-wider">YOUR SELFIE HERE</p>
                    <p className="text-[10px] text-slate-400 font-mono">Scan QR to appear on screen!</p>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* QR CODE SIDEBAR CONTAINER */}
        <div className="w-full lg:w-80 bg-slate-950 border-2 border-white/20 rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-5 shadow-2xl shrink-0">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 font-mono flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> GET FEATURED LIVE
            </span>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">JOIN THE WALL</h3>
          </div>

          {/* QR Code Graphic Container */}
          <div className="p-3 bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center border-4 border-indigo-600">
            <img
              src="/fanzone-qr.png"
              alt="FanZone QR Code"
              className="w-40 h-40 object-contain rounded-lg"
            />
          </div>

          {/* Bottom QR Code Instruction Text */}
          <div className="space-y-1 pt-1">
            <p className="text-sm font-black text-cyan-300 uppercase tracking-wide leading-snug">
              Scan the QR and see yourself on big screen
            </p>
            <p className="text-[11px] text-slate-400 font-mono">fan-zone-five.vercel.app</p>
          </div>
        </div>
      </main>

      {/* ---------------------------------------------------- */}
      {/* FOOTER BRANDING BAR */}
      {/* ---------------------------------------------------- */}
      <footer className="mt-4 border-t border-white/10 pt-3 flex items-center justify-between text-xs text-slate-500 font-mono z-20">
        <span>POWERED BY FANFORGE ENGAGEMENT OS</span>
        <span className="text-cyan-400 font-extrabold">{approvedSelfies.length} FAN PHOTOS BROADCASTED LIVE</span>
      </footer>

      {/* ---------------------------------------------------- */}
      {/* NEWLY ACCEPTED SELFIE SPOTLIGHT POP-UP ANIMATION */}
      {/* ---------------------------------------------------- */}
      <AnimatePresence>
        {spotlightSelfie && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSpotlightSelfie(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6 cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.3, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="bg-black rounded-3xl max-w-xl w-full p-3 text-center border-4 border-cyan-400 shadow-[0_0_80px_rgba(34,211,238,0.6)] relative overflow-hidden"
            >
              {/* Clean Spotlight Photo ONLY */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black">
                <img
                  src={spotlightSelfie.photoUrl}
                  alt="Spotlight Selfie"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
