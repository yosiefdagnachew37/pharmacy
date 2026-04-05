import axios from 'axios';

// Detect if we are running inside an Electron desktop app at runtime.
// In Electron (with nodeIntegration: true), window.process.type === 'renderer'.
// In a regular browser this will be undefined, so isElectron is false.
// Robust Electron detection (contextIsolation compatible)
const isElectron =
    (typeof window !== 'undefined' && window.location.protocol === 'file:') ||
    (typeof navigator !== 'undefined' && navigator.userAgent.includes('Electron'));

// Web app (browser) → use the Railway backend URL from VITE_API_URL
// Electron desktop → always use local backend on port 3001
const BASE_URL = isElectron
    ? 'http://localhost:3001'
    : (import.meta.env.VITE_API_URL || 'http://localhost:3001');

const client = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add interceptor for tokens and organization overrides
client.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Impersonation support: add organization override if selected
    const selectedOrg = sessionStorage.getItem('selectedOrganization');
    if (selectedOrg) {
        try {
            const org = JSON.parse(selectedOrg);
            if (org.id) {
                config.headers['x-organization-id'] = org.id;
            }
        } catch (e) { /* ignore parse errors */ }
    }
    
    return config;
});

// Handle 401 errors globally — but NOT for the login endpoint itself
// (a failed login returns 401, and redirecting to /login on the /login page causes a white screen)
client.interceptors.response.use(
    (response) => response,
    (error) => {
        const isLoginRequest = error.config?.url?.includes('/auth/login');
        if (error.response?.status === 401 && !isLoginRequest) {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            // Dispatch storage event so AuthProvider picks it up immediately
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
        
        // Handle 402 License Required globally for the desktop version 
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
