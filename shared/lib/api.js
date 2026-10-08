import { mockRequest } from './mock.js';

const BASE = import.meta.env.VITE_API_URL || '/api';
// Each app sets its own key (website vs admin) so their logins never overwrite each other.
const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || 'ss-token';
// Demo mode = in-browser mock backend + demo logins. Production builds turn it off with VITE_DEMO=false.
export const DEMO_ENABLED = import.meta.env.VITE_DEMO !== 'false';

export const tokenStore = {
  get: () => { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } },
  set: (t) => { try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ } },
};

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// null = not probed yet, true = use the in-browser demo backend.
let demoMode = null;
const listeners = new Set();
export const onDemoMode = (fn) => (listeners.add(fn), () => listeners.delete(fn));
export const isDemoMode = () => demoMode === true;

async function realRequest(path, { method, body, token }) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  // A non-JSON reply (e.g. the dev proxy's error page) means the API is down.
  if (!isJson) throw new TypeError('API unavailable');
  const json = await res.json();
  if (!res.ok) throw new ApiError(json.message || 'Request failed', res.status);
  return json;
}

export async function api(path, { method = 'GET', body } = {}) {
  const token = tokenStore.get();
  if (demoMode !== true) {
    try {
      const result = await realRequest(path, { method, body, token });
      demoMode = false;
      return result;
    } catch (err) {
      if (err instanceof ApiError || demoMode === false) throw err;
      if (!DEMO_ENABLED) throw new ApiError('Cannot reach the server. Please try again in a moment.', 0);
      demoMode = true;
      listeners.forEach((fn) => fn(true));
    }
  }
  try {
    return await mockRequest(path, { method, body, token });
  } catch (err) {
    throw new ApiError(err.message, err.status);
  }
}
