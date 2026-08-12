const API_BASE =
  typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? (import.meta.env.VITE_LOCAL_API_URL || 'http://localhost:8000')
    : (import.meta.env.VITE_API_URL || 'https://engagements-six.vercel.app');

const REMOTE_API = import.meta.env.VITE_API_URL || 'https://engagements-six.vercel.app';


async function request(method, path, body, timeoutMs = 4000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      let detail = res.statusText;
      try {
        const data = await res.json();
        detail = data.detail || detail;
      } catch (e) { }
      throw new Error(detail);
    }

    if (res.status === 204) return null;
    return await res.json();
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// Auth
export const registerUserApi = async (data) => {
  try {
    return await request('POST', '/api/auth/register', data);
  } catch (e) {
    return {
      id: `usr-${Date.now().toString(36)}`,
      fullName: data.fullName || 'New User',
      companyName: data.companyName || '',
      email: data.email,
      role: data.role || 'Brand',
      createdAt: Date.now() / 1000,
    };
  }
};

export const loginUserApi = async (data) => {
  try {
    return await request('POST', '/api/auth/login', data);
  } catch (e) {
    const email = data.email || 'user@company.com';
    const isBrand = email.includes('brand');
    return {
      id: `usr-${Date.now().toString(36)}`,
      fullName: email.split('@')[0] || 'Demo User',
      companyName: 'FanForge Platform',
      email: email,
      role: isBrand ? 'Brand' : 'Super Admin',
      createdAt: Date.now() / 1000,
    };
  }
};

// Users
export const fetchUser = async (id) => {
  try {
    return await request('GET', `/api/users/${id}`);
  } catch (e) {
    return {
      id: id || 'demo-user',
      fullName: 'Super Admin',
      companyName: 'FanForge Platform',
      email: 'admin@fanforge.com',
      role: 'Super Admin',
      createdAt: Date.now() / 1000,
    };
  }
};
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
const SELFIE_API = REMOTE_API;

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
    const res = await fetch(`${REMOTE_API}/api/screen/status`);
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

export const notifyInstancesChanged = () => {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new Event('fanforge_instances_updated'));
    window.dispatchEvent(new Event('storage'));
    const channel = new BroadcastChannel('fanforge_instances_sync');
    channel.postMessage({ type: 'INSTANCES_UPDATED', timestamp: Date.now() });
    channel.close();
  } catch (e) {}
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

  try {
    const remoteData = await request('GET', `/api/instances/${queryString}`);
    if (Array.isArray(remoteData)) {
      // Update local storage cache with live backend data (evicting deleted instances)
      try {
        const existingCache = getCachedInstances();
        const otherAppsCache = existingCache.filter((i) => {
          if (params.appId && (i.appId === params.appId || i.templateId === params.appId)) {
            const targetUser = params.userId || params.brandId;
            if (targetUser && (i.userId === targetUser || i.brandId === targetUser)) {
              return false; // Evict deleted/stale cached items for this app & user
            }
          }
          return true;
        });
        const updatedCache = [...remoteData, ...otherAppsCache];
        localStorage.setItem('fanforge_instances_cache', JSON.stringify(updatedCache));
      } catch (e) {}

      return remoteData;
    }
  } catch (e) {}

  // Fallback to local cache only when network request fails
  let merged = getCachedInstances();

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

export const saveGameConfigApi = async (gameId, configData, { brandId, instanceId } = {}) => {
  if (!gameId || !configData) return;

  const bId = brandId || configData.brandId || '';
  const instId = instanceId || configData.instanceId || '';

  // Cache scoped to the instance/brand, never the global template
  const cacheKey = instId
    ? `fanforge_game_config_${instId}`
    : bId
    ? `fanforge_game_config_${bId}_${gameId}`
    : `fanforge_game_config_${gameId}`;
  try {
    localStorage.setItem(cacheKey, JSON.stringify(configData));
    localStorage.setItem(`fanforge_game_config_${gameId}`, JSON.stringify(configData));
  } catch (e) {}

  const qp = new URLSearchParams();
  if (instId) qp.set('instanceId', instId);
  if (bId) qp.set('brandId', bId);
  const qs = qp.toString() ? `?${qp.toString()}` : '';

  const brandedPayload = { ...configData, brandId: bId, instanceId: instId };

  try {
    await request('POST', `/api/game-config/${gameId}${qs}`, brandedPayload);
  } catch (e) {}

  try {
    await fetch(`${REMOTE_API}/api/game-config/${gameId}${qs}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(brandedPayload),
    });
  } catch (e) {}
};

export const submitInstanceApi = async (data) => {
  let result = null;
  try {
    result = await request('POST', '/api/instances/submit', data);
  } catch (e) {}

  try {
    const res = await fetch(`${REMOTE_API}/api/instances/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok && !result) result = await res.json();
  } catch (e) {}

  if (!result) {
    // Offline fallback — generate a local instance (does NOT touch master template)
    const id = `inst-${Date.now().toString(36)}`;
    result = {
      instanceId: id,
      appId: data.appId || data.templateId || 'memory-challenge',
      templateId: data.templateId || data.appId || 'memory-challenge',
      userId: data.userId || '',
      brandName: data.brandName || 'Brand Account',
      title: data.title || 'Custom Brand Engagement',
      brandId: data.brandId || data.userId || '',
      status: data.status || 'draft',
      publishedAt: Date.now() / 1000,
      approvedAt: null,
      config: data.config || {},
    };
  }

  saveCachedInstance(result);

  if (result && result.config) {
    const appId = result.appId || result.templateId || 'memory-challenge';
    saveGameConfigApi(appId, result.config, {
      brandId: result.brandId || result.userId,
      instanceId: result.instanceId || result.id,
    });
  }

  notifyInstancesChanged();
  return result;
};

