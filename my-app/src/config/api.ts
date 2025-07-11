// API Configuration
export const API_CONFIG = {
  BASE_URL: "https://6c3ae1444bd5.ngrok-free.app",
  
  // API Endpoints
  ENDPOINTS: {
    AUTH: {
      REGISTER: "/auth/register",
      LOGIN: "/auth/login",
      LOGOUT: "/auth/logout",
    },
    SALES: {
      SAVE: "/sales/pr/save",
      SUBMIT: "/sales/pr/submit",
      GET_ALL: "/sales/pr",
      GET_BY_ID: (id: string) => `/sales/pr/${id}`,
      UPDATE: (id: string) => `/sales/pr/${id}`,
      RESUBMIT: (id: string) => `/sales/pr/${id}/resubmit`,
      DELETE: (id: string) => `/sales/pr/${id}`,
    },
    PA: {
      GET_ALL: "/pa/pr",
      GET_MY: "/pa/pr/my",
      ASSIGN: (id: string) => `/pa/pr/${id}/assign`,
      APPROVE_REJECT: (id: string) => `/pa/pr/${id}/approve-reject`,
      GET_BY_ID: (id: string) => `/pa/pr/${id}`,
    },
  },
  
  // Request configuration
  REQUEST_CONFIG: {
    credentials: 'include' as const,
    headers: {
      'Content-Type': 'application/json',
    },
  },
};

// Environment-specific configuration
export const getApiBaseUrl = () => {
  // In development, use the proxy
  if (import.meta.env.DEV) {
    return '/api';
  }
  
  // Check for environment variable first
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Fallback to default
  return API_CONFIG.BASE_URL;
};

// Helper function to build full API URL
export const buildApiUrl = (endpoint: string) => {
  return `${getApiBaseUrl()}${endpoint}`;
}; 