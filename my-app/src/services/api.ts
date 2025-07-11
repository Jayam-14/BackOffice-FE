import { API_CONFIG, buildApiUrl } from '../config/api';

export const API_ENDPOINTS = API_CONFIG.ENDPOINTS;

// Error handling utility
const handleApiError = async (response: Response) => {
  if (!response.ok) {
    // Check if response is HTML (likely a 404 page or ngrok warning)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      console.error('API returned HTML instead of JSON. This might be the ngrok warning page.');
      console.error('Response status:', response.status);
      console.error('Response URL:', response.url);
      
      // Check if it's the ngrok warning page
      const text = await response.text();
      if (text.includes('ERR_NGROK_6024') || text.includes('ngrok.com')) {
        throw new Error('NGROK_WARNING: Please accept the ngrok warning page first by visiting the URL directly in your browser.');
      }
      
      throw new Error(`API endpoint not found: ${response.url} (Status: ${response.status})`);
    }
    
    try {
      const errorData = await response.json();
      throw new Error(errorData.detail || "API request failed");
    } catch (parseError) {
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }
  }
  
  // Check if response is JSON
  const contentType = response.headers.get('content-type');
  if (contentType && !contentType.includes('application/json')) {
    console.warn('API response is not JSON:', contentType);
  }
  
  return response.json();
};

// Check if API is available
const isApiAvailable = async (): Promise<boolean> => {
  try {
    const response = await fetch(buildApiUrl('/auth/login'), {
      method: 'OPTIONS',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.warn('API not available, falling back to mock data:', error);
    return false;
  }
};

// Generic API request function with fallback
const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const url = buildApiUrl(endpoint);
  console.log('API Request URL:', url);
  console.log('API Request options:', options);
  
  const defaultOptions: RequestInit = {
    ...API_CONFIG.REQUEST_CONFIG,
    headers: {
      ...API_CONFIG.REQUEST_CONFIG.headers,
      ...options.headers,
    },
    ...options,
  };

  try {
    console.log('Making API request to:', url);
    const response = await fetch(url, defaultOptions);
    console.log('API Response status:', response.status);
    console.log('API Response headers:', response.headers);
    return await handleApiError(response);
  } catch (error) {
    console.error('API Error:', error);
    
    // If it's a CORS error or network error, throw a specific error
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('CORS_ERROR: Unable to connect to the backend API. Please ensure the backend is running and CORS is configured properly.');
    }
    
    throw error;
  }
};

