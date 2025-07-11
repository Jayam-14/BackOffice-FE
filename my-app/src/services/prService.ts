import { salesAPI, paAPI, transformPRData } from './api';
import type { PR, PRFormData, UserRoleType } from '../types';
import { UserRole } from '../types';
import { mockAPI } from './mockData';

// Sales Executive PR Service
export const salesPRService = {
  // Get all pricing requests for sales executive
  getPRs: async (salesStatus?: string): Promise<PR[]> => {
    try {
      console.log('Calling salesAPI.getPricingRequests...');
      const response = await salesAPI.getPricingRequests(salesStatus);
      console.log('Raw API response:', response);
      console.log('Response type:', typeof response);
      console.log('Response length:', Array.isArray(response) ? response.length : 'Not an array');
      console.log('Response structure:', JSON.stringify(response, null, 2));
      
      if (Array.isArray(response) && response.length > 0) {
        console.log('First raw PR from API:', response[0]);
      }
      
      const transformedPRs = response.map((pr: any) => {
        console.log('Transforming PR:', pr);
        const transformed = transformPRData.fromAPI(pr);
        console.log('Transformed PR:', transformed);
        return transformed;
      });
      
      console.log('Final transformed PRs:', transformedPRs);
      return transformedPRs;
    } catch (error) {
      console.error('Error fetching PRs from API:', error);
      
      // Check if it's the ngrok warning error
      if (error instanceof Error && error.message.includes('NGROK_WARNING')) {
        console.error('Ngrok warning detected. Please visit https://6c3ae1444bd5.ngrok-free.app in your browser and accept the warning.');
        // Show a user-friendly message
        alert('Please visit https://6c3ae1444bd5.ngrok-free.app in your browser and accept the ngrok warning, then refresh this page.');
      }
      
      // Fallback to mock data when API fails
      return mockAPI.getPRs('1', UserRole.SALES_EXECUTIVE);
    }
  },

  // Get specific pricing request
  getPR: async (prId: string): Promise<PR | null> => {
    try {
      const response = await salesAPI.getPricingRequestById(prId);
      return transformPRData.fromAPI(response);
    } catch (error) {
      console.error('Error fetching PR from API, falling back to mock data:', error);
      // Fallback to mock data when API fails
      return mockAPI.getPR(prId);
    }
  },

  // Create new pricing request (save as draft)
  createPR: async (prData: PRFormData): Promise<PR> => {
    try {
      const apiData = transformPRData.toAPI(prData);
      const response = await salesAPI.savePricingRequest(apiData);
      return transformPRData.fromAPI(response);
    } catch (error) {
      console.error('Error creating PR:', error);
      throw error;
    }
  },

  // Update pricing request (draft only)
  updatePR: async (prId: string, prData: Partial<PRFormData>): Promise<PR> => {
    try {
      const apiData = transformPRData.toAPI(prData as PRFormData);
      const response = await salesAPI.updatePricingRequest(prId, apiData);
      return transformPRData.fromAPI(response);
    } catch (error) {
      console.error('Error updating PR:', error);
      throw error;
    }
  },

  // Submit pricing request for review
  submitPR: async (prData: PRFormData): Promise<PR> => {
    try {
      const apiData = transformPRData.toAPI(prData);
      const response = await salesAPI.submitPricingRequest(apiData);
      return transformPRData.fromAPI(response);
    } catch (error) {
      console.error('Error submitting PR:', error);
      throw error;
    }
  },

  // Resubmit action required request
  resubmitPR: async (prId: string, prData: PRFormData): Promise<PR> => {
    try {
      const apiData = transformPRData.toAPI(prData);
      const response = await salesAPI.resubmitActionRequiredRequest(prId, apiData);
      return transformPRData.fromAPI(response);
    } catch (error) {
      console.error('Error resubmitting PR:', error);
      throw error;
    }
  },

  // Delete pricing request
  deletePR: async (prId: string): Promise<void> => {
    try {
      await salesAPI.deletePricingRequest(prId);
    } catch (error) {
      console.error('Error deleting PR:', error);
      throw error;
    }
  },
};

