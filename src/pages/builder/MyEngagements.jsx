import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Gamepad2,
  Plus,
  Sparkles,
  Star,
  Clock,
  Zap,
  Users,
  Rocket,
  Edit2,
  Copy,
  Check,
  Lock,
  ArrowUpRight,
  Trash2,
  Send,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTemplates } from '../../context/TemplateContext';
import { fetchInstancesApi, launchInstanceApi, deleteInstanceApi, submitInstanceApi, publishInstanceApi } from '../../lib/api';

export default function MyEngagements() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const { templates } = useTemplates();

  const [myInstances, setMyInstances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  // Guards state updates from the fetchInstancesApi background revalidation callback,
  // which can resolve after this component has unmounted (e.g. user navigated away).
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadMyEngagements = async () => {
    setIsLoading(true);
    const targetUserId = user?.id || localStorage.getItem('fanforge_user_id') || 'default-user';
    try {
      const instances = await fetchInstancesApi(
        { userId: targetUserId, brandId: targetUserId },
        (freshInstances) => {
          // Fires once the background revalidation resolves — without this, a stale
          // cached list could be shown indefinitely even though fresher data exists.
          if (isMountedRef.current) setMyInstances(freshInstances || []);
        }
      );
      if (isMountedRef.current) setMyInstances(instances || []);
    } catch (err) {
      if (isMountedRef.current) toast.error('Unable to fetch your selected engagements.');
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMyEngagements();
  }, [user]);

  const handleLaunch = async (instanceId, e) => {
    if (e) e.stopPropagation();
    try {
      await launchInstanceApi(instanceId);
      toast.success('🚀 Engagement launched live to stadium displays and FanZone portal!');
      loadMyEngagements();
    } catch (err) {
      toast.error(err.message || 'Cannot launch engagement until approved by Admin.');
    }
  };

  const handleSendForApproval = async (inst, e) => {
    if (e) e.stopPropagation();
    try {
      await submitInstanceApi({
        instanceId: inst.instanceId || inst.id,
        templateId: inst.templateId || inst.appId,
        appId: inst.appId || inst.templateId,
        userId: user?.id || '',
        brandName: user?.company || user?.name || 'Brand Account',
        title: inst.title || 'Engagement Activation',
        status: 'pending',
        config: inst.config || {},
      });
      toast.success(`Submitted "${inst.title || 'Engagement'}" for Admin Approval!`);
      loadMyEngagements();
    } catch (err) {
      toast.error('Failed to send for approval.');
    }
  };

  const handlePublish = async (instanceId, e) => {
    if (e) e.stopPropagation();
    try {
      await publishInstanceApi(instanceId);
      toast.success('Published! Customized engagement is now live on FanZone.');
      loadMyEngagements();
    } catch (err) {
      toast.error('Failed to publish engagement.');
    }
  };

  const handleDelete = async (instanceId, title, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Are you sure you want to remove "${title}" from My Engagements?`)) return;
    try {
      // Find the instance to get its appId before deleting
      const inst = myInstances.find((i) => (i.instanceId || i.id) === instanceId);
      await deleteInstanceApi(instanceId);

      // Clear ALL brand-scoped draft/cache keys so re-adding starts fresh from master defaults
      if (user?.id) {
        const userId = user.id;
        try {
          localStorage.removeItem(`fanforge_mc_draft_${userId}`);
          localStorage.removeItem(`fanforge_game_config_${instanceId}`);
          localStorage.removeItem(`fanforge_game_config_${userId}_memory-challenge`);
          // Also clear legacy keys
          localStorage.removeItem('fanforge_memory_customization');
          localStorage.removeItem('fanforge_game_config_memory-challenge');
        } catch (e) {}
      }

      toast.success(`Removed "${title}" from My Engagements`);
      setMyInstances((prev) => prev.filter((i) => (i.instanceId || i.id) !== instanceId));
    } catch (err) {
      toast.error('Failed to remove engagement.');
    }
  };

  const copyToClipboard = (text, id, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('UUID copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'approved':
        return <Badge variant="emerald" size="sm">Approved — Ready to Publish</Badge>;
      case 'published':
        return <Badge variant="indigo" size="sm">Published to FanZone</Badge>;
      case 'launched':
        return <Badge variant="indigo" size="sm">🚀 Launched & Live</Badge>;
      case 'rejected':
        return <Badge variant="rose" size="sm">Changes Requested</Badge>;
      case 'pending':
        return <Badge variant="amber" size="sm">⏳ Under Admin Review</Badge>;
      default:
        return <Badge variant="slate" size="sm">Draft</Badge>;
    }
  };

  const findTemplate = (inst) => {
    const tId = inst.templateId || inst.appId || '';
    const match = (templates || []).find((t) => t.id === tId || t.id === tId.toLowerCase());
    if (match) return match;

    if (tId.includes('memory') || (inst.title || '').toLowerCase().includes('memory')) {
      return {
        id: 'memory-challenge',
        title: inst.title || 'Memory Challenge',
        category: 'Games',
        description: 'Interactive tile-matching memory game for stadium big screens and venue mobile apps. Fans memorize brand icons under time pressure to win instant rewards.',
        thumbnail: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?auto=format&fit=crop&w=600&q=80',
        duration: '1-3 mins',
        difficulty: 'Medium',
        audienceSize: '100 - 100,000+',
        popularity: 4.91,
        ratingCount: 340,
      };
    }
    if (tId.includes('reaction') || (inst.title || '').toLowerCase().includes('reaction')) {
      return {
        id: 'reaction-wall',
        title: inst.title || 'Live Fan Emoji Reaction Wall',
        category: 'Audience Participation',
        description: 'Real-time emoji reaction stream for stadium big screens and venue Jumbotrons. Fans tap reaction emojis on mobile smartphones.',
        thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
        duration: '1-3 mins',
        difficulty: 'Easy',
        audienceSize: '100 - 100,000+',
        popularity: 4.98,
        ratingCount: 620,
      };
    }
    if (tId.includes('poll') || (inst.title || '').toLowerCase().includes('poll')) {
      return {
        id: 'live-poll',
        title: inst.title || 'Real-Time Stadium Live Poll',
        category: 'Voting',
        description: 'Interactive halftime and match-day live voting for stadium big screens. Fans scan QR code to cast votes.',
        thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80',
        duration: '1-3 mins',
        difficulty: 'Easy',
        audienceSize: '100 - 100,000+',
        popularity: 4.95,
        ratingCount: 512,
      };
    }
    if (tId.includes('selfie') || (inst.title || '').toLowerCase().includes('selfie')) {
      return {
        id: 'selfie-wall',
        title: inst.title || 'Live Fan Selfie Wall',
        category: 'Photo Experiences',
        description: 'Real-time digital selfie wall for stadium screens and venues. Fans scan Jumbotron QR code to upload photos.',
        thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80',
        duration: '3-5 mins',
        difficulty: 'Easy',
        audienceSize: '100 - 100,000+',
        popularity: 4.9,
        ratingCount: 488,
      };
    }
    if (tId.includes('lane') || (inst.title || '').toLowerCase().includes('lane')) {
      return {
        id: 'lane-daze',
        title: inst.title || 'Lane Dash',
        category: 'Games',
        description: 'High-energy 3-lane arcade endless runner engagement template for stadium big screens and venue mobile fan portals.',
        thumbnail: '/lane_daze.png',
        duration: '1-3 mins',
        difficulty: 'Medium',
        audienceSize: '100 - 100,000+',
        popularity: 4.94,
        ratingCount: 275,
      };
    }
    if (tId.includes('wheel') || tId.includes('spin') || (inst.title || '').toLowerCase().includes('spin')) {
      return {
        id: 'spin-wheel',
        title: inst.title || 'Spin the Wheel',
        category: 'Contests',
        description: 'Interactive prize wheel engagement template for stadium big screens and venue mobile fan portals. Fans spin the wheel to win instant sponsor rewards, coupons, and VIP perks.',
        thumbnail: '/spin_wheel.jpg',
        duration: '1-2 mins',
        difficulty: 'Easy',
        audienceSize: '100 - 100,000+',
        popularity: 4.96,
        ratingCount: 410,
      };
    }

    return {
      id: tId || 'custom-engagement',
      title: inst.title || 'Custom Brand Engagement',
      category: 'Engagement',
      description: 'Customized stadium engagement activation for fan interaction and live big screen broadcast.',
      thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80',
      duration: '1-3 mins',
      difficulty: 'Easy',
      audienceSize: '100 - 100,000+',
      popularity: 4.9,
      ratingCount: 200,
    };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> My Selected Brand Activations
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Engagements
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-xl">
            Manage your registered activations, customize game assets & copy, and launch approved engagements live to arena screens.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => navigate('/library')}
            className="bg-indigo-600 hover:bg-indigo-500 shadow-md"
          >
            Select New Engagement
          </Button>
        </div>
      </div>

      {/* Instance List */}
      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-500">Loading your engagements...</p>
        </div>
      ) : myInstances.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Gamepad2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">No Engagements Selected Yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Select an engagement template from the library to register it under My Engagements.
            </p>
          </div>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => navigate('/library')}
            className="bg-indigo-600 hover:bg-indigo-500"
          >
            Browse Engagement Library
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myInstances.map((inst) => {
            const template = findTemplate(inst);
            const statusLower = (inst.status || '').toLowerCase();
            const isApproved = statusLower === 'approved';
            const isPublished = statusLower === 'published';
            const isLaunched = statusLower === 'launched';
            const isPending = statusLower === 'pending';

            return (
              <div
                key={inst.instanceId || inst.id}
                onClick={() => navigate(`/my-engagements/${template.id}?instanceId=${inst.instanceId || inst.id}`)}
                className="group bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-400 transition-all duration-200 hover:shadow-xl flex flex-col justify-between overflow-hidden relative cursor-pointer"
              >
                {/* Thumbnail Banner */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                  <img
                    src={template.thumbnail}
                    alt=""
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />

                  {/* Top Header Row Badges & UUID */}
                  <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1">
                      <Badge variant="indigo" size="sm" className="w-fit">
                        {template.category}
                      </Badge>
                      {inst.status && inst.status !== 'draft' && getStatusBadge(inst.status)}
                    </div>

                    {inst.instanceId && (
                      <span className="text-[10px] font-mono font-semibold text-slate-900 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg border border-white/40 flex items-center gap-1 shadow-xs shrink-0">
                        UUID: {inst.instanceId.slice(0, 10)}...
                        <button
                          onClick={(e) => copyToClipboard(inst.instanceId, inst.instanceId, e)}
                          className="text-slate-500 hover:text-slate-900 ml-0.5"
                          title="Copy UUID"
                        >
                          {copiedId === inst.instanceId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </span>
                    )}
                  </div>

                  {/* Bottom Rating */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 text-xs text-white font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{template.popularity || 4.91}</span>
                    <span className="text-white/70">({template.ratingCount || 340})</span>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {inst.title || template.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {template.description}
                    </p>
                  </div>

                  {/* Info Grid — Time, Level, Fans */}
                  <div className="grid grid-cols-3 gap-2 border-t border-b border-slate-100 py-3 text-[11px] text-slate-600">
                    <div className="flex flex-col items-center text-center">
                      <span className="text-slate-400 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> Time
                      </span>
                      <span className="font-bold text-slate-900 mt-0.5">{template.duration || '1-3 mins'}</span>
                    </div>
                    <div className="flex flex-col items-center text-center border-x border-slate-100">
                      <span className="text-slate-400 font-medium flex items-center gap-1">
                        <Zap className="w-3 h-3 text-slate-400" /> Level
                      </span>
                      <span className="font-bold text-slate-900 mt-0.5">{template.difficulty || 'Medium'}</span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <span className="text-slate-400 font-medium flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" /> Fans
                      </span>
                      <span className="font-bold text-slate-900 mt-0.5 truncate max-w-[80px]">
                        {(template.audienceSize || '100').split(' ')[0]}
                      </span>
                    </div>
                  </div>

                  {/* Brand & Date */}
                  <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                    <span>
                      Brand: <strong className="text-slate-800">{inst.brandName || user?.company || 'Brand Account'}</strong>
                    </span>
                    <span>{new Date((inst.publishedAt || inst.createdAt || Date.now() / 1000) * 1000).toLocaleDateString()}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between gap-1.5 pt-1 w-full" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={ArrowUpRight}
                      onClick={() => navigate(`/my-engagements/${template.id}?instanceId=${inst.instanceId || inst.id}`)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex-1 shadow-sm"
                    >
                      Open Engagement
                    </Button>

                    {(!inst.status || inst.status === 'draft') && (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Send}
                        onClick={(e) => handleSendForApproval(inst, e)}
                        className="bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 font-bold text-xs shrink-0"
                      >
                        Send for Approval
                      </Button>
                    )}

                    {(isApproved || isPublished) && (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Rocket}
                        onClick={(e) => handleLaunch(inst.instanceId, e)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs shadow-md animate-pulse shrink-0"
                      >
                        🚀 Launch Live
                      </Button>
                    )}

                    {isLaunched && (
                      <Badge variant="indigo" size="sm">
                        ✅ Live
                      </Badge>
                    )}

                    <Button
                      variant="danger"
                      size="sm"
                      icon={Trash2}
                      onClick={(e) => handleDelete(inst.instanceId || inst.id, inst.title || template.title, e)}
                      className="bg-rose-600 hover:bg-rose-500 text-white font-bold shrink-0 shadow-sm w-8 h-8 flex items-center justify-center p-0"
                      title="Delete Engagement"
                      aria-label="Delete Engagement"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
