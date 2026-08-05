import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AppProvider } from './context/AppContext';
import { TemplateProvider } from './context/TemplateContext';
import { SelfieWallProvider } from './context/SelfieWallContext';
import { LivePollProvider } from './context/LivePollContext';
import { ReactionWallProvider } from './context/ReactionWallContext';
import { MemoryChallengeProvider } from './context/MemoryChallengeContext';

// Layouts
import AppLayout from './components/layout/AppLayout';
import AuthLayout from './pages/auth/AuthLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import EmailVerification from './pages/auth/EmailVerification';
import ResetPassword from './pages/auth/ResetPassword';

// Main App Pages
import Dashboard from './pages/Dashboard';
import Organizations from './pages/Organizations';
import OrganizationDetails from './pages/OrganizationDetails';
import Events from './pages/Events';
import Analytics from './pages/Analytics';
import Rewards from './pages/Rewards';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import IdleScreenSettings from './pages/IdleScreenSettings';
import NotFound from './pages/NotFound';

// Phase 2 Engagement Library Pages
import EngagementLibrary from './pages/library/EngagementLibrary';
import TemplateDetails from './pages/library/TemplateDetails';
import MyTemplates from './pages/library/MyTemplates';

// Phase 3 Brand Engine Pages
import BrandManager from './pages/builder/BrandManager';

// Selfie Wall Activation Pages & Screens
import SelfieWallDisplay from './components/selfieWall/SelfieWallDisplay';
import StadiumScreenRouter from './components/selfieWall/StadiumScreenRouter';

// Standalone Public Fan Zone Landing Page (QR Code Scan Destination)
import FanZoneLanding from './pages/public/FanZoneLanding';
import IdleScreenDisplay from './pages/public/IdleScreenDisplay';

// New App / Instance Architecture Parametric Embed Routers
import InstanceDisplayRouter from './pages/public/InstanceDisplayRouter';
import InstanceFanRouter from './pages/public/InstanceFanRouter';

import ErrorBoundary from './components/ui/ErrorBoundary';

// Protected Route Guard Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return null;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ToastProvider>
          <AuthProvider>
            <AppProvider>
              <TemplateProvider>
                <SelfieWallProvider>
                  <LivePollProvider>
                    <ReactionWallProvider>
                      <MemoryChallengeProvider>
                        <Routes>
                    {/* Root Redirect */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />

                    {/* App / Instance Architecture Parametric Embed Routes */}
                    <Route path="/e/:appId/:instanceId/display" element={<InstanceDisplayRouter />} />
                    <Route path="/e/:appId/display" element={<InstanceDisplayRouter />} />
                    <Route path="/e/:appId/:instanceId" element={<InstanceFanRouter />} />
                    <Route path="/e/:appId" element={<InstanceFanRouter />} />

                    {/* Public Standalone Fan Zone Landing Page (QR Destination) */}
                    <Route path="/fan-zone" element={<FanZoneLanding />} />
                    <Route path="/arena" element={<FanZoneLanding />} />
                    <Route path="/live" element={<FanZoneLanding />} />

                    {/* Public Fullscreen Broadcast Displays */}
                    <Route path="/idle-display" element={<StadiumScreenRouter forceMode="idle" />} />
                    <Route path="/idle" element={<StadiumScreenRouter forceMode="idle" />} />
                    <Route path="/poll-display" element={<StadiumScreenRouter forceMode="live-poll" />} />
                    <Route path="/live-poll/display" element={<StadiumScreenRouter forceMode="live-poll" />} />
                    <Route path="/reaction-display" element={<StadiumScreenRouter forceMode="reaction-wall" />} />
                    <Route path="/reaction-wall/display" element={<StadiumScreenRouter forceMode="reaction-wall" />} />
                    <Route path="/memory-display" element={<StadiumScreenRouter forceMode="memory-challenge" />} />
                    <Route path="/memory-challenge/display" element={<StadiumScreenRouter forceMode="memory-challenge" />} />
                    <Route path="/lane-daze-display" element={<StadiumScreenRouter forceMode="lane-daze" />} />
                    <Route path="/lane-daze/display" element={<StadiumScreenRouter forceMode="lane-daze" />} />

                    {/* Dynamic Stadium Broadcast Screen (Switches automatically between Idle Screen, Selfie Wall, Live Poll & Reaction Wall) */}
                    <Route path="/display" element={<StadiumScreenRouter />} />
                    <Route path="/screen" element={<StadiumScreenRouter />} />



                    {/* Authentication Routes */}
                    <Route element={<AuthLayout />}>
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/email-verification" element={<EmailVerification />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                    </Route>

                    {/* Redirect Legacy Builder Routes to Library */}
                    <Route path="/builder" element={<Navigate to="/library" replace />} />
                    <Route path="/builder/:id" element={<Navigate to="/library" replace />} />

                    {/* Fullscreen Jumbotron Selfie Wall Screen */}
                    <Route
                      path="/selfie-wall/display"
                      element={
                        <ProtectedRoute>
                          <StadiumScreenRouter forceMode="selfie-wall" />
                        </ProtectedRoute>
                      }
                    />

                    {/* Protected Application Layout Routes */}
                    <Route
                      element={
                        <ProtectedRoute>
                          <AppLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/organizations" element={<Organizations />} />
                      <Route path="/organizations/:id" element={<OrganizationDetails />} />
                      <Route path="/events" element={<Events />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/rewards" element={<Rewards />} />
                      <Route path="/idle-screen" element={<IdleScreenSettings />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/settings" element={<Settings />} />

                      {/* Selfie Wall Redirect to Engagement Library */}
                      <Route path="/selfie-wall" element={<Navigate to="/library/selfie-wall" replace />} />

                      {/* Phase 2 Library Routes */}
                      <Route path="/library" element={<EngagementLibrary />} />
                      <Route path="/library/my-templates" element={<MyTemplates />} />
                      <Route path="/library/:id" element={<TemplateDetails />} />

                      {/* Phase 3 Brand Engine Portal */}
                      <Route path="/brands" element={<BrandManager />} />
                    </Route>

                    {/* 404 Catch-All */}
                    <Route path="*" element={<NotFound />} />
                    </Routes>
                      </MemoryChallengeProvider>
                    </ReactionWallProvider>
                  </LivePollProvider>
                </SelfieWallProvider>
              </TemplateProvider>
            </AppProvider>
          </AuthProvider>
        </ToastProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
