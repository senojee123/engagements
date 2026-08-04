import React, { createContext, useContext, useState, useEffect } from 'react';

const MemoryChallengeContext = createContext(null);

export const DEFAULT_LEADERBOARD = [
  { id: 1, rank: 1, name: 'Alex Morgan', score: 1850, time: '00:24s', badge: '🥇 Gold MVP', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', status: 'Perfect Score' },
  { id: 2, rank: 2, name: 'Marcus Vance', score: 1620, time: '00:27s', badge: '🥈 Silver Master', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', status: 'Fast Combo' },
  { id: 3, rank: 3, name: 'Sarah Jenkins', score: 1490, time: '00:31s', badge: '🥉 Bronze Champ', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80', status: 'Reward Claimed' },
  { id: 4, rank: 4, name: 'Jordan Taylor', score: 1350, time: '00:34s', badge: 'Top 5', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', status: '100% Match' },
  { id: 5, rank: 5, name: 'Chris Hemsworth', score: 1220, time: '00:38s', badge: 'Top 5', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80', status: 'Tile Speedster' },
  { id: 6, rank: 6, name: 'Emma Watson', score: 1180, time: '00:41s', badge: 'Participant', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80', status: 'Completed' },
];

export const DEFAULT_CUSTOMIZATION = {
  headline: 'Scan to Play Memory Challenge!',
  description:
    'Test your memory on the big screen! Scan the QR code on your mobile phone to flip & match sponsor tiles, earn instant rewards, and climb the stadium leaderboard!',
  leaderboardTitle: 'Stadium Memory Leaderboard',
  venueName: 'Metropolis Arena Stadium Broadcast',
  badgeText: 'LIVE ARENA DISPLAY',
  logoUrl: '',
  logoText: 'Memory Challenge',
};

export const MemoryChallengeProvider = ({ children }) => {
  const [isChallengeActive, setIsChallengeActive] = useState(() => {
    const saved = localStorage.getItem('fanforge_memory_challenge_active');
    return saved ? JSON.parse(saved) : false;
  });

  const [leaderboard, setLeaderboard] = useState(DEFAULT_LEADERBOARD);

  const [customization, setCustomizationState] = useState(() => {
    const saved = localStorage.getItem('fanforge_memory_customization');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_CUSTOMIZATION;
  });

  const [activeBrand, setActiveBrand] = useState({
    name: 'FanForge Stadium',
    primaryColor: '#4f46e5',
    secondaryColor: '#ffffff',
    gradientBg: 'from-slate-950 via-indigo-950 to-slate-950',
    tagline: 'Interactive Stadium Memory Experience',
    themeBadge: 'LIVE MATCHDAY MODE',
  });

  // Cross-tab Synchronization Listener
  useEffect(() => {
    const syncStateFromStorage = () => {
      const savedActive = localStorage.getItem('fanforge_memory_challenge_active');
      if (savedActive !== null) {
        setIsChallengeActive(JSON.parse(savedActive));
      }

      const savedCustom = localStorage.getItem('fanforge_memory_customization');
      if (savedCustom) {
        try {
          setCustomizationState(JSON.parse(savedCustom));
        } catch (e) {}
      }
    };

    window.addEventListener('storage', syncStateFromStorage);
    return () => window.removeEventListener('storage', syncStateFromStorage);
  }, []);

  const launchChallenge = () => {
    setIsChallengeActive(true);
    localStorage.setItem('fanforge_memory_challenge_active', JSON.stringify(true));
    window.dispatchEvent(new Event('storage'));
  };

  const stopChallenge = () => {
    setIsChallengeActive(false);
    localStorage.setItem('fanforge_memory_challenge_active', JSON.stringify(false));
    window.dispatchEvent(new Event('storage'));
  };

  const setCustomization = (newCustomization) => {
    const updated =
      typeof newCustomization === 'function' ? newCustomization(customization) : newCustomization;
    setCustomizationState(updated);
    localStorage.setItem('fanforge_memory_customization', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const updateCustomization = (field, value) => {
    setCustomizationState((prev) => {
      const updated = { ...prev, [field]: value };
      localStorage.setItem('fanforge_memory_customization', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
      return updated;
    });
  };

  return (
    <MemoryChallengeContext.Provider
      value={{
        isChallengeActive,
        launchChallenge,
        stopChallenge,
        leaderboard,
        setLeaderboard,
        customization,
        setCustomization,
        updateCustomization,
        activeBrand,
        setActiveBrand,
      }}
    >
      {children}
    </MemoryChallengeContext.Provider>
  );
};

export const useMemoryChallenge = () => {
  const context = useContext(MemoryChallengeContext);
  if (!context) {
    return {
      isChallengeActive: false,
      launchChallenge: () => {},
      stopChallenge: () => {},
      leaderboard: DEFAULT_LEADERBOARD,
      customization: DEFAULT_CUSTOMIZATION,
      setCustomization: () => {},
      updateCustomization: () => {},
      activeBrand: {
        name: 'FanForge Stadium',
        primaryColor: '#4f46e5',
        secondaryColor: '#ffffff',
        gradientBg: 'from-slate-950 via-indigo-950 to-slate-950',
        tagline: 'Interactive Stadium Memory Experience',
        themeBadge: 'LIVE MATCHDAY MODE',
      },
      setActiveBrand: () => {},
    };
  }
  return context;
};
