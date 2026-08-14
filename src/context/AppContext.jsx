import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  fetchOrganizations,
  createOrganizationApi,
  updateOrganizationApi,
  deleteOrganizationApi,
  fetchEvents,
  createEventApi,
  updateEventApi,
  deleteEventApi,
  fetchActivities,
  fetchNotifications,
  markNotificationReadApi,
  markAllNotificationsReadApi,
  fetchScreenStatusApi,
  updateScreenStatusApi,
} from '../lib/api';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [organizations, setOrganizations] = useState([]);
  const [events, setEvents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const DEFAULT_IDLE_CONFIG = {
    eventTitle: 'Welcome to Dialog Family Day 2026',
    subtitle: 'Interactive Experiences Powered by FanForge',
    eventLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
    messageTitle: 'Experience starts soon...',
    messageSubtitle: 'Organizer will launch an activity shortly',
    activitiesList: ['Games', 'Selfies', 'Rewards', 'Challenges'],
    sponsorLogos: [
      { id: 'sp_1', name: 'Dialog Axiata', logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=200&q=80' },
      { id: 'sp_2', name: 'Samsung', logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80' },
      { id: 'sp_3', name: 'Coca-Cola', logo: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=200&q=80' },
    ],
  };

  const [idleScreenConfig, setIdleScreenConfig] = useState(() => {
    const saved = localStorage.getItem('fanforge_idle_config');
    return saved ? JSON.parse(saved) : DEFAULT_IDLE_CONFIG;
  });

  const [globalSearch, setGlobalSearch] = useState('');

  useEffect(() => {
    let cancelled = false;

    // Fetch backend data & screen status config
    Promise.all([fetchOrganizations(), fetchEvents(), fetchActivities(), fetchNotifications(), fetchScreenStatusApi()])
      .then(([orgs, evts, acts, notifs, statusData]) => {
        if (cancelled) return;
        setOrganizations(orgs);
        setEvents(evts);
        setActivities(acts);
        setNotifications(notifs);

        if (statusData && statusData.idleConfig) {
          setIdleScreenConfig(statusData.idleConfig);
          localStorage.setItem('fanforge_idle_config', JSON.stringify(statusData.idleConfig));
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    // Real-Time Cross-Tab / Cross-Browser Sync Listeners
    let channel = null;
    try {
      channel = new BroadcastChannel('fanforge_idle_sync');
      channel.onmessage = (e) => {
        if (e.data && e.data.idleConfig) {
          setIdleScreenConfig(e.data.idleConfig);
          localStorage.setItem('fanforge_idle_config', JSON.stringify(e.data.idleConfig));
        }
      };
    } catch (e) {}

    const handleStorage = (e) => {
      if (e.key === 'fanforge_idle_config' && e.newValue) {
        try {
          setIdleScreenConfig(JSON.parse(e.newValue));
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorage);

    // Periodic polling to keep cross-browser sessions up to date (paused when tab is hidden)
    const interval = setInterval(() => {
      if (document.hidden) return;
      fetchScreenStatusApi()
        .then((data) => {
          if (!cancelled && data && data.idleConfig) {
            setIdleScreenConfig((prev) => {
              const strPrev = JSON.stringify(prev);
              const strNew = JSON.stringify(data.idleConfig);
              if (strPrev !== strNew) {
                localStorage.setItem('fanforge_idle_config', strNew);
                return data.idleConfig;
              }
              return prev;
            });
          }
        })
        .catch(() => {});
    }, 8000);

    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
      if (channel) channel.close();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('fanforge_idle_config', JSON.stringify(idleScreenConfig));
  }, [idleScreenConfig]);

  const refreshActivities = async () => {
    fetchActivities().then((acts) => setActivities(acts)).catch(() => {});
  };

  const updateIdleConfig = (updatedFields) => {
    setIdleScreenConfig((prev) => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('fanforge_idle_config', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));

      try {
        const channel = new BroadcastChannel('fanforge_idle_sync');
        channel.postMessage({ idleConfig: updated });
        channel.close();
      } catch (e) {}

      updateScreenStatusApi({ idleConfig: updated }).catch(() => {});
      return updated;
    });
  };

  const addSponsorLogo = (sponsor) => {
    const newSponsor = {
      id: `sp_${Date.now()}`,
      name: sponsor.name || 'Sponsor',
      logo: sponsor.logo || 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=200&q=80',
    };
    const updated = {
      ...idleScreenConfig,
      sponsorLogos: [...(idleScreenConfig.sponsorLogos || []), newSponsor],
    };
    updateIdleConfig(updated);
  };

  const removeSponsorLogo = (id) => {
    const updated = {
      ...idleScreenConfig,
      sponsorLogos: (idleScreenConfig.sponsorLogos || []).filter((sp) => sp.id !== id),
    };
    updateIdleConfig(updated);
  };

  // Organization CRUD — Optimistic UI
  const createOrganization = async (orgData) => {
    const tempId = `org_${Date.now()}`;
    const newOrg = {
      id: tempId,
      name: orgData.name,
      logo: orgData.logo || 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=150&q=80',
      industry: orgData.industry || 'Sports',
      description: orgData.description || '',
      website: orgData.website || '',
      contactEmail: orgData.contactEmail || '',
      eventsCount: 0,
      createdAt: new Date().toISOString(),
    };

    setOrganizations((prev) => [newOrg, ...prev]);

    createOrganizationApi(orgData)
      .then((savedOrg) => {
        if (savedOrg && savedOrg.id) {
          setOrganizations((prev) => prev.map((o) => (o.id === tempId ? savedOrg : o)));
        }
        refreshActivities();
      })
      .catch(() => {});

    return newOrg;
  };

  const updateOrganization = async (id, updatedFields) => {
    setOrganizations((prev) => prev.map((org) => (org.id === id ? { ...org, ...updatedFields } : org)));
    updateOrganizationApi(id, updatedFields)
      .then((updated) => {
        if (updated) setOrganizations((prev) => prev.map((org) => (org.id === id ? updated : org)));
        refreshActivities();
      })
      .catch(() => {});
    return { id, ...updatedFields };
  };

  const deleteOrganization = async (id) => {
    setOrganizations((prev) => prev.filter((o) => o.id !== id));
    deleteOrganizationApi(id).then(() => refreshActivities()).catch(() => {});
  };

  // Event CRUD — Optimistic UI
  const createEvent = async (eventData) => {
    const tempId = `evt_${Date.now()}`;
    const newEvt = {
      id: tempId,
      name: eventData.name,
      type: eventData.type || 'Sports',
      venue: eventData.venue || 'TBD Stadium',
      startDate: eventData.startDate,
      endDate: eventData.endDate,
      organizationId: eventData.organizationId,
      status: eventData.status || 'Draft',
      capacity: Number(eventData.capacity) || 5000,
    };

    setEvents((prev) => [newEvt, ...prev]);

    createEventApi(eventData)
      .then((savedEvt) => {
        if (savedEvt && savedEvt.id) {
          setEvents((prev) => prev.map((e) => (e.id === tempId ? savedEvt : e)));
        }
        refreshActivities();
      })
      .catch(() => {});

    return newEvt;
  };

  const updateEvent = async (id, updatedFields) => {
    setEvents((prev) => prev.map((evt) => (evt.id === id ? { ...evt, ...updatedFields } : evt)));
    updateEventApi(id, updatedFields)
      .then((updated) => {
        if (updated) setEvents((prev) => prev.map((evt) => (evt.id === id ? updated : evt)));
        refreshActivities();
      })
      .catch(() => {});
    return { id, ...updatedFields };
  };

  const deleteEvent = async (id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    deleteEventApi(id).then(() => refreshActivities()).catch(() => {});
  };

  // Notifications — Optimistic UI
  const markNotificationRead = async (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    markNotificationReadApi(id).catch(() => {});
  };

  const markAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    markAllNotificationsReadApi().catch(() => {});
  };

  return (
    <AppContext.Provider
      value={{
        organizations,
        events,
        activities,
        notifications,
        isLoading,
        globalSearch,
        setGlobalSearch,
        idleScreenConfig,
        updateIdleConfig,
        addSponsorLogo,
        removeSponsorLogo,
        createOrganization,
        updateOrganization,
        deleteOrganization,
        createEvent,
        updateEvent,
        deleteEvent,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
