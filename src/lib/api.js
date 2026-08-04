const API_BASE =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? (import.meta.env.VITE_LOCAL_API_URL || 'http://localhost:8000')
    : (import.meta.env.VITE_API_URL || 'https://engagements-production.up.railway.app');


async function request(method, path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const data = await res.json();
      detail = data.detail || detail;
    } catch (e) { }
    throw new Error(detail);
  }

  if (res.status === 204) return null;
  return res.json();
}

// Auth
export const registerUserApi = (data) => request('POST', '/api/auth/register', data);
export const loginUserApi = (data) => request('POST', '/api/auth/login', data);

// Users
export const fetchUser = (id) => request('GET', `/api/users/${id}`);
export const updateUserApi = (id, data) => request('PATCH', `/api/users/${id}`, data);
export const changePasswordApi = (id, data) => request('POST', `/api/users/${id}/change-password`, data);

// Organizations
export const fetchOrganizations = () => request('GET', '/api/organizations/');
export const createOrganizationApi = (data) => request('POST', '/api/organizations/', data);
export const updateOrganizationApi = (id, data) => request('PATCH', `/api/organizations/${id}`, data);
export const deleteOrganizationApi = (id) => request('DELETE', `/api/organizations/${id}`);

// Events
export const fetchEvents = () => request('GET', '/api/events/');
export const createEventApi = (data) => request('POST', '/api/events/', data);
export const updateEventApi = (id, data) => request('PATCH', `/api/events/${id}`, data);
export const deleteEventApi = (id) => request('DELETE', `/api/events/${id}`);

// Activities
export const fetchActivities = (limit = 20) => request('GET', `/api/activities/?limit=${limit}`);

// Notifications
export const fetchNotifications = () => request('GET', '/api/notifications/');
export const markNotificationReadApi = (id) => request('POST', `/api/notifications/${id}/read`);
export const markAllNotificationsReadApi = () => request('POST', '/api/notifications/read-all');

// Templates
export const fetchTemplates = () => request('GET', '/api/templates/');
export const createTemplateApi = (data) => request('POST', '/api/templates/', data);

// Brand Kits
export const fetchBrandKits = () => request('GET', '/api/brand-kits/');
export const createBrandKitApi = (data) => request('POST', '/api/brand-kits/', data);
export const updateBrandKitApi = (id, data) => request('PUT', `/api/brand-kits/${id}`, data);
export const deleteBrandKitApi = (id) => request('DELETE', `/api/brand-kits/${id}`);

// Live Polls
export const fetchPolls = () => request('GET', '/api/polls/');
export const fetchActivePoll = () => request('GET', '/api/polls/active');
export const submitVoteApi = (pollId, optionId) => request('POST', '/api/polls/vote', { pollId, optionId });
export const createPollApi = (data) => request('POST', '/api/polls/', data);
export const activatePollApi = (pollId) => request('POST', `/api/polls/${pollId}/activate`);
export const resetPollApi = (pollId) => request('POST', `/api/polls/${pollId}/reset`);
export const deletePollApi = (pollId) => request('DELETE', `/api/polls/${pollId}`);

// Reaction Wall
export const emitReactionApi = (emoji, fanName) => request('POST', '/api/reactions/emit', { emoji, fanName });
export const fetchReactionsApi = () => request('GET', '/api/reactions/recent');
export const clearReactionsApi = () => request('POST', '/api/reactions/clear');


// Selfie Wall — always use Railway (single source of truth shared between fan zone + dashboard)
const SELFIE_API = 'https://engagements-production.up.railway.app';

const selfieRequest = async (method, path, body) => {
  const res = await fetch(`${SELFIE_API}${path}`, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let detail = res.statusText;
    try { const d = await res.json(); detail = d.detail || detail; } catch (e) {}
    throw new Error(detail);
  }
  if (res.status === 204) return null;
  return res.json();
};

export const fetchSelfiesApi = (status) => selfieRequest('GET', `/api/selfies${status ? `?status=${status}` : ''}`);
export const uploadSelfieApi = (data) => selfieRequest('POST', '/api/selfies/upload', data);
export const approveSelfieApi = (id) => selfieRequest('POST', `/api/selfies/${id}/approve`);
export const rejectSelfieApi = (id) => selfieRequest('POST', `/api/selfies/${id}/reject`);
export const deleteSelfieApi = (id) => selfieRequest('DELETE', `/api/selfies/${id}`);
export const clearSelfiesApi = () => selfieRequest('DELETE', '/api/selfies/clear');


// Screen Status & Mode Routing (Syncs both local and Railway Cloud backend for Vercel live deployments)
export const fetchScreenStatusApi = async () => {
  try {
    const data = await request('GET', '/api/screen/status');
    if (data && data.activeMode) return data;
  } catch (e) {}

  try {
    const res = await fetch('https://engagements-production.up.railway.app/api/screen/status');
    return await res.json();
  } catch (e) {
    return { isSelfieWallActive: false, activeMode: 'idle' };
  }
};

export const updateScreenStatusApi = async (data) => {
  // Always update Railway Cloud backend so Vercel deployment (fan-zone-five.vercel.app) updates in real-time
  try {
    await fetch('https://engagements-production.up.railway.app/api/screen/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (e) {}

  try {
    return await request('POST', '/api/screen/status', data);
  } catch (e) {}
};




