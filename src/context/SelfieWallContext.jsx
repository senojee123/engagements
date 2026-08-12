import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_SELFIES } from '../data/selfieWallData';
import { DEFAULT_BRAND_KITS } from '../data/brandEngineData';
import { fetchSelfiesApi, uploadSelfieApi, approveSelfieApi, rejectSelfieApi, deleteSelfieApi, clearSelfiesApi, updateScreenStatusApi } from '../lib/api';


export const DEFAULT_FRAME_CONFIG = {
  style: 'dialog-5g-ultra',
  tagline: 'I Was At The 5G Experience Zone',
  borderColor: '#ef4444',
  glowColor: 'rgba(239,68,68,0.85)',
  icon: 'zap',
  animation: 'pulse',
  borderWidth: '4px',
  bgType: 'black',
  overlayImage: '/assets/dialog_5g_frame.jpg',
};

export const PRESET_FRAME_CONFIGS = {
  'stadium-glow': {
    style: 'stadium-glow',
    tagline: 'JUST APPROVED ON STADIUM SCREEN',
    borderColor: '#22d3ee',
    glowColor: 'rgba(34,211,238,0.75)',
    icon: 'sparkles',
    animation: 'pulse',
    borderWidth: '4px',
    bgType: 'black',
  },
  'gold-vip': {
    style: 'gold-vip',
    tagline: '⭐ VIP FAN OF THE MATCH ⭐',
    borderColor: '#fbbf24',
    glowColor: 'rgba(251,191,36,0.85)',
    icon: 'trophy',
    animation: 'bounce',
    borderWidth: '4px',
    bgType: 'black',
  },
  'brand-signature': {
    style: 'brand-signature',
    tagline: '',
    borderColor: '#6366f1',
    glowColor: 'rgba(99,102,241,0.75)',
    icon: 'award',
    animation: 'pulse',
    borderWidth: '4px',
    bgType: 'black',
  },
  'minimal-dark': {
    style: 'minimal-dark',
    tagline: 'LIVE FAN BROADCAST',
    borderColor: '#cbd5e1',
    glowColor: 'rgba(255,255,255,0.25)',
    icon: 'shield',
    animation: 'none',
    borderWidth: '2px',
    bgType: 'glass',
  },
  'cyber-pulse': {
    style: 'cyber-pulse',
    tagline: 'HYPER STADIUM ACTIVATION',
    borderColor: '#34d399',
    glowColor: 'rgba(52,211,153,0.85)',
    icon: 'zap',
    animation: 'pulse',
    borderWidth: '4px',
    bgType: 'black',
  },
  'dialog-5g-ultra': {
    style: 'dialog-5g-ultra',
    tagline: 'I Was At The 5G Experience Zone',
    borderColor: '#ef4444',
    glowColor: 'rgba(239,68,68,0.85)',
    icon: 'zap',
    animation: 'pulse',
    borderWidth: '4px',
    bgType: 'black',
    overlayImage: '/assets/dialog_5g_frame.jpg',
  },
};

const SelfieWallContext = createContext(null);


