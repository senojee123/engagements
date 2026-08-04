import React from 'react';
import { useSelfieWall } from '../../context/SelfieWallContext';
import SelfieWallDisplay from './SelfieWallDisplay';
import LivePollDisplay from '../livePoll/LivePollDisplay';
import ReactionWallDisplay from '../reactionWall/ReactionWallDisplay';
import MemoryChallengeDisplay from '../memoryChallenge/MemoryChallengeDisplay';
import { useLivePoll, LivePollProvider } from '../../context/LivePollContext';
import { useReactionWall, ReactionWallProvider } from '../../context/ReactionWallContext';
import { useMemoryChallenge, MemoryChallengeProvider } from '../../context/MemoryChallengeContext';
import IdleScreenDisplay from '../../pages/public/IdleScreenDisplay';

function DynamicScreen() {
  const { isChallengeActive } = useMemoryChallenge();
  const { isReactionWallActive } = useReactionWall();
  const { isPollActive } = useLivePoll();
  const { isSelfieWallActive } = useSelfieWall();

  if (isChallengeActive) {
    return <MemoryChallengeDisplay isStandalonePage={true} />;
  }

  if (isReactionWallActive) {
    return <ReactionWallDisplay isStandalonePage={true} />;
  }

  if (isPollActive) {
    return <LivePollDisplay isStandalonePage={true} />;
  }

  if (isSelfieWallActive) {
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

  // Dynamic Live Screen: Automatically routes between Memory Challenge, Reaction Wall, Live Poll, Selfie Wall & Idle Screen
  return <DynamicScreen />;
}
