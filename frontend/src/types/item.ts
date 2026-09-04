export interface Category {
  id: string;
  name: string;
}

export type ItemStatus =
  | "ACTIVE"
  | "MATCHED"
  | "CLAIMED"
  | "RETURNED"
  | "CLOSED";

export interface LostItem {
  id: string;
  title: string;
  description?: string;
  location: string;
  lostAt: string;
  status: ItemStatus;
  category: Category;
}

export interface FoundItem {
  id: string;
  title: string;
  description?: string;
  location: string;
  foundAt: string;
  status: ItemStatus;
  category: Category;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
