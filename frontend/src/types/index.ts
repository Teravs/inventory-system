export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'VIEWER';
export type Status = 'ACTIVE' | 'INACTIVE';
export type ActionType = 'CREATE' | 'UPDATE' | 'DELETE' | 'CHANGE_ROLE' | 'ACTIVATE' | 'DEACTIVATE';

export interface User {
  id: number | string;
  name: string;
  username: string;
  role: Role;
  status: Status;
  createdAt: string;
  updatedAt?: string;
}

export interface Category {
  id: number | string;
  name: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
  _count?: {
    inventories: number;
  };
}

export interface InventoryItem {
  assetNumber: string;
  serialNumber: string | null;
  name: string;
  brand: string | null;
  categoryId: number | string;
  assignedTo: string | null;
  devicePassword?: string | null;
  purchaseMonth: string;
  qrCode: string;
  status: Status;
  createdById: number | string;
  updatedById: number | string;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  createdBy?: { id: number | string; name: string; username: string };
  updatedBy?: { id: number | string; name: string; username: string };
}

export interface ActivityLog {
  id: string;
  userId: number | string;
  action: ActionType;
  entityType: string;
  entityId: string;
  description: string;
  oldData: Record<string, unknown> | string | null;
  newData: Record<string, unknown> | string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: {
    id: number | string;
    name: string;
    username: string;
    role: Role;
  };
}

export interface DashboardStats {
  cards: {
    totalInventory: number;
    activeInventory: number;
    inactiveInventory: number;
    totalCategories: number;
    totalUsers: number;
  };
  recentItems: (InventoryItem & { category: { name: string } })[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}