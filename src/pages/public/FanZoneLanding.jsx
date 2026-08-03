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
} from 'lucide-react';
import { useSelfieWall } from '../../context/SelfieWallContext';
import { useLivePoll, LivePollProvider } from '../../context/LivePollContext';
import { useReactionWall, ReactionWallProvider } from '../../context/ReactionWallContext';
import { useToast } from '../../context/ToastContext';

function FanZoneLandingContent() {
  const { uploadSelfie, activeBrand, selfies, isSelfieWallActive } = useSelfieWall();
  const { activePoll, submitVote, isPollActive } = useLivePoll();
  const { emitReaction, isReactionWallActive } = useReactionWall();
  const toast = useToast();

  const DEFAULT_FANZONE_SETTINGS = {
    headerTitle: 'FAN ZONE',
    headerSubtitle: 'Fan experiences go live throughout the match',
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
    } catch (e) {}

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (channel) channel.close();
    };
  }, []);

  const [activeModal, setActiveModal] = useState(null); // null | 'selfie-wall' | 'live-vote' | 'reaction-wall'
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

  const samplePhotos = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
  ];

  // Initialize Camera Stream when Selfie Cam modal opens
  useEffect(() => {
    if (activeModal === 'selfie-wall' && selfieStage === 'camera') {
      startCameraStream();
    } else {
      stopCameraStream();
    }
    return () => stopCameraStream();
  }, [activeModal, selfieStage]);

  const startCameraStream = async () => {
    setHasCameraError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } },
        audio: false,
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera access not granted or hardware unavailable:', err);
      setHasCameraError(true);
      setSelectedPhoto(samplePhotos[0]);
    }
  };

  const stopCameraStream = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  const captureSelfiePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      const maxDim = 480;
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

      const capturedUrl = canvas.toDataURL('image/jpeg', 0.6);
      setSelectedPhoto(capturedUrl);
      stopCameraStream();
      setSelfieStage('preview');
      toast.success('Selfie captured! Tap SEND to submit.');
    } else if (hasCameraError) {
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
      photoUrl: selectedPhoto || samplePhotos[0],
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
    <div className="min-h-screen bg-[#f4f2ee] text-slate-900 font-sans flex flex-col justify-between p-4 sm:p-8 max-w-2xl mx-auto selection:bg-rose-500 selection:text-white">
      {/* Hidden Canvas for Camera Snapshot */}
      <canvas ref={canvasRef} className="hidden" />

      {/* ---------------------------------------------------- */}
      {/* TOP BRAND HEADER */}
      {/* ---------------------------------------------------- */}
      <header className="space-y-2 pt-4">
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
        <p className="text-xs sm:text-sm text-slate-600 font-medium">
          {fanZoneSettings.headerSubtitle || 'Fan experiences go live throughout the match'}
        </p>
      </header>

      {/* ---------------------------------------------------- */}
      {/* ACTIVE ENGAGEMENT CARDS LIST */}
      {/* ---------------------------------------------------- */}
      <main className="my-8 space-y-4">
        {/* 1. LIVE VOTE CARD */}
        <div
          onClick={() => setActiveModal('live-vote')}
          className={`group p-6 rounded-3xl transition-all cursor-pointer flex items-center justify-between ${
            isPollActive
              ? 'bg-[#eae7e1] border-2 border-indigo-500 hover:border-indigo-600 shadow-md ring-1 ring-indigo-500/20'
              : 'bg-[#eae7e1] hover:bg-[#e2ded6] border border-black/5 hover:border-black/15 shadow-2xs opacity-80 hover:opacity-100'
          }`}
        >
          <div className="space-y-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider font-mono ${isPollActive ? 'text-indigo-600' : 'text-slate-500'}`}>
              LIVE VOTE {isPollActive && '• FEATURED'}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              Cast your vote on the live match question
            </h3>
            <span className={`text-xs font-semibold flex items-center gap-1 ${isPollActive ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
              {isPollActive ? '● LIVE NOW' : '○ STANDBY'}
            </span>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 ${
            isPollActive ? 'bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-500/30' : 'bg-white/60 text-slate-700'
          }`}>
            <Vote className="w-6 h-6" />
          </div>
        </div>

        {/* 2. REACTION WALL CARD */}
        <div
          onClick={() => setActiveModal('reaction-wall')}
          className={`group p-6 rounded-3xl transition-all cursor-pointer flex items-center justify-between ${
            isReactionWallActive
              ? 'bg-[#eae7e1] border-2 border-amber-500 hover:border-amber-600 shadow-md ring-1 ring-amber-500/20'
              : 'bg-[#eae7e1] hover:bg-[#e2ded6] border border-black/5 hover:border-black/15 shadow-2xs opacity-80 hover:opacity-100'
          }`}
        >
          <div className="space-y-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider font-mono ${isReactionWallActive ? 'text-amber-600' : 'text-slate-500'}`}>
              REACTION WALL {isReactionWallActive && '• FEATURED'}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
              Send your emoji reaction to the big screen
            </h3>
            <span className={`text-xs font-semibold flex items-center gap-1 ${isReactionWallActive ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
              {isReactionWallActive ? '● LIVE NOW' : '○ STANDBY'}
            </span>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 ${
            isReactionWallActive ? 'bg-amber-500 text-slate-950 shadow-lg ring-2 ring-amber-500/30' : 'bg-white/60 text-slate-700'
          }`}>
            <Radio className="w-6 h-6" />
          </div>
        </div>

        {/* 3. SELFIE CAM CARD */}
        <div
          onClick={() => {
            setActiveModal('selfie-wall');
            setSelfieStage('camera');
          }}
          className={`group p-6 rounded-3xl transition-all cursor-pointer flex items-center justify-between ${
            isSelfieWallActive
              ? 'bg-[#eae7e1] border-2 border-red-500 hover:border-red-600 shadow-md ring-1 ring-red-500/20'
              : 'bg-[#eae7e1] hover:bg-[#e2ded6] border border-black/5 hover:border-black/15 shadow-2xs opacity-80 hover:opacity-100'
          }`}
        >
          <div className="space-y-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider font-mono ${isSelfieWallActive ? 'text-red-600' : 'text-slate-500'}`}>
              SELFIE CAM {isSelfieWallActive && '• FEATURED'}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-red-600 transition-colors">
              Capture your moment and appear on the big screen
            </h3>
            <span className={`text-xs font-semibold flex items-center gap-1 ${isSelfieWallActive ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
              {isSelfieWallActive ? '● LIVE NOW • Tap to Open Selfie Camera' : '○ STANDBY'}
            </span>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 ${
            isSelfieWallActive ? 'bg-red-600 text-white shadow-lg ring-2 ring-red-500/30' : 'bg-white/60 text-slate-700'
          }`}>
            <Camera className="w-6 h-6" />
          </div>
        </div>
      </main>

      {/* ---------------------------------------------------- */}
      {/* BOTTOM SPONSOR FOOTER */}
      {/* ---------------------------------------------------- */}
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
                            className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                              selectedPhoto === url ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-700'
                            }`}
                          >
                            <img src={url} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SHUTTER BUTTON */}
                  <div className="flex items-center justify-center pt-2">
                    <button
                      onClick={captureSelfiePhoto}
                      className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-2xl ring-4 ring-white/30 active:scale-90 transition-all"
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
                <h4 className="text-sm font-extrabold text-slate-900">
                  {activePoll?.question || "Who will score the winning goal in tonight's final half?"}
                </h4>

                <div className="space-y-2">
                  {(activePoll?.options || [
                    { id: 'opt-1', text: 'Alex Morgan (Apex)' },
                    { id: 'opt-2', text: 'Jordan Taylor (Strikers)' },
                    { id: 'opt-3', text: 'Sarah Jenkins (United)' },
                  ]).map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setSelectedOption(opt.id);
                        setHasVoted(true);
                        if (activePoll && submitVote) {
                          submitVote(activePoll.id, opt.id);
                        }
                        toast.success(`Vote for ${opt.text} cast!`);
                      }}
                      className={`w-full p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                        selectedOption === opt.id
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
      </AnimatePresence>
    </div>
  );
}

export default function FanZoneLanding() {
  return (
    <LivePollProvider>
      <ReactionWallProvider>
        <FanZoneLandingContent />
      </ReactionWallProvider>
    </LivePollProvider>
  );
}


