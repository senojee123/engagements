import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { fetchTemplates, createTemplateApi } from '../lib/api';

const TemplateContext = createContext(null);

export const TemplateProvider = ({ children }) => {
  const { user, updateProfile } = useAuth();

  const [templates, setTemplates] = useState([]);
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
        if (!cancelled) setTemplates(data);
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
