import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, QrCode, Sparkles, Users, Tv, CheckCircle2, ShieldCheck, Check, X } from 'lucide-react';
import { useBuilder } from '../../context/BuilderContext';
import { useSelfieWall } from '../../context/SelfieWallContext';

export default function BigScreenStadiumFrame() {
  const { customBrand, activeBrand, activeTemplateId, bigScreenStage, setBigScreenStage } = useBuilder();

  // Safely consume real-time SelfieWallContext
  let selfieWallCtx = null;
  try {
    selfieWallCtx = useSelfieWall();
  } catch (e) {}

  const approvedSelfies = selfieWallCtx ? selfieWallCtx.approvedSelfies : [];
  const pendingSelfies = selfieWallCtx ? selfieWallCtx.pendingSelfies : [];
  const pendingSelfie = pendingSelfies[0];

  const handleAcceptPending = () => {
    if (pendingSelfie && selfieWallCtx) {
      selfieWallCtx.approveSelfie(pendingSelfie.id);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl overflow-hidden border-4 border-slate-800 shadow-2xl bg-slate-950 text-white relative">
      {/* Stadium Jumbotron Top Header Bar */}
      <div className="px-6 py-3 bg-black/60 border-b border-white/10 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">
            <Tv className="w-4 h-4 text-cyan-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-sm uppercase tracking-wider">
                STADIUM JUMBOTRON BROADCAST
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                ● LIVE STADIUM STREAM
              </span>
            </div>
          </div>
        </div>

        {/* Big Screen Stage Selector */}
        <div className="flex items-center gap-1.5 text-xs">
          {['lobby', 'participants', 'winner', 'sponsor'].map((stage) => (
            <button
              key={stage}
              type="button"
              onClick={() => setBigScreenStage(stage)}
              className={`px-2.5 py-1 rounded-lg font-semibold capitalize transition-all ${
                bigScreenStage === stage
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              {stage}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stadium Jumbotron Screen Content */}
      <div
        className={`p-8 min-h-[380px] flex flex-col justify-between relative bg-gradient-to-br ${customBrand.bgGradient}`}
      >
        {/* ------------------------------------------------------------------ */}
        {/* SPECIALIZED SELFIE MOSAIC WALL BROADCAST */}
        {/* ------------------------------------------------------------------ */}
        {activeTemplateId === 'selfie-wall' ? (
          <div className="space-y-6 my-auto animate-in fade-in">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/15 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 p-2 border border-white/20">
                  <img src={customBrand.logo} alt="Brand" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-white">Live Fan Selfie Mosaic Wall</h2>
                  <p className="text-xs text-cyan-300">Scan QR Code to Upload • Moderated Platform Queue Active</p>
                </div>
              </div>

              {/* Jumbotron QR Code scan prompt */}
              <a
                href="/fan-zone"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 bg-white text-slate-950 p-2.5 rounded-2xl shadow-xl hover:bg-slate-100 transition-colors"
                title="Click to open Fan Zone mobile landing page"
              >
                <QrCode className="w-10 h-10 text-indigo-600" />
                <div className="text-left">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">Scan QR Code</p>
                  <p className="text-xs font-bold text-slate-900">fanforge.live/fan-zone</p>
                </div>
              </a>
            </div>

            {/* Platform Organizer Acceptance Banner */}
            {pendingSelfie && (
              <div className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-400/50 backdrop-blur-md flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-3">
                  <img src={pendingSelfie.photoUrl || pendingSelfie.img} alt="Pending" className="w-10 h-10 rounded-xl object-cover ring-2 ring-amber-400" />
                  <div>
                    <p className="text-xs font-extrabold text-white">Incoming Selfie from {pendingSelfie.uploaderName || pendingSelfie.name}</p>
                    <p className="text-[10px] text-amber-200">FanForge Platform Queue • Awaiting Organizer Acceptance</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAcceptPending}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs flex items-center gap-1 shadow-md hover:bg-emerald-400"
                  >
                    <Check className="w-4 h-4" /> ACCEPT & BROADCAST
                  </button>
                  <button
                    onClick={() => selfieWallCtx && selfieWallCtx.rejectSelfie(pendingSelfie.id)}
                    className="p-1.5 rounded-xl bg-rose-500/30 text-rose-200 hover:bg-rose-500/50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Approved Fan Selfie Mosaic Grid */}
            {approvedSelfies.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {approvedSelfies.map((fan) => (
                  <div key={fan.id} className="group relative aspect-square rounded-2xl overflow-hidden border border-white/20 shadow-xl bg-slate-900">
                    <img src={fan.photoUrl || fan.img} alt={fan.uploaderName || fan.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent p-2.5 flex flex-col justify-end text-left">
                      <span className="text-xs font-bold text-white truncate">{fan.uploaderName || fan.name}</span>
                      <span className="text-[9px] text-cyan-300 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" /> Approved Live
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/10 space-y-2">
                <p className="text-sm font-bold text-white">No Approved Fan Selfies Yet</p>
                <p className="text-xs text-cyan-300">Scan the QR code to upload a selfie and approve it in the Pending Queue.</p>
              </div>
            )}
          </div>
        ) : (
          /* STANDARD GAME BROADCAST FOR OTHER ENGAGEMENTS */
          <div className="my-auto space-y-6">
            {bigScreenStage === 'lobby' && (
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 animate-in fade-in">
                <div className="space-y-4 max-w-md">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md p-3 border border-white/20 shadow-xl">
                    <img src={customBrand.logo} alt="Brand" className="w-full h-full object-contain" />
                  </div>
                  <h2 className="text-3xl font-extrabold text-white tracking-tight">
                    {activeBrand.name} Stadium Product Rush
                  </h2>
                  <p className="text-sm text-indigo-200 leading-relaxed">
                    Scan the QR code with your smartphone camera to join 45,000+ fans in real-time.
                  </p>
                </div>

                <div className="bg-white p-5 rounded-3xl text-slate-950 text-center shadow-2xl border-4 border-cyan-400/50">
                  <div className="w-40 h-40 bg-slate-950 rounded-2xl flex items-center justify-center p-3 text-white">
                    <QrCode className="w-32 h-32 text-cyan-400" />
                  </div>
                  <p className="text-xs font-extrabold text-slate-900 mt-3">SCAN TO PLAY NOW</p>
                  <p className="text-[10px] text-slate-500 font-mono">fanforge.live/stadium-01</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stadium Footer Bar */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
          <span>Venue: Metropolis Arena Stadium Jumbotron</span>
          <span className="font-mono text-cyan-300">Res: 3840x2160 4K UHD</span>
        </div>
      </div>
    </div>
  );
}
