import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List as ListIcon,
  Sparkles,
  Plus,
  BookmarkCheck,
  Star,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Dropdown from '../../components/ui/Dropdown';
import EmptyState from '../../components/ui/EmptyState';
import FilterPills from '../../components/ui/FilterPills';
import TemplateCard from '../../components/library/TemplateCard';
import { useTemplates } from '../../context/TemplateContext';
import { CATEGORIES } from '../../constants/categories';

export default function EngagementLibrary() {
  const navigate = useNavigate();
  const {
    templates,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedDifficulty,
    setSelectedDifficulty,
    selectedDuration,
    setSelectedDuration,
    sortBy,
    setSortBy,
  } = useTemplates();

  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  const difficultyOptions = [
    { value: 'All', label: 'All Difficulties' },
    { value: 'Easy', label: 'Easy' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Hard', label: 'Hard' },
  ];

  const durationOptions = [
    { value: 'All', label: 'All Durations' },
    { value: '< 1 min', label: '< 1 min' },
    { value: '1-3 mins', label: '1-3 mins' },
    { value: '3-5 mins', label: '3-5 mins' },
    { value: '> 5 mins', label: '> 5 mins' },
  ];

  const sortOptions = [
    { value: 'popularity', label: 'Sort by Popularity' },
    { value: 'title', label: 'Sort by Name' },
    { value: 'difficulty', label: 'Sort by Difficulty' },
  ];

  // Instant Search & Multi-tier Filtering logic
  const filteredTemplates = templates.filter((tpl) => {
    // Search Query (title, category, tags, description)
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      tpl.title.toLowerCase().includes(query) ||
      tpl.category.toLowerCase().includes(query) ||
      tpl.description.toLowerCase().includes(query) ||
      tpl.tags.some((tag) => tag.toLowerCase().includes(query));

    // Category Filter
    const matchesCategory = selectedCategory === 'All' || tpl.category === selectedCategory;

    // Difficulty Filter
    const matchesDifficulty = selectedDifficulty === 'All' || tpl.difficulty === selectedDifficulty;

    // Duration Filter
    const matchesDuration = selectedDuration === 'All' || tpl.duration === selectedDuration;

    return matchesSearch && matchesCategory && matchesDifficulty && matchesDuration;
  });

  // Sorting
  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    if (sortBy === 'difficulty') return a.difficulty.localeCompare(b.difficulty);
    return b.popularity - a.popularity; // Default: Popularity desc
  });

  const featuredTemplates = templates.filter((t) => t.isFeatured);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-cyan-300 text-xs font-semibold mb-3 border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Experience Marketplace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Engagement Library
            </h1>
            <p className="text-indigo-200/80 text-sm mt-1 leading-relaxed">
              Choose from professionally designed engagement experiences that can be customized for any brand or event.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              onClick={() => navigate('/library/my-templates')}
              variant="outline"
              icon={BookmarkCheck}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              My Saved Templates
            </Button>
          </div>
        </div>
      </div>

      {/* Featured Templates Banner */}
      {searchQuery === '' && selectedCategory === 'All' && featuredTemplates.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <h2 className="text-lg font-bold text-slate-900">Featured Experiences</h2>
            </div>
            <span className="text-xs text-slate-500">Hand-crafted high conversion games</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} viewMode="grid" />
            ))}
          </div>
        </div>
      )}

      {/* Toolbar: Instant Search, Category Filter Chips, Multi-Filters */}
      <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Search & Main Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Instant Search Input */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates e.g. 'game', 'photo', 'product'..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <Dropdown
            options={difficultyOptions}
            value={selectedDifficulty}
            onChange={(val) => setSelectedDifficulty(val)}
          />

          <Dropdown
            options={durationOptions}
            value={selectedDuration}
            onChange={(val) => setSelectedDuration(val)}
          />
        </div>

        {/* Category Chips Bar */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-4">
          <FilterPills options={CATEGORIES} value={selectedCategory} onChange={setSelectedCategory} />

          {/* View Mode & Sort Toggle */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <div className="w-48">
              <Dropdown
                options={sortOptions}
                value={sortBy}
                onChange={(val) => setSortBy(val)}
              />
            </div>
            <div className="flex items-center gap-1 border border-slate-200 rounded-xl p-1 bg-slate-50">
              <button
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
                aria-pressed={viewMode === 'grid'}
                className={`p-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  viewMode === 'grid' ? 'bg-white shadow-xs text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                aria-label="List view"
                aria-pressed={viewMode === 'list'}
                className={`p-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  viewMode === 'list' ? 'bg-white shadow-xs text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Templates Gallery */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            All Experiences ({sortedTemplates.length})
          </h2>
          <span className="text-xs text-slate-500">
            Showing results for category: <span className="font-semibold text-indigo-600">{selectedCategory}</span>
          </span>
        </div>

        {sortedTemplates.length > 0 ? (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {sortedTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} viewMode={viewMode} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No active backend engagements published"
            description="Engagement templates deployed from the backend API will automatically appear here."
            actionLabel="Reset Filters"
            onAction={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedDifficulty('All');
              setSelectedDuration('All');
            }}
          />
        )}
      </div>
    </div>
  );
}
