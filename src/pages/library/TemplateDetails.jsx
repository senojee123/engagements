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
import { useTemplates } from '../../context/TemplateContext';
import { useSelfieWall, SelfieWallProvider } from '../../context/SelfieWallContext';
import { useLivePoll, LivePollProvider } from '../../context/LivePollContext';
import { useReactionWall, ReactionWallProvider } from '../../context/ReactionWallContext';
import { useToast } from '../../context/ToastContext';



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



  const favorited = isFavorite(template.id);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 w-full">
      <Link
        to="/library"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Engagement Library
      </Link>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start gap-5">
          <img
            src={template.thumbnail}
            alt={template.title}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-slate-200 shadow-md shrink-0"
          />
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {template.title}
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              {template.description}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <BrandSwitcher activeBrand={selectedBrand} onSelectBrand={setSelectedBrand} />
        {selectedBrand && <GameplayMockup brand={selectedBrand} templateId={template.id} />}
      </div>
    </div>
  );
}