// Authentication APIs
export const authAPI = {
  register: async (userData: {
    username: string;
    email: string;
    password: string;
    role: 'SE' | 'PA';
  }) => {
    return apiRequest(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login: async (credentials: {
    email: string;
    password: string;
  }) => {
    return apiRequest(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  logout: async () => {
    return apiRequest(API_ENDPOINTS.AUTH.LOGOUT, {
      method: 'POST',
    });
  },
};

// Sales Executive APIs
export const salesAPI = {
  savePricingRequest: async (requestData: {
    shipment_date: string;
    account_info: string;
    discount: string;
    origin_address: string;
    origin_state: string;
    origin_zip: string;
    origin_country: string;
    dest_address: string;
    dest_state: string;
    dest_zip: string;
    dest_country: string;
    accessorial: string;
    pickup: string;
    delivery: string;
    daylight_protect: boolean;
    items: Array<{
      item_name: string;
      commodity_class: string;
      total_weight: number;
      handling_unit: string;
      no_of_pieces: number;
      container_type: string;
      no_of_pallets: number;
    }>;
  }) => {
    return apiRequest(API_ENDPOINTS.SALES.SAVE, {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  },

  submitPricingRequest: async (requestData: any) => {
    return apiRequest(API_ENDPOINTS.SALES.SUBMIT, {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  },

  getPricingRequests: async (salesStatus?: string) => {
    let url = API_ENDPOINTS.SALES.GET_ALL;
    if (salesStatus) {
      url += `?sales_status=${encodeURIComponent(salesStatus)}`;
    }
    return apiRequest(url, { method: 'GET' });
  },

  getPricingRequestById: async (prId: string) => {
    return apiRequest(API_ENDPOINTS.SALES.GET_BY_ID(prId), {
      method: 'GET',
    });
  },

  updatePricingRequest: async (prId: string, requestData: any) => {
    return apiRequest(API_ENDPOINTS.SALES.UPDATE(prId), {
      method: 'PUT',
      body: JSON.stringify(requestData),
    });
  },

  resubmitActionRequiredRequest: async (prId: string, requestData: any) => {
    return apiRequest(API_ENDPOINTS.SALES.RESUBMIT(prId), {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  },

  deletePricingRequest: async (prId: string) => {
    return apiRequest(API_ENDPOINTS.SALES.DELETE(prId), {
      method: 'DELETE',
    });
  },
};

// Pricing Analyst APIs
export const paAPI = {
  getAvailablePricingRequests: async (paStatus?: string) => {
    let url = API_ENDPOINTS.PA.GET_ALL;
    if (paStatus) {
      url += `?pa_status=${encodeURIComponent(paStatus)}`;
    }
    return apiRequest(url, { method: 'GET' });
  },

  getMyAssignedRequests: async (paStatus?: string) => {
    let url = API_ENDPOINTS.PA.GET_MY;
    if (paStatus) {
      url += `?pa_status=${encodeURIComponent(paStatus)}`;
    }
    return apiRequest(url, { method: 'GET' });
  },

  assignPricingRequest: async (prId: string) => {
    return apiRequest(API_ENDPOINTS.PA.ASSIGN(prId), {
      method: 'POST',
    });
  },

  approveRejectPricingRequest: async (
    prId: string,
    action: 'approve' | 'reject' | 'action_required',
    comment: string = ''
  ) => {
    return apiRequest(API_ENDPOINTS.PA.APPROVE_REJECT(prId), {
      method: 'POST',
      body: JSON.stringify({
        action,
        comment,
      }),
    });
  },

  getPricingRequestById: async (prId: string) => {
    return apiRequest(API_ENDPOINTS.PA.GET_BY_ID(prId), {
      method: 'GET',
    });
  },
};

// Data transformation utilities
export const transformPRData = {
  // Transform frontend PR data to API format
  toAPI: (prData: any) => ({
    shipment_date: prData.shipmentDate instanceof Date ? prData.shipmentDate.toISOString().split('T')[0] : prData.shipmentDate,
    account_info: prData.accountInfo,
    discount: prData.discount,
    origin_address: prData.startingAddress,
    origin_state: prData.startingState,
    origin_zip: prData.startingZip,
    origin_country: prData.startingCountry,
    dest_address: prData.destinationAddress,
    dest_state: prData.destinationState,
    dest_zip: prData.destinationZip,
    dest_country: prData.destinationCountry,
    accessorial: prData.accessorial || '',
    pickup: prData.pickup || '',
    delivery: prData.delivery || '',
    daylight_protect: prData.daylightProtectCoverage,
    items: prData.items.map((item: any) => ({
      item_name: item.itemName,
      commodity_class: item.commodityClass,
      total_weight: item.totalWeight,
      handling_unit: item.handlingUnits,
      no_of_pieces: item.numberOfPieces,
      container_type: item.containerTypes,
      no_of_pallets: item.numberOfPallets,
    })),
  }),

  // Transform API PR data to frontend format
  fromAPI: (apiData: any) => ({
    id: apiData.id,
    shipmentDate: apiData.shipment_date,
    accountInfo: apiData.account_info,
    discount: apiData.discount,
    startingAddress: apiData.origin_address,
    startingState: apiData.origin_state,
    startingZip: apiData.origin_zip,
    startingCountry: apiData.origin_country,
    destinationAddress: apiData.dest_address,
    destinationState: apiData.dest_state,
    destinationZip: apiData.dest_zip,
    destinationCountry: apiData.dest_country,
    accessorial: apiData.accessorial || '',
    pickup: apiData.pickup || '',
    delivery: apiData.delivery || '',
    daylightProtectCoverage: apiData.daylight_protect,
    status: apiData.sales_status,
    analystStatus: apiData.analyst_status,
    createdBy: apiData.created_by,
    assignedTo: apiData.assigned_to,
    submissionDate: apiData.submission_date,
    lastUpdated: apiData.last_updated,
    items: apiData.items?.map((item: any) => ({
      id: item.id,
      itemName: item.item_name,
      commodityClass: item.commodity_class,
      totalWeight: item.total_weight,
      handlingUnits: item.handling_unit,
      numberOfPieces: item.no_of_pieces,
      containerTypes: item.container_type,
      numberOfPallets: item.no_of_pallets,
    })) || [],
    comments: apiData.comments?.map((comment: any) => ({
      id: comment.id,
      commentText: comment.comment_text,
      createdAt: comment.created_at,
    })) || [],
  }),
}; 