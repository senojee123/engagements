import React from 'react';

/**
 * TimerDisplay Component
 * Reusable timer HUD display supporting time format MM:SS and alert styles.
 */
export default function TimerDisplay({ seconds, timeLimit = null, primaryColor = '#0057FF' }) {
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `Time: ${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Remaining time if timeLimit is specified
  const isCountdown = typeof timeLimit === 'number' && timeLimit > 0;
  const remaining = isCountdown ? Math.max(0, timeLimit - seconds) : seconds;
  const isUrgent = isCountdown && remaining <= 10;

  return (
    <div
      className={`px-4 py-2 rounded-xl font-mono font-extrabold text-base tracking-wider border shadow-inner transition-colors ${
        isUrgent
          ? 'bg-rose-950/80 border-rose-500 text-rose-400 animate-pulse'
          : 'bg-slate-900/90 border-slate-700 text-white'
      }`}
      style={!isUrgent ? { borderColor: `${primaryColor}60` } : {}}
    >
      {isCountdown ? `Time Left: ${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}` : formatTime(seconds)}
    </div>
  );
}
