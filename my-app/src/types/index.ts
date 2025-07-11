export const UserRole = {
  SALES_EXECUTIVE: 'SALES_EXECUTIVE',
  PRICING_ANALYST: 'PRICING_ANALYST'
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

export const PRStatus = {
  DRAFT: 'DRAFT',
  UNDER_REVIEW: 'UNDER_REVIEW',
  ACTION_REQUIRED: 'ACTION_REQUIRED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CLOSED: 'CLOSED'
} as const;

export type PRStatusType = typeof PRStatus[keyof typeof PRStatus];

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRoleType;
  createdAt: Date;
}

export interface Comment {
  comment_id: string;
  pr_id: string;
  user_id: string;
  role: UserRoleType;
  comment_text: string;
  created_at: Date;
}

export interface ItemInfo {
  itemName: string;
  commodityClass: string;
  totalWeight: number;
  handlingUnits: number;
  numberOfPieces: number;
  containerTypes: string;
  numberOfPallets: number;
}

export interface PRFormData {
  // Header Section
  shipmentDate: Date;
  accountInfo: string;
  discount: number;
  
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
  accessorial: boolean;
  pickup: boolean;
  delivery: boolean;
  
  // Insurance
  daylightProtectCoverage: boolean;
  insuranceDescription?: string;
  insuranceNote?: string;
}

export interface PR extends PRFormData {
  id: string;
  status: PRStatusType;
  created_by: string;
  assigned_to?: string;
  submission_date?: Date;
  last_updated: Date;
  comments: Comment[];
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: UserRoleType) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
} 