const deduplicateSelfies = (list) => {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  return list.filter((item) => {
    if (!item || !item.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

export const SelfieWallProvider = ({ children }) => {
  const [selfies, setSelfies] = useState([]);


  const [activeBrand, setActiveBrandState] = useState(() => {
    const saved = localStorage.getItem('fanforge_active_brand');
    return saved ? JSON.parse(saved) : DEFAULT_BRAND_KITS[0]; // Coca-Cola
  });

  const setActiveBrand = (brand) => {
    setActiveBrandState(brand);
    localStorage.setItem('fanforge_active_brand', JSON.stringify(brand));
    try {
      const channel = new BroadcastChannel('fanforge_selfie_sync');
      channel.postMessage({ type: 'BRAND_UPDATED', payload: brand });
      channel.close();
    } catch (e) {}
  };

  const [displayMode, setDisplayMode] = useState('grid'); // 'grid' | 'carousel' | 'highlight'
  const [carouselSpeed, setCarouselSpeed] = useState(4); // seconds per slide
  const [aiAutoApprove, setAiAutoApprove] = useState(false); // Default: Strict Organizer Moderation
  const [aiSensitivity, setAiSensitivity] = useState(80); // Safety threshold (80+)
  const [isLiveStreamConnected, setIsLiveStreamConnected] = useState(true);

  // Spotlight Frame Customizer State
  const [frameConfig, setFrameConfigState] = useState(() => {
    const saved = localStorage.getItem('fanforge_selfie_frame_config');
    return saved ? { ...DEFAULT_FRAME_CONFIG, ...JSON.parse(saved) } : DEFAULT_FRAME_CONFIG;
  });

  const updateFrameConfig = (updates) => {
    setFrameConfigState((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem('fanforge_selfie_frame_config', JSON.stringify(next));
      try {
        const channel = new BroadcastChannel('fanforge_selfie_sync');
        channel.postMessage({ type: 'FRAME_CONFIG_UPDATED', payload: next });
        channel.close();
      } catch (e) {}
      return next;
    });
  };

  const frameStyle = frameConfig.style;
  const frameTagline = frameConfig.tagline;

  const setFrameStyle = (style) => {
    const preset = PRESET_FRAME_CONFIGS[style] || DEFAULT_FRAME_CONFIG;
    updateFrameConfig({ ...preset, style });
  };

  const setFrameTagline = (tagline) => {
    updateFrameConfig({ tagline });
  };

  // Active activity state for Stadium Screen (false = Idle Screen, true = Selfie Wall)
  const [isSelfieWallActive, setIsSelfieWallActiveState] = useState(() => {
    const saved = localStorage.getItem('fanforge_selfie_wall_active');
    return saved ? JSON.parse(saved) : false;
  });

  const setIsSelfieWallActive = (isActive) => {
    setIsSelfieWallActiveState(isActive);
    localStorage.setItem('fanforge_selfie_wall_active', JSON.stringify(isActive));
    window.dispatchEvent(new Event('storage'));
    try {
      updateScreenStatusApi({
        isSelfieWallActive: isActive,
        activeMode: isActive ? 'selfie-wall' : 'idle',
      }).catch(() => {});
      const channel = new BroadcastChannel('fanforge_selfie_sync');
      channel.postMessage({ type: 'STATUS_UPDATED', isSelfieWallActive: isActive });
      channel.close();
    } catch (e) {}
  };

  const launchSelfieWall = () => {
    setIsSelfieWallActive(true);
  };

  const stopSelfieWall = () => {
    setIsSelfieWallActive(false);
  };

  // Sync state changes using API as single source of truth
  const updateSelfiesState = (updaterFn) => {
    setSelfies((prevSelfies) => {
      const rawNext = typeof updaterFn === 'function' ? updaterFn(prevSelfies) : updaterFn;
      return deduplicateSelfies(rawNext);
    });
  };

  // 1. Initial & Background Sync (Fast 3-second Auto-Polling)
  useEffect(() => {
    let isCancelled = false;
    try {
      localStorage.removeItem('fanforge_selfie_wall');
    } catch (e) {}

    const loadSelfies = () => {
      fetchSelfiesApi()
        .then((data) => {
          if (!isCancelled && Array.isArray(data)) {
            setSelfies(deduplicateSelfies(data));
          }
        })
        .catch(() => {});
    };

    loadSelfies();
    const interval = setInterval(loadSelfies, 3000); // 3-second auto-poll guarantee

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, []);

  // 2. Real-Time Listener (WebSocket + Auto-Reconnect & Storage)
  useEffect(() => {
    // Always connect to the live backend (single source of truth for fan zone + dashboard)
    const wsUrl = (import.meta.env.VITE_API_URL || 'https://engagements-six.vercel.app').replace(/^http/, 'ws') + '/ws';
    let socket = null;
    let reconnectTimer = null;
    let isComponentMounted = true;

    const connectWebSocket = () => {
      try {
        socket = new WebSocket(wsUrl);

        socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === 'SELFIE_SUBMITTED' && message.payload) {
              setSelfies((prev) => deduplicateSelfies([message.payload, ...prev]));
            } else if (message.type === 'SELFIE_APPROVED' && message.payload) {
              setSelfies((prev) =>
                prev.map((s) => (s.id === message.payload.id ? { ...s, ...message.payload } : s))
              );
            } else if (message.type === 'SELFIE_REJECTED' && message.payload) {
              setSelfies((prev) =>
                prev.map((s) => (s.id === message.payload.id ? { ...s, ...message.payload } : s))
              );
            } else if (message.type === 'SELFIES_UPDATED') {
              fetchSelfiesApi()
                .then((data) => {
                  if (Array.isArray(data) && isComponentMounted) setSelfies(deduplicateSelfies(data));
                })
                .catch(() => {});
            }
          } catch (e) {}
        };

        socket.onclose = () => {
          if (isComponentMounted) {
            reconnectTimer = setTimeout(connectWebSocket, 2000);
          }
        };
      } catch (e) {}
    };

    connectWebSocket();

    // BroadcastChannel Listener
    let channel;
    try {
      channel = new BroadcastChannel('fanforge_selfie_sync');
      channel.onmessage = (event) => {
        if (event.data) {
          if (event.data.type === 'SELFIES_UPDATED') {
            setSelfies(deduplicateSelfies(event.data.payload));
          } else if (event.data.type === 'STATUS_UPDATED') {
            setIsSelfieWallActiveState(event.data.isSelfieWallActive);
          } else if (event.data.type === 'BRAND_UPDATED') {
            setActiveBrandState(event.data.payload);
          } else if (event.data.type === 'FRAME_CONFIG_UPDATED') {
            if (event.data.payload) setFrameConfigState(event.data.payload);
          }
        }
      };
    } catch (e) {}

    // Window Storage Listener
    const handleStorageChange = (e) => {
      if (e.key === 'fanforge_selfie_wall' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setSelfies(deduplicateSelfies(parsed));
        } catch (err) {}
      }
      if (e.key === 'fanforge_selfie_wall_active' && e.newValue !== null) {
        try {
          setIsSelfieWallActiveState(JSON.parse(e.newValue));
        } catch (err) {}
      }
      if (e.key === 'fanforge_active_brand' && e.newValue) {
        try {
          setActiveBrandState(JSON.parse(e.newValue));
        } catch (err) {}
      }
      if (e.key === 'fanforge_selfie_frame_config' && e.newValue) {
        try {
          setFrameConfigState(JSON.parse(e.newValue));
        } catch (err) {}
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      isComponentMounted = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (socket) socket.close();
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Derived filtered lists (sorted by most recently approved/timestamp)
  const approvedSelfies = selfies
    .filter((s) => s.status === 'approved')
    .sort((a, b) => (b.approvedAt || b.timestamp || 0) - (a.approvedAt || a.timestamp || 0));

  const pendingSelfies = selfies.filter((s) => s.status === 'pending');
  const flaggedSelfies = selfies.filter((s) => s.status === 'flagged');
  const rejectedSelfies = selfies.filter((s) => s.status === 'rejected');
  const featuredSelfies = selfies.filter((s) => s.isFeatured && s.status === 'approved');

  // Simulated AI Image Analysis Engine
  const analyzeImageWithAi = (uploaderName, caption) => {
    const isSuspicious = uploaderName.toLowerCase().includes('guest') || caption.toLowerCase().includes('bad');
    const safetyScore = isSuspicious ? Math.floor(Math.random() * 40) + 20 : Math.floor(Math.random() * 20) + 80;

    let riskLevel = 'Low Risk';
    let flags = [];

    if (safetyScore < 40) {
      riskLevel = 'High Risk';
      flags = ['Inappropriate Content', 'Low Safety Confidence'];
    } else if (safetyScore < aiSensitivity) {
      riskLevel = 'Medium Risk';
      flags = ['Obscured Face', 'Brand Safety Flag'];
    }

    return { safetyScore, riskLevel, flags };
  };

  // Upload Action (Fan Phone Upload -> Strictly Pending Queue, reading latest storage + Backend API)
  const uploadSelfie = (newPhotoData) => {
    const aiResult = analyzeImageWithAi(newPhotoData.uploaderName || 'Fan Guest', newPhotoData.caption || '');

    const tempId = `sf-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const createdSelfie = {
      id: tempId,
      eventId: 'event-01',
      uploaderName: newPhotoData.uploaderName || 'Stadium Fan',
      photoUrl: newPhotoData.photoUrl || '',

      uploadTime: 'Just now',
      timestamp: Date.now(),
      approvedAt: Date.now(),
      status: 'pending', // Strictly Pending Queue
      aiSafetyScore: aiResult.safetyScore,
      aiRiskLevel: aiResult.riskLevel,
      aiFlags: aiResult.flags,
      isFeatured: false,
      brandId: activeBrand.id,
      caption: newPhotoData.caption || 'Live from Metropolis Arena!',
    };

    updateSelfiesState((latest) => [createdSelfie, ...latest]);

    // Send to Cloud Backend API (so Dashboard picks it up over WebSocket)
    uploadSelfieApi({
      uploaderName: createdSelfie.uploaderName,
      photoUrl: createdSelfie.photoUrl,
      caption: createdSelfie.caption,
      brandId: createdSelfie.brandId,
    })
      .then((backendSelfie) => {
        if (backendSelfie) {
          setSelfies((prev) =>
            prev.map((s) => (s.id === tempId ? { ...s, ...backendSelfie } : s))
          );
        }
      })
      .catch(() => {});

    return createdSelfie;
  };

  // Moderation Actions
  const approveSelfie = (id) => {
    const now = Date.now();
    updateSelfiesState((latest) =>
      latest.map((s) => (s.id === id ? { ...s, status: 'approved', approvedAt: now } : s))
    );
    approveSelfieApi(id).catch(() => {});
  };

  const rejectSelfie = (id) => {
    updateSelfiesState((latest) => latest.map((s) => (s.id === id ? { ...s, status: 'rejected' } : s)));
    rejectSelfieApi(id).catch(() => {});
  };

  const toggleFeatured = (id) => {
    updateSelfiesState((latest) => latest.map((s) => (s.id === id ? { ...s, isFeatured: !s.isFeatured } : s)));
  };

  const deleteSelfie = (id) => {
    updateSelfiesState((latest) => latest.filter((s) => s.id !== id));
    deleteSelfieApi(id).catch(() => {});
  };

  const resetAllSelfies = () => {
    updateSelfiesState([]);
    clearSelfiesApi().catch(() => {});
  };

  const bulkApprove = (ids) => {
    const now = Date.now();
    updateSelfiesState((latest) =>
      latest.map((s) => (ids.includes(s.id) ? { ...s, status: 'approved', approvedAt: now } : s))
    );
  };

  const bulkReject = (ids) => {
    updateSelfiesState((latest) => latest.map((s) => (ids.includes(s.id) ? { ...s, status: 'rejected' } : s)));
  };

  return (
    <SelfieWallContext.Provider
      value={{
        selfies,
        approvedSelfies,
        pendingSelfies,
        flaggedSelfies,
        rejectedSelfies,
        featuredSelfies,
        activeBrand,
        setActiveBrand,
        frameConfig,
        updateFrameConfig,
        frameStyle,
        setFrameStyle,
        frameTagline,
        setFrameTagline,
        displayMode,
        setDisplayMode,
        carouselSpeed,
        setCarouselSpeed,
        aiAutoApprove,
        setAiAutoApprove,
        aiSensitivity,
        setAiSensitivity,
        isLiveStreamConnected,
        setIsLiveStreamConnected,
        isSelfieWallActive,
        setIsSelfieWallActive,
        launchSelfieWall,
        stopSelfieWall,
        uploadSelfie,
        approveSelfie,
        rejectSelfie,
        toggleFeatured,
        deleteSelfie,
        bulkApprove,
        bulkReject,
        resetAllSelfies,
      }}
    >
      {children}
    </SelfieWallContext.Provider>
  );
};

export const useSelfieWall = () => {
  const context = useContext(SelfieWallContext);
  if (!context) {
    return {
      selfies: [],
      approvedSelfies: INITIAL_SELFIES,
      pendingSelfies: [],
      flaggedSelfies: [],
      activeBrand: DEFAULT_BRAND_KITS[0],
      frameConfig: DEFAULT_FRAME_CONFIG,
      updateFrameConfig: () => {},
      frameStyle: 'stadium-glow',
      setFrameStyle: () => {},
      frameTagline: '',
      setFrameTagline: () => {},
      displayMode: 'grid',
      carouselSpeed: 4,
      aiAutoApprove: false,
      aiSensitivity: 80,
      isLiveStreamConnected: true,
      isSelfieWallActive: false,
      setIsSelfieWallActive: () => {},
      launchSelfieWall: () => {},
      stopSelfieWall: () => {},
      uploadSelfie: () => {},
      approveSelfie: () => {},
      rejectSelfie: () => {},
      toggleFeatured: () => {},
      deleteSelfie: () => {},
      bulkApprove: () => {},
      bulkReject: () => {},
      resetAllSelfies: () => {},
    };
  }
  return context;
};
