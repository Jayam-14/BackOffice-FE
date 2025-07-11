import { salesAPI, paAPI, transformPRData } from "./api";
import type { PR, PRCreateData } from "../types";

// Sales Executive PR Service
export const salesPRService = {
  // Get all pricing requests for sales executive
  getPRs: async (salesStatus?: string): Promise<PR[]> => {
    try {
      const response = await salesAPI.getPricingRequests(salesStatus);
      return response.map((pr: any) => transformPRData.fromAPI(pr));
    } catch (error) {
      console.error("Error fetching sales PRs:", error);
      throw error;
    }
  },

  // Get specific pricing request by ID
  getPRById: async (prId: string): Promise<PR> => {
    try {
      const response = await salesAPI.getPricingRequestById(prId);
      return transformPRData.fromAPI(response);
    } catch (error) {
      console.error("Error fetching PR by ID:", error);
      throw error;
    }
  },

  // Create new pricing request (save as draft)
  createPR: async (prData: PRCreateData): Promise<PR> => {
    try {
      const apiData = transformPRData.toAPI(prData);
      const response = await salesAPI.savePricingRequest(apiData);
      return transformPRData.fromAPI(response);
    } catch (error) {
      console.error("Error creating PR:", error);
      throw error;
    }
  },

  // Submit pricing request for review
  submitPR: async (prData: PRCreateData): Promise<PR> => {
    try {
      const apiData = transformPRData.toAPI(prData);
      const response = await salesAPI.submitPricingRequest(apiData);
      return transformPRData.fromAPI(response);
    } catch (error) {
      console.error("Error submitting PR:", error);
      throw error;
    }
  },

  // Update existing pricing request
  updatePR: async (prId: string, prData: PRCreateData): Promise<PR> => {
    try {
      const apiData = transformPRData.toAPI(prData);
      const response = await salesAPI.updatePricingRequest(prId, apiData);
      return transformPRData.fromAPI(response);
    } catch (error) {
      console.error("Error updating PR:", error);
      throw error;
    }
  },

  // Resubmit action required pricing request
  resubmitPR: async (prId: string, prData: PRCreateData): Promise<PR> => {
    try {
      const apiData = transformPRData.toAPI(prData);
      const response = await salesAPI.resubmitActionRequiredRequest(
        prId,
        apiData
      );
      return transformPRData.fromAPI(response);
    } catch (error) {
      console.error("Error resubmitting PR:", error);
      throw error;
    }
  },

  // Delete pricing request
  deletePR: async (prId: string): Promise<void> => {
    try {
      await salesAPI.deletePricingRequest(prId);
    } catch (error) {
      console.error("Error deleting PR:", error);
      throw error;
    }
  },

  // Send draft to PA for review
  sendToPA: async (prId: string): Promise<PR> => {
    try {
      const response = await salesAPI.sendToPA(prId);
      return transformPRData.fromAPI(response);
    } catch (error) {
      console.error("Error sending PR to PA:", error);
      throw error;
    }
  },
};

// Pricing Analyst PR Service
export const paPRService = {
  // Get all available pricing requests for PA
  getAvailablePRs: async (paStatus?: string): Promise<PR[]> => {
    try {
      const response = await paAPI.getAvailablePricingRequests(paStatus);
      return response.map((pr: any) => transformPRData.fromAPI(pr));
    } catch (error) {
      console.error("Error fetching available PRs:", error);
      throw error;
    }
  },

  // Get my assigned pricing requests
  getMyAssignedPRs: async (paStatus?: string): Promise<PR[]> => {
    try {
      const response = await paAPI.getMyAssignedRequests(paStatus);
      return response.map((pr: any) => transformPRData.fromAPI(pr));
    } catch (error) {
      console.error("Error fetching my assigned PRs:", error);
      throw error;
    }
  },

  // Get specific pricing request by ID
  getPRById: async (prId: string): Promise<PR> => {
    try {
      const response = await paAPI.getPricingRequestById(prId);
      return transformPRData.fromAPI(response);
    } catch (error) {
      console.error("Error fetching PR by ID:", error);
      throw error;
    }
  },

  // Assign pricing request to self
  assignPR: async (prId: string): Promise<PR> => {
    try {
      const response = await paAPI.assignPricingRequest(prId);
      return transformPRData.fromAPI(response);
    } catch (error) {
      console.error("Error assigning PR:", error);
      throw error;
    }
  },

  // Approve pricing request
  approvePR: async (prId: string, comment?: string): Promise<PR> => {
    try {
      const response = await paAPI.approveRejectPricingRequest(
        prId,
        "approve",
        comment || ""
      );
      return transformPRData.fromAPI(response);
    } catch (error) {
      console.error("Error approving PR:", error);
      throw error;
    }
  },

  // Reject pricing request
  rejectPR: async (prId: string, comment: string): Promise<PR> => {
    try {
      const response = await paAPI.approveRejectPricingRequest(
        prId,
        "reject",
        comment
      );
      return transformPRData.fromAPI(response);
    } catch (error) {
      console.error("Error rejecting PR:", error);
      throw error;
    }
  },

  // Request action required
  requestActionRequired: async (prId: string, comment: string): Promise<PR> => {
    try {
      const response = await paAPI.approveRejectPricingRequest(
        prId,
        "action_required",
        comment
      );
      return transformPRData.fromAPI(response);
    } catch (error) {
      console.error("Error requesting action:", error);
      throw error;
    }
  },
};
