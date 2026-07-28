import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sparkles, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import ToastContainer from '../../components/ui/ToastContainer';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      <ToastContainer />
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left / Top Form Area */}
        <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24 bg-white">
          <div className="w-full max-w-md mx-auto">
            {/* Logo */}
            <Link to="/" className="inline-flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl gradient-indigo-cyan flex items-center justify-center text-white font-bold text-lg shadow-md">
                FF
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 tracking-tight text-xl leading-none">
                  FanForge
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-indigo-600 uppercase mt-0.5">
                  Engagement Operating System
                </span>
              </div>
            </Link>

            {/* Nested Auth Routes */}
            <Outlet />
          </div>
        </div>

        {/* Right Hero Branding Banner (Desktop) */}
        <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-12 lg:p-16 flex-col justify-between overflow-hidden">
          {/* Animated decorative graphics */}
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />

          {/* Top Tagline */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-cyan-300 text-xs font-semibold mb-6">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Next-Gen Enterprise Engagement</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Transform every stadium, concert, and event into an interactive arena.
            </h2>
            <p className="text-indigo-200/80 text-sm mt-4 max-w-lg leading-relaxed">
              FanForge gives venue operators and brand organizers real-time tools for trivia, live polling, AR activations, and instant rewards.
            </p>
          </div>

          {/* Middle Feature Highlights */}
          <div className="relative z-10 space-y-4 my-8">
            <div className="flex items-start gap-3 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <Zap className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-white">Sub-100ms Latency Engine</h4>
                <p className="text-xs text-indigo-200/70 mt-0.5">
                  Synchronize 100,000+ stadium fans in real-time without app downloads.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-white">Enterprise Role Governance</h4>
                <p className="text-xs text-indigo-200/70 mt-0.5">
                  Granular permission control across Super Admins, Brands, and Venue Managers.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Testimonial */}
          <div className="relative z-10 pt-6 border-t border-white/10">
            <p className="text-xs text-indigo-200/80 italic">
              "FanForge enabled us to double fan participation during the 2025 World Championship Series."
            </p>
            <div className="flex items-center gap-3 mt-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-xs">
                AS
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Apex Sports Operations</p>
                <p className="text-[10px] text-indigo-300">Enterprise Client</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
