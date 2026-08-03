import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_SELFIES } from '../data/selfieWallData';
import { DEFAULT_BRAND_KITS } from '../data/brandEngineData';
import { fetchSelfiesApi, uploadSelfieApi, approveSelfieApi, rejectSelfieApi } from '../lib/api';

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
  const [selfies, setSelfies] = useState(() => {
    const saved = localStorage.getItem('fanforge_selfie_wall');
    const loaded = saved ? JSON.parse(saved) : INITIAL_SELFIES;
    return deduplicateSelfies(loaded);
  });

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

  // Active activity state for Stadium Screen (false = Idle Screen, true = Selfie Wall)
  const [isSelfieWallActive, setIsSelfieWallActiveState] = useState(() => {
    const saved = localStorage.getItem('fanforge_selfie_wall_active');
    return saved ? JSON.parse(saved) : false;
  });

  const setIsSelfieWallActive = (isActive) => {
    setIsSelfieWallActiveState(isActive);
    localStorage.setItem('fanforge_selfie_wall_active', JSON.stringify(isActive));
    try {
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

  // Sync state changes reading latest storage state & deduplicating IDs
  const updateSelfiesState = (updaterFn) => {
    setSelfies((prevSelfies) => {
      let currentStorageSelfies = prevSelfies;
      const saved = localStorage.getItem('fanforge_selfie_wall');
      if (saved) {
        try {
          currentStorageSelfies = JSON.parse(saved);
        } catch (e) {}
      }

      const rawNext = typeof updaterFn === 'function' ? updaterFn(currentStorageSelfies) : updaterFn;
      const nextSelfies = deduplicateSelfies(rawNext);

      localStorage.setItem('fanforge_selfie_wall', JSON.stringify(nextSelfies));

      try {
        const channel = new BroadcastChannel('fanforge_selfie_sync');
        channel.postMessage({ type: 'SELFIES_UPDATED', payload: nextSelfies });
        channel.close();
      } catch (e) {}

      return nextSelfies;
    });
  };

  // 1. Initial Fetch from Backend API
  useEffect(() => {
    let isCancelled = false;
    fetchSelfiesApi()
      .then((data) => {
        if (!isCancelled && Array.isArray(data) && data.length > 0) {
          setSelfies((prev) => deduplicateSelfies([...data, ...prev]));
        }
      })
      .catch(() => {});

    return () => {
      isCancelled = true;
    };
  }, []);

  // 2. Real-Time Listener (WebSocket & BroadcastChannel & Storage)
  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const wsUrl = apiBase.replace(/^http/, 'ws') + '/ws';
    let socket = null;

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
                if (Array.isArray(data)) setSelfies(deduplicateSelfies(data));
              })
              .catch(() => {});
          }
        } catch (e) {}
      };
    } catch (e) {}

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
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
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
      photoUrl: newPhotoData.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
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

  const resetAllSelfies = () => {
    updateSelfiesState([]);
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
