import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import FanZoneLanding from './pages/public/FanZoneLanding';
import FanZoneSplash from './components/FanZoneSplash';
import { SelfieWallProvider } from './context/SelfieWallContext';
import { LivePollProvider } from './context/LivePollContext';
import { ReactionWallProvider } from './context/ReactionWallContext';
import { MemoryChallengeProvider } from './context/MemoryChallengeContext';
import { ToastProvider } from './context/ToastContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <SelfieWallProvider>
          <LivePollProvider>
            <ReactionWallProvider>
              <MemoryChallengeProvider>
                <FanZoneSplash>
                  <FanZoneLanding />
                </FanZoneSplash>
              </MemoryChallengeProvider>
            </ReactionWallProvider>
          </LivePollProvider>
        </SelfieWallProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);
