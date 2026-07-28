import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchBrandKits } from '../lib/api';

const BuilderContext = createContext(null);

export const BuilderProvider = ({ children }) => {
  const [availableBrands, setAvailableBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeBrand, setActiveBrand] = useState(null);
  const [activeTemplateId, setActiveTemplateId] = useState('selfie-wall'); // 'selfie-wall' | 'reaction-wall' | 'live-poll' | 'product-rush'
  const [viewportMode, setViewportMode] = useState('mobile'); // 'mobile' | 'desktop' | 'bigscreen'
  const [playerStage, setPlayerStage] = useState('gameplay'); // 'join' | 'instructions' | 'countdown' | 'gameplay' | 'leaderboard' | 'winner'
  const [bigScreenStage, setBigScreenStage] = useState('lobby'); // 'lobby' | 'countdown' | 'participants' | 'leaderboard' | 'winner' | 'sponsor'

  // Custom Editable Overrides
  const [customBrand, setCustomBrand] = useState({});

  useEffect(() => {
    let cancelled = false;
    fetchBrandKits()
      .then((brands) => {
        if (cancelled) return;
        setAvailableBrands(brands);
        if (brands.length > 0) setActiveBrand(brands[0]); // Coca-Cola
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Game Physics & Rules
  const [gameRules, setGameRules] = useState({
    gameDuration: 90, // seconds
    difficulty: 'Easy',
    lives: 3,
    maxPlayers: 50000,
    spawnSpeed: 'Fast',
    obstacleFrequency: 'Medium',
    rewardPointsPerItem: 100,
    winningScore: 1000,
    countdownTimer: 3,
    particleEffects: true,
  });

  // Update customBrand whenever activeBrand preset changes
  useEffect(() => {
    if (!activeBrand) return;
    setCustomBrand({
      logo: activeBrand.logo,
      primaryColor: activeBrand.primaryColor,
      secondaryColor: activeBrand.secondaryColor,
      accentColor: activeBrand.accentColor,
      collectibleName: activeBrand.collectibleName,
      collectibleIcon: activeBrand.collectibleIcon,
      obstacleName: activeBrand.obstacleName,
      obstacleIcon: activeBrand.obstacleIcon,
      powerUpName: activeBrand.powerUpName,
      powerUpIcon: activeBrand.powerUpIcon,
      bgGradient: activeBrand.bgGradient,
      audioTheme: activeBrand.audioTheme,
    });
  }, [activeBrand]);

  const switchBrand = (brandId) => {
    const found = availableBrands.find((b) => b.id === brandId);
    if (found) {
      setActiveBrand(found);
    }
  };

  const updateCustomProperty = (key, value) => {
    setCustomBrand((prev) => ({ ...prev, [key]: value }));
  };

  const updateGameRules = (key, value) => {
    setGameRules((prev) => ({ ...prev, [key]: value }));
  };

  // Generate Exportable Standard JSON Config
  const exportJsonConfig = () => {
    return {
      templateId: activeTemplateId,
      version: '2.0.0',
      brand: {
        id: activeBrand.id,
        name: activeBrand.name,
        tagline: activeBrand.tagline,
        logo: customBrand.logo,
      },
      theme: {
        primaryColor: customBrand.primaryColor,
        secondaryColor: customBrand.secondaryColor,
        accentColor: customBrand.accentColor,
        bgGradient: customBrand.bgGradient,
        audioTheme: customBrand.audioTheme,
      },
      sprites: {
        collectible: {
          name: customBrand.collectibleName,
          icon: customBrand.collectibleIcon,
          points: gameRules.rewardPointsPerItem,
        },
        obstacle: {
          name: customBrand.obstacleName,
          icon: customBrand.obstacleIcon,
        },
        powerUp: {
          name: customBrand.powerUpName,
          icon: customBrand.powerUpIcon,
        },
      },
      rules: gameRules,
      createdAt: new Date().toISOString(),
    };
  };

  return (
    <BuilderContext.Provider
      value={{
        availableBrands,
        isLoading,
        activeBrand,
        switchBrand,
        activeTemplateId,
        setActiveTemplateId,
        customBrand,
        updateCustomProperty,
        gameRules,
        updateGameRules,
        viewportMode,
        setViewportMode,
        playerStage,
        setPlayerStage,
        bigScreenStage,
        setBigScreenStage,
        exportJsonConfig,
      }}
    >
      {children}
    </BuilderContext.Provider>
  );
};

export const useBuilder = () => {
  const context = useContext(BuilderContext);
  if (!context) {
    throw new Error('useBuilder must be used within a BuilderProvider');
  }
  return context;
};
