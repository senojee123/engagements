import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Calendar,
  BarChart3,
  Gift,
  Tv,
  Gamepad2,
  Camera,
  SlidersHorizontal,
  Shield,
  Settings,
  User,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import Badge from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';

const mainNavItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, disabled: false },
  { name: 'Approvals', path: '/approvals', icon: CheckCircle2, disabled: false, badge: 'New' },
  { name: 'Organizations', path: '/organizations', icon: Building2, disabled: false },
  { name: 'Events', path: '/events', icon: Calendar, disabled: false },
  { name: 'Analytics', path: '/analytics', icon: BarChart3, disabled: false },
  { name: 'Rewards', path: '/rewards', icon: Gift, disabled: false },
  { name: 'Idle Screen', path: '/idle-screen', icon: Tv, disabled: false },
];

const marketplaceNavItems = [
  { name: 'Engagement Library', path: '/library', icon: Gamepad2, disabled: false },
  { name: 'My Engagements', path: '/my-engagements', icon: Layers, disabled: false },
  { name: 'Brand Engine', path: '/brands', icon: Shield, disabled: false },
];

const secondaryNavItems = [
  { name: 'Settings', path: '/settings', icon: Settings, disabled: false },
  { name: 'Profile', path: '/profile', icon: User, disabled: false },
];

export default function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) {
  const location = useLocation();
  const { currentRole } = useAuth();

  const filteredMainNavItems = mainNavItems.filter((item) => {
    if (currentRole === 'Brand') {
      return item.path === '/analytics' || item.path === '/rewards' || item.path === '/idle-screen';
    }
    if (currentRole === 'Developer') {
      return item.path === '/analytics';
    }
    if (item.path === '/approvals' && currentRole !== 'Admin' && currentRole !== 'Super Admin') {
      return false;
    }
    return true;
  });

  const filteredMarketplaceNavItems = marketplaceNavItems.filter((item) => {
    if (currentRole === 'Brand') {
      return item.path === '/my-engagements' || item.path === '/library';
    }
    if (currentRole === 'Developer') {
      return item.path === '/library' || item.path === '/brands';
    }
    return item.path !== '/my-engagements';
  });

  const filteredSecondaryNavItems = secondaryNavItems;

  const renderNavLink = (item) => {
    const isActive =
      location.pathname === item.path ||
      (item.path !== '/dashboard' && location.pathname.startsWith(item.path) && item.path !== '#');
    const Icon = item.icon;

    if (item.disabled) {
      return (
        <div
          key={item.name}
          className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-400 cursor-not-allowed opacity-60 transition-opacity ${isCollapsed ? 'justify-center' : ''
            }`}
          title="Coming Soon"
        >
          <div className="flex items-center gap-3">
            <Icon className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span className="text-xs font-medium">{item.name}</span>}
          </div>
          {!isCollapsed && (
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
              Soon
            </span>
          )}
        </div>
      );
    }

    return (
      <NavLink
        key={item.name}
        to={item.path}
        onClick={() => setIsMobileOpen(false)}
        title={isCollapsed ? item.name : undefined}
        className={({ isActive }) =>
          `group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${isActive
            ? 'bg-indigo-50/90 text-indigo-700 font-bold shadow-xs border-r-2 border-indigo-600'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          } ${isCollapsed ? 'justify-center' : ''}`
        }
      >
        <div className="flex items-center gap-3">
          <Icon
            className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
              }`}
          />
          {!isCollapsed && <span>{item.name}</span>}
        </div>
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen bg-white border-r border-slate-200/80 transition-all duration-300 flex flex-col justify-between ${isCollapsed ? 'w-20' : 'w-64'
          } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between">
          <NavLink to="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl gradient-indigo-cyan flex items-center justify-center text-white font-extrabold text-base shadow-md shrink-0">
              FF
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold text-slate-900 tracking-tight text-base leading-tight">
                  FanForge
                </span>
                <span className="text-[10px] font-bold tracking-wider text-indigo-600 uppercase">
                  Engagement OS
                </span>
              </div>
            )}
          </NavLink>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Body */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {/* Marketplace & Builder */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Marketplace & Builder
              </div>
            )}
            {filteredMarketplaceNavItems.map(renderNavLink)}
          </div>

          {/* Core System */}
          <div className="space-y-1 pt-3 border-t border-slate-100">
            {!isCollapsed && (
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Core OS
              </div>
            )}
            {filteredMainNavItems.map(renderNavLink)}
          </div>

          {/* Preferences */}
          <div className="space-y-1 pt-3 border-t border-slate-100">
            {!isCollapsed && (
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Preferences
              </div>
            )}
            {filteredSecondaryNavItems.map(renderNavLink)}
          </div>
        </div>

      </aside>
    </>
  );
}
