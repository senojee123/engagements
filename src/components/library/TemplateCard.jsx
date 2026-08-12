import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  Heart,
  Clock,
  Zap,
  Users,
  Copy,
  ArrowUpRight,
  Sparkles,
  Plus,
  Layers,
} from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { useTemplates } from '../../context/TemplateContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { submitInstanceApi } from '../../lib/api';

export default function TemplateCard({ template, viewMode = 'grid' }) {
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite, duplicateTemplate } = useTemplates();
  const { user, currentRole } = useAuth();
  const toast = useToast();
  const [isAdding, setIsAdding] = React.useState(false);

  const favorited = isFavorite(template.id);

  const handleAddToMyEngagements = async (e) => {
    e.stopPropagation();
    if (isAdding) return;
    setIsAdding(true);
    const currentUserId = user?.id || localStorage.getItem('fanforge_user_id') || 'default-user';
    const currentBrand = user?.company || user?.name || 'Brand Account';
    try {
      const res = await submitInstanceApi({
        templateId: template.id,
        appId: template.id,
        userId: currentUserId,
        brandId: currentUserId,
        brandName: currentBrand,
        title: template.title,
        status: 'draft',
        config: { templateId: template.id, title: template.title },
      });
      toast.success(`"${template.title}" successfully added to My Engagements!`);
    } catch (err) {
      toast.error('Failed to add engagement.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    try {
      await toggleFavorite(template.id);
      toast.info(favorited ? `Removed "${template.title}" from favorites` : `Saved "${template.title}" to favorites!`);
    } catch (err) {
      toast.error(err.message || 'Unable to update favorites.');
    }
  };

  const handleDuplicateClick = async (e) => {
    e.stopPropagation();
    try {
      await duplicateTemplate(template);
      toast.success(`Duplicated "${template.title}" into My Templates!`);
    } catch (err) {
      toast.error(err.message || 'Unable to duplicate template.');
    }
  };

  if (viewMode === 'list') {
    return (
      <div
        onClick={() => navigate(`/library/${template.id}`)}
        className="group bg-white border border-slate-200/80 hover:border-indigo-400 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-200 hover:shadow-md cursor-pointer"
      >
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-24 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100">
            <img
              src={template.thumbnail}
              alt=""
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80';
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {template.isFeatured && (
              <span className="absolute top-1.5 left-1.5 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" /> Featured
              </span>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="indigo" size="sm">
                {template.category}
              </Badge>
              <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {template.popularity} ({template.ratingCount})
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
              {template.title}
            </h3>
            <p className="text-xs text-slate-500 line-clamp-1">{template.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-4 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> {template.duration}</span>
            <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-slate-400" /> {template.difficulty}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleFavoriteClick}
              aria-label={favorited ? `Remove ${template.title} from favorites` : `Add ${template.title} to favorites`}
              aria-pressed={favorited}
              className={`p-2 rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                favorited ? 'bg-rose-50 border-rose-200 text-rose-600' : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
              title="Favorite"
            >
              <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
            </button>
            <Button
              size="sm"
              variant="primary"
              icon={Plus}
              onClick={handleAddToMyEngagements}
              isLoading={isAdding}
              className="bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              Add to My Engagements
            </Button>
            <Button
              size="sm"
              variant="outline"
              icon={Copy}
              onClick={handleDuplicateClick}
            >
              Duplicate
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => navigate(`/library/${template.id}`)}
      className={`group bg-white rounded-2xl border transition-all duration-200 hover:shadow-xl cursor-pointer flex flex-col justify-between overflow-hidden relative ${
        template.isFeatured
          ? 'border-indigo-300 ring-2 ring-indigo-500/20 shadow-md'
          : 'border-slate-200/80 hover:border-indigo-400'
      }`}
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
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {template.isFeatured ? (
              <span className="bg-gradient-to-r from-indigo-600 to-cyan-600 text-white text-xs font-extrabold px-2.5 py-1 rounded-xl shadow-md flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Featured
              </span>
            ) : template.status === 'Popular' ? (
              <span className="bg-amber-500 text-slate-950 text-xs font-extrabold px-2.5 py-1 rounded-xl shadow-md flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-current" /> Popular
              </span>
            ) : (
              <Badge variant="indigo" size="sm">
                {template.category}
              </Badge>
            )}
          </div>

          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-label={favorited ? `Remove ${template.title} from favorites` : `Add ${template.title} to favorites`}
            aria-pressed={favorited}
            className={`p-2 rounded-xl backdrop-blur-md transition-all shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
              favorited
                ? 'bg-rose-500 text-white'
                : 'bg-white/80 text-slate-700 hover:bg-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Bottom Rating */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 text-xs text-white font-semibold">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{template.popularity}</span>
          <span className="text-white/70">({template.ratingCount})</span>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors line-clamp-1">
            {template.title}
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {template.description}
          </p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-3 gap-2 border-t border-b border-slate-100 py-3 text-[11px] text-slate-600">
          <div className="flex flex-col items-center text-center">
            <span className="text-slate-400 font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> Time</span>
            <span className="font-bold text-slate-900 mt-0.5">{template.duration}</span>
          </div>
          <div className="flex flex-col items-center text-center border-x border-slate-100">
            <span className="text-slate-400 font-medium flex items-center gap-1"><Zap className="w-3 h-3" /> Level</span>
            <span className="font-bold text-slate-900 mt-0.5">{template.difficulty}</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="text-slate-400 font-medium flex items-center gap-1"><Users className="w-3 h-3" /> Fans</span>
            <span className="font-bold text-slate-900 mt-0.5 truncate max-w-[80px]">{template.audienceSize.split(' ')[0]}</span>
          </div>
        </div>

        {/* Action Button Footer */}
        <div className="flex items-center justify-between gap-2 pt-1">
          {currentRole === 'Brand' ? (
            <Button
              size="sm"
              variant="primary"
              icon={Plus}
              onClick={handleAddToMyEngagements}
              isLoading={isAdding}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 shadow-sm"
            >
              Add to My Engagements
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              icon={ArrowUpRight}
              onClick={() => navigate(`/library/${template.id}`)}
              className="w-full border-slate-200 hover:border-indigo-500 text-slate-700 hover:text-indigo-600 font-semibold text-xs py-2"
            >
              View Engagement Template
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
