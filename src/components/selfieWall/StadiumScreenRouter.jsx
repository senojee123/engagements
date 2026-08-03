import React from 'react';
import { useSelfieWall } from '../../context/SelfieWallContext';
import SelfieWallDisplay from './SelfieWallDisplay';
import LivePollDisplay from '../livePoll/LivePollDisplay';
import ReactionWallDisplay from '../reactionWall/ReactionWallDisplay';
import { useLivePoll, LivePollProvider } from '../../context/LivePollContext';
import { useReactionWall, ReactionWallProvider } from '../../context/ReactionWallContext';
import IdleScreenDisplay from '../../pages/public/IdleScreenDisplay';

function DynamicScreen() {
  const { isReactionWallActive } = useReactionWall();
  const { isPollActive } = useLivePoll();
  const { isSelfieWallActive } = useSelfieWall();

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

  // Dynamic Live Screen: Automatically routes between Reaction Wall, Live Poll, Selfie Wall & Idle Screen
  return (
    <LivePollProvider>
      <ReactionWallProvider>
        <DynamicScreen />
      </ReactionWallProvider>
    </LivePollProvider>
  );
}
