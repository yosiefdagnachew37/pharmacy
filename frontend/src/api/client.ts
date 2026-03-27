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
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Impersonation support: add organization override if selected
    const selectedOrg = localStorage.getItem('selectedOrganization');
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

// Handle 401 errors globally
client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Dispatch storage event so AuthProvider picks it up immediately
            window.dispatchEvent(new Event('storage'));
            
            if (isElectron) {
                window.location.hash = '#/login';
            } else {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default client;
