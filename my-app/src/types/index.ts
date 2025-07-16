export enum UserRole {
  SALES_EXECUTIVE = "SE",
  PRICING_ANALYST = "PA",
}

export type UserRoleType = "SE" | "PA";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    name: string,
    email: string,
    password: string,
    role: UserRoleType
  ) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

export enum PRStatus {
  DRAFT = "Draft",
  UNDER_REVIEW = "Under Review",
  ACTION_REQUIRED = "Action Required",
  ACTIVE_STATUS = "Active Status",
  APPROVED = "Approved",
  REJECTED = "Rejected",
  CLOSED = "Closed",
}

export interface PRItem {
  id: string;
  itemName: string;
  commodityClass: string;
  totalWeight: number;
  handlingUnit: string;
  noOfPieces: number;
  containerType: string;
  noOfPallets: number;
}

export interface PRComment {
  id: string;
  commentText: string;
  createdAt: string;
}

export interface PR {
  id: string;
  shipmentDate: Date;
  accountInfo: string;
  discount?: string;
  originAddress: string;
  originState: string;
  originZip: string;
  originCountry: string;
  destAddress: string;
  destState: string;
  destZip: string;
  destCountry: string;
  accessorial?: string;
  pickup?: string;
  delivery?: string;
  daylightProtect: boolean;
  salesStatus: string;
  analystStatus?: string;
  finalApprovalStatus?: string; // Track if closed PR was approved or rejected
  createdBy: string;
  assignedTo?: string;
  submissionDate?: string;
  lastUpdated: string;
  items: PRItem[];
  comments: PRComment[];
}

export interface PRCreateData {
  shipmentDate: Date;
  accountInfo: string;
  discount: string;
  originAddress: string;
  originState: string;
  originZip: string;
  originCountry: string;
  destAddress: string;
  destState: string;
  destZip: string;
  destCountry: string;
  accessorial: string;
  pickup: string;
  delivery: string;
  daylightProtect: boolean;
  items: PRItem[];
}

export interface PRSummary {
  pr_id: string;
  origin_state: string;
  destination_state: string;
  status?: string;
  assigned?: string;
  sales_status?: string;
  analyst_status?: string;
}

export interface AssignmentResponse {
  id: string;
  status: string;
  message: string;
}

export interface ApproveRejectRequest {
  action: "approve" | "reject" | "action_required";
  comment: string;
}
