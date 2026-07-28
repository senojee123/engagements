import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Tv,
  Camera,
  ShieldCheck,
  Sparkles,
  Play,
  Grid,
  Star,
  Plus,
  Radio,
  QrCode,
  Sliders,
  Settings,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Tabs from '../../components/ui/Tabs';
import SelfieModerationPanel from '../../components/selfieWall/SelfieModerationPanel';
import SelfieWallDisplay from '../../components/selfieWall/SelfieWallDisplay';
import SelfieUploaderModal from '../../components/selfieWall/SelfieUploaderModal';
import BrandSwitcher from '../../components/library/BrandSwitcher';
import { useSelfieWall, SelfieWallProvider } from '../../context/SelfieWallContext';
import { useToast } from '../../context/ToastContext';

function SelfieWallDashboardInner() {
  const navigate = useNavigate();
  const toast = useToast();
  const {
    approvedSelfies,
    pendingSelfies,
    flaggedSelfies,
    activeBrand,
    setActiveBrand,
    displayMode,
    setDisplayMode,
    isLiveStreamConnected,
    isSelfieWallActive,
    launchSelfieWall,
    stopSelfieWall,
  } = useSelfieWall();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeViewTab, setActiveViewTab] = useState('moderation'); // 'moderation' | 'preview' | 'settings'

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-cyan-300 text-xs font-semibold border border-white/10">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Real-Time Fan Activation Module</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold font-mono">
                <Radio className="w-3 h-3 animate-pulse" /> WebSocket Live
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Live Fan Selfie Wall & Moderation Center
            </h1>
            <p className="text-indigo-200/80 text-sm leading-relaxed">
              Manage stadium Jumbotron selfie broadcasts, AI safety moderation queues, and real-time brand activations.
            </p>

            {/* Quick Metrics Bar */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-cyan-300 pt-2">
              <span>● {approvedSelfies.length} Approved Photos Live</span>
              <span>● {pendingSelfies.length} Pending Admin Review</span>
              <span>● {flaggedSelfies.length} AI Flagged Risk</span>
            </div>
          </div>

          {/* Action Launcher Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              onClick={() => setIsUploadModalOpen(true)}
              variant="outline"
              icon={Plus}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              Simulate Fan Upload
            </Button>

            {isSelfieWallActive ? (
              <Button
                onClick={() => {
                  stopSelfieWall();
                  toast.info('Selfie Wall stopped. Open stadium screen returned to Idle.');
                }}
                variant="outline"
                className="bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30 font-bold"
              >
                ● Live: Stop Selfie Wall (Return to Idle)
              </Button>
            ) : (
              <Button
                onClick={() => {
                  launchSelfieWall();
                  toast.success('Selfie Wall launched live to stadium display screen!');
                }}
                variant="primary"
                icon={Tv}
              >
                🚀 Launch Selfie Wall to Screen
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Brand Engine Switcher Bar */}
      <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Active Brand Identity Theme</h3>
            <p className="text-xs text-slate-500">Transform background colors, logos, and frame stickers instantly across all stadium screens.</p>
          </div>
          <Badge variant="indigo" size="sm">
            Active: {activeBrand.name}
          </Badge>
        </div>
        <BrandSwitcher activeBrand={activeBrand} onSelectBrand={setActiveBrand} />
      </div>

      {/* Main View Tabs */}
      <Tabs
        tabs={[
          { id: 'moderation', label: `Moderation Queue (${pendingSelfies.length + flaggedSelfies.length})`, icon: ShieldCheck },
          { id: 'preview', label: 'Live Stadium Screen Preview', icon: Tv },
        ]}
        activeTab={activeViewTab}
        onChange={setActiveViewTab}
      />

      {/* TAB 1: MODERATION DESK */}
      {activeViewTab === 'moderation' && <SelfieModerationPanel />}

      {/* TAB 2: LIVE DISPLAY PREVIEW */}
      {activeViewTab === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-900 text-white rounded-2xl border border-slate-800">
            <div className="flex items-center gap-3">
              <Tv className="w-5 h-5 text-cyan-400" />
              <div>
                <h4 className="text-sm font-bold text-white">Stadium Display Viewport Preview</h4>
                <p className="text-xs text-slate-400">Live preview of the LED Screen output broadcasted to Metropolis Arena.</p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={Tv}
              onClick={() => navigate('/selfie-wall/display')}
            >
              Open Fullscreen Mode
            </Button>
          </div>

          <div className="rounded-3xl overflow-hidden border-4 border-slate-800 shadow-2xl">
            <SelfieWallDisplay isStandalonePage={false} />
          </div>
        </div>
      )}

      {/* Fan Upload Simulation Modal */}
      <SelfieUploaderModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
}

export default function SelfieWallDashboard() {
  return (
    <SelfieWallProvider>
      <SelfieWallDashboardInner />
    </SelfieWallProvider>
  );
}
