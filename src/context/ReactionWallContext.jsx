import React, { createContext, useContext, useState, useEffect } from 'react';
import { emitReactionApi, fetchReactionsApi, clearReactionsApi, updateScreenStatusApi } from '../lib/api';
import { DEFAULT_BRAND_KITS } from '../data/brandEngineData';

const ReactionWallContext = createContext(null);

const DEFAULT_FRAME_CONFIG = {
  networkTitle: 'STADIUM FAN NETWORK',
  headerTagline: '🔥 LIVE FAN ENERGY',
  footerText: 'FAN REACTION STREAM • LIVE STADIUM FAN FEED',
  poweredByText: 'POWERED BY FanForge Engagement OS ⚡',
  qrTitle: 'SCAN & SEND REACTIONS',
  qrSubtitle: 'Point your phone camera at the QR code to burst emojis live on the big screen!',
  logoUrl: '',
};

export const ReactionWallProvider = ({ children }) => {
  const [activeReactions, setActiveReactions] = useState([]);
  const [totalCount, setTotalCount] = useState(() => {
    const saved = localStorage.getItem('fanforge_reaction_total_count');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [isReactionWallActive, setIsReactionWallActiveState] = useState(() => {
    const saved = localStorage.getItem('fanforge_reaction_wall_active');
    return saved ? JSON.parse(saved) : false;
  });

  const [frameConfig, setFrameConfigState] = useState(() => {
    const saved = localStorage.getItem('fanforge_reaction_frame_config');
    return saved ? JSON.parse(saved) : DEFAULT_FRAME_CONFIG;
  });

  const updateFrameConfig = (newConfig) => {
    const updated = { ...frameConfig, ...newConfig };
    setFrameConfigState(updated);
    localStorage.setItem('fanforge_reaction_frame_config', JSON.stringify(updated));
    try {
      const channel = new BroadcastChannel('fanforge_reaction_sync');
      channel.postMessage({ type: 'FRAME_CONFIG_UPDATED', payload: updated });
      channel.close();
    } catch (e) {}
  };

  const [activeBrand, setActiveBrandState] = useState(() => {
    const saved = localStorage.getItem('fanforge_active_brand');
    return saved ? JSON.parse(saved) : DEFAULT_BRAND_KITS[0];
  });

  const setActiveBrand = (brand) => {
    setActiveBrandState(brand);
    localStorage.setItem('fanforge_active_brand', JSON.stringify(brand));
    try {
      const channel = new BroadcastChannel('fanforge_reaction_sync');
      channel.postMessage({ type: 'BRAND_UPDATED', payload: brand });
      channel.close();
    } catch (e) {}
  };

  // Helper to add floating emoji item to active list
  const addFloatingEmoji = (emojiObj) => {
    const id = emojiObj.id || `react-${Date.now()}-${Math.random()}`;
    const xOffset = emojiObj.xOffset !== undefined ? emojiObj.xOffset : Math.random() * 80 + 10;
    const fanName = emojiObj.fanName || 'Stadium Fan';

    const newItem = {
      id,
      emoji: emojiObj.emoji,
      fanName,
      xOffset,
      createdAt: Date.now(),
    };

    setActiveReactions((prev) => [...prev.slice(-40), newItem]);
    setTotalCount((prev) => {
      const next = prev + 1;
      localStorage.setItem('fanforge_reaction_total_count', next.toString());
      return next;
    });

    // Auto-prune floating emoji particle after 4 seconds
    setTimeout(() => {
      setActiveReactions((prev) => prev.filter((item) => item.id !== id));
    }, 4000);
  };

  // WebSocket & BroadcastChannel Listener
  useEffect(() => {
    const wsUrl = (import.meta.env.VITE_API_URL || 'https://engagements-production.up.railway.app').replace(/^http/, 'ws') + '/ws';

    let socket = null;

    try {
      socket = new WebSocket(wsUrl);
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'REACTION_EMITTED' && message.reaction) {
            addFloatingEmoji(message.reaction);
          } else if (message.type === 'REACTION_STATUS_UPDATED') {
            setIsReactionWallActiveState(message.isActive);
          } else if (message.type === 'REACTION_CLEARED') {
            setActiveReactions([]);
          }
        } catch (e) {}
      };
    } catch (e) {}

    let channel = null;
    try {
      channel = new BroadcastChannel('fanforge_reaction_sync');
      channel.onmessage = (event) => {
        const { type, reaction, isActive, payload } = event.data;
        if (type === 'REACTION_EMITTED' && reaction) {
          addFloatingEmoji(reaction);
        } else if (type === 'REACTION_STATUS_TOGGLED') {
          setIsReactionWallActiveState(isActive);
        } else if (type === 'REACTION_CLEARED') {
          setActiveReactions([]);
        } else if (type === 'TOTAL_COUNT_RESET') {
          setTotalCount(0);
          localStorage.setItem('fanforge_reaction_total_count', '0');
        } else if (type === 'FRAME_CONFIG_UPDATED' && payload) {
          setFrameConfigState(payload);
        } else if (type === 'BRAND_UPDATED' && payload) {
          setActiveBrandState(payload);
        }
      };
    } catch (e) {}

    return () => {
      if (socket) socket.close();
      if (channel) channel.close();
    };
  }, []);

  const broadcastLocally = (payload) => {
    try {
      const channel = new BroadcastChannel('fanforge_reaction_sync');
      channel.postMessage(payload);
      channel.close();
    } catch (e) {}
  };

  const emitReaction = async (emoji, fanName = 'Stadium Fan') => {
    // Optimistic local add
    const localItem = {
      id: `react-opt-${Date.now()}-${Math.random()}`,
      emoji,
      fanName,
      xOffset: Math.random() * 80 + 10,
    };
    addFloatingEmoji(localItem);
    broadcastLocally({ type: 'REACTION_EMITTED', reaction: localItem });

    try {
      await emitReactionApi(emoji, fanName);
    } catch (err) {
      console.warn('Backend reaction emit failed, using optimistic particle:', err);
    }
  };

  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('fanforge_reaction_wall_active');
      if (saved !== null) {
        setIsReactionWallActiveState(JSON.parse(saved));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const launchReactionWall = () => {
    setIsReactionWallActiveState(true);
    localStorage.setItem('fanforge_reaction_wall_active', JSON.stringify(true));
    window.dispatchEvent(new Event('storage'));
    try {
      updateScreenStatusApi({ isSelfieWallActive: false, activeMode: 'reaction-wall' }).catch(() => {});
    } catch (e) {}
    broadcastLocally({ type: 'REACTION_STATUS_TOGGLED', isActive: true });
  };

  const stopReactionWall = () => {
    setIsReactionWallActiveState(false);
    localStorage.setItem('fanforge_reaction_wall_active', JSON.stringify(false));
    window.dispatchEvent(new Event('storage'));
    try {
      updateScreenStatusApi({ isSelfieWallActive: false, activeMode: 'idle' }).catch(() => {});
    } catch (e) {}
    broadcastLocally({ type: 'REACTION_STATUS_TOGGLED', isActive: false });
  };

  const clearReactions = async () => {
    setActiveReactions([]);
    broadcastLocally({ type: 'REACTION_CLEARED' });
    try {
      await clearReactionsApi();
    } catch (e) {}
  };

  const resetTotalCount = () => {
    setTotalCount(0);
    localStorage.setItem('fanforge_reaction_total_count', '0');
    broadcastLocally({ type: 'TOTAL_COUNT_RESET' });
  };

  return (
    <ReactionWallContext.Provider
      value={{
        activeReactions,
        totalCount,
        isReactionWallActive,
        activeBrand,
        setActiveBrand,
        frameConfig,
        updateFrameConfig,
        emitReaction,
        launchReactionWall,
        stopReactionWall,
        clearReactions,
        resetTotalCount,
      }}
    >
      {children}
    </ReactionWallContext.Provider>
  );
};

export const useReactionWall = () => {
  const context = useContext(ReactionWallContext);
  if (!context) {
    return {
      activeReactions: [],
      totalCount: 0,
      isReactionWallActive: false,
      activeBrand: DEFAULT_BRAND_KITS[0],
      frameConfig: {},
      updateFrameConfig: () => {},
      setActiveBrand: () => {},
      setIsReactionWallActive: () => {},
      launchReactionWall: () => {},
      stopReactionWall: () => {},
      emitReaction: async () => {},
      clearReactions: () => {},
      resetTotalCount: () => {},
    };
  }
  return context;
};
