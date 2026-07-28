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

    Promise.all([fetchOrganizations(), fetchEvents(), fetchActivities(), fetchNotifications()])
      .then(([orgs, evts, acts, notifs]) => {
        if (cancelled) return;
        setOrganizations(orgs);
        setEvents(evts);
        setActivities(acts);
        setNotifications(notifs);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('fanforge_idle_config', JSON.stringify(idleScreenConfig));
  }, [idleScreenConfig]);

  const refreshActivities = async () => {
    setActivities(await fetchActivities());
  };

  const updateIdleConfig = (updatedFields) => {
    setIdleScreenConfig((prev) => ({ ...prev, ...updatedFields }));
  };

  const addSponsorLogo = (sponsor) => {
    const newSponsor = {
      id: `sp_${Date.now()}`,
      name: sponsor.name || 'Sponsor',
      logo: sponsor.logo || 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=200&q=80',
    };
    setIdleScreenConfig((prev) => ({
      ...prev,
      sponsorLogos: [...prev.sponsorLogos, newSponsor],
    }));
  };

  const removeSponsorLogo = (id) => {
    setIdleScreenConfig((prev) => ({
      ...prev,
      sponsorLogos: prev.sponsorLogos.filter((sp) => sp.id !== id),
    }));
  };

  // Organization CRUD
  const createOrganization = async (orgData) => {
    const newOrg = await createOrganizationApi({
      name: orgData.name,
      logo: orgData.logo || 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=150&q=80',
      industry: orgData.industry || 'Sports',
      description: orgData.description || '',
      website: orgData.website || '',
      contactEmail: orgData.contactEmail || '',
    });
    setOrganizations((prev) => [newOrg, ...prev]);
    await refreshActivities();
    return newOrg;
  };

  const updateOrganization = async (id, updatedFields) => {
    const updated = await updateOrganizationApi(id, updatedFields);
    setOrganizations((prev) => prev.map((org) => (org.id === id ? updated : org)));
    await refreshActivities();
    return updated;
  };

  const deleteOrganization = async (id) => {
    await deleteOrganizationApi(id);
    setOrganizations((prev) => prev.filter((o) => o.id !== id));
    await refreshActivities();
  };

  // Event CRUD
  const createEvent = async (eventData) => {
    const newEvt = await createEventApi({
      name: eventData.name,
      type: eventData.type || 'Sports',
      venue: eventData.venue || 'TBD Stadium',
      startDate: eventData.startDate,
      endDate: eventData.endDate,
      organizationId: eventData.organizationId,
      status: eventData.status || 'Draft',
      capacity: Number(eventData.capacity) || 5000,
    });
    setEvents((prev) => [newEvt, ...prev]);
    await refreshActivities();
    return newEvt;
  };

  const updateEvent = async (id, updatedFields) => {
    const updated = await updateEventApi(id, updatedFields);
    setEvents((prev) => prev.map((evt) => (evt.id === id ? updated : evt)));
    await refreshActivities();
    return updated;
  };

  const deleteEvent = async (id) => {
    await deleteEventApi(id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
    await refreshActivities();
  };

  // Notifications
  const markNotificationRead = async (id) => {
    const updated = await markNotificationReadApi(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? updated : n)));
  };

  const markAllNotificationsRead = async () => {
    await markAllNotificationsReadApi();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
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
