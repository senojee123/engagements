import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { fetchTemplates, createTemplateApi } from '../lib/api';

const DEFAULT_FALLBACK_TEMPLATES = [
  {
    id: 'memory-challenge',
    title: 'Memory Challenge',
    category: 'Games',
    description:
      'Interactive tile-matching memory game for stadium big screens and venue mobile apps. Fans memorize brand icons and card locations under time pressure to unlock instant prizes and dynamic leaderboard ranks.',
    thumbnail: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?auto=format&fit=crop&w=600&q=80',
    duration: '1-3 mins',
    difficulty: 'Medium',
    audienceSize: '100 - 100,000+',
    popularity: 4.91,
    ratingCount: 340,
    tags: ['Memory Game', 'Tile Matching', 'Gamification', 'Sponsor Rewards', 'Fan Engagement'],
    status: 'Active Backend',
    isFeatured: true,
    supportedOutputs: ['Mobile Web', 'LED Screen', 'Projector', 'TV Display', 'Jumbotron'],
    defaultBrand: 'coca-cola',
    playerJourney: [
      '1. Scan QR Code displayed on venue screens or access inside match-day mobile app.',
      '2. A grid of hidden sponsor & team cards is displayed briefly for 5 seconds.',
      '3. Cards flip face down, initiating the memory challenge countdown timer.',
      '4. Tap matching pairs in succession to build dynamic combo multipliers and score points.',
      '5. Complete the grid before time expires to claim instant sponsor coupon rewards!',
    ],
  },
  {
    id: 'reaction-wall',
    title: 'Live Fan Emoji Reaction Wall',
    category: 'Audience Participation',
    description:
      'Real-time emoji reaction stream for stadium big screens and venue Jumbotrons. Fans tap reaction emojis on their mobile smartphones to burst floating emoji particles live across the screen!',
    thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
    duration: '1-3 mins',
    difficulty: 'Easy',
    audienceSize: '100 - 100,000+',
    popularity: 4.98,
    ratingCount: 620,
    tags: ['Emoji Stream', 'Reaction Wall', 'Particle Effects', 'Real-Time WebSocket', 'Jumbotron Broadcast'],
    status: 'Active Backend',
    isFeatured: true,
  },
  {
    id: 'live-poll',
    title: 'Real-Time Stadium Live Poll',
    category: 'Voting',
    description:
      'Interactive halftime and match-day live voting for stadium big screens. Fans scan the QR code on Jumbotrons or mobile phones to cast votes, driving live animated percentage bars.',
    thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80',
    duration: '1-3 mins',
    difficulty: 'Easy',
    audienceSize: '100 - 100,000+',
    popularity: 4.95,
    ratingCount: 512,
    tags: ['Live Poll', 'Jumbotron Voting', 'Halftime Question', 'Real-Time WebSocket'],
    status: 'Active Backend',
    isFeatured: true,
  },
  {
    id: 'selfie-wall',
    title: 'Live Fan Selfie Wall',
    category: 'Photo Experiences',
    description:
      'Real-time digital selfie wall for stadium screens and venues. Fans scan Jumbotron QR code to upload photos, which enter an AI & Admin Moderation Queue before live broadcast.',
    thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80',
    duration: '3-5 mins',
    difficulty: 'Easy',
    audienceSize: '100 - 100,000+',
    popularity: 4.9,
    ratingCount: 488,
    tags: ['Mosaic Wall', 'Selfie Upload', 'AI Moderation Queue', 'Jumbotron Broadcast'],
    status: 'Active Backend',
    isFeatured: true,
  },
];

const TemplateContext = createContext(null);

export const TemplateProvider = ({ children }) => {
  const { user, updateProfile } = useAuth();

  const [templates, setTemplates] = useState(DEFAULT_FALLBACK_TEMPLATES);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedDuration, setSelectedDuration] = useState('All');
  const [sortBy, setSortBy] = useState('popularity');

  useEffect(() => {
    let cancelled = false;
    fetchTemplates()
      .then((data) => {
        if (!cancelled && Array.isArray(data)) {
          // Merge API data with built-in templates to guarantee memory-challenge is always present
          const fetchedIds = new Set(data.map((t) => t.id));
          const missingBuiltIns = DEFAULT_FALLBACK_TEMPLATES.filter((t) => !fetchedIds.has(t.id));
          setTemplates([...data, ...missingBuiltIns]);
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch templates, fallback to built-in templates:', err);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const favorites = user?.favoriteTemplateIds || [];
  const myTemplates = templates.filter((t) => t.createdByUserId === user?.id);

  const toggleFavorite = async (id) => {
    const next = favorites.includes(id) ? favorites.filter((f) => f !== id) : [...favorites, id];
    await updateProfile({ favoriteTemplateIds: next });
  };

  const isFavorite = (id) => favorites.includes(id);

  const duplicateTemplate = async (template) => {
    const cloned = await createTemplateApi({
      title: `${template.title} (My Copy)`,
      category: template.category,
      description: template.description,
      thumbnail: template.thumbnail,
      duration: template.duration,
      difficulty: template.difficulty,
      tags: template.tags,
      status: 'Draft',
      createdByUserId: user?.id,
    });
    setTemplates((prev) => [cloned, ...prev]);
    return cloned;
  };

  const createCustomTemplate = async (templateData) => {
    const newTemplate = await createTemplateApi({
      title: templateData.title,
      category: templateData.category || 'Games',
      description: templateData.description || '',
      thumbnail: templateData.thumbnail || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
      duration: templateData.duration || '1-3 mins',
      difficulty: templateData.difficulty || 'Easy',
      tags: templateData.tags ? templateData.tags.split(',').map((t) => t.trim()) : ['Custom'],
      status: templateData.status || 'Draft',
      createdByUserId: user?.id,
    });
    setTemplates((prev) => [newTemplate, ...prev]);
    return newTemplate;
  };

  return (
    <TemplateContext.Provider
      value={{
        templates,
        isLoading,
        favorites,
        myTemplates,
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
        toggleFavorite,
        isFavorite,
        duplicateTemplate,
        createCustomTemplate,
      }}
    >
      {children}
    </TemplateContext.Provider>
  );
};

export const useTemplates = () => {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error('useTemplates must be used within a TemplateProvider');
  }
  return context;
};
