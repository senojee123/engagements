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
export const deleteUserApi = (id) => request('DELETE', `/api/users/${id}`);

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
    try { const d = await res.json(); detail = d.detail || detail; } catch (e) { }
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
  } catch (e) { }

  try {
    const res = await fetch('https://engagements-production.up.railway.app/api/screen/status');
    return await res.json();
  } catch (e) {
    return { isSelfieWallActive: false, activeMode: 'idle' };
  }
};

const getCachedInstances = () => {
  try {
    const raw = localStorage.getItem('fanforge_instances_cache');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

const saveCachedInstance = (inst) => {
  if (!inst) return;
  const instId = inst.instanceId || inst.id;
  if (!instId) return;

  try {
    const list = getCachedInstances();
    const idx = list.findIndex(
      (i) => (i.instanceId || i.id) === instId || (i.appId === inst.appId && i.userId === inst.userId && i.userId !== 'default-user')
    );
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...inst };
    } else {
      list.unshift(inst);
    }
    localStorage.setItem('fanforge_instances_cache', JSON.stringify(list));
  } catch (e) {}
};

export const fetchInstancesApi = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.appId) queryParams.append('appId', params.appId);
  if (params.userId) queryParams.append('userId', params.userId);
  if (params.brandId) queryParams.append('brandId', params.brandId);
  if (params.status) queryParams.append('status', params.status);
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

  let remoteData = [];
  try {
    remoteData = (await request('GET', `/api/instances/${queryString}`)) || [];
  } catch (e) {
    remoteData = [];
  }

  const cachedList = getCachedInstances();
  const mergedMap = new Map();

  for (const c of cachedList) {
    const key = c.instanceId || c.id;
    if (key) mergedMap.set(key, c);
  }

  for (const r of remoteData) {
    const key = r.instanceId || r.id;
    if (key) mergedMap.set(key, r);
  }

  let merged = Array.from(mergedMap.values());

  if (params.appId) {
    merged = merged.filter((i) => i.appId === params.appId || i.templateId === params.appId);
  }

  if (params.userId || params.brandId) {
    const targetBrand = params.userId || params.brandId;
    merged = merged.filter(
      (i) =>
        i.userId === targetBrand ||
        i.brandId === targetBrand ||
        i.userId === 'default-user' ||
        i.brandId === 'default-brand' ||
        (i.brandName || '').toLowerCase().includes(targetBrand.toLowerCase())
    );
  }

  if (params.status) {
    const statuses = params.status.split(',').map((s) => s.trim().toLowerCase());
    merged = merged.filter((i) => statuses.includes((i.status || '').toLowerCase()));
  }

  return merged;
};

export const submitInstanceApi = async (data) => {
  let result = null;
  try {
    result = await request('POST', '/api/instances/submit', data);
  } catch (e) {}

  if (!result) {
    result = await publishInstanceApi(data);
  }

  saveCachedInstance(result);
  return result;
};

export const sendApprovalInstanceApi = async (instanceId) => {
  let result = null;
  try {
    result = await request('POST', `/api/instances/${instanceId}/send-approval`);
  } catch (e) {}

  if (!result) {
    try {
      const res = await fetch(`https://engagements-production.up.railway.app/api/instances/${instanceId}/send-approval`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) result = await res.json();
    } catch (e) {}
  }

  if (!result) {
    const cached = getCachedInstances().find((i) => (i.instanceId || i.id) === instanceId);
    result = {
      ...(cached || {}),
      id: instanceId,
      instanceId: instanceId,
      status: 'pending',
    };
  }

  saveCachedInstance(result);
  return result;
};

export const approveInstanceApi = async (instanceId) => {
  let result = null;
  try {
    result = await request('POST', `/api/instances/${instanceId}/approve`);
  } catch (e) {}

  if (!result) {
    const cached = getCachedInstances().find((i) => (i.instanceId || i.id) === instanceId);
    result = {
      ...(cached || {}),
      id: instanceId,
      instanceId: instanceId,
      status: 'approved',
      approvedAt: Date.now() / 1000,
    };
  }

  saveCachedInstance(result);
  return result;
};

export const rejectInstanceApi = async (instanceId) => {
  let result = null;
  try {
    result = await request('POST', `/api/instances/${instanceId}/reject`);
  } catch (e) {}

  if (!result) {
    const cached = getCachedInstances().find((i) => (i.instanceId || i.id) === instanceId);
    result = {
      ...(cached || {}),
      id: instanceId,
      instanceId: instanceId,
      status: 'rejected',
    };
  }

  saveCachedInstance(result);
  return result;
};

export const launchInstanceApi = async (instanceId) => {
  let result = null;
  try {
    result = await request('POST', `/api/instances/${instanceId}/launch`);
  } catch (e) {}

  if (!result) {
    const cached = getCachedInstances().find((i) => (i.instanceId || i.id) === instanceId);
    result = {
      ...(cached || {}),
      id: instanceId,
      instanceId: instanceId,
      status: 'launched',
      publishedAt: Date.now() / 1000,
    };
  }

  saveCachedInstance(result);
  return result;
};

export const deleteInstanceApi = async (instanceId) => {
  try {
    await request('DELETE', `/api/instances/${instanceId}`);
  } catch (e) {}

  try {
    const list = getCachedInstances().filter((i) => (i.instanceId || i.id) !== instanceId);
    localStorage.setItem('fanforge_instances_cache', JSON.stringify(list));
  } catch (e) {}

  return { message: 'Deleted' };
};

export const publishInstanceApi = async (data) => {
  try {
    return await request('POST', '/api/instances/publish', data);
  } catch (e) {}

  try {
    const res = await fetch('https://engagements-production.up.railway.app/api/instances/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) return await res.json();
  } catch (e) {}

  const id = `inst-${Date.now().toString(36)}`;
  return {
    instanceId: id,
    appId: data.appId || data.templateId || 'memory-challenge',
    templateId: data.templateId || data.appId || 'memory-challenge',
    userId: data.userId || '',
    brandName: data.brandName || 'Brand Account',
    title: data.title || 'Custom Brand Engagement',
    brandId: data.brandId || '',
    status: data.status || 'draft',
    publishedAt: Date.now() / 1000,
    approvedAt: null,
    config: data.config || {},
  };
};

export const fetchInstanceApi = async (instanceId) => {
  try {
    return await request('GET', `/api/instances/${instanceId}`);
  } catch (e) { }

  const res = await fetch(`https://engagements-production.up.railway.app/api/instances/${instanceId}`);
  if (!res.ok) throw new Error('Instance not found');
  return res.json();
};

export const fetchGameConfigApi = async (appId) => {
  try {
    const data = await request('GET', `/api/game-config/${appId}`);
    if (data) return data;
  } catch (e) { }

  const res = await fetch(`https://engagements-production.up.railway.app/api/game-config/${appId}`);
  if (!res.ok) throw new Error('Config not found');
  return res.json();
};

export const updateScreenStatusApi = async (data) => {
  // Always update Railway Cloud backend so Vercel deployment (fan-zone-five.vercel.app) updates in real-time
  try {
    await fetch('https://engagements-production.up.railway.app/api/screen/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (e) { }

  try {
    return await request('POST', '/api/screen/status', data);
  } catch (e) { }
};




