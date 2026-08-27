import {
  UserRole,
  UserStatus,
  CategoryStatus,
  InventoryStatus,
  ActivityAction
} from '@prisma/client';

export {
  UserRole,
  UserStatus,
  CategoryStatus,
  InventoryStatus,
  ActivityAction
};

// Aliases for clean cross-domain imports
export type Role = UserRole;
export const Role = UserRole;

export type Status = UserStatus;
export const Status = UserStatus;

export type ActionType = ActivityAction;
export const ActionType = ActivityAction;

export interface AuthUserPayload {
  id: number;
  username: string;
  role: UserRole;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}