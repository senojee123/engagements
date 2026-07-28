const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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

// Reaction Wall
export const emitReactionApi = (emoji, fanName) => request('POST', '/api/reactions/emit', { emoji, fanName });
export const fetchReactionsApi = () => request('GET', '/api/reactions/recent');
export const clearReactionsApi = () => request('POST', '/api/reactions/clear');