// Pricing Analyst PR Service
export const paPRService = {
  // Get all available pricing requests
  getAvailablePRs: async (paStatus?: string): Promise<PR[]> => {
    try {
      console.log('Calling paAPI.getAvailablePricingRequests...');
      const response = await paAPI.getAvailablePricingRequests(paStatus);
      console.log('PA API response:', response);
      console.log('PA Response type:', typeof response);
      console.log('PA Response length:', Array.isArray(response) ? response.length : 'Not an array');
      
      if (Array.isArray(response) && response.length > 0) {
        console.log('First PA PR from API:', response[0]);
      }
      
      const transformedPRs = response.map((pr: any) => {
        console.log('Transforming PA PR:', pr);
        const transformed = transformPRData.fromAPI(pr);
        console.log('Transformed PA PR:', transformed);
        return transformed;
      });
      
      console.log('Final transformed PA PRs:', transformedPRs);
      return transformedPRs;
    } catch (error) {
      console.error('Error fetching available PRs from API:', error);
      
      // Check if it's the ngrok warning error
      if (error instanceof Error && error.message.includes('NGROK_WARNING')) {
        console.error('Ngrok warning detected for PA API. Please visit https://6c3ae1444bd5.ngrok-free.app in your browser and accept the warning.');
        alert('Please visit https://6c3ae1444bd5.ngrok-free.app in your browser and accept the ngrok warning, then refresh this page.');
      }
      
      // Fallback to mock data when API fails
      return mockAPI.getPRs('2', UserRole.PRICING_ANALYST);
    }
  },

  // Get my assigned pricing requests
  getMyAssignedPRs: async (paStatus?: string): Promise<PR[]> => {
    try {
      const response = await paAPI.getMyAssignedRequests(paStatus);
      return response.map((pr: any) => transformPRData.fromAPI(pr));
    } catch (error) {
      console.error('Error fetching my assigned PRs:', error);
      throw error;
    }
  },

  // Assign pricing request to self
  assignPR: async (prId: string): Promise<PR> => {
    try {
      const response = await paAPI.assignPricingRequest(prId);
      return transformPRData.fromAPI(response);
    } catch (error) {
      console.error('Error assigning PR:', error);
      throw error;
    }
  },

  // Get specific pricing request
  getPR: async (prId: string): Promise<PR | null> => {
    try {
      const response = await paAPI.getPricingRequestById(prId);
      return transformPRData.fromAPI(response);
    } catch (error) {
      console.error('Error fetching PR:', error);
      throw error;
    }
  },

  // Approve pricing request
  approvePR: async (prId: string, comment: string = ''): Promise<PR> => {
    try {
      const response = await paAPI.approveRejectPricingRequest(prId, 'approve', comment);
      return transformPRData.fromAPI(response);
    } catch (error) {
      console.error('Error approving PR:', error);
      throw error;
    }
  },

  // Reject pricing request
  rejectPR: async (prId: string, comment: string = ''): Promise<PR> => {
    try {
      const response = await paAPI.approveRejectPricingRequest(prId, 'reject', comment);
      return transformPRData.fromAPI(response);
    } catch (error) {
      console.error('Error rejecting PR:', error);
      throw error;
    }
  },

  // Mark as action required
  actionRequiredPR: async (prId: string, comment: string = ''): Promise<PR> => {
    try {
      const response = await paAPI.approveRejectPricingRequest(prId, 'action_required', comment);
      return transformPRData.fromAPI(response);
    } catch (error) {
      console.error('Error marking PR as action required:', error);
      throw error;
    }
  },
};

// Generic PR service that routes based on user role
export const prService = {
  getPRs: async (role: UserRoleType, status?: string): Promise<PR[]> => {
    if (role === UserRole.SALES_EXECUTIVE) {
      return salesPRService.getPRs(status);
    } else {
      return paPRService.getAvailablePRs(status);
    }
  },

  getPR: async (prId: string, role: UserRoleType): Promise<PR | null> => {
    if (role === UserRole.SALES_EXECUTIVE) {
      return salesPRService.getPR(prId);
    } else {
      return paPRService.getPR(prId);
    }
  },

  getMyAssignedPRs: async (status?: string): Promise<PR[]> => {
    return paPRService.getMyAssignedPRs(status);
  },
}; 