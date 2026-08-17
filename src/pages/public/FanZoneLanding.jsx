import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Vote,
  Radio,
  CheckCircle2,
  Sparkles,
  UploadCloud,
  X,
  RefreshCcw,
  Zap,
  Check,
  ShieldCheck,
  SwitchCamera,
  Smile,
  Brain,
  Trophy,
} from 'lucide-react';
import { useSelfieWall, SelfieWallProvider } from '../../context/SelfieWallContext';
import { useLivePoll, LivePollProvider } from '../../context/LivePollContext';
import { useReactionWall, ReactionWallProvider } from '../../context/ReactionWallContext';
import { useMemoryChallenge, MemoryChallengeProvider } from '../../context/MemoryChallengeContext';
import { useToast } from '../../context/ToastContext';
import { fetchScreenStatusApi, fetchInstanceApi, fetchGameConfigApi, fetchInstancesApi } from '../../lib/api';

function FanZoneLandingContent({ forcedAppId, instanceId } = {}) {
  const { uploadSelfie, activeBrand, selfies, isSelfieWallActive } = useSelfieWall();
  const { activePoll, submitVote, isPollActive } = useLivePoll();
  const { emitReaction, isReactionWallActive } = useReactionWall();
  const { isChallengeActive: isMemoryChallengeActive } = useMemoryChallenge();
  const toast = useToast();

  const [remoteActiveMode, setRemoteActiveMode] = useState(null);
  const [approvedInstances, setApprovedInstances] = useState([]);
  const [isInstancesLoading, setIsInstancesLoading] = useState(true);
  const [activeBrandName, setActiveBrandName] = useState('');

  const loadInstances = (showLoading = false) => {
    const searchParams = new URLSearchParams(window.location.search);
    const brandParam = searchParams.get('brandId') || searchParams.get('brand') || searchParams.get('userId');
    const targetBrand = brandParam || undefined;

    const queryParams = {};
    if (targetBrand) {
      queryParams.brandId = targetBrand;
    }

    // 1. Read from cache instantly (SWR) to load the UI in 0ms!
    try {
      const cached = localStorage.getItem('fanforge_instances_cache');
      if (cached) {
        let list = JSON.parse(cached) || [];
        if (targetBrand) {
          list = list.filter(
            (i) =>
              i.userId === targetBrand ||
              i.brandId === targetBrand ||
              i.userId === 'default-user' ||
              i.brandId === 'default-brand' ||
              (i.brandName || '').toLowerCase().includes(targetBrand.toLowerCase())
          );
        }
        
        // Filter unique instances
        const uniqueAppMap = new Map();
        list.forEach((inst) => {
          const key = inst.instanceId || inst.id;
          if (key) {
            uniqueAppMap.set(key, inst);
          }
        });
        const deduplicatedList = Array.from(uniqueAppMap.values());
        
        if (deduplicatedList.length > 0) {
          setApprovedInstances(deduplicatedList);
          if (deduplicatedList[0].brandName) {
            setActiveBrandName(deduplicatedList[0].brandName);
          }
          // Hide loading spinner immediately since we have cached data to show!
          setIsInstancesLoading(false);
          showLoading = false; 
        }
      }
    } catch (e) {
      console.warn('Failed to load cached instances in landing:', e);
    }

    if (showLoading) setIsInstancesLoading(true);

    fetchInstancesApi(queryParams)
      .then((data) => {
        const list = data || [];
        const uniqueAppMap = new Map();
        list.forEach((inst) => {
          const key = inst.instanceId || inst.id;
          if (key) {
            uniqueAppMap.set(key, inst);
          }
        });
        const deduplicatedList = Array.from(uniqueAppMap.values());

        setApprovedInstances(deduplicatedList);
        if (deduplicatedList.length > 0 && deduplicatedList[0].brandName) {
          setActiveBrandName(deduplicatedList[0].brandName);
        }
      })
      .catch(() => {
        if (approvedInstances.length === 0) {
          setApprovedInstances([]);
        }
      })
      .finally(() => setIsInstancesLoading(false));
  };

  useEffect(() => {
    loadInstances(true);

    // Poll for new/deleted instances every 2 seconds
    const interval = setInterval(() => {
      loadInstances(false);
    }, 2000);

    const handleSync = () => loadInstances(false);

    window.addEventListener('focus', handleSync);
    window.addEventListener('storage', handleSync);
    window.addEventListener('fanforge_instances_updated', handleSync);

    let channel;
    try {
      channel = new BroadcastChannel('fanforge_instances_sync');
      channel.onmessage = (event) => {
        if (event.data?.type === 'INSTANCES_UPDATED') {
          loadInstances(false);
        }
      };
    } catch (e) {}

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleSync);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('fanforge_instances_updated', handleSync);
      if (channel) channel.close();
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const syncStatus = () => {
      fetchScreenStatusApi()
        .then((data) => {
          if (!isCancelled && data && data.activeMode) {
            setRemoteActiveMode(data.activeMode);
          }
        })
        .catch(() => { });
    };

    syncStatus();
    const timer = setInterval(syncStatus, 2000);

    const wsUrl = (import.meta.env.VITE_API_URL || 'https://engagements-six.vercel.app').replace(/^http/, 'ws') + '/ws';
    let socket = null;
    try {
      socket = new WebSocket(wsUrl);
      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'STATUS_UPDATED' && msg.activeMode) {
            setRemoteActiveMode(msg.activeMode);
          }
        } catch (e) { }
      };
    } catch (e) { }

    return () => {
      isCancelled = true;
      clearInterval(timer);
      if (socket) socket.close();
    };
  }, []);

  const activePollComputed = isPollActive || remoteActiveMode === 'live-poll';
  const activeReactionComputed = isReactionWallActive || remoteActiveMode === 'reaction-wall';
  const activeSelfieComputed = isSelfieWallActive || remoteActiveMode === 'selfie-wall';
  const activeMemoryComputed = isMemoryChallengeActive || remoteActiveMode === 'memory-challenge';

  // Memory Challenge Game State
  const DEFAULT_EMOJI_PAIRS = ['⚽', '🏆', '🥤', '🎯', '🔥', '⚡'];
  const [instanceTiles, setInstanceTiles] = useState(null);
  const EMOJI_PAIRS = instanceTiles && instanceTiles.length >= 2 ? instanceTiles : DEFAULT_EMOJI_PAIRS;
  const [memoryCards, setMemoryCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [moveCount, setMoveCount] = useState(0);

  const resetMemoryGame = () => {
    const shuffled = [...EMOJI_PAIRS, ...EMOJI_PAIRS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({ id: index, emoji }));
    setMemoryCards(shuffled);
    setFlippedCards([]);
    setMatchedPairs([]);
    setMoveCount(0);
  };

  const handleCardClick = (index) => {
    if (flippedCards.length === 2 || flippedCards.includes(index) || matchedPairs.includes(memoryCards[index]?.emoji)) {
      return;
    }

    const nextFlipped = [...flippedCards, index];
    setFlippedCards(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoveCount((m) => m + 1);
      const [firstIdx, secondIdx] = nextFlipped;
      if (memoryCards[firstIdx]?.emoji === memoryCards[secondIdx]?.emoji) {
        const matchedEmoji = memoryCards[firstIdx]?.emoji;
        setMatchedPairs((prev) => [...prev, matchedEmoji]);
        setFlippedCards([]);
        toast.success(`Match found! ${matchedEmoji}`);
      } else {
        setTimeout(() => {
          setFlippedCards([]);
        }, 800);
      }
    }
  };

  const DEFAULT_FANZONE_SETTINGS = {
    headerTitle: 'FAN ZONE',
    headerSubtitle: '',
    headerLogo: '',
    poweredByText: '',
    poweredByLogo: '',
  };

  const [fanZoneSettings, setFanZoneSettings] = useState(() => {
    const saved = localStorage.getItem('fanforge_fanzone_settings');
    return saved ? { ...DEFAULT_FANZONE_SETTINGS, ...JSON.parse(saved) } : DEFAULT_FANZONE_SETTINGS;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('fanforge_fanzone_settings');
      if (saved) {
        setFanZoneSettings({ ...DEFAULT_FANZONE_SETTINGS, ...JSON.parse(saved) });
      }
    };

    let channel;
    try {
      channel = new BroadcastChannel('fanforge_fanzone_sync');
      channel.onmessage = (event) => {
        if (event.data?.type === 'FANZONE_SETTINGS_UPDATED') {
          setFanZoneSettings({ ...DEFAULT_FANZONE_SETTINGS, ...event.data.payload });
        }
      };
    } catch (e) { }

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (channel) channel.close();
    };
  }, []);

  const [activeModal, setActiveModal] = useState(null); // null | 'selfie-wall' | 'live-vote' | 'reaction-wall'

  // Resolve this URL's game config and open it directly, instead of showing the
  // generic multi-game lobby. Two cases:
  //  - instanceId present: this link is pinned to one specific historical
  //    version (immutable, for preview/rollback) — fetch that exact UUID.
  //  - instanceId absent but forcedAppId present: this is the STABLE embed
  //    link (the one that's already printed on a QR code / hosted in an
  //    iframe) — it must never change, so it always resolves to whatever the
  //    Brand most recently published, via the "current config" endpoint.
  useEffect(() => {
    if (!instanceId && !forcedAppId) return;
    let isCancelled = false;

    const load = instanceId
      ? fetchInstanceApi(instanceId).then((data) => data?.config)
      : fetchGameConfigApi(forcedAppId);

    load
      .then((config) => {
        if (isCancelled || !config) return;
        const tiles = config.tiles;
        if (Array.isArray(tiles) && tiles.length >= 2) {
          setInstanceTiles(tiles.map((t) => t.content).filter(Boolean));
        }
      })
      .catch(() => { });

    return () => {
      isCancelled = true;
    };
  }, [instanceId, forcedAppId]);

  useEffect(() => {
    if (activeModal === 'memory-challenge' && memoryCards.length === 0) {
      resetMemoryGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeModal, instanceTiles]);

  const [selfieStage, setSelfieStage] = useState('camera'); // 'camera' | 'preview' | 'sent'
  const [uploaderName, setUploaderName] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [submittedSelfieId, setSubmittedSelfieId] = useState(null);

  // Camera State
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [hasCameraError, setHasCameraError] = useState(false);

  // Live vote state
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);

  // Reaction state
  const [floatingEmojis, setFloatingEmojis] = useState([]);

  const startCameraStream = async () => {
    setHasCameraError(false);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not available');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } },
        audio: false,
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => { });
      }
    } catch (err) {
      console.warn('Camera access not granted or hardware unavailable:', err);
      setHasCameraError(true);
    }
  };

  const stopCameraStream = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  // Automatically start/stop camera stream when camera modal stage is open
  useEffect(() => {
    if (activeModal === 'selfie-wall' && selfieStage === 'camera') {
      startCameraStream();
    } else {
      stopCameraStream();
    }
    return () => {
      stopCameraStream();
    };
  }, [activeModal, selfieStage]);

  // Ensure srcObject is attached whenever videoRef or stream updates
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(() => { });
    }
  }, [cameraStream, selfieStage]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 640;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setSelectedPhoto(dataUrl);
        stopCameraStream();
        setSelfieStage('preview');
        toast.success('Photo uploaded! Tap SEND to submit.');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const captureSelfiePhoto = () => {
    if (videoRef.current && canvasRef.current && cameraStream) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      const maxDim = 640;
      let width = video.videoWidth || 640;
      let height = video.videoHeight || 640;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      // Mirror horizontal for natural selfie feel
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, width, height);

      const capturedUrl = canvas.toDataURL('image/jpeg', 0.7);
      setSelectedPhoto(capturedUrl);
      stopCameraStream();
      setSelfieStage('preview');
      toast.success('Selfie captured! Tap SEND to submit.');
    } else {
      // Fallback if camera stream is inactive or error
      if (!selectedPhoto && samplePhotos && samplePhotos.length > 0) {
        setSelectedPhoto(samplePhotos[0]);
      }
      setSelfieStage('preview');
    }
  };

  const [isSending, setIsSending] = useState(false);

  const handleSendSelfie = () => {
    if (isSending) return;
    setIsSending(true);
    const created = uploadSelfie({
      uploaderName: uploaderName || 'Stadium Fan',
      caption: caption || `${activeBrand.name} Match Day Fan!`,
      photoUrl: selectedPhoto,

    });
    setSubmittedSelfieId(created.id);
    setSelfieStage('sent');
    setIsSending(false);
    toast.success('Selfie submitted to FanForge Moderation Queue!');
  };

  // Check if submitted selfie was approved in real-time context
  const submittedSelfieObj = selfies.find((s) => s.id === submittedSelfieId);
  const isApproved = submittedSelfieObj?.status === 'approved';

  const sendReactionEmoji = (emoji) => {
    const newEmoji = { id: Date.now(), emoji, left: Math.random() * 80 + 10 };
    setFloatingEmojis((prev) => [...prev.slice(-8), newEmoji]);
    if (emitReaction) {
      emitReaction(emoji, uploaderName || 'Stadium Fan');
    }
    toast.info(`Broadcasted ${emoji} reaction to big screen!`);
  };

  return (
    <div className="min-h-screen bg-[#f4f2ee] text-slate-900 font-sans flex flex-col justify-start p-4 sm:p-8 max-w-2xl mx-auto selection:bg-rose-500 selection:text-white">
      {/* Hidden Canvas for Camera Snapshot */}
      <canvas ref={canvasRef} className="hidden" />

      {/* ---------------------------------------------------- */}
      {/* TOP BRAND HEADER */}
      {/* ---------------------------------------------------- */}
      <header className="space-y-2 pt-2 pb-2">
        {fanZoneSettings.headerLogo && (
          <img
            src={fanZoneSettings.headerLogo}
            alt="Header Logo"
            className="h-10 max-w-[200px] object-contain mb-2"
          />
        )}
        <h1 className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tight uppercase">
          {fanZoneSettings.headerTitle || 'FAN ZONE'}
        </h1>
        {fanZoneSettings.headerSubtitle && (
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            {fanZoneSettings.headerSubtitle}
          </p>
        )}
      </header>

      {/* ---------------------------------------------------- */}
      {/* ACTIVE ENGAGEMENT CARDS LIST */}
      {/* ---------------------------------------------------- */}
      <main className="mt-4 mb-8 space-y-4 flex-1">
        {isInstancesLoading ? (
          <div className="p-8 text-center text-slate-500 font-semibold text-sm flex items-center justify-center gap-2">
            <RefreshCcw className="w-4 h-4 animate-spin text-indigo-600" />
            Loading approved engagements...
          </div>
        ) : approvedInstances.length === 0 ? (
          <div className="p-8 sm:p-12 bg-white rounded-3xl border border-black/10 text-center space-y-4 shadow-xs my-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <Zap className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              No Engagements Added to My Engagements Yet
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Add an engagement template from the Engagement Library to "My Engagements" to display it on FanZone.
            </p>
          </div>
        ) : (
          approvedInstances.map((inst) => {
            const appId = inst.appId || inst.templateId || 'memory-challenge';
            const metaMap = {
              'memory-challenge': {
                label: 'MEMORY CHALLENGE',
                icon: Brain,
                borderColor: 'border-emerald-600',
                textColor: 'text-emerald-600',
                ringColor: 'ring-emerald-500/30',
                bgColor: 'bg-emerald-600',
                defaultTitle: 'Match stadium icon pairs and win points',
                onClick: () => {
                  const instId = inst.instanceId || inst.id;
                  const brandId = inst.brandId || inst.userId;
                  const queryParams = new URLSearchParams();
                  if (instId) queryParams.append('instanceId', instId);
                  if (brandId) queryParams.append('brandId', brandId);
                  const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
                  window.location.href = `https://memory-challenge-b7b.pages.dev/${query}`;
                },
                isActive: activeMemoryComputed,
              },
              'selfie-wall': {
                label: 'SELFIE CAM',
                icon: Camera,
                borderColor: 'border-red-600',
                textColor: 'text-red-600',
                ringColor: 'ring-red-500/30',
                bgColor: 'bg-red-600',
                defaultTitle: 'Capture your moment and appear on the big screen',
                onClick: () => {
                  setActiveModal('selfie-wall');
                  setSelfieStage('camera');
                },
                isActive: activeSelfieComputed,
              },
              'live-poll': {
                label: 'LIVE VOTE',
                icon: Vote,
                borderColor: 'border-indigo-600',
                textColor: 'text-indigo-600',
                ringColor: 'ring-indigo-500/30',
                bgColor: 'bg-indigo-600',
                defaultTitle: 'Cast your vote on the live match question',
                onClick: () => setActiveModal('live-poll'),
                isActive: activePollComputed,
              },
              'reaction-wall': {
                label: 'REACTION WALL',
                icon: Radio,
                borderColor: 'border-amber-500',
                textColor: 'text-amber-600',
                ringColor: 'ring-amber-500/30',
                bgColor: 'bg-amber-500',
                defaultTitle: 'Send your emoji reaction to the big screen',
                onClick: () => setActiveModal('reaction-wall'),
                isActive: activeReactionComputed,
              },
              'lane-daze': {
                label: 'LANE DASH',
                icon: Trophy,
                borderColor: 'border-cyan-600',
                textColor: 'text-cyan-600',
                ringColor: 'ring-cyan-500/30',
                bgColor: 'bg-cyan-600',
                defaultTitle: 'High-energy 3-lane arcade runner',
                onClick: () => {
                  const instId = inst.instanceId || inst.id;
                  const brandId = inst.brandId || inst.userId;
                  const queryParams = new URLSearchParams();
                  if (instId) queryParams.append('instanceId', instId);
                  if (brandId) queryParams.append('brandId', brandId);
                  const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
                  window.location.href = `https://lane-dash-game.pages.dev/games/lane-dash/index.html${query}`;
                },
                isActive: remoteActiveMode === 'lane-daze',
              },
              'lane-dash': {
                label: 'LANE DASH',
                icon: Trophy,
                borderColor: 'border-cyan-600',
                textColor: 'text-cyan-600',
                ringColor: 'ring-cyan-500/30',
                bgColor: 'bg-cyan-600',
                defaultTitle: 'High-energy 3-lane arcade runner',
                onClick: () => {
                  const instId = inst.instanceId || inst.id;
                  const brandId = inst.brandId || inst.userId;
                  const queryParams = new URLSearchParams();
                  if (instId) queryParams.append('instanceId', instId);
                  if (brandId) queryParams.append('brandId', brandId);
                  const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
                  window.location.href = `https://lane-dash-game.pages.dev/games/lane-dash/index.html${query}`;
                },
                isActive: remoteActiveMode === 'lane-daze',
              },
            };

            const meta = metaMap[appId] || metaMap['memory-challenge'];
            const Icon = meta.icon;
            const isActive = meta.isActive;

            return (
              <div
                key={inst.instanceId || inst.id}
                onClick={meta.onClick}
                className={`group p-6 rounded-3xl transition-all cursor-pointer flex items-center justify-between ${
                  isActive
                    ? `bg-white border-2 ${meta.borderColor} shadow-xl ring-4 ${meta.ringColor} scale-[1.02]`
                    : 'bg-[#eae7e1] hover:bg-[#e2ded6] border border-black/5 hover:border-black/15 shadow-2xs opacity-80 hover:opacity-100'
                }`}
              >
                <div className="space-y-1 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider font-mono ${
                        isActive ? meta.textColor : 'text-slate-500'
                      }`}
                    >
                      {inst.brandName ? `${inst.brandName} • ` : ''}{meta.label}
                    </span>
                    {isActive && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[9px] font-black tracking-widest uppercase border border-emerald-300 animate-pulse">
                        LIVE FEATURED
                      </span>
                    )}
                  </div>

                  <h3
                    className={`text-base sm:text-lg font-bold transition-colors ${
                      isActive ? 'text-slate-950 font-extrabold' : 'text-slate-900 group-hover:text-slate-950'
                    }`}
                  >
                    {inst.title || meta.defaultTitle}
                  </h3>

                  <span
                    className={`text-xs font-semibold flex items-center gap-1.5 ${
                      isActive ? 'text-emerald-700 font-extrabold' : 'text-slate-500'
                    }`}
                  >
                    {isActive ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                        <span>● LIVE NOW • Tap to Interact</span>
                      </>
                    ) : (
                      <span>○ APPROVED ACTIVATION • Tap to Launch</span>
                    )}
                  </span>
                </div>

                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 ${
                    isActive
                      ? `${meta.bgColor} text-white shadow-lg ring-2 ${meta.ringColor}`
                      : 'bg-white/60 text-slate-700'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            );
          })
        )}
      </main>

      {(fanZoneSettings.poweredByLogo || fanZoneSettings.poweredByText) && (
        <footer className="py-6 text-center space-y-2 border-t border-black/10">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 font-mono">
            POWERED BY
          </p>
          {fanZoneSettings.poweredByLogo && (
            <img
              src={fanZoneSettings.poweredByLogo}
              alt="Powered By Logo"
              className="h-10 max-w-[220px] object-contain mx-auto my-1"
            />
          )}
          {fanZoneSettings.poweredByText && (
            <p className="text-sm font-extrabold text-slate-900 tracking-tight">
              {fanZoneSettings.poweredByText}
            </p>
          )}
        </footer>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 1: SELFIE CAM LIVE CAMERA VIEWFINDER FLOW */}
      {/* ---------------------------------------------------- */}
      <AnimatePresence>
        {activeModal === 'selfie-wall' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 text-left relative text-white border border-slate-800 overflow-hidden"
            >
              <button
                onClick={() => {
                  stopCameraStream();
                  setActiveModal(null);
                }}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 z-20"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-lg">Selfie Cam Viewfinder</h3>
                  <p className="text-xs text-cyan-300">Smile & snap your stadium selfie!</p>
                </div>
              </div>

              {/* ---------------------------------- */}
              {/* STAGE 1: LIVE CAMERA VIEWFINDER */}
              {/* ---------------------------------- */}
              {selfieStage === 'camera' && (
                <div className="space-y-4">
                  <div className="relative aspect-square rounded-3xl overflow-hidden bg-black border-2 border-red-500 shadow-2xl flex items-center justify-center">
                    {!hasCameraError ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover scale-x-[-1]"
                      />
                    ) : (
                      <div className="p-6 text-center space-y-3">
                        <Smile className="w-12 h-12 text-red-500 mx-auto" />
                        <p className="text-xs font-bold text-white">Camera Preview Active</p>
                        <p className="text-[11px] text-slate-400">
                          Select a sample selfie photo below or tap snap to proceed!
                        </p>
                      </div>
                    )}

                    {/* Live Brand Overlay Frame */}
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl border border-white/20 flex items-center gap-1.5">
                      <img src={activeBrand.logo} alt="" className="w-4 h-4 object-contain" />
                      <span className="text-xs font-extrabold text-white">{activeBrand.name} Frame</span>
                    </div>

                    {/* Camera Grid Target Crosshair */}
                    <div className="absolute inset-12 border border-white/20 rounded-2xl pointer-events-none" />
                  </div>

                  {/* Sample Fallback Selector if Camera Permissions block */}
                  {hasCameraError && (
                    <div className="space-y-1.5">
                      <span className="text-xs text-slate-400 font-semibold">Choose Sample Photo:</span>
                      <div className="grid grid-cols-4 gap-2">
                        {samplePhotos.map((url, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedPhoto(url)}
                            className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedPhoto === url ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-700'
                              }`}
                          >
                            <img src={url} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SHUTTER & FILE UPLOAD BUTTONS */}
                  <div className="flex items-center justify-center gap-6 pt-2">
                    <label className="cursor-pointer px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center gap-2 transition-all">
                      <UploadCloud className="w-4 h-4 text-cyan-400" />
                      <span>Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>

                    <button
                      onClick={captureSelfiePhoto}
                      className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-2xl ring-4 ring-white/30 active:scale-90 transition-all shrink-0"
                      title="Take Selfie Photo"
                    >
                      <div className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center">
                        <Camera className="w-8 h-8" />
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* ---------------------------------- */}
              {/* STAGE 2: PREVIEW WITH ONLY SEND BUTTON */}
              {/* ---------------------------------- */}
              {selfieStage === 'preview' && (
                <div className="space-y-5">
                  <div className="relative aspect-square rounded-3xl overflow-hidden border-2 border-red-500 shadow-2xl bg-black">
                    <img src={selectedPhoto} alt="Captured Selfie" className="w-full h-full object-cover" />
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl border border-white/20 flex items-center gap-1.5">
                      <img src={activeBrand.logo} alt="" className="w-4 h-4 object-contain" />
                      <span className="text-xs font-extrabold text-white">{activeBrand.name} Match Frame Overlay</span>
                    </div>
                  </div>

                  <button
                    onClick={handleSendSelfie}
                    className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-base shadow-2xl flex items-center justify-center gap-2 uppercase tracking-wider active:scale-95 transition-all"
                  >
                    <UploadCloud className="w-5 h-5" /> SEND
                  </button>
                </div>
              )}

              {/* ---------------------------------- */}
              {/* STAGE 3: SENT & REAL-TIME APPROVAL */}
              {/* ---------------------------------- */}
              {selfieStage === 'sent' && (
                <div className="text-center py-6 space-y-4">
                  {isApproved ? (
                    <div className="space-y-3 animate-in zoom-in">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg border border-emerald-500/40">
                        <CheckCircle2 className="w-10 h-10" />
                      </div>
                      <h4 className="text-xl font-extrabold text-white">APPROVED & BROADCAST LIVE! 🎉</h4>
                      <p className="text-xs text-cyan-300">
                        Look at the central stadium Jumbotron screen — your selfie is now live on the mosaic wall!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 animate-in fade-in">
                      <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-lg border border-amber-500/40 animate-pulse">
                        <Sparkles className="w-8 h-8" />
                      </div>
                      <h4 className="text-lg font-extrabold text-white">Selfie Received! ⏳</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Your photo is currently in the FanForge Organizer Moderation Queue. Once accepted, it will project live onto the big screen!
                      </p>
                      <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300">
                        Status: <span className="text-amber-400 font-bold">Awaiting Organizer Approval</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setSelfieStage('camera')}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
                  >
                    Take Another Selfie 📸
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------------------------------------------- */}
      {/* MODAL 2: LIVE VOTE HALFTIME POLL */}
      {/* ---------------------------------------------------- */}
      <AnimatePresence>
        {activeModal === 'live-vote' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-left relative"
            >
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                  <Vote className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">Match Day Halftime Live Vote</h3>
                  <p className="text-xs text-slate-500">Vote now to see results on Jumbotron</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                {activePoll ? (
                  <>
                    <h4 className="text-sm font-extrabold text-slate-900">
                      {activePoll.question}
                    </h4>

                    <div className="space-y-2">
                      {(activePoll.options || []).map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setSelectedOption(opt.id);
                            setHasVoted(true);
                            if (submitVote) {
                              submitVote(activePoll.id, opt.id);
                            }
                            toast.success(`Vote for ${opt.text} cast!`);
                          }}
                          className={`w-full p-3 rounded-xl border text-xs font-bold text-left transition-all ${selectedOption === opt.id
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                              : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                          ● {opt.text}
                        </button>
                      ))}
                    </div>

                    {hasVoted && (
                      <p className="text-xs font-extrabold text-emerald-600 text-center pt-2">
                        ✓ Vote Broadcasted Live to Big Screen!
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-slate-500 text-center py-4">
                    No active poll right now — check back soon!
                  </p>
                )}
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------------------------------------------- */}
      {/* MODAL 3: REACTION WALL MODAL */}
      {/* ---------------------------------------------------- */}
      <AnimatePresence>
        {activeModal === 'reaction-wall' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-left relative overflow-hidden"
            >
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md font-bold">
                  🔥
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">Emoji Reaction Stream</h3>
                  <p className="text-xs text-slate-500">Tap emojis to burst them across stadium screens</p>
                </div>
              </div>

              <div className="relative h-40 rounded-2xl bg-slate-900 p-4 flex flex-col justify-end overflow-hidden border border-slate-800">
                {floatingEmojis.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ y: 100, opacity: 1, scale: 0.8 }}
                    animate={{ y: -140, opacity: 0, scale: 1.5 }}
                    transition={{ duration: 1.8, ease: 'easeOut' }}
                    className="absolute text-3xl pointer-events-none"
                    style={{ left: `${item.left}%` }}
                  >
                    {item.emoji}
                  </motion.div>
                ))}
                <p className="text-xs text-slate-400 text-center font-mono">
                  Tap buttons below to send reactions
                </p>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {['🔥', '👏', '🚀', '❤️', '⚡'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => sendReactionEmoji(emoji)}
                    className="py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-2xl shadow-sm active:scale-90 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ---------------------------------------------------- */}
        {/* MODAL 4: MEMORY CHALLENGE MATCHING GAME */}
        {/* ---------------------------------------------------- */}
        {activeModal === 'memory-challenge' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-left relative overflow-hidden"
            >
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md font-bold">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">Memory Challenge</h3>
                  <p className="text-xs text-purple-600 font-semibold">Match all stadium icon pairs!</p>
                </div>
              </div>

              {/* Game Score & Move Count */}
              <div className="flex items-center justify-between px-4 py-2 rounded-2xl bg-purple-50 border border-purple-100 text-xs font-extrabold text-purple-900">
                <span>Moves: {moveCount}</span>
                <span>Matched: {matchedPairs.length} / {EMOJI_PAIRS.length}</span>
              </div>

              {/* Card Grid */}
              <div className="grid grid-cols-4 gap-2.5 py-2">
                {memoryCards.map((card, idx) => {
                  const isFlipped = flippedCards.includes(idx) || matchedPairs.includes(card.emoji);
                  const isMatched = matchedPairs.includes(card.emoji);

                  return (
                    <button
                      key={card.id}
                      onClick={() => handleCardClick(idx)}
                      disabled={isMatched}
                      className={`aspect-square rounded-2xl text-2xl font-bold flex items-center justify-center transition-all duration-300 transform shadow-sm ${isMatched
                          ? 'bg-emerald-100 border-2 border-emerald-400 text-emerald-800 scale-95 opacity-80'
                          : isFlipped
                            ? 'bg-purple-600 text-white border-2 border-purple-400 scale-105 shadow-md'
                            : 'bg-slate-100 hover:bg-slate-200 border border-slate-300 text-transparent active:scale-95'
                        }`}
                    >
                      {isFlipped ? card.emoji : '❓'}
                    </button>
                  );
                })}
              </div>

              {/* Victory Banner */}
              {matchedPairs.length === EMOJI_PAIRS.length && (
                <div className="p-4 rounded-2xl bg-emerald-500 text-white text-center space-y-2 animate-bounce shadow-xl">
                  <div className="flex items-center justify-center gap-2">
                    <Trophy className="w-6 h-6 text-amber-300 fill-amber-300" />
                    <span className="font-black text-base">CHALLENGE COMPLETED!</span>
                  </div>
                  <p className="text-xs font-semibold">You completed the challenge in {moveCount} moves! 🎉</p>
                  <button
                    onClick={resetMemoryGame}
                    className="px-4 py-1.5 rounded-xl bg-white text-emerald-900 font-extrabold text-xs shadow-md"
                  >
                    Play Again 🔄
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FanZoneLanding({ forcedAppId, instanceId } = {}) {
  return (
    <SelfieWallProvider>
      <LivePollProvider>
        <ReactionWallProvider>
          <MemoryChallengeProvider>
            <FanZoneLandingContent forcedAppId={forcedAppId} instanceId={instanceId} />
          </MemoryChallengeProvider>
        </ReactionWallProvider>
      </LivePollProvider>
    </SelfieWallProvider>
  );
}