export const sendApprovalInstanceApi = async (instanceId) => {
  let result = null;
  try {
    result = await request('POST', `/api/instances/${instanceId}/send-approval`);
  } catch (e) {}

  if (!result) {
    try {
      const res = await fetch(`${REMOTE_API}/api/instances/${instanceId}/send-approval`, {
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

  if (result && result.config) {
    const appId = result.appId || result.templateId || 'memory-challenge';
    saveGameConfigApi(appId, result.config, {
      brandId: result.brandId || result.userId,
      instanceId: result.instanceId || result.id,
    });
  }

  return result;
};

export const approveInstanceApi = async (instanceId) => {
  let result = null;
  try {
    result = await request('POST', `/api/instances/${instanceId}/approve`);
  } catch (e) {}

  try {
    const res = await fetch(`${REMOTE_API}/api/instances/${instanceId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok && !result) result = await res.json();
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

  if (result && result.config) {
    const appId = result.appId || result.templateId || 'memory-challenge';
    saveGameConfigApi(appId, result.config, {
      brandId: result.brandId || result.userId,
      instanceId: result.instanceId || result.id,
    });
  }

  return result;
};

export const rejectInstanceApi = async (instanceId) => {
  let result = null;
  try {
    result = await request('POST', `/api/instances/${instanceId}/reject`);
  } catch (e) {}

  try {
    await fetch(`${REMOTE_API}/api/instances/${instanceId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
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

  try {
    const res = await fetch(`${REMOTE_API}/api/instances/${instanceId}/launch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok && !result) result = await res.json();
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

  if (result && result.config) {
    const appId = result.appId || result.templateId || 'memory-challenge';
    saveGameConfigApi(appId, result.config, {
      brandId: result.brandId || result.userId,
      instanceId: result.instanceId || result.id,
    });
  }

  return result;
};

export const deleteInstanceApi = async (instanceId) => {
  try {
    await request('DELETE', `/api/instances/${instanceId}`);
  } catch (e) {}

  try {
    await fetch(`${REMOTE_API}/api/instances/${instanceId}`, {
      method: 'DELETE',
    });
  } catch (e) {}

  try {
    const list = getCachedInstances().filter((i) => (i.instanceId || i.id) !== instanceId);
    localStorage.setItem('fanforge_instances_cache', JSON.stringify(list));

    // Clear all associated brand draft & game config cache keys
    if (typeof window !== 'undefined' && window.localStorage) {
      Object.keys(localStorage).forEach((key) => {
        if (
          key.includes(instanceId) ||
          key.startsWith('fanforge_mc_draft_') ||
          key.startsWith('fanforge_memory_customization') ||
          key.startsWith('fanforge_game_config_')
        ) {
          localStorage.removeItem(key);
        }
      });
    }
  } catch (e) {}

  notifyInstancesChanged();
  return { message: 'Deleted' };
};

/**
 * Publish a brand's approved engagement instance.
 * This does NOT modify the master template.
 */
export const publishInstanceApi = async (instanceId) => {
  let result = null;
  try {
    result = await request('POST', `/api/instances/${instanceId}/publish`);
  } catch (e) {}

  if (!result) {
    try {
      const res = await fetch(`https://engagements-production.up.railway.app/api/instances/${instanceId}/publish`, {
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
      status: 'published',
      publishedAt: Date.now() / 1000,
    };
  }

  saveCachedInstance(result);

  if (result && result.config) {
    const appId = result.appId || result.templateId || 'memory-challenge';
    saveGameConfigApi(appId, result.config, {
      brandId: result.brandId || result.userId,
      instanceId: result.instanceId || result.id,
    });
  }

  return result;
};

export const fetchInstanceApi = async (instanceId) => {
  try {
    return await request('GET', `/api/instances/${instanceId}`);
  } catch (e) { }

  const res = await fetch(`https://engagements-production.up.railway.app/api/instances/${instanceId}`);
  if (!res.ok) throw new Error('Instance not found');
  return res.json();
};

/**
 * Fetch game config for a specific brand instance.
 * Falls back to brand cache, then master default.
 * NEVER overwrites the master template.
 */
export const fetchGameConfigApi = async (appId, { instanceId, brandId } = {}) => {
  // Build brand-scoped cache key
  const cacheKey = instanceId
    ? `fanforge_game_config_${instanceId}`
    : brandId
    ? `fanforge_game_config_${brandId}_${appId}`
    : null;

  // Build query string
  const qp = new URLSearchParams();
  if (instanceId) qp.set('instanceId', instanceId);
  if (brandId) qp.set('brandId', brandId);
  const qs = qp.toString() ? `?${qp.toString()}` : '';

  try {
    const data = await request('GET', `/api/game-config/${appId}${qs}`);
    if (data && (data.tiles || data.headline || data.gameTitle)) {
      if (cacheKey) {
        try { localStorage.setItem(cacheKey, JSON.stringify(data)); } catch (e) {}
      }
      return data;
    }
  } catch (e) { }

  // Fallback: brand-scoped local cache
  if (cacheKey) {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch (e) {}
  }

  return null;
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




