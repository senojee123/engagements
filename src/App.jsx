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

// Lazy-loaded Main App Pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Organizations = React.lazy(() => import('./pages/Organizations'));
const OrganizationDetails = React.lazy(() => import('./pages/OrganizationDetails'));
const Events = React.lazy(() => import('./pages/Events'));
const Analytics = React.lazy(() => import('./pages/Analytics'));
const Rewards = React.lazy(() => import('./pages/Rewards'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Settings = React.lazy(() => import('./pages/Settings'));
const IdleScreenSettings = React.lazy(() => import('./pages/IdleScreenSettings'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

// Lazy-loaded Phase 2 Engagement Library Pages
const EngagementLibrary = React.lazy(() => import('./pages/library/EngagementLibrary'));
const TemplateDetails = React.lazy(() => import('./pages/library/TemplateDetails'));
const MyTemplates = React.lazy(() => import('./pages/library/MyTemplates'));

// Lazy-loaded Phase 3 Brand Engine Pages
const BrandManager = React.lazy(() => import('./pages/builder/BrandManager'));
const Approvals = React.lazy(() => import('./pages/admin/Approvals'));
const MyEngagements = React.lazy(() => import('./pages/builder/MyEngagements'));

// Lazy-loaded Selfie Wall Activation Pages & Screens
const SelfieWallDisplay = React.lazy(() => import('./components/selfieWall/SelfieWallDisplay'));
const StadiumScreenRouter = React.lazy(() => import('./components/selfieWall/StadiumScreenRouter'));

// Lazy-loaded Standalone Public Fan Zone Landing Page (QR Code Scan Destination)
const FanZoneLanding = React.lazy(() => import('./pages/public/FanZoneLanding'));
const IdleScreenDisplay = React.lazy(() => import('./pages/public/IdleScreenDisplay'));

// Lazy-loaded New App / Instance Architecture Parametric Embed Routers
const InstanceDisplayRouter = React.lazy(() => import('./pages/public/InstanceDisplayRouter'));
const InstanceFanRouter = React.lazy(() => import('./pages/public/InstanceFanRouter'));

import ErrorBoundary from './components/ui/ErrorBoundary';

// Protected Route Guard Component
// Protected Route Guard Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, currentRole } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (
    allowedRoles &&
    !allowedRoles.includes(currentRole) &&
    currentRole !== 'Super Admin' &&
    currentRole !== 'Admin'
  ) {
    return <Navigate to="/analytics" replace />;
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
                        <React.Suspense fallback={
                          <div className="min-h-screen flex items-center justify-center bg-slate-50">
                            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                          </div>
                        }>
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
                      <Route path="/my-engagements" element={<MyEngagements />} />
                      <Route path="/my-engagements/:id" element={<TemplateDetails />} />
                      <Route path="/library/my-templates" element={<MyTemplates />} />
                      <Route path="/library/:id" element={<TemplateDetails />} />

                      {/* Admin Approvals Route */}
                      <Route path="/approvals" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin']}><Approvals /></ProtectedRoute>} />

                      {/* Phase 3 Brand Engine Portal */}
                      <Route path="/brands" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Developer']}><BrandManager /></ProtectedRoute>} />
                    </Route>

                    {/* 404 Catch-All */}
                    <Route path="*" element={<NotFound />} />
                    </Routes>
                  </React.Suspense>
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
