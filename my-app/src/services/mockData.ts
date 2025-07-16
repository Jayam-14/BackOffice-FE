import type { PR, Comment, UserRoleType, PRStatusType } from '../types';
import { UserRole, PRStatus } from '../types';

// Mock data
export const mockPRs: PR[] = [
  {
    id: '1',
    shipmentDate: new Date('2024-01-15'),
    accountInfo: 'ABC Company',
    discount: 10,
    startingAddress: '123 Main St',
    startingState: 'CA',
    startingZip: '90210',
    startingCountry: 'USA',
    destinationAddress: '456 Oak Ave',
    destinationState: 'NY',
    destinationZip: '10001',
    destinationCountry: 'USA',
    items: [
      {
        itemName: 'Electronics',
        commodityClass: 'Class 70',
        totalWeight: 500,
        handlingUnits: 10,
        numberOfPieces: 50,
        containerTypes: 'Boxes',
        numberOfPallets: 2
      }
    ],
    accessorial: true,
    pickup: false,
    delivery: true,
    daylightProtectCoverage: false,
    status: PRStatus.DRAFT,
    created_by: '1',
    last_updated: new Date('2024-01-10'),
    comments: []
  },
  {
    id: '2',
    shipmentDate: new Date('2024-01-20'),
    accountInfo: 'XYZ Corp',
    discount: 5,
    startingAddress: '789 Pine St',
    startingState: 'TX',
    startingZip: '75001',
    startingCountry: 'USA',
    destinationAddress: '321 Elm St',
    destinationState: 'FL',
    destinationZip: '33101',
    destinationCountry: 'USA',
    items: [
      {
        itemName: 'Furniture',
        commodityClass: 'Class 50',
        totalWeight: 1000,
        handlingUnits: 5,
        numberOfPieces: 10,
        containerTypes: 'Crates',
        numberOfPallets: 1
      }
    ],
    accessorial: false,
    pickup: true,
    delivery: true,
    daylightProtectCoverage: true,
    insuranceDescription: 'Full coverage for fragile items',
    insuranceNote: 'Handle with care',
    status: PRStatus.UNDER_REVIEW,
    created_by: '1',
    assigned_to: '2',
    submission_date: new Date('2024-01-12'),
    last_updated: new Date('2024-01-12'),
    comments: [
      {
        comment_id: '1',
        pr_id: '2',
        user_id: '2',
        role: UserRole.PRICING_ANALYST,
        comment_text: 'Please provide additional details about the fragile items.',
        created_at: new Date('2024-01-13')
      }
    ]
  },
  {
    id: '3',
    shipmentDate: new Date('2024-01-25'),
    accountInfo: 'Approved Company',
    discount: 15,
    startingAddress: '100 Success St',
    startingState: 'CA',
    startingZip: '90210',
    startingCountry: 'USA',
    destinationAddress: '200 Victory Ave',
    destinationState: 'NY',
    destinationZip: '10001',
    destinationCountry: 'USA',
    items: [
      {
        itemName: 'Approved Items',
        commodityClass: 'Class 60',
        totalWeight: 750,
        handlingUnits: 8,
        numberOfPieces: 25,
        containerTypes: 'Boxes',
        numberOfPallets: 3
      }
    ],
    accessorial: true,
    pickup: true,
    delivery: true,
    daylightProtectCoverage: true,
    status: PRStatus.CLOSED,
    salesStatus: 'Closed',
    analystStatus: 'Closed',
    finalApprovalStatus: 'Approved', // This PR was approved before being closed
    created_by: '1',
    assigned_to: '2',
    submission_date: new Date('2024-01-20'),
    last_updated: new Date('2024-01-25'),
    comments: [
      {
        comment_id: '2',
        pr_id: '3',
        user_id: '2',
        role: UserRole.PRICING_ANALYST,
        comment_text: 'Approved with conditions.',
        created_at: new Date('2024-01-22')
      }
    ]
  },
  {
    id: '4',
    shipmentDate: new Date('2024-01-30'),
    accountInfo: 'Rejected Company',
    discount: 20,
    startingAddress: '300 Failure St',
    startingState: 'TX',
    startingZip: '75001',
    startingCountry: 'USA',
    destinationAddress: '400 Denial Ave',
    destinationState: 'FL',
    destinationZip: '33101',
    destinationCountry: 'USA',
    items: [
      {
        itemName: 'Rejected Items',
        commodityClass: 'Class 80',
        totalWeight: 1200,
        handlingUnits: 12,
        numberOfPieces: 30,
        containerTypes: 'Crates',
        numberOfPallets: 4
      }
    ],
    accessorial: false,
    pickup: false,
    delivery: true,
    daylightProtectCoverage: false,
    status: PRStatus.CLOSED,
    salesStatus: 'Closed',
    analystStatus: 'Closed',
    finalApprovalStatus: 'Rejected', // This PR was rejected before being closed
    created_by: '1',
    assigned_to: '2',
    submission_date: new Date('2024-01-25'),
    last_updated: new Date('2024-01-30'),
    comments: [
      {
        comment_id: '3',
        pr_id: '4',
        user_id: '2',
        role: UserRole.PRICING_ANALYST,
        comment_text: 'Rejected due to insufficient information.',
        created_at: new Date('2024-01-28')
      }
    ]
  }
];

