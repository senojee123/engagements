import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowDown, Maximize2, Minimize2, Tv } from 'lucide-react';

export default function IdleScreenDisplay() {
  const { idleScreenConfig } = useApp();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const config = idleScreenConfig || {
    eventTitle: 'Welcome to Dialog Family Day 2026',
    subtitle: 'Interactive Experiences Powered by FanForge',
    eventLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
    messageTitle: 'Experience starts soon...',
    messageSubtitle: 'Organizer will launch an activity shortly',
    sponsorLogos: [],
  };

  return (
    <div className="w-full min-h-screen bg-[#121212] text-white flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden font-mono selection:bg-indigo-500 selection:text-white">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute inset-0 bg-radial from-indigo-950/30 via-transparent to-transparent pointer-events-none" />

      {/* Top Controls Bar */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        <button
          onClick={toggleFullscreen}
          className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all shadow-md"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* TOP SECTION: EVENT LOGO & HEADER */}
      {/* ---------------------------------------------------- */}
      <header className="flex flex-col items-center text-center space-y-5 pt-4 z-10">
        {/* EVENT LOGO */}
        <div className="flex justify-center items-center">
          {config.eventLogo ? (
            <img src={config.eventLogo} alt="Event Logo" className="max-h-16 sm:max-h-20 max-w-full object-contain" />
          ) : (
            <div className="px-6 py-2 rounded-xl border border-dashed border-white/40 text-sm font-bold tracking-widest text-slate-300 uppercase">
              EVENT LOGO
            </div>
          )}
        </div>

        {/* WELCOME TITLES */}
        <div className="space-y-2 max-w-3xl">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight uppercase">
            {config.eventTitle}
          </h1>
          <p className="text-sm sm:text-lg text-slate-300 font-sans font-medium">
            {config.subtitle}
          </p>
        </div>

        {/* FEATURED EXPERIENCE PILLS */}
        <div className="flex items-center justify-center flex-wrap gap-3 pt-2 font-sans">
          <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-sm font-bold text-white flex items-center gap-2 shadow-lg">
            <span className="text-base">👾</span> Games
          </div>
          <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-sm font-bold text-white flex items-center gap-2 shadow-lg">
            <span className="text-base">📷</span> Selfies
          </div>
          <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-sm font-bold text-white flex items-center gap-2 shadow-lg">
            <span className="text-base">🎁</span> Rewards
          </div>
          <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-sm font-bold text-white flex items-center gap-2 shadow-lg">
            <span className="text-base">🏆</span> Challenges
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------- */}
      {/* CENTER INTERACTIVE CUE */}
      {/* ---------------------------------------------------- */}
      <main className="my-auto py-8 flex flex-col items-center justify-center text-center space-y-6 z-10">
        {/* DOWN ARROW CIRCLE */}
        <div className="w-16 h-16 rounded-full border-2 border-white/40 bg-white/5 backdrop-blur-sm flex items-center justify-center text-white animate-bounce shadow-2xl">
          <ArrowDown className="w-8 h-8" />
        </div>

        {/* WAITING MESSAGES */}
        <div className="space-y-2 max-w-xl">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {config.messageTitle}
          </h2>
          <p className="text-sm sm:text-base text-slate-400 font-sans">
            {config.messageSubtitle}
          </p>
        </div>
      </main>

      {/* ---------------------------------------------------- */}
      {/* BOTTOM SECTION: DIVIDER & SPONSOR LOGOS */}
      {/* ---------------------------------------------------- */}
      <footer className="pt-6 border-t border-white/20 z-10 text-center">
        {/* SPONSOR LOGOS ROW */}
        <div className="flex items-center justify-center gap-6 flex-wrap pb-4">
          {config.sponsorLogos && config.sponsorLogos.length > 0 ? (
            config.sponsorLogos.map((sp) => (
              <div
                key={sp.id}
                className="h-12 px-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-3 shadow-xl hover:bg-white/15 transition-all"
              >
                <img src={sp.logo} alt={sp.name} className="h-7 w-auto object-contain" />
                <span className="text-xs font-extrabold text-white font-sans tracking-tight">{sp.name}</span>
              </div>
            ))
          ) : (
            <span className="text-xs text-slate-500 italic font-sans">No sponsor logos added yet</span>
          )}
        </div>
      </footer>
    </div>
  );
}
