import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Heart,
  Copy,
  Sparkles,
  Play,
  Monitor,
  Smartphone,
  Tv,
  Tablet,
  CheckCircle2,
  Zap,
  Clock,
  Users,
  Layers,
  Settings,
  Camera,
  Plus,
  Upload,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Tabs from '../../components/ui/Tabs';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import BrandSwitcher from '../../components/library/BrandSwitcher';
import GameplayMockup from '../../components/library/GameplayMockup';
import SelfieModerationPanel from '../../components/selfieWall/SelfieModerationPanel';
import SelfieWallDisplay from '../../components/selfieWall/SelfieWallDisplay';
import SelfieUploaderModal from '../../components/selfieWall/SelfieUploaderModal';
import LivePollDisplay from '../../components/livePoll/LivePollDisplay';
import LivePollModerationPanel from '../../components/livePoll/LivePollModerationPanel';
import ReactionWallDisplay from '../../components/reactionWall/ReactionWallDisplay';
import ReactionWallModerationPanel from '../../components/reactionWall/ReactionWallModerationPanel';
import MemoryChallengeDisplay from '../../components/memoryChallenge/MemoryChallengeDisplay';
import MemoryChallengeConfig from './MemoryChallengeConfig';
import { useTemplates } from '../../context/TemplateContext';
import { useSelfieWall, SelfieWallProvider } from '../../context/SelfieWallContext';
import { useLivePoll, LivePollProvider } from '../../context/LivePollContext';
import { useReactionWall, ReactionWallProvider } from '../../context/ReactionWallContext';
import { useMemoryChallenge, MemoryChallengeProvider } from '../../context/MemoryChallengeContext';
import { useToast } from '../../context/ToastContext';
import { updateScreenStatusApi } from '../../lib/api';