export const mockComments: Comment[] = [
  {
    comment_id: '1',
    pr_id: '2',
    user_id: '2',
    role: UserRole.PRICING_ANALYST,
    comment_text: 'Please provide additional details about the fragile items.',
    created_at: new Date('2024-01-13')
  }
];

// Mock API functions
export const mockAPI = {
  // PR related functions
  getPRs: async (userId: string, role: UserRoleType): Promise<PR[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (role === UserRole.SALES_EXECUTIVE) {
      return mockPRs.filter(pr => pr.created_by === userId);
    } else {
      return mockPRs.filter(pr => 
        pr.status === PRStatus.UNDER_REVIEW || 
        pr.status === PRStatus.ACTION_REQUIRED ||
        pr.status === PRStatus.APPROVED ||
        pr.status === PRStatus.REJECTED ||
        pr.status === PRStatus.CLOSED
      );
    }
  },

  getPR: async (prId: string): Promise<PR | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockPRs.find(pr => pr.id === prId) || null;
  },

  createPR: async (prData: Omit<PR, 'id' | 'created_by' | 'last_updated' | 'comments'> & { status?: PRStatusType; submission_date?: Date }): Promise<PR> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newPR: PR = {
      ...prData,
      id: Date.now().toString(),
      status: prData.status || PRStatus.DRAFT,
      created_by: '1', // This would come from auth context
      last_updated: new Date(),
      comments: []
    };
    mockPRs.push(newPR);
    return newPR;
  },

  updatePR: async (prId: string, prData: Partial<PR>): Promise<PR> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const index = mockPRs.findIndex(pr => pr.id === prId);
    if (index === -1) throw new Error('PR not found');
    
    mockPRs[index] = { ...mockPRs[index], ...prData, last_updated: new Date() };
    return mockPRs[index];
  },

  deletePR: async (prId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockPRs.findIndex(pr => pr.id === prId);
    if (index === -1) throw new Error('PR not found');
    mockPRs.splice(index, 1);
  },

  submitPR: async (prId: string): Promise<PR> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const pr = mockPRs.find(p => p.id === prId);
    if (!pr) throw new Error('PR not found');
    
    pr.status = PRStatus.UNDER_REVIEW;
    pr.submission_date = new Date();
    pr.last_updated = new Date();
    return pr;
  },

  approvePR: async (prId: string): Promise<PR> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const pr = mockPRs.find(p => p.id === prId);
    if (!pr) throw new Error('PR not found');
    
    pr.status = PRStatus.APPROVED;
    pr.last_updated = new Date();
    return pr;
  },

  rejectPR: async (prId: string): Promise<PR> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const pr = mockPRs.find(p => p.id === prId);
    if (!pr) throw new Error('PR not found');
    
    pr.status = PRStatus.REJECTED;
    pr.last_updated = new Date();
    return pr;
  },

  // Comment related functions
  addComment: async (commentData: Omit<Comment, 'comment_id' | 'created_at'>): Promise<Comment> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newComment: Comment = {
      ...commentData,
      comment_id: Date.now().toString(),
      created_at: new Date()
    };
    
    const pr = mockPRs.find(p => p.id === commentData.pr_id);
    if (pr) {
      pr.comments.push(newComment);
      pr.status = PRStatus.ACTION_REQUIRED;
      pr.last_updated = new Date();
    }
    
    return newComment;
  },

  getComments: async (prId: string): Promise<Comment[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const pr = mockPRs.find(p => p.id === prId);
    return pr?.comments || [];
  }
}; 