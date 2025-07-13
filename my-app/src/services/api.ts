import { API_CONFIG, buildApiUrl } from "../config/api";

export const API_ENDPOINTS = API_CONFIG.ENDPOINTS;

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem("authToken");
};

// Error handling utility
const handleApiError = async (response: Response) => {
  if (!response.ok) {
    try {
      const errorData = await response.json();
      throw new Error(errorData.detail || "API request failed");
    } catch (parseError) {
      throw new Error(
        `API request failed with status ${response.status}: ${response.statusText}`
      );
    }
  }

  return response.json();
};

// Generic API request function
const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const url = buildApiUrl(endpoint);
  console.log("API Request URL:", url);

  const token = getAuthToken();
  const defaultOptions: RequestInit = {
    ...API_CONFIG.REQUEST_CONFIG,
    headers: {
      ...API_CONFIG.REQUEST_CONFIG.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    console.log("Making API request to:", url);
    const response = await fetch(url, defaultOptions);
    console.log("API Response status:", response.status);
    return await handleApiError(response);
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// Authentication APIs
export const authAPI = {
  register: async (userData: {
    username: string;
    email: string;
    password: string;
    role: "SE" | "PA";
  }) => {
    const response = await apiRequest(API_ENDPOINTS.AUTH.REGISTER, {
      method: "POST",
      body: JSON.stringify(userData),
    });

    // Store the token
    if (response.access_token) {
      localStorage.setItem("authToken", response.access_token);
    }

    return response;
  },

  login: async (credentials: { email: string; password: string }) => {
    const response = await apiRequest(API_ENDPOINTS.AUTH.LOGIN, {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    // Store the token
    if (response.access_token) {
      localStorage.setItem("authToken", response.access_token);
    }

    return response;
  },

  logout: async () => {
    try {
      await apiRequest(API_ENDPOINTS.AUTH.LOGOUT, {
        method: "POST",
      });
    } finally {
      // Always remove token on logout
      localStorage.removeItem("authToken");
    }
  },

  getProfile: async () => {
    return apiRequest(API_ENDPOINTS.AUTH.PROFILE, {
      method: "GET",
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
      method: "POST",
      body: JSON.stringify(requestData),
    });
  },

  submitPricingRequest: async (requestData: any) => {
    return apiRequest(API_ENDPOINTS.SALES.SUBMIT, {
      method: "POST",
      body: JSON.stringify(requestData),
    });
  },

  getPricingRequests: async (salesStatus?: string) => {
    let url = API_ENDPOINTS.SALES.GET_ALL;
    if (salesStatus) {
      url += `?sales_status=${encodeURIComponent(salesStatus)}`;
    }
    return apiRequest(url, { method: "GET" });
  },

  getPricingRequestById: async (prId: string) => {
    return apiRequest(API_ENDPOINTS.SALES.GET_BY_ID(prId), {
      method: "GET",
    });
  },

  updatePricingRequest: async (prId: string, requestData: any) => {
    return apiRequest(API_ENDPOINTS.SALES.UPDATE(prId), {
      method: "PUT",
      body: JSON.stringify(requestData),
    });
  },

  resubmitActionRequiredRequest: async (prId: string, requestData: any) => {
    return apiRequest(API_ENDPOINTS.SALES.RESUBMIT(prId), {
      method: "POST",
      body: JSON.stringify(requestData),
    });
  },

  deletePricingRequest: async (prId: string) => {
    return apiRequest(API_ENDPOINTS.SALES.DELETE(prId), {
      method: "DELETE",
    });
  },

  sendToPA: async (prId: string) => {
    return apiRequest(API_ENDPOINTS.SALES.SEND_TO_PA(prId), {
      method: "POST",
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
    return apiRequest(url, { method: "GET" });
  },

  getMyAssignedRequests: async (paStatus?: string) => {
    let url = API_ENDPOINTS.PA.GET_MY;
    if (paStatus) {
      url += `?pa_status=${encodeURIComponent(paStatus)}`;
    }
    return apiRequest(url, { method: "GET" });
  },

  assignPricingRequest: async (prId: string) => {
    return apiRequest(API_ENDPOINTS.PA.ASSIGN(prId), {
      method: "POST",
    });
  },

  approveRejectPricingRequest: async (
    prId: string,
    action: "approve" | "reject" | "action_required",
    comment: string = ""
  ) => {
    return apiRequest(API_ENDPOINTS.PA.APPROVE_REJECT(prId), {
      method: "POST",
      body: JSON.stringify({
        action,
        comment,
      }),
    });
  },

  getPricingRequestById: async (prId: string) => {
    return apiRequest(API_ENDPOINTS.PA.GET_BY_ID(prId), {
      method: "GET",
    });
  },
};

// Data transformation utilities
export const transformPRData = {
  // Transform frontend PR data to API format
  toAPI: (prData: any) => ({
    shipment_date:
      prData.shipmentDate instanceof Date
        ? prData.shipmentDate.toISOString().split("T")[0]
        : prData.shipmentDate,
    account_info: prData.accountInfo,
    discount: prData.discount,
    origin_address: prData.originAddress,
    origin_state: prData.originState,
    origin_zip: prData.originZip,
    origin_country: prData.originCountry,
    dest_address: prData.destAddress,
    dest_state: prData.destState,
    dest_zip: prData.destZip,
    dest_country: prData.destCountry,
    accessorial: prData.accessorial,
    pickup: prData.pickup,
    delivery: prData.delivery,
    daylight_protect: prData.daylightProtect,
    items: prData.items.map((item: any) => ({
      item_name: item.itemName,
      commodity_class: item.commodityClass,
      total_weight: item.totalWeight,
      handling_unit: item.handlingUnit,
      no_of_pieces: item.noOfPieces,
      container_type: item.containerType,
      no_of_pallets: item.noOfPallets,
    })),
  }),

  // Transform API PR data to frontend format
  fromAPI: (apiData: any) => {
    console.log("API Data received:", apiData);
    console.log("Status fields:", {
      sales_status: apiData.sales_status,
      analyst_status: apiData.analyst_status,
      status: apiData.status,
    });

    return {
      id: apiData.id || apiData.pr_id, // Handle both summary and detailed formats
      shipmentDate: apiData.shipment_date
        ? new Date(apiData.shipment_date)
        : new Date(),
      accountInfo:
        apiData.account_info ||
        `PR-${apiData.pr_id?.slice(-8) || apiData.id?.slice(-8) || "Unknown"}`, // Use PR ID as fallback
      discount: apiData.discount || "",
      originAddress: apiData.origin_address || "",
      originState: apiData.origin_state || "",
      originZip: apiData.origin_zip || "",
      originCountry: apiData.origin_country || "USA",
      destAddress: apiData.dest_address || "",
      destState: apiData.destination_state || apiData.dest_state || "", // Handle destination_state field
      destZip: apiData.dest_zip || "",
      destCountry: apiData.dest_country || "USA",
      accessorial: apiData.accessorial || "",
      pickup: apiData.pickup || "",
      delivery: apiData.delivery || "",
      daylightProtect: apiData.daylight_protect || false,
      salesStatus: apiData.sales_status || apiData.status || "Draft",
      analystStatus: apiData.analyst_status || apiData.status || null,
      createdBy: apiData.created_by || "",
      assignedTo: apiData.assigned_to || apiData.assigned || null,
      submissionDate: apiData.submission_date || "",
      lastUpdated: apiData.last_updated || "",
      items:
        apiData.items?.map((item: any) => ({
          id: item.id,
          itemName: item.item_name,
          commodityClass: item.commodity_class,
          totalWeight: item.total_weight,
          handlingUnit: item.handling_unit,
          noOfPieces: item.no_of_pieces,
          containerType: item.container_type,
          noOfPallets: item.no_of_pallets,
        })) || [],
      comments:
        apiData.comments?.map((comment: any) => ({
          id: comment.id,
          commentText: comment.comment_text,
          createdAt: comment.created_at,
        })) || [],
    };
  },
};
