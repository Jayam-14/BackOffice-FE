// API Configuration
export const API_CONFIG = {
  BASE_URL: "http://localhost:8080",
  REQUEST_CONFIG: {
    headers: {
      "Content-Type": "application/json",
    },
  },
  ENDPOINTS: {
    AUTH: {
      REGISTER: "/auth/register",
      LOGIN: "/auth/login",
      LOGOUT: "/auth/logout",
      PROFILE: "/auth/profile",
    },
    SALES: {
      SAVE: "/sales/pr/save",
      SUBMIT: "/sales/pr/submit",
      GET_ALL: "/sales/pr",
      GET_BY_ID: (prId: string) => `/sales/pr/${prId}`,
      UPDATE: (prId: string) => `/sales/pr/${prId}`,
      RESUBMIT: (prId: string) => `/sales/pr/${prId}/resubmit`,
      DELETE: (prId: string) => `/sales/pr/${prId}`,
      SEND_TO_PA: (prId: string) => `/sales/pr/${prId}/send-to-pa`,
    },
    PA: {
      GET_ALL: "/pa/pr",
      GET_MY: "/pa/pr/my",
      GET_BY_ID: (prId: string) => `/pa/pr/${prId}`,
      ASSIGN: (prId: string) => `/pa/pr/${prId}/assign`,
      APPROVE_REJECT: (prId: string) => `/pa/pr/${prId}/approve-reject`,
    },
    HEALTH: "/health",
  },
};

export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
