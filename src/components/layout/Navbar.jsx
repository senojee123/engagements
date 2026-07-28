import React, { useState, useRef, useEffect, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Menu,
  Shield,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Check,
  Building2,
  Calendar,
  Gamepad2,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useTemplates } from '../../context/TemplateContext';
import { formatRelativeTime } from '../../lib/formatRelativeTime';
import Badge from '../ui/Badge';

const MAX_RESULTS_PER_GROUP = 4;

export default function Navbar({ isCollapsed, setIsMobileOpen }) {
  const { user, currentRole, availableRoles, switchRole, logout } = useAuth();
  const { globalSearch, setGlobalSearch, organizations, events, notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const { templates } = useTemplates();
  const navigate = useNavigate();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const roleRef = useRef(null);
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const searchResults = useMemo(() => {
    const query = globalSearch.trim().toLowerCase();
    if (!query) return null;

    const matchedOrgs = organizations
      .filter((o) => o.name.toLowerCase().includes(query) || o.industry.toLowerCase().includes(query))
      .slice(0, MAX_RESULTS_PER_GROUP);

    const matchedEvents = events
      .filter((e) => e.name.toLowerCase().includes(query) || e.venue.toLowerCase().includes(query))
      .slice(0, MAX_RESULTS_PER_GROUP);

    const matchedTemplates = templates
      .filter((t) => t.title.toLowerCase().includes(query) || t.category.toLowerCase().includes(query))
      .slice(0, MAX_RESULTS_PER_GROUP);

    return { matchedOrgs, matchedEvents, matchedTemplates };
  }, [globalSearch, organizations, events, templates]);

  const hasResults =
    searchResults &&
    (searchResults.matchedOrgs.length > 0 ||
      searchResults.matchedEvents.length > 0 ||
      searchResults.matchedTemplates.length > 0);

  const closeSearch = () => {
    setIsSearchOpen(false);
    setGlobalSearch('');
  };

  const goTo = (path) => {
    navigate(path);
    closeSearch();
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (roleRef.current && !roleRef.current.contains(e.target)) setIsRoleDropdownOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setIsProfileDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setIsNotifOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setIsSearchOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleGlobalKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        searchInputRef.current?.blur();
      }
    }
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      className={`sticky top-0 z-30 h-16 glass-header transition-all duration-300 ${
        isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
      }`}
    >
      <div className="h-full px-6 sm:px-8 lg:px-10 flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu & Search */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <button
            onClick={() => setIsMobileOpen(true)}
            aria-label="Open navigation menu"
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search Input */}
          <div className="relative w-full" ref={searchRef}>
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search organizations, events, templates..."
              aria-label="Global search"
              className="w-full pl-10 pr-12 py-2 bg-slate-50/90 border border-slate-200/90 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all shadow-2xs"
            />
            {globalSearch ? (
              <button
                type="button"
                onClick={closeSearch}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="hidden sm:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-400 bg-slate-200/60 rounded border border-slate-300/60 pointer-events-none">
                ⌘K
              </span>
            )}

            {/* Search Results Dropdown */}
            {isSearchOpen && searchResults && (
              <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200/90 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 max-h-96 overflow-y-auto">
                {hasResults ? (
                  <div className="py-2">
                    {searchResults.matchedOrgs.length > 0 && (
                      <div className="px-2">
                        <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Organizations
                        </p>
                        {searchResults.matchedOrgs.map((org) => (
                          <button
                            key={org.id}
                            type="button"
                            onClick={() => goTo(`/organizations/${org.id}`)}
                            className="w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center gap-2.5 hover:bg-slate-50 transition-colors"
                          >
                            <Building2 className="w-4 h-4 text-indigo-500 shrink-0" />
                            <span className="font-semibold text-slate-800 truncate">{org.name}</span>
                            <span className="text-slate-400 truncate">{org.industry}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {searchResults.matchedEvents.length > 0 && (
                      <div className="px-2 pt-1">
                        <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Events
                        </p>
                        {searchResults.matchedEvents.map((evt) => (
                          <button
                            key={evt.id}
                            type="button"
                            onClick={() => goTo('/events')}
                            className="w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center gap-2.5 hover:bg-slate-50 transition-colors"
                          >
                            <Calendar className="w-4 h-4 text-cyan-500 shrink-0" />
                            <span className="font-semibold text-slate-800 truncate">{evt.name}</span>
                            <span className="text-slate-400 truncate">{evt.venue}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {searchResults.matchedTemplates.length > 0 && (
                      <div className="px-2 pt-1">
                        <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Templates
                        </p>
                        {searchResults.matchedTemplates.map((tpl) => (
                          <button
                            key={tpl.id}
                            type="button"
                            onClick={() => goTo(`/library/${tpl.id}`)}
                            className="w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center gap-2.5 hover:bg-slate-50 transition-colors"
                          >
                            <Gamepad2 className="w-4 h-4 text-purple-500 shrink-0" />
                            <span className="font-semibold text-slate-800 truncate">{tpl.title}</span>
                            <span className="text-slate-400 truncate">{tpl.category}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center">
                    <p className="text-xs font-semibold text-slate-600">
                      No results for "{globalSearch}"
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Try a different organization, event, or template name.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Role Switcher, Notifications, Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Role Switcher Pill */}
          <div className="relative" ref={roleRef}>
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              aria-haspopup="true"
              aria-expanded={isRoleDropdownOpen}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50/90 hover:bg-indigo-100/90 border border-indigo-200/90 rounded-xl text-xs font-semibold text-indigo-700 transition-all shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              <Shield className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline text-slate-500 font-normal">Role:</span>
              <span className="font-extrabold">{currentRole}</span>
              <ChevronDown className="w-3.5 h-3.5 text-indigo-500" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200/90 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-1.5 border-b border-slate-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Active User Role
                  </p>
                </div>
                <div className="py-1">
                  {availableRoles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => {
                        switchRole(role.id);
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                        currentRole === role.id ? 'bg-indigo-50/70 font-semibold text-indigo-700' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{role.name}</span>
                        <span className="text-[10px] text-slate-500 line-clamp-1">{role.description}</span>
                      </div>
                      {currentRole === role.id && <Check className="w-4 h-4 text-indigo-600 shrink-0 ml-2" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notifications Drawer Toggle */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : 'Notifications'}
              aria-haspopup="true"
              aria-expanded={isNotifOpen}
              className="relative p-2 rounded-xl border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200/90 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-slate-900">Notifications</h4>
                    {unreadCount > 0 && (
                      <Badge variant="rose" size="sm">
                        {unreadCount} new
                      </Badge>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-xs text-indigo-600 hover:underline font-medium"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.map((notif) => (
                    <button
                      key={notif.id}
                      type="button"
                      onClick={() => !notif.isRead && markNotificationRead(notif.id)}
                      className={`w-full text-left p-4 text-xs transition-colors ${
                        !notif.isRead ? 'bg-indigo-50/30 font-medium' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between text-slate-900 font-semibold mb-1">
                        <span>{notif.title}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{formatRelativeTime(notif.createdAt)}</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{notif.message}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              aria-label="Open profile menu"
              aria-haspopup="true"
              aria-expanded={isProfileDropdownOpen}
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
                alt={user?.name || 'User'}
                className="w-8 h-8 rounded-xl object-cover ring-2 ring-indigo-500/20 shadow-2xs"
              />
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 leading-tight">
                  {user?.name || 'Alex Morgan'}
                </span>
                <span className="text-[10px] text-slate-500 leading-tight font-medium">
                  {user?.company || 'Apex Sports'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
            </button>

            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200/90 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>

                <div className="py-1">
                  <NavLink
                    to="/profile"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>My Profile</span>
                  </NavLink>
                  <NavLink
                    to="/settings"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>System Settings</span>
                  </NavLink>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
