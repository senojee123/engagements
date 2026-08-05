import React from 'react';
import { useParams } from 'react-router-dom';
import FanZoneLanding from './FanZoneLanding';

export default function InstanceFanRouter() {
  const { appId, instanceId } = useParams();

  return (
    <FanZoneLanding
      forcedAppId={appId}
      instanceId={instanceId}
    />
  );
}
