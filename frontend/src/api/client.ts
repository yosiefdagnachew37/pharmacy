import axios from 'axios';

// ─── Electron detection ────────────────────────────────────────────────────────
// Robust detection compatible with contextIsolation=true and false.
const isElectron =
    (typeof window !== 'undefined' && window.location.protocol === 'file:') ||
    (typeof navigator !== 'undefined' && navigator.userAgent.includes('Electron'));

// ─── LAN Client Mode detection ────────────────────────────────────────────────
// LAN client mode is active when:
//   1. Running inside Electron (local file or Electron UA), AND
//   2. A LAN server URL has been stored by the LanSetup page in localStorage.
//
// This is a purely additive check — if lan_server_url is absent,
// behaviour falls through to the existing Desktop / SaaS logic unchanged.
function getLanServerUrl(): string {
    try {
        return localStorage.getItem('lan_server_url') || '';
    } catch {
        return ''; // localStorage unavailable in SSR / test environments
    }
}

function getLanSecret(): string {
    try {
        return localStorage.getItem('lan_secret') || '';
    } catch {
        return '';
    }
}

const lanServerUrl = getLanServerUrl();
const isLanClient = isElectron && lanServerUrl.startsWith('http');

// ─── Base URL resolution ───────────────────────────────────────────────────────
//  Priority:
//    1. LAN client → configured server URL  (http://SERVER_IP:PORT)
//    2. Electron desktop → local backend    (http://localhost:3001)
//    3. Web/SaaS → VITE_API_URL env var
const BASE_URL = isLanClient
    ? lanServerUrl
    : isElectron
        ? 'http://localhost:3001'
        : (import.meta.env.VITE_API_URL || 'http://localhost:3001');

// ─── Axios instance ───────────────────────────────────────────────────────────
const client = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ─── Request interceptor ──────────────────────────────────────────────────────
// Attaches: JWT Bearer token, x-organization-id (impersonation), x-lan-secret (LAN mode)
client.interceptors.request.use((config) => {
    // 1. JWT auth token (existing behaviour — unchanged)
    const token = sessionStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Organisation override for super-admin impersonation (existing — unchanged)
    const selectedOrg = sessionStorage.getItem('selectedOrganization');
    if (selectedOrg) {
        try {
            const org = JSON.parse(selectedOrg);
            if (org.id) {
                config.headers['x-organization-id'] = org.id;
            }
        } catch (_) { /* ignore parse errors */ }
    }

    // 3. LAN shared-secret header (NEW — only active in LAN client mode)
    if (isLanClient) {
        const secret = getLanSecret();
        if (secret) {
            config.headers['x-lan-secret'] = secret;
        }
    }

    return config;
});

// ─── Response interceptor ─────────────────────────────────────────────────────
// Handles 401 (session expired) and 402 (license required) globally.
// Existing logic is preserved exactly — no changes to SaaS or Desktop behaviour.
client.interceptors.response.use(
    (response) => response,
    (error) => {
        const isLoginRequest = error.config?.url?.includes('/auth/login');

        // 401 — session expired or invalid token
        if (error.response?.status === 401 && !isLoginRequest) {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            window.dispatchEvent(new Event('storage'));

            const currentPath = window.location.pathname;
            const currentHash = window.location.hash;
            if (!currentPath.includes('/login') && !currentHash.includes('/login')) {
                if (isElectron) {
                    window.location.hash = '#/login';
                } else {
                    window.location.href = '/login';
                }
            }
        }

        // 402 — hardware license required (Desktop mode only)
        // LAN mode does not use hardware licensing, so this only fires for IS_DESKTOP_OFFLINE
        if (error.response?.status === 402) {
            const currentPath = window.location.pathname;
            const currentHash = window.location.hash;
            if (!currentPath.includes('/license-lock') && !currentHash.includes('/license-lock')) {
                if (isElectron) {
                    window.location.hash = '#/license-lock';
                } else {
                    window.location.href = '/license-lock';
                }
            }
        }

        return Promise.reject(error);
    }
);

export default client;
