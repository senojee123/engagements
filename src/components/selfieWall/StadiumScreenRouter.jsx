import React from 'react';
import { useSelfieWall } from '../../context/SelfieWallContext';
import SelfieWallDisplay from './SelfieWallDisplay';
import LivePollDisplay from '../livePoll/LivePollDisplay';
import ReactionWallDisplay from '../reactionWall/ReactionWallDisplay';
import MemoryChallengeDisplay from '../memoryChallenge/MemoryChallengeDisplay';
import LaneDazeDisplay from '../laneDaze/LaneDazeDisplay';
import { useLivePoll, LivePollProvider } from '../../context/LivePollContext';
import { useReactionWall, ReactionWallProvider } from '../../context/ReactionWallContext';
import { useMemoryChallenge, MemoryChallengeProvider } from '../../context/MemoryChallengeContext';
import IdleScreenDisplay from '../../pages/public/IdleScreenDisplay';

import { fetchScreenStatusApi } from '../../lib/api';

function DynamicScreen() {
  const { isChallengeActive } = useMemoryChallenge();
  const { isReactionWallActive } = useReactionWall();
  const { isPollActive } = useLivePoll();
  const { isSelfieWallActive } = useSelfieWall();

  const [remoteMode, setRemoteMode] = React.useState(() => {
    return localStorage.getItem('fanforge_active_mode') || 'idle';
  });

  React.useEffect(() => {
    const checkStatus = () => {
      const saved = localStorage.getItem('fanforge_active_mode');
      if (saved) setRemoteMode(saved);

      fetchScreenStatusApi()
        .then((data) => {
          if (data && data.activeMode) {
            setRemoteMode(data.activeMode);
            localStorage.setItem('fanforge_active_mode', data.activeMode);
          }
        })
        .catch(() => {});
    };

    checkStatus();
    const interval = setInterval(checkStatus, 1500);
    window.addEventListener('storage', checkStatus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkStatus);
    };
  }, []);

  if (remoteMode === 'lane-daze') {
    return <LaneDazeDisplay isStandalonePage={true} />;
  }

  if (isChallengeActive || remoteMode === 'memory-challenge') {
    return <MemoryChallengeDisplay isStandalonePage={true} />;
  }

  if (isReactionWallActive || remoteMode === 'reaction-wall') {
    return <ReactionWallDisplay isStandalonePage={true} />;
  }

  if (isPollActive || remoteMode === 'live-poll') {
    return <LivePollDisplay isStandalonePage={true} />;
  }

  if (isSelfieWallActive || remoteMode === 'selfie-wall') {
    return <SelfieWallDisplay isStandalonePage={true} />;
  }

  return <IdleScreenDisplay />;
}

export default function StadiumScreenRouter({ forceMode = null }) {
  if (forceMode === 'idle') {
    return <IdleScreenDisplay />;
  }

  if (forceMode === 'selfie-wall') {
    return <SelfieWallDisplay isStandalonePage={true} />;
  }

  if (forceMode === 'live-poll') {
    return (
      <LivePollProvider>
        <LivePollDisplay isStandalonePage={true} />
      </LivePollProvider>
    );
  }

  if (forceMode === 'reaction-wall') {
    return (
      <ReactionWallProvider>
        <ReactionWallDisplay isStandalonePage={true} />
      </ReactionWallProvider>
    );
  }

  if (forceMode === 'memory-challenge') {
    return <MemoryChallengeDisplay isStandalonePage={true} />;
  }

  if (forceMode === 'lane-daze') {
    return <LaneDazeDisplay isStandalonePage={true} />;
  }

  // Dynamic Live Screen: Automatically routes between Memory Challenge, Reaction Wall, Live Poll, Selfie Wall & Idle Screen
  return <DynamicScreen />;
}
