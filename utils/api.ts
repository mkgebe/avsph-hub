import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

const AUTH_COOKIE = 'auth_token';

// Requests may opt out of the global 401 -> redirect-to-login behaviour.
// Used by the /me probes, whose callers decide what a 401 means for them.
declare module 'axios' {
    export interface AxiosRequestConfig {
        skipAuthRedirect?: boolean;
    }
}

const resolveBaseUrl = (): string => {
    const configured = process.env.NEXT_PUBLIC_API_URL;
    if (configured) return configured;

    // NEXT_PUBLIC_* values are inlined at build time. When the variable is
    // missing from the deployment, every request silently targets the
    // visitor's own machine, which looks like "login is broken" instead of
    // "the API URL was never configured". Say so out loud.
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
        console.error(
            '[api] NEXT_PUBLIC_API_URL is not set. Falling back to http://localhost:3000, ' +
            'which will not work on a deployed site. Set it in the deployment environment and redeploy.',
        );
    }
    return 'http://localhost:3000';
};

const API_BASE_URL = resolveBaseUrl();

// Sign-in is interactive: somebody is watching the button spin. A stalled API
// has to be reported in seconds, not after the generous timeout that long
// report and export requests need.
export const AUTH_TIMEOUT_MS = 12000;

// The base URL the client is actually talking to, for diagnostics on screen.
export const getApiBaseUrl = (): string => API_BASE_URL;

// True when NEXT_PUBLIC_API_URL was missing at build time, so every request is
// aimed at the visitor's own machine and nothing can ever succeed.
export const isApiUrlConfigured = (): boolean =>
    Boolean(process.env.NEXT_PUBLIC_API_URL);

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    // Without a timeout an unreachable API leaves requests pending forever,
    // which strands the login button on "Authenticating...".
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Helper to get cookie value.
// The value is read with slice rather than split('='), because tokens may
// contain '=' (base64 padding) and splitting truncates them into garbage.
const getCookie = (name: string): string | undefined => {
    if (typeof window === 'undefined') return undefined;
    const prefix = `${name}=`;
    const row = document.cookie
        .split('; ')
        .find(entry => entry.startsWith(prefix));
    if (!row) return undefined;
    const value = row.slice(prefix.length);
    if (!value) return undefined;
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
};

// Helper to set cookie
export const setAuthToken = (token: string) => {
    if (typeof window === 'undefined') return;
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie =
        `${AUTH_COOKIE}=${encodeURIComponent(token)}; path=/; ` +
        `expires=${expires.toUTCString()}; SameSite=Lax${secure}`;
};

// Helper to clear auth token
export const clearAuthToken = () => {
    if (typeof window !== 'undefined') {
        document.cookie = `${AUTH_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
};

// Whether a token is present at all, so callers can skip pointless requests.
export const hasAuthToken = (): boolean => Boolean(getCookie(AUTH_COOKIE));

interface ApiErrorBody {
    error?: string;
    message?: string;
}

// Turns a failed request into something a person can act on. Reporting every
// failure as "invalid email or password" hides outages and misconfiguration.
export const getApiErrorMessage = (
    error: unknown,
    fallback = 'Something went wrong. Please try again.',
): string => {
    if (!axios.isAxiosError(error)) return fallback;

    const axiosError = error as AxiosError<ApiErrorBody>;
    const status = axiosError.response?.status;

    if (!axiosError.response) {
        if (axiosError.code === 'ECONNABORTED') {
            return 'The server took too long to respond. Please try again.';
        }
        return `Cannot reach the server at ${API_BASE_URL}. Check your connection or the API configuration.`;
    }

    const fromServer =
        axiosError.response.data?.error || axiosError.response.data?.message;
    if (fromServer) return fromServer;

    if (status === 401 || status === 403) return 'Invalid email or password.';
    if (status === 404) return `Endpoint not found at ${API_BASE_URL}. Check the API configuration.`;
    if (status && status >= 500) return 'The server is having trouble right now. Please try again shortly.';

    return fallback;
};

// Whether a failure means "this session is not valid" as opposed to "the
// server could not be reached". Only the former should end a session: a
// timeout or a dropped connection must not sign a working session out.
export const isAuthError = (error: unknown): boolean => {
    if (!axios.isAxiosError(error)) return false;
    const status = error.response?.status;
    return status === 401 || status === 403;
};

// Request interceptor to add bearer token
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = getCookie(AUTH_COOKIE);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        const config = error.config as InternalAxiosRequestConfig | undefined;

        // Don't redirect on 401 for auth endpoints
        const isAuthEndpoint =
            config?.url?.includes('/admin/login') ||
            config?.url?.includes('/admin/register') ||
            config?.url?.includes('/staff/login');

        const shouldRedirect =
            error.response?.status === 401 &&
            !isAuthEndpoint &&
            !config?.skipAuthRedirect;

        if (shouldRedirect && typeof window !== 'undefined') {
            // Already on the login page: clearing and reloading here just
            // restarts the page mid-sign-in.
            if (window.location.pathname !== '/login') {
                clearAuthToken();
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
