import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookmarkCheck,
  Clock,
  FileEdit,
  ShoppingBag,
  Plus,
  ArrowLeft,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Tabs from '../../components/ui/Tabs';
import TemplateCard from '../../components/library/TemplateCard';
import EmptyState from '../../components/ui/EmptyState';
import { useTemplates } from '../../context/TemplateContext';

export default function MyTemplates() {
  const navigate = useNavigate();
  const { templates, favorites, myTemplates } = useTemplates();
  const [activeTab, setActiveTab] = useState('favorites');

  // Filter templates
  const favoritedTemplates = templates.filter((t) => favorites.includes(t.id));
  const recentTemplates = templates.slice(0, 4); // Recently accessed preview templates

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Saved Templates & Favorites</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your bookmarked experiences and saved backend engagement templates.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'favorites', label: `Favorites (${favoritedTemplates.length})`, icon: BookmarkCheck },
          { id: 'recent', label: 'Recently Used', icon: Clock },
          { id: 'drafts', label: `Drafts (${myTemplates.length})`, icon: FileEdit },
          { id: 'purchased', label: 'Purchased (0)', icon: ShoppingBag },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Content */}
      {activeTab === 'favorites' && (
        <div>
          {favoritedTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoritedTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} viewMode="grid" />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={BookmarkCheck}
              title="No favorite templates saved"
              description="Click the heart icon on any template in the library to save it here for quick access."
              actionLabel="Browse Engagement Library"
              onAction={() => navigate('/library')}
            />
          )}
        </div>
      )}

      {activeTab === 'recent' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentTemplates.map((template) => (
            <TemplateCard key={template.id} template={template} viewMode="grid" />
          ))}
        </div>
      )}

      {activeTab === 'drafts' && (
        <div>
          {myTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} viewMode="grid" />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={FileEdit}
              title="No saved template drafts"
              description="Templates saved from backend activations will appear here."
              actionLabel="Browse Engagement Library"
              onAction={() => navigate('/library')}
            />
          )}
        </div>
      )}

      {activeTab === 'purchased' && (
        <EmptyState
          icon={ShoppingBag}
          title="No premium purchased templates"
          description="All Phase 1 & 2 templates are currently available under your Enterprise plan."
          actionLabel="Explore Marketplace"
          onAction={() => navigate('/library')}
        />
      )}
    </div>
  );
}
