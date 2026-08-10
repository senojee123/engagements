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
  const [isLoading, setIsLoading] = useState(true);

  // Normalize App ID slug
  const normalizedAppId = (appId || 'idle').toLowerCase().trim();
  const registryItem = APP_DISPLAY_REGISTRY[normalizedAppId];

  // Resolve this URL's config.
  //  - instanceId present: pinned to one specific historical version (UUID).
  //  - instanceId absent: this is the STABLE embed link (already printed on a
  //    QR code / hosted on a Jumbotron) — it must never change, so it always
  //    resolves to whatever config was most recently published for appId.
  useEffect(() => {
    let isCancelled = false;

    const fetchCurrentByAppId = () =>
      fetch(`${RAILWAY_API}/api/game-config/${normalizedAppId}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (!isCancelled && data) setInstanceConfig(data);
        })
        .catch(() => {});

    if (!instanceId) {
      fetchCurrentByAppId().finally(() => {
        if (!isCancelled) setIsLoading(false);
      });
      return () => {
        isCancelled = true;
      };
    }

    fetch(`${RAILWAY_API}/api/instances/${instanceId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Instance not found');
        return res.json();
      })
      .then((data) => {
        if (!isCancelled && data) {
          // GET /api/instances/:id returns { instanceId, appId, brandId, status, publishedAt, config }
          setInstanceConfig(data.config || data);
        }
      })
      .catch(() => fetchCurrentByAppId())
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