function SelfieWallEngagementView({ template }) {
  const navigate = useNavigate();
  const toast = useToast();
  const {
    approvedSelfies,
    pendingSelfies,
    flaggedSelfies,
    activeBrand,
    setActiveBrand,
    isSelfieWallActive,
    launchSelfieWall,
    stopSelfieWall,
  } = useSelfieWall();

  const [activeSubTab, setActiveSubTab] = useState('moderation');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 w-full">
      {/* Back Link */}
      <Link
        to="/library"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Engagement Library
      </Link>

      {/* Hero Header Banner with Full Horizontal Width */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row items-start gap-6 w-full">
          <img
            src={template.thumbnail}
            alt={template.title}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-slate-700 shadow-md shrink-0"
          />

          <div className="space-y-3 flex-1 w-full text-left">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant="indigo" size="sm">
                {template.category}
              </Badge>
              <span className="bg-emerald-950 text-emerald-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-800 whitespace-nowrap">
                ● ACTIVE BACKEND ENGAGEMENT
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold text-cyan-300 whitespace-nowrap">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {template.popularity} ({template.ratingCount} reviews)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {template.title}
            </h1>

            <p className="text-sm text-indigo-200/80 max-w-3xl leading-relaxed">
              {template.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-cyan-300 font-semibold pt-1">
              <span>● {approvedSelfies.length} Approved Photos Broadcasted</span>
              <span>● {pendingSelfies.length} Pending Moderation</span>
              <span>● {flaggedSelfies.length} AI Flagged Risk</span>
            </div>
          </div>
        </div>

        {/* Action Buttons Toolbar Row */}
        <div className="pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-indigo-200/70 font-medium">
            Active Venue: <span className="font-bold text-white">Metropolis Arena Stadium</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/fan-zone"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-white/10 text-cyan-300 border border-white/20 hover:bg-white/20 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <span>Open Fan Zone Mobile Portal 📱</span>
            </a>

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
                variant="outline"
                onClick={() => {
                  stopSelfieWall();
                  toast.info('Selfie Wall stopped. Open stadium screen returned to Idle.');
                }}
                className="bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30 font-bold"
              >
                ● Live: Stop Selfie Wall (Return to Idle)
              </Button>
            ) : (
              <Button
                variant="primary"
                icon={Tv}
                onClick={() => {
                  launchSelfieWall();
                  toast.success('Selfie Wall launched live to stadium display screen!');
                }}
              >
                🚀 Launch Selfie Wall to Screen
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Brand Switcher */}
      <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Active Brand Identity Theme</h3>
            <p className="text-xs text-slate-500">Transform background colors, logos, and frame stickers instantly.</p>
          </div>
          <Badge variant="indigo" size="sm">
            Active: {activeBrand.name}
          </Badge>
        </div>
        <BrandSwitcher activeBrand={activeBrand} onSelectBrand={setActiveBrand} />
      </div>

      {/* Sub Tabs */}
      <Tabs
        tabs={[
          { id: 'moderation', label: `Moderation Queue (${pendingSelfies.length + flaggedSelfies.length})` },
          { id: 'preview', label: 'Live Stadium Screen Preview' },
        ]}
        activeTab={activeSubTab}
        onChange={setActiveSubTab}
      />

      {/* TAB 1: MODERATION DESK */}
      {activeSubTab === 'moderation' && <SelfieModerationPanel />}

      {/* TAB 2: LIVE DISPLAY PREVIEW */}
      {activeSubTab === 'preview' && (
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

function LivePollEngagementView({ template }) {

  const navigate = useNavigate();
  const toast = useToast();
  const {
    activePoll,
    activeBrand,
    setActiveBrand,
    isPollActive,
    launchLivePoll,
    stopLivePoll,
  } = useLivePoll();

  const [activeSubTab, setActiveSubTab] = useState('control');

  return (
    <div className="space-y-8 animate-in fade-in duration-300 w-full">
      {/* Back Link */}
      <Link
        to="/library"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Engagement Library
      </Link>

      {/* Hero Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row items-start gap-6 w-full">
          <img
            src={template.thumbnail}
            alt={template.title}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-slate-700 shadow-md shrink-0"
          />

          <div className="space-y-3 flex-1 w-full text-left">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant="indigo" size="sm">
                {template.category}
              </Badge>
              <span className="bg-emerald-950 text-emerald-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-800 whitespace-nowrap">
                ● ACTIVE BACKEND ENGAGEMENT
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold text-cyan-300 whitespace-nowrap">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {template.popularity} ({template.ratingCount} reviews)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {template.title}
            </h1>

            <p className="text-sm text-indigo-200/80 max-w-3xl leading-relaxed">
              {template.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-cyan-300 font-semibold pt-1 font-mono">
              <span>● Active Poll: "{activePoll?.question}"</span>
              <span>● Total Votes: {(activePoll?.totalVotes || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons Toolbar Row */}
        <div className="pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-indigo-200/70 font-medium">
            Active Venue: <span className="font-bold text-white">Metropolis Arena Stadium</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/fan-zone"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-white/10 text-cyan-300 border border-white/20 hover:bg-white/20 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <span>Open Fan Zone Mobile Portal 📱</span>
            </a>

            {isPollActive ? (
              <Button
                variant="outline"
                onClick={() => {
                  stopLivePoll();
                  toast.info('Live Poll stopped on stadium screen.');
                }}
                className="bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30 font-bold"
              >
                ● Live: Stop Live Poll (Return to Idle)
              </Button>
            ) : (
              <Button
                variant="primary"
                icon={Tv}
                onClick={() => {
                  launchLivePoll();
                  toast.success('Live Poll launched to stadium display screen!');
                }}
              >
                🚀 Launch Live Poll to Screen
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Brand Switcher */}
      <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Active Brand Identity Theme</h3>
            <p className="text-xs text-slate-500">Transform background colors, logos, and frame stickers instantly.</p>
          </div>
          <Badge variant="indigo" size="sm">
            Active: {activeBrand.name}
          </Badge>
        </div>
        <BrandSwitcher activeBrand={activeBrand} onSelectBrand={setActiveBrand} />
      </div>

      {/* Sub Tabs */}
      <Tabs
        tabs={[
          { id: 'control', label: 'Poll Organizer Control Desk' },
          { id: 'preview', label: 'Live Stadium Jumbotron Display Preview' },
        ]}
        activeTab={activeSubTab}
        onChange={setActiveSubTab}
      />

      {activeSubTab === 'control' && <LivePollModerationPanel />}

      {activeSubTab === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-900 text-white rounded-2xl border border-slate-800">
            <div className="flex items-center gap-3">
              <Tv className="w-5 h-5 text-cyan-400" />
              <div>
                <h4 className="text-sm font-bold text-white">Stadium Display Viewport Preview</h4>
                <p className="text-xs text-slate-400">Live preview of the LED Screen broadcasted to Metropolis Arena.</p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={Tv}
              onClick={() => navigate('/poll-display')}
            >
              Open Fullscreen Mode
            </Button>
          </div>

          <div className="rounded-3xl overflow-hidden border-4 border-slate-800 shadow-2xl">
            <LivePollDisplay isStandalonePage={false} />
          </div>
        </div>
      )}
    </div>
  );
}

function ReactionWallEngagementView({ template }) {

  const navigate = useNavigate();
  const toast = useToast();
  const {
    activeReactions,
    totalCount,
    activeBrand,
    setActiveBrand,
    isReactionWallActive,
    launchReactionWall,
    stopReactionWall,
  } = useReactionWall();

  const [activeSubTab, setActiveSubTab] = useState('control');

  return (
    <div className="space-y-8 animate-in fade-in duration-300 w-full">
      <Link
        to="/library"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Engagement Library
      </Link>

      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row items-start gap-6 w-full">
          <img
            src={template.thumbnail}
            alt={template.title}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-slate-700 shadow-md shrink-0"
          />

          <div className="space-y-3 flex-1 w-full text-left">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant="indigo" size="sm">
                {template.category}
              </Badge>
              <span className="bg-emerald-950 text-emerald-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-800 whitespace-nowrap">
                ● ACTIVE BACKEND ENGAGEMENT
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold text-cyan-300 whitespace-nowrap">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {template.popularity} ({template.ratingCount} reviews)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {template.title}
            </h1>

            <p className="text-sm text-indigo-200/80 max-w-3xl leading-relaxed">
              {template.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-amber-400 font-semibold pt-1 font-mono">
              <span>● Active Particles on Screen: {activeReactions.length}</span>
              <span>● Total Fan Reactions: {totalCount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-indigo-200/70 font-medium">
            Active Venue: <span className="font-bold text-white">Metropolis Arena Stadium</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/fan-zone"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-white/10 text-cyan-300 border border-white/20 hover:bg-white/20 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <span>Open Fan Zone Mobile Portal 📱</span>
            </a>

            {isReactionWallActive ? (
              <Button
                variant="outline"
                onClick={() => {
                  stopReactionWall();
                  toast.info('Reaction Wall stopped on stadium screen.');
                }}
                className="bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30 font-bold"
              >
                ● Live: Stop Reaction Wall (Return to Idle)
              </Button>
            ) : (
              <Button
                variant="primary"
                icon={Tv}
                onClick={() => {
                  launchReactionWall();
                  toast.success('Reaction Wall launched live to stadium screen!');
                }}
              >
                🚀 Launch Reaction Wall to Screen
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Active Brand Identity Theme</h3>
            <p className="text-xs text-slate-500">Transform background colors, logos, and frame stickers instantly.</p>
          </div>
          <Badge variant="indigo" size="sm">
            Active: {activeBrand.name}
          </Badge>
        </div>
        <BrandSwitcher activeBrand={activeBrand} onSelectBrand={setActiveBrand} />
      </div>

      <Tabs
        tabs={[
          { id: 'control', label: 'Reaction Wall Organizer Desk' },
          { id: 'preview', label: 'Live Stadium Display Preview' },
        ]}
        activeTab={activeSubTab}
        onChange={setActiveSubTab}
      />

      {activeSubTab === 'control' && <ReactionWallModerationPanel />}

      {activeSubTab === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-900 text-white rounded-2xl border border-slate-800">
            <div className="flex items-center gap-3">
              <Tv className="w-5 h-5 text-cyan-400" />
              <div>
                <h4 className="text-sm font-bold text-white">Stadium Display Viewport Preview</h4>
                <p className="text-xs text-slate-400">Live preview of the LED Screen broadcasted to Metropolis Arena.</p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={Tv}
              onClick={() => navigate('/reaction-display')}
            >
              Open Fullscreen Mode
            </Button>
          </div>

          <div className="rounded-3xl overflow-hidden border-4 border-slate-800 shadow-2xl">
            <ReactionWallDisplay isStandalonePage={false} />
          </div>
        </div>
      )}
    </div>
  );
}

function MemoryChallengeEngagementView({ template }) {
  const navigate = useNavigate();
  const toast = useToast();
  const {
    isChallengeActive,
    launchChallenge,
    stopChallenge,
    activeBrand,
    setActiveBrand,
    leaderboard,
    customization,
    updateCustomization,
    setCustomization,
  } = useMemoryChallenge();

  const [activeSubTab, setActiveSubTab] = useState('customize');

  return (
    <div className="space-y-8 animate-in fade-in duration-300 w-full">
      {/* Back Link */}
      <Link
        to="/library"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Engagement Library
      </Link>

      {/* Hero Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row items-start gap-6 w-full">
          <img
            src={template.thumbnail}
            alt={template.title}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-slate-700 shadow-md shrink-0"
          />

          <div className="space-y-3 flex-1 w-full text-left">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant="indigo" size="sm">
                {template.category}
              </Badge>
              <span className="bg-emerald-950 text-emerald-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-800 whitespace-nowrap">
                ● ACTIVE BACKEND ENGAGEMENT
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold text-cyan-300 whitespace-nowrap">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {template.popularity} ({template.ratingCount || 340} reviews)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {template.title}
            </h1>

            <p className="text-sm text-indigo-200/80 max-w-3xl leading-relaxed">
              {template.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-cyan-300 font-semibold pt-1 font-mono">
              <span>● Status: {isChallengeActive ? 'Broadcast Live on Jumbotron' : 'Paused / Idle'}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons Toolbar Row */}
        <div className="pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-indigo-200/70 font-medium">
            Active Venue: <span className="font-bold text-white">Metropolis Arena Stadium</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/fan-zone"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-white/10 text-cyan-300 border border-white/20 hover:bg-white/20 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <span>Open Fan Zone Mobile Portal 📱</span>
            </a>

            {isChallengeActive ? (
              <Button
                variant="outline"
                onClick={() => {
                  stopChallenge();
                  toast.info('Memory Challenge stopped. Stadium display returned to Idle.');
                }}
                className="bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30 font-bold"
              >
                ● Live: Stop Challenge (Return to Idle)
              </Button>
            ) : (
              <Button
                variant="primary"
                icon={Tv}
                onClick={() => {
                  launchChallenge();
                  toast.success('Memory Challenge launched live to stadium display screen!');
                }}
              >
                🚀 Launch Challenge to Screen
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Brand Switcher */}
      <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Active Brand Identity Theme</h3>
            <p className="text-xs text-slate-500">Transform background colors and visual identity theme for the screen output.</p>
          </div>
          <Badge variant="indigo" size="sm">
            Active: {activeBrand.name}
          </Badge>
        </div>
        <BrandSwitcher activeBrand={activeBrand} onSelectBrand={setActiveBrand} />
      </div>

      {/* Sub Tabs */}
      <Tabs
        tabs={[
          { id: 'tile-editor', label: '🧩 Brand Tile Editor' },
          { id: 'customize', label: 'Customize Display Screen & Wordings 🎨' },
          { id: 'journey', label: 'Fan Experience & Player Journey 📖' },
        ]}
        activeTab={activeSubTab}
        onChange={setActiveSubTab}
      />

      {/* TAB 0: BRAND TILE EDITOR */}
      {activeSubTab === 'tile-editor' && (
        <MemoryChallengeConfig />
      )}

      {/* TAB 1: CUSTOMIZE DISPLAY SCREEN & WORDINGS */}
      {activeSubTab === 'customize' && (
        <Card className="bg-white border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" /> Custom Screen Headlines, Logos & Copy
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Customize the titles, descriptions, sponsor logos, and broadcast wordings rendered on the stadium display screen.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={Tv}
              onClick={() => navigate('/display')}
              className="bg-indigo-600 hover:bg-indigo-500"
            >
              Preview on Live Screen 📺
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Main Challenge Headline */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Challenge Headline Wording
              </label>
              <input
                type="text"
                value={customization.headline || ''}
                onChange={(e) => updateCustomization('headline', e.target.value)}
                placeholder="e.g. Scan to Play Memory Challenge!"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-400">Large title displayed on the side card above the QR code.</p>
            </div>

            {/* 2. Leaderboard Title */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Leaderboard Section Title
              </label>
              <input
                type="text"
                value={customization.leaderboardTitle || ''}
                onChange={(e) => updateCustomization('leaderboardTitle', e.target.value)}
                placeholder="e.g. Stadium Memory Leaderboard"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-400">Header title of the live rankings table.</p>
            </div>

            {/* 3. Description Copy */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Description & Instructions Copy
              </label>
              <textarea
                rows={3}
                value={customization.description || ''}
                onChange={(e) => updateCustomization('description', e.target.value)}
                placeholder="Test your memory on the big screen! Scan the QR code on your mobile phone to flip & match sponsor tiles..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-400">Explanatory paragraph text on the display screen.</p>
            </div>

            {/* 4. Custom Sponsor Logo / Display Image (File Upload + URL) */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Custom Sponsor Logo / Display Image
              </label>

              {customization.logoUrl ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 p-1.5 flex items-center justify-center shrink-0 shadow-xs">
                      <img
                        src={customization.logoUrl}
                        alt="Custom Logo Preview"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div className="overflow-hidden text-left">
                      <span className="text-xs font-bold text-slate-800 block truncate">Custom Logo Active</span>
                      <span className="text-[10px] text-slate-400 block truncate font-mono">
                        {customization.logoUrl.startsWith('data:') ? 'Local Image File Uploaded' : customization.logoUrl}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      updateCustomization('logoUrl', '');
                      toast.info('Logo removed.');
                    }}
                    className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors text-xs font-bold flex items-center gap-1 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" /> Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <label className="flex-1 w-full cursor-pointer">
                      <div className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-700 flex items-center justify-center gap-2 transition-colors">
                        <Upload className="w-4 h-4 text-indigo-600" />
                        <span>📁 Choose Image File from Device</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files && e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              updateCustomization('logoUrl', ev.target.result);
                              toast.success('Logo image uploaded successfully!');
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>

                    <span className="text-xs text-slate-400 font-bold uppercase">or</span>

                    <input
                      type="text"
                      value={customization.logoUrl || ''}
                      onChange={(e) => updateCustomization('logoUrl', e.target.value)}
                      placeholder="Paste Image URL..."
                      className="flex-1 w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">Upload a PNG/JPG/SVG image file directly from your computer or paste a web URL.</p>
                </div>
              )}
            </div>

            {/* 5. Header Brand Title */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Display Title (Top Left)
              </label>
              <input
                type="text"
                value={customization.logoText || ''}
                onChange={(e) => updateCustomization('logoText', e.target.value)}
                placeholder="e.g. Memory Challenge"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-400">Main title rendered on the top header bar.</p>
            </div>

            {/* 6. Screen Badge Text */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Top Screen Badge Label
              </label>
              <input
                type="text"
                value={customization.badgeText || ''}
                onChange={(e) => updateCustomization('badgeText', e.target.value)}
                placeholder="e.g. LIVE ARENA DISPLAY"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-400">Small pill badge beside the top header title.</p>
            </div>

            {/* 7. Stadium Venue Name */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Stadium Venue Name
              </label>
              <input
                type="text"
                value={customization.venueName || ''}
                onChange={(e) => updateCustomization('venueName', e.target.value)}
                placeholder="e.g. Metropolis Arena Stadium Broadcast"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-400">Venue location printed on top bar and bottom footer.</p>
            </div>
          </div>

          {/* Preset Customization Buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Quick Presets:</span>
              <button
                onClick={() =>
                  setCustomization({
                    headline: 'Halftime Memory Challenge!',
                    description: 'Match all sponsor tiles in under 30 seconds to win VIP match tickets & instant food vouchers!',
                    leaderboardTitle: 'Halftime Top Speedsters',
                    venueName: 'Central Arena Stadium Jumbotron',
                    badgeText: 'HALFTIME SPECIAL',
                    logoUrl: '',
                    logoText: 'Halftime Memory Game',
                  })
                }
                className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition-colors"
              >
                Halftime Special
              </button>
              <button
                onClick={() =>
                  setCustomization({
                    headline: 'Sponsor VIP Memory Challenge',
                    description: 'Match sponsor products and brand logos on your smartphone to claim exclusive fan rewards!',
                    leaderboardTitle: 'VIP Leaderboard Ranks',
                    venueName: 'Metropolis Stadium Jumbotron',
                    badgeText: 'VIP SPONSOR EDITION',
                    logoUrl: '',
                    logoText: 'Sponsor Memory Challenge',
                  })
                }
                className="px-3 py-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-xs font-bold border border-cyan-200 transition-colors"
              >
                Sponsor VIP Theme
              </button>
            </div>

            <Button
              variant="primary"
              onClick={() => toast.success('Display screen customization saved live!')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
            >
              Save Customization Live
            </Button>
          </div>
        </Card>
      )}

      {/* TAB 2: FAN EXPERIENCE GUIDE */}
      {activeSubTab === 'journey' && template.playerJourney && (
        <Card className="bg-white border-slate-200/80 shadow-xs p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-600" /> Fan Experience & Player Journey
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 grid grid-cols-1 md:grid-cols-2 gap-3">
            {template.playerJourney.map((step, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">{step}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function TemplateDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { templates, isLoading, isFavorite, toggleFavorite, duplicateTemplate } = useTemplates();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('preview');
  const [selectedBrand, setSelectedBrand] = useState(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  // Find template by ID
  const template = templates.find((t) => t.id === id);

  if (!template) {
    return (
      <div className="space-y-6">
        <Link
          to="/library"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Engagement Library
        </Link>
        <EmptyState
          title="Template not found"
          description="This engagement template doesn't exist or may have been removed."
          actionLabel="Back to Engagement Library"
          onAction={() => navigate('/library')}
        />
      </div>
    );
  }

  // If viewing Selfie Wall, wrap in SelfieWallProvider & render dedicated view
  if (template.id === 'selfie-wall') {
    return (
      <SelfieWallProvider>
        <SelfieWallEngagementView template={template} />
      </SelfieWallProvider>
    );
  }

  // If viewing Live Poll, wrap in LivePollProvider & render dedicated view
  if (template.id === 'live-poll') {
    return (
      <LivePollProvider>
        <LivePollEngagementView template={template} />
      </LivePollProvider>
    );
  }

  // If viewing Reaction Wall, wrap in ReactionWallProvider & render dedicated view
  if (template.id === 'reaction-wall') {
    return (
      <ReactionWallProvider>
        <ReactionWallEngagementView template={template} />
      </ReactionWallProvider>
    );
  }

  // If viewing Memory Challenge, render dedicated view directly
  if (template.id === 'memory-challenge') {
    return <MemoryChallengeEngagementView template={template} />;
  }



  const favorited = isFavorite(template.id);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 w-full">
      {/* Back Link */}
      <Link
        to="/library"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Engagement Library
      </Link>

      {/* Hero Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row items-start gap-6 w-full">
          <img
            src={template.thumbnail}
            alt={template.title}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-slate-700 shadow-md shrink-0"
          />

          <div className="space-y-3 flex-1 w-full text-left">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant="indigo" size="sm">
                {template.category}
              </Badge>
              <span className="bg-emerald-950 text-emerald-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-800 whitespace-nowrap">
                ● ACTIVE BACKEND TEMPLATE
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold text-cyan-300 whitespace-nowrap">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {template.popularity} ({template.ratingCount || 120} reviews)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {template.title}
            </h1>

            <p className="text-sm text-indigo-200/80 max-w-3xl leading-relaxed">
              {template.description}
            </p>

            {/* Quick Meta Badges */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-indigo-200/70 pt-1">
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                <Clock className="w-3.5 h-3.5 text-cyan-400" /> {template.duration}
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> {template.difficulty}
              </span>
              {template.audienceSize && (
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                  <Users className="w-3.5 h-3.5 text-emerald-400" /> {template.audienceSize}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls & Tags */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5">
            {template.tags?.map((t) => (
              <span key={t} className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 text-xs font-medium border border-slate-700/60">
                #{t}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => toggleFavorite(template.id)}
              variant="outline"
              icon={Heart}
              className={`border-slate-700 ${favorited ? 'text-rose-400 bg-rose-950/40 border-rose-800' : 'text-slate-300 hover:text-white'}`}
            >
              {favorited ? 'Bookmarked' : 'Favorite'}
            </Button>
            {template.id === 'lane-daze' ? (
              localStorage.getItem('fanforge_active_mode') === 'lane-daze' ? (
                <Button
                  onClick={() => {
                    localStorage.setItem('fanforge_active_mode', 'idle');
                    window.dispatchEvent(new Event('storage'));
                    updateScreenStatusApi({ isSelfieWallActive: false, activeMode: 'idle' }).catch(() => {});
                    toast.info('Lane Daze broadcast stopped. Screen returned to Idle.');
                  }}
                  variant="outline"
                  className="bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30 font-bold"
                >
                  ● Live: Stop Broadcast (Return to Idle)
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    localStorage.setItem('fanforge_active_mode', 'lane-daze');
                    window.dispatchEvent(new Event('storage'));
                    updateScreenStatusApi({ isSelfieWallActive: false, activeMode: 'lane-daze' }).catch(() => {});
                    toast.success('Lane Daze launched live on active display screen!');
                  }}
                  variant="primary"
                  icon={Tv}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow-lg"
                >
                  🚀 Launch on Screen
                </Button>
              )
            ) : (
              <Button
                onClick={() => navigate('/builder')}
                variant="primary"
                icon={Sparkles}
                className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg"
              >
                Customize in Visual Studio
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Player Journey Guide */}
      {template.playerJourney && template.playerJourney.length > 0 && (
        <Card className="bg-white border-slate-200/80 shadow-xs p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-600" /> Fan Experience & Player Journey
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 grid grid-cols-1 md:grid-cols-2 gap-3">
            {template.playerJourney.map((step, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">{step}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Interactive Brand Switcher & Gameplay Preview */}
      {template.id !== 'memory-challenge' && template.id !== 'lane-daze' && (
        <div className="space-y-6">
          <BrandSwitcher activeBrand={selectedBrand} onSelectBrand={setSelectedBrand} />
          {selectedBrand && <GameplayMockup brand={selectedBrand} templateId={template.id} />}
        </div>
      )}
    </div>
  );
}
