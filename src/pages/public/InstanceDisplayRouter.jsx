import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

// Display Components
import SelfieWallDisplay from '../../components/selfieWall/SelfieWallDisplay';
import LivePollDisplay from '../../components/livePoll/LivePollDisplay';
import ReactionWallDisplay from '../../components/reactionWall/ReactionWallDisplay';
import MemoryChallengeDisplay from '../../components/memoryChallenge/MemoryChallengeDisplay';
import LaneDazeDisplay from '../../components/laneDaze/LaneDazeDisplay';
import IdleScreenDisplay from './IdleScreenDisplay';
import NotFound from '../NotFound';

// Context Providers
import { SelfieWallProvider } from '../../context/SelfieWallContext';
import { LivePollProvider } from '../../context/LivePollContext';
import { ReactionWallProvider } from '../../context/ReactionWallContext';
import { MemoryChallengeProvider } from '../../context/MemoryChallengeContext';

const APP_DISPLAY_REGISTRY = {
  'selfie-wall': {
    component: SelfieWallDisplay,
    provider: SelfieWallProvider,
  },
  'memory-challenge': {
    component: MemoryChallengeDisplay,
    provider: MemoryChallengeProvider,
  },
  'live-poll': {
    component: LivePollDisplay,
    provider: LivePollProvider,
  },
  'reaction-wall': {
    component: ReactionWallDisplay,
    provider: ReactionWallProvider,
  },
  'lane-daze': {
    component: LaneDazeDisplay,
    provider: null,
  },
  'idle': {
    component: IdleScreenDisplay,
    provider: null,
  },
};

const RAILWAY_API = import.meta.env.VITE_API_URL || 'https://engagements-production.up.railway.app';

export default function InstanceDisplayRouter() {
  const { appId, instanceId } = useParams();
  const [instanceConfig, setInstanceConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(!!instanceId);

  // Normalize App ID slug
  const normalizedAppId = (appId || 'idle').toLowerCase().trim();
  const registryItem = APP_DISPLAY_REGISTRY[normalizedAppId];

  // Fetch instance configuration if instanceId UUID is provided in URL
  useEffect(() => {
    if (!instanceId) {
      setIsLoading(false);
      return;
    }

    let isCancelled = false;
    // Attempt to fetch instance snapshot by UUID, falling back to game-config by appId slug
    const fetchUrl = `${RAILWAY_API}/api/instances/${instanceId}`;

    fetch(fetchUrl)
      .then((res) => {
        if (!res.ok) throw new Error('Instance not found');
        return res.json();
      })
      .then((data) => {
        if (!isCancelled && data) {
          setInstanceConfig(data);
        }
      })
      .catch(() => {
        // Fallback fetch to game-config by appId
        fetch(`${RAILWAY_API}/api/game-config/${normalizedAppId}`)
          .then((r) => (r.ok ? r.json() : null))
          .then((fallbackData) => {
            if (!isCancelled && fallbackData) {
              setInstanceConfig(fallbackData);
            }
          })
          .catch(() => {});
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [instanceId, normalizedAppId]);

  if (!registryItem) {
    return <NotFound />;
  }

  const DisplayComponent = registryItem.component;
  const ProviderComponent = registryItem.provider;

  const content = (
    <DisplayComponent
      isStandalonePage={true}
      instanceId={instanceId}
      instanceConfig={instanceConfig}
    />
  );

  if (ProviderComponent) {
    return <ProviderComponent>{content}</ProviderComponent>;
  }

  return content;
}
