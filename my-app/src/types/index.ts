export const UserRole = {
  SALES_EXECUTIVE: 'SALES_EXECUTIVE',
  PRICING_ANALYST: 'PRICING_ANALYST'
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

export const PRStatus = {
  DRAFT: 'Draft',
  UNDER_REVIEW: 'Under Review',
  ACTION_REQUIRED: 'Action Required',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CLOSED: 'Closed'
} as const;

export type PRStatusType = typeof PRStatus[keyof typeof PRStatus];

export const AnalystStatus = {
  UNDER_REVIEW: 'Under Review',
  ACTIVE_STATUS: 'Active Status',
  CLOSED: 'Closed'
} as const;

export type AnalystStatusType = typeof AnalystStatus[keyof typeof AnalystStatus];

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRoleType;
  createdAt: Date;
}

export interface Comment {
  id: string;
  comment_text: string;
  created_at: string;
}

export interface ItemInfo {
  id?: string;
  itemName: string;
  commodityClass: string;
  totalWeight: number;
  handlingUnits: string;
  numberOfPieces: number;
  containerTypes: string;
  numberOfPallets: number;
}

export interface PRFormData {
  // Header Section
  shipmentDate: string;
  accountInfo: string;
  discount: string;
  
  // Origin Section
  startingAddress: string;
  startingState: string;
  startingZip: string;
  startingCountry: string;
  
  // Destination Section
  destinationAddress: string;
  destinationState: string;
  destinationZip: string;
  destinationCountry: string;
  
  // Item Info
  items: ItemInfo[];
  
  // Additional Services
  accessorial: string;
  pickup: string;
  delivery: string;
  
  // Insurance
  daylightProtectCoverage: boolean;
  insuranceDescription?: string;
  insuranceNote?: string;
}

export interface PR extends PRFormData {
  id: string;
  status: PRStatusType;
  analystStatus?: AnalystStatusType;
  created_by: string;
  assigned_to?: string;
  submission_date?: string;
  last_updated: string;
  comments: Comment[];
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: UserRoleType) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
} 