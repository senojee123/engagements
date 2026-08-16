import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Heart,
  Copy,
  Sparkles,
  Play,
  Rocket,
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
  Send,
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
import MemoryChallengeConfig, { MASTER_DEFAULT_CONFIG } from './MemoryChallengeConfig';
import LaneDazeConfig from './LaneDazeConfig';
import { useTemplates } from '../../context/TemplateContext';
import { useSelfieWall, SelfieWallProvider } from '../../context/SelfieWallContext';
import { useLivePoll, LivePollProvider } from '../../context/LivePollContext';
import { useReactionWall, ReactionWallProvider } from '../../context/ReactionWallContext';
import { useMemoryChallenge, MemoryChallengeProvider } from '../../context/MemoryChallengeContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { updateScreenStatusApi, submitInstanceApi, fetchInstancesApi, publishInstanceApi, launchInstanceApi } from '../../lib/api';



function useBackLink() {
  const location = useLocation();
  const { currentRole } = useAuth();
  const isFromMyEngagements =
    location.pathname.startsWith('/my-engagements') ||
    location.search.includes('from=my-engagements') ||
    location.state?.from === 'my-engagements';

  return {
    isFromMyEngagements,
    isBrandRole: currentRole === 'Brand',
    path: isFromMyEngagements ? '/my-engagements' : '/library',
    label: isFromMyEngagements ? 'Back to My Engagements' : 'Back to Engagement Library',
  };
}

function SelfieWallEngagementView({ template }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const backLink = useBackLink();
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
  const [instanceStatus, setInstanceStatus] = useState('draft');

  const searchParams = new URLSearchParams(useLocation().search);
  const urlInstanceId = searchParams.get('instanceId');

  useEffect(() => {
    fetchInstancesApi({ appId: 'selfie-wall', userId: user?.id })
      .then((instances) => {
        if (instances && instances.length > 0) {
          const match = urlInstanceId
            ? instances.find((i) => (i.instanceId || i.id) === urlInstanceId) || instances[0]
            : instances[0];
          setInstanceStatus(match.status || 'draft');
        }
      })
      .catch(() => {});
  }, [user?.id, urlInstanceId]);

  const isApproved = !backLink.isBrandRole || (instanceStatus || '').toLowerCase() === 'approved' || (instanceStatus || '').toLowerCase() === 'launched';

  const handleSaveAndSendForApproval = async () => {
    const targetInstId = urlInstanceId || `inst-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    try {
      await submitInstanceApi({
        instanceId: targetInstId,
        templateId: 'selfie-wall',
        appId: 'selfie-wall',
        userId: user?.id || '',
        brandId: user?.id || '',
        brandName: user?.company || user?.name || 'Brand Account',
        title: template.title || 'Live Fan Selfie Wall',
        status: 'pending',
        config: { templateId: 'selfie-wall', instanceId: targetInstId },
      });
      setInstanceStatus('pending');
      toast.success('Live Fan Selfie Wall saved & submitted for Admin Approval!');
    } catch (e) {
      toast.error('Failed to submit for approval.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 w-full">
      {/* Back Link */}
      <Link
        to={backLink.path}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> {backLink.label}
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
            {backLink.isBrandRole && (
              <>
                <Button
                  onClick={async () => {
                    const currentUserId = user?.id || localStorage.getItem('fanforge_user_id') || 'default-user';
                    const currentBrand = user?.company || user?.name || 'Brand Account';
                    const newInstId = `inst-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
                    try {
                      await submitInstanceApi({
                        instanceId: newInstId,
                        templateId: 'selfie-wall',
                        appId: 'selfie-wall',
                        userId: currentUserId,
                        brandId: currentUserId,
                        brandName: currentBrand,
                        title: template.title || 'Live Fan Selfie Wall',
                        status: 'draft',
                        config: { templateId: 'selfie-wall', instanceId: newInstId },
                      });
                      toast.success(`"${template.title}" successfully added to My Engagements!`);
                    } catch (e) {
                      toast.error('Failed to add engagement.');
                    }
                  }}
                  variant="outline"
                  icon={Plus}
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20 font-bold text-xs"
                >
                  Add to My Engagements
                </Button>
                <Button
                  onClick={handleSaveAndSendForApproval}
                  variant="primary"
                  icon={Send}
                  disabled={instanceStatus === 'pending'}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md"
                >
                  {instanceStatus === 'pending' ? '⏳ Submitted for Approval' : 'Save & Send for Approval'}
                </Button>
              </>
            )}
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
                disabled={!isApproved}
                onClick={async () => {
                  if (!isApproved) {
                    toast.error('Cannot launch engagement until it is approved by an Admin.');
                    return;
                  }
                  if (!backLink.isBrandRole) {
                    try {
                      await submitInstanceApi({
                        templateId: 'selfie-wall',
                        appId: 'selfie-wall',
                        userId: user?.id || 'admin',
                        brandId: user?.id || 'admin',
                        brandName: user?.company || user?.name || 'Metropolis Arena Stadium',
                        title: template.title || 'Live Fan Selfie Wall',
                        status: 'launched',
                        config: { templateId: 'selfie-wall' },
                      });
                    } catch (e) {}
                  }
                  launchSelfieWall();
                  toast.success('Selfie Wall launched live to stadium display screen & FanZone portal!');
                }}
                className={!isApproved ? 'opacity-50 cursor-not-allowed bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-800' : ''}
                title={!isApproved ? (instanceStatus === 'pending' ? 'Waiting for Admin Approval' : 'Save & Send for Approval to enable launch') : 'Launch Live to Screen'}
              >
                {instanceStatus === 'pending' ? '⏳ Waiting for Admin Approval' : !isApproved ? '🔒 Approval Required to Launch' : '🚀 Launch Selfie Wall to Screen'}
              </Button>
            )}
          </div>
        </div>
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
  const { user } = useAuth();
  const backLink = useBackLink();
  const {
    activePoll,
    activeBrand,
    setActiveBrand,
    isPollActive,
    launchLivePoll,
    stopLivePoll,
  } = useLivePoll();

  const [activeSubTab, setActiveSubTab] = useState('control');
  const [instanceStatus, setInstanceStatus] = useState('draft');

  useEffect(() => {
    fetchInstancesApi({ appId: 'live-poll', userId: user?.id })
      .then((instances) => {
        if (instances && instances.length > 0) {
          setInstanceStatus(instances[0].status || 'draft');
        }
      })
      .catch(() => {});
  }, [user?.id]);

  const isApproved = !backLink.isBrandRole || (instanceStatus || '').toLowerCase() === 'approved' || (instanceStatus || '').toLowerCase() === 'launched';

  const handleSaveAndSendForApproval = async () => {
    try {
      await submitInstanceApi({
        templateId: 'live-poll',
        appId: 'live-poll',
        userId: user?.id || '',
        brandName: user?.company || user?.name || 'Brand Account',
        title: template.title || 'Stadium Real-Time Live Poll',
        status: 'pending',
        config: { templateId: 'live-poll' },
      });
      setInstanceStatus('pending');
      toast.success('Stadium Live Poll saved & submitted for Admin Approval!');
    } catch (e) {
      toast.error('Failed to submit for approval.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 w-full">
      {/* Back Link */}
      <Link
        to={backLink.path}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> {backLink.label}
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
            {backLink.isBrandRole && (
              <>
                <Button
                  onClick={async () => {
                    const currentUserId = user?.id || localStorage.getItem('fanforge_user_id') || 'default-user';
                    const currentBrand = user?.company || user?.name || 'Brand Account';
                    try {
                      await submitInstanceApi({
                        templateId: 'live-poll',
                        appId: 'live-poll',
                        userId: currentUserId,
                        brandId: currentUserId,
                        brandName: currentBrand,
                        title: template.title || 'Stadium Real-Time Live Poll',
                        status: 'draft',
                        config: { templateId: 'live-poll' },
                      });
                      toast.success(`"${template.title}" successfully added to My Engagements!`);
                    } catch (e) {
                      toast.error('Failed to add engagement.');
                    }
                  }}
                  variant="outline"
                  icon={Plus}
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20 font-bold text-xs"
                >
                  Add to My Engagements
                </Button>
                <Button
                  onClick={handleSaveAndSendForApproval}
                  variant="primary"
                  icon={Send}
                  disabled={instanceStatus === 'pending'}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md"
                >
                  {instanceStatus === 'pending' ? '⏳ Submitted for Approval' : 'Save & Send for Approval'}
                </Button>
              </>
            )}
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
                disabled={!isApproved}
                onClick={async () => {
                  if (!isApproved) {
                    toast.error('Cannot launch engagement until it is approved by an Admin.');
                    return;
                  }
                  if (!backLink.isBrandRole) {
                    try {
                      await submitInstanceApi({
                        templateId: 'live-poll',
                        appId: 'live-poll',
                        userId: user?.id || 'admin',
                        brandId: user?.id || 'admin',
                        brandName: user?.company || user?.name || 'Metropolis Arena Stadium',
                        title: template.title || 'Stadium Real-Time Live Poll',
                        status: 'launched',
                        config: { templateId: 'live-poll' },
                      });
                    } catch (e) {}
                  }
                  launchLivePoll();
                  toast.success('Live Poll launched to stadium display screen & FanZone portal!');
                }}
                className={!isApproved ? 'opacity-50 cursor-not-allowed bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-800' : ''}
                title={!isApproved ? (instanceStatus === 'pending' ? 'Waiting for Admin Approval' : 'Save & Send for Approval to enable launch') : 'Launch Live to Screen'}
              >
                {instanceStatus === 'pending' ? '⏳ Waiting for Admin Approval' : !isApproved ? '🔒 Approval Required to Launch' : '🚀 Launch Live Poll to Screen'}
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
  const { user } = useAuth();
  const backLink = useBackLink();
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
  const [instanceStatus, setInstanceStatus] = useState('draft');

  useEffect(() => {
    fetchInstancesApi({ appId: 'reaction-wall', userId: user?.id })
      .then((instances) => {
        if (instances && instances.length > 0) {
          setInstanceStatus(instances[0].status || 'draft');
        }
      })
      .catch(() => {});
  }, [user?.id]);

  const isApproved = !backLink.isBrandRole || (instanceStatus || '').toLowerCase() === 'approved' || (instanceStatus || '').toLowerCase() === 'launched';

  const handleSaveAndSendForApproval = async () => {
    try {
      await submitInstanceApi({
        templateId: 'reaction-wall',
        appId: 'reaction-wall',
        userId: user?.id || '',
        brandName: user?.company || user?.name || 'Brand Account',
        title: template.title || 'Live Fan Emoji Reaction Wall',
        status: 'pending',
        config: { templateId: 'reaction-wall' },
      });
      setInstanceStatus('pending');
      toast.success('Live Fan Emoji Reaction Wall saved & submitted for Admin Approval!');
    } catch (e) {
      toast.error('Failed to submit for approval.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 w-full">
      <Link
        to={backLink.path}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> {backLink.label}
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
            {backLink.isBrandRole && (
              <>
                <Button
                  onClick={async () => {
                    const currentUserId = user?.id || localStorage.getItem('fanforge_user_id') || 'default-user';
                    const currentBrand = user?.company || user?.name || 'Brand Account';
                    try {
                      await submitInstanceApi({
                        templateId: 'reaction-wall',
                        appId: 'reaction-wall',
                        userId: currentUserId,
                        brandId: currentUserId,
                        brandName: currentBrand,
                        title: template.title || 'Live Fan Emoji Reaction Wall',
                        status: 'draft',
                        config: { templateId: 'reaction-wall' },
                      });
                      toast.success(`"${template.title}" successfully added to My Engagements!`);
                    } catch (e) {
                      toast.error('Failed to add engagement.');
                    }
                  }}
                  variant="outline"
                  icon={Plus}
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20 font-bold text-xs"
                >
                  Add to My Engagements
                </Button>
                <Button
                  onClick={handleSaveAndSendForApproval}
                  variant="primary"
                  icon={Send}
                  disabled={instanceStatus === 'pending'}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md"
                >
                  {instanceStatus === 'pending' ? '⏳ Submitted for Approval' : 'Save & Send for Approval'}
                </Button>
              </>
            )}
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
                disabled={!isApproved}
                onClick={async () => {
                  if (!isApproved) {
                    toast.error('Cannot launch engagement until it is approved by an Admin.');
                    return;
                  }
                  if (!backLink.isBrandRole) {
                    try {
                      await submitInstanceApi({
                        templateId: 'reaction-wall',
                        appId: 'reaction-wall',
                        userId: user?.id || 'admin',
                        brandId: user?.id || 'admin',
                        brandName: user?.company || user?.name || 'Metropolis Arena Stadium',
                        title: template.title || 'Live Fan Emoji Reaction Wall',
                        status: 'launched',
                        config: { templateId: 'reaction-wall' },
                      });
                    } catch (e) {}
                  }
                  launchReactionWall();
                  toast.success('Reaction Wall launched live to stadium screen & FanZone portal!');
                }}
                className={!isApproved ? 'opacity-50 cursor-not-allowed bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-800' : ''}
                title={!isApproved ? (instanceStatus === 'pending' ? 'Waiting for Admin Approval' : 'Save & Send for Approval to enable launch') : 'Launch Live to Screen'}
              >
                {instanceStatus === 'pending' ? '⏳ Waiting for Admin Approval' : !isApproved ? '🔒 Approval Required to Launch' : '🚀 Launch Reaction Wall to Screen'}
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
  const { user } = useAuth();
  const backLink = useBackLink();
  const isFromMyEngagements = backLink.isFromMyEngagements;

  const {
    isChallengeActive,
    launchChallenge,
    stopChallenge,
  } = useMemoryChallenge();

  const [activeSubTab, setActiveSubTab] = useState(isFromMyEngagements ? 'tile-editor' : 'preview');
  const [instanceStatus, setInstanceStatus] = useState(null);
  const [instanceTitle, setInstanceTitle] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (user?.id) {
      fetchInstancesApi({ appId: template.id, userId: user.id })
        .then((instances) => {
          if (!isMounted) return;
          const inst = instances && instances[0];
          setInstanceStatus(inst?.status || null);
          if (inst?.title || inst?.config?.gameTitle) {
            setInstanceTitle(inst.title || inst.config?.gameTitle);
          }
        })
        .catch(() => {});
    }
    return () => { isMounted = false; };
  }, [template.id, user?.id]);

  const isApproved = instanceStatus === 'approved' || instanceStatus === 'launched' || !backLink.isBrandRole;

  return (
    <div className="space-y-8 animate-in fade-in duration-300 w-full">
      {/* Back Link */}
      <Link
        to={backLink.path}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> {backLink.label}
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
                ● MASTER DEFAULT TEMPLATE
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold text-cyan-300 whitespace-nowrap">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {template.popularity} ({template.ratingCount || 340} reviews)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {isFromMyEngagements && instanceTitle ? instanceTitle : template.title}
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
            {!isFromMyEngagements ? (
              <Button
                onClick={async () => {
                  const currentUserId = user?.id || localStorage.getItem('fanforge_user_id') || 'default-user';
                  const currentBrand = user?.company || user?.name || 'Brand Account';
                  try {
                    const res = await submitInstanceApi({
                      templateId: 'memory-challenge',
                      appId: 'memory-challenge',
                      userId: currentUserId,
                      brandId: currentUserId,
                      brandName: currentBrand,
                      title: template.title || '3D Memory Tile Challenge',
                      status: 'draft',
                      config: MASTER_DEFAULT_CONFIG,
                    });
                    toast.success(`"${template.title}" added to My Engagements!`);
                    navigate(`/my-engagements/memory-challenge?instanceId=${res.instanceId || res.id}`);
                  } catch (e) {
                    toast.error('Failed to add engagement.');
                  }
                }}
                variant="primary"
                icon={Plus}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md"
              >
                Add to My Engagements
              </Button>
            ) : (
              <>
                {instanceStatus === 'approved' && (
                  <Button
                    onClick={async () => {
                      const searchParams = new URLSearchParams(window.location.search);
                      const urlInstanceId = searchParams.get('instanceId');
                      let instId = urlInstanceId;
                      if (!instId && user?.id) {
                        try {
                          const insts = await fetchInstancesApi({ appId: 'memory-challenge', userId: user.id });
                          if (insts && insts.length > 0) instId = insts[0].instanceId || insts[0].id;
                        } catch (e) {}
                      }
                      if (instId) {
                        try {
                          await publishInstanceApi(instId);
                          setInstanceStatus('published');
                          toast.success('Published! Customized engagement is now live on FanZone.');
                        } catch (e) {
                          toast.error('Failed to publish engagement.');
                        }
                      }
                    }}
                    variant="primary"
                    icon={Sparkles}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md"
                  >
                    ✨ Publish to FanZone
                  </Button>
                )}

                {instanceStatus === 'pending' && (
                  <Button
                    variant="primary"
                    icon={Send}
                    disabled={true}
                    className="bg-indigo-900/60 text-indigo-300 font-bold border border-indigo-700/50"
                  >
                    ⏳ Submitted for Approval
                  </Button>
                )}

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
                    disabled={!isApproved}
                    onClick={async () => {
                      if (!isApproved) {
                        toast.error('Cannot launch engagement until it is approved by an Admin.');
                        return;
                      }
                      const searchParams = new URLSearchParams(window.location.search);
                      const urlInstanceId = searchParams.get('instanceId');
                      let instId = urlInstanceId;
                      if (!instId && user?.id) {
                        try {
                          const insts = await fetchInstancesApi({ appId: 'memory-challenge', userId: user.id });
                          if (insts && insts.length > 0) instId = insts[0].instanceId || insts[0].id;
                        } catch (e) {}
                      }
                      if (instId) {
                        try {
                          await launchInstanceApi(instId);
                        } catch (e) {}
                      }
                      launchChallenge();
                      toast.success('Memory Challenge launched live to stadium display screen & FanZone portal!');
                    }}
                    className={!isApproved ? 'opacity-50 cursor-not-allowed bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-800' : ''}
                    title={!isApproved ? (instanceStatus === 'pending' ? 'Waiting for Admin Approval' : 'Save & Send for Approval to enable launch') : 'Launch Live to Screen'}
                  >
                    {!isApproved ? '🔒 Approval Required to Launch' : '🚀 Launch Challenge to Screen'}
                  </Button>
                )}
              </>
            )}

            <a
              href="/fan-zone"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-white/10 text-cyan-300 border border-white/20 hover:bg-white/20 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <span>Open Fan Zone Mobile Portal 📱</span>
            </a>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <Tabs
        tabs={
          isFromMyEngagements
            ? [
                { id: 'tile-editor', label: '🧩 Brand Tile Editor' },
                { id: 'journey', label: 'Fan Experience & Player Journey 📖' },
              ]
            : [
                { id: 'preview', label: '📺 Master Template Preview' },
                { id: 'journey', label: 'Fan Experience & Player Journey 📖' },
              ]
        }
        activeTab={activeSubTab}
        onChange={setActiveSubTab}
      />

      {/* TAB: MASTER TEMPLATE PREVIEW (READ-ONLY LIBRARY VIEW) */}
      {!isFromMyEngagements && activeSubTab === 'preview' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Tv className="w-5 h-5 text-indigo-400" />
              <div>
                <h4 className="text-sm font-bold text-white">Immutable Master Template Preview</h4>
                <p className="text-xs text-slate-400">Default stadium memory challenge cards & layout (Read-Only).</p>
              </div>
            </div>
            <Badge variant="indigo" size="sm">Master Default</Badge>
          </div>
          <MemoryChallengeDisplay isMasterDefault={true} />
        </div>
      )}

      {/* TAB: BRAND TILE EDITOR (MY ENGAGEMENTS INSTANCE VIEW) */}
      {isFromMyEngagements && activeSubTab === 'tile-editor' && (
        <MemoryChallengeConfig onSubmitted={() => setInstanceStatus('pending')} />
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

function LaneDazeEngagementView({ template }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const backLink = useBackLink();
  const isFromMyEngagements = backLink.isFromMyEngagements;

  const [activeSubTab, setActiveSubTab] = useState(isFromMyEngagements ? 'lane-dash-editor' : 'preview');
  const [instanceStatus, setInstanceStatus] = useState(null);
  const [instanceTitle, setInstanceTitle] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (user?.id) {
      fetchInstancesApi({ appId: template.id, userId: user.id })
        .then((instances) => {
          if (!isMounted) return;
          const inst = instances && instances[0];
          setInstanceStatus(inst?.status || null);
          if (inst?.title || inst?.config?.gameTitle) {
            setInstanceTitle(inst.title || inst.config?.gameTitle);
          }
        })
        .catch(() => {});
    }
    return () => { isMounted = false; };
  }, [template.id, user?.id]);

  const handleLaunch = async (instanceId, e) => {
    if (e) e.stopPropagation();
    try {
      await launchInstanceApi(instanceId);
      toast.success('Lane Dash launched live to stadium screens!');
      setInstanceStatus('launched');
    } catch (err) {
      toast.error('Failed to launch live.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 w-full text-left">
      {/* Back Link */}
      <Link
        to={backLink.path}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> {backLink.label}
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
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {template.popularity} ({template.ratingCount || 275} reviews)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {isFromMyEngagements && instanceTitle ? instanceTitle : template.title}
            </h1>

            <p className="text-sm text-indigo-200/80 max-w-3xl leading-relaxed">
              {template.description}
            </p>
          </div>
        </div>

        {/* Action Buttons Toolbar Row */}
        <div className="pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-indigo-200/70 font-medium">
            Active Venue: <span className="font-bold text-white">Metropolis Arena Stadium</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isFromMyEngagements && (instanceStatus === 'approved' || instanceStatus === 'published') && (
              <Button
                onClick={(e) => {
                  fetchInstancesApi({ appId: 'lane-daze', userId: user.id }).then((instances) => {
                    const inst = instances && instances[0];
                    if (inst) handleLaunch(inst.instanceId || inst.id, e);
                  });
                }}
                variant="primary"
                icon={Rocket}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md animate-pulse"
              >
                🚀 Launch Live to Screen
              </Button>
            )}
            
            {isFromMyEngagements && (
              <a
                href={`/fan-zone?brandId=${user?.id}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-white/10 text-cyan-300 border border-white/20 hover:bg-white/20 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <span>Open Fan Zone Mobile Portal 📱</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <Tabs
        tabs={
          isFromMyEngagements
            ? [
                { id: 'lane-dash-editor', label: '🏎️ Customize Brand' },
                { id: 'journey', label: 'Fan Experience & Player Journey 📖' },
              ]
            : [
                { id: 'preview', label: '📺 Stadium Leaderboard Preview' },
                { id: 'journey', label: 'Fan Experience & Player Journey 📖' },
              ]
        }
        activeTab={activeSubTab}
        onChange={setActiveSubTab}
      />

      {/* TAB: STADIUM LEADERBOARD PREVIEW */}
      {!isFromMyEngagements && activeSubTab === 'preview' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Tv className="w-5 h-5 text-indigo-400" />
              <div>
                <h4 className="text-sm font-bold text-white">Immutable Leaderboard Preview</h4>
                <p className="text-xs text-slate-400">Default stadium Lane Dash scoreboard view (Read-Only).</p>
              </div>
            </div>
            <Badge variant="indigo" size="sm">Master Default</Badge>
          </div>
          <LaneDazeDisplay isStandalonePage={true} />
        </div>
      )}

      {/* TAB: BRAND EDITOR */}
      {isFromMyEngagements && activeSubTab === 'lane-dash-editor' && (
        <LaneDazeConfig onSubmitted={() => setInstanceStatus('pending')} />
      )}

      {/* TAB: FAN EXPERIENCE GUIDE */}
      {activeSubTab === 'journey' && template.playerJourney && (
        <Card className="bg-white border-slate-200/80 shadow-xs p-6 col-span-1 md:col-span-2">
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
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('preview');
  const [selectedBrand, setSelectedBrand] = useState(null);
  const backLink = useBackLink();

  const handleAddToMyEngagements = async () => {
    if (!template) return;
    try {
      const res = await submitInstanceApi({
        templateId: template.id,
        appId: template.id,
        userId: user?.id || '',
        brandName: user?.company || user?.name || 'Brand Account',
        title: template.title,
        status: 'draft',
        config: { templateId: template.id, title: template.title },
      });
      toast.success(`"${template.title}" successfully added to My Engagements!`);
    } catch (err) {
      toast.error('Failed to add engagement.');
    }
  };

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
          to={backLink.path}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {backLink.label}
        </Link>
        <EmptyState
          title="Template not found"
          description="This engagement template doesn't exist or may have been removed."
          actionLabel={backLink.label}
          onAction={() => navigate(backLink.path)}
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

  // If viewing Lane Dash, render dedicated view directly
  if (template.id === 'lane-daze') {
    return <LaneDazeEngagementView template={template} />;
  }



  const favorited = isFavorite(template.id);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 w-full">
      {/* Back Link */}
      <Link
        to={backLink.path}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> {backLink.label}
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
            {backLink.isBrandRole && !backLink.isFromMyEngagements && (
              <Button
                onClick={handleAddToMyEngagements}
                variant="primary"
                icon={Plus}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md"
              >
                Add to My Engagements
              </Button>
            )}
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
                    updateScreenStatusApi({ isSelfieWallActive: false, activeMode: 'idle' }).catch(() => { });
                    toast.info('Lane Dash broadcast stopped. Screen returned to Idle.');
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
                    updateScreenStatusApi({ isSelfieWallActive: false, activeMode: 'lane-daze' }).catch(() => { });
                    toast.success('Lane Dash launched live on active display screen!');
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
