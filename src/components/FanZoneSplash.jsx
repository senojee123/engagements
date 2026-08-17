import React, { useState, useEffect } from 'react';

const SPLASH_DURATION_MS = 2200;
const FADE_DURATION_MS = 300;

// Shows a branded splash over the FanZone portal while it first loads, then
// fades out to reveal the real content underneath (which mounts and starts
// fetching immediately, so it's usually ready by the time the splash clears).
export default function FanZoneSplash({ children }) {
  const [showSplash, setShowSplash] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setIsFadingOut(true), SPLASH_DURATION_MS);
    const removeTimer = setTimeout(() => setShowSplash(false), SPLASH_DURATION_MS + FADE_DURATION_MS);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  return (
    <>
      {children}
      {showSplash && (
        <div
          className={`fixed inset-0 z-[100] flex flex-col items-center justify-between bg-[#f4f2ee] px-6 py-16 transition-opacity duration-300 ${
            isFadingOut ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {/* Spacer to push title to the middle */}
          <div className="flex-1" />

          {/* Centered Large Title */}
          <div className="flex flex-col items-center justify-center text-center">
            <h1 className="text-6xl sm:text-7xl font-black tracking-tight text-slate-950 select-none">
              Fan<span className="text-rose-600">Zone</span>
            </h1>
          </div>

          {/* Powered By section pushed to the bottom */}
          <div className="flex-1 flex flex-col items-center justify-end gap-4 mt-8">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Powered by
            </span>
            <div className="flex items-center gap-8 sm:gap-10">
              <img
                src="/assets/dialog-5g-ultra-logo.jpg"
                alt="Dialog 5G Ultra"
                className="h-9 sm:h-11 w-auto object-contain"
              />
              <img
                src="/assets/dialog-airfibre-logo.png"
                alt="Dialog AirFibre"
                className="h-9 sm:h-11 w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
