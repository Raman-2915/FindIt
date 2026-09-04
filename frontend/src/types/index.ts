export type UserRole = "USER" | "ADMIN";

export type ItemStatus =
  | "ACTIVE"
  | "MATCHED"
  | "CLAIMED"
  | "RETURNED"
  | "CLOSED";

export type MatchStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export type ClaimStatus = "PENDING" | "APPROVED" | "REJECTED";

export type ReportStatus =
  | "PENDING"
  | "REVIEWED"
  | "DISMISSED"
  | "ACTION_TAKEN";

export type NotificationType = "MATCH_FOUND" | "CLAIM_UPDATE" | "SYSTEM";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  createdAt?: string;
}

export interface LostItem {
  id: string;
  userId: string;
  categoryId: string;
  title: string;
  description: string;
  location: string;
  lostAt: string;
  status: ItemStatus;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  user?: User;
}

export interface FoundItem {
  id: string;
  userId: string;
  categoryId: string;
  title: string;
  description: string;
  location: string;
  foundAt: string;
  status: ItemStatus;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  user?: User;
}

export interface Match {
  id: string;
  lostItemId: string;
  foundItemId: string;
  score: number;
  status: MatchStatus;
  createdAt: string;
  foundItem?: FoundItem;
}

export interface Claim {
  id: string;
  userId: string;
  foundItemId: string;
  message: string;
  status: ClaimStatus;
  createdAt: string;
  updatedAt: string;
  foundItem?: FoundItem;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  lostItemId?: string;
  foundItemId?: string;
  reason: string;
  status: ReportStatus;
  createdAt: string;
}
