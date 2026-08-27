import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AppLayout } from '../components/layout/AppLayout';

import { LoginPage } from '../pages/auth/Login';
import { DashboardPage } from '../pages/dashboard/Dashboard';
import { InventoryListPage } from '../pages/inventory/InventoryList';
import { InventoryDetailPage } from '../pages/inventory/InventoryDetail';
import { CategoryListPage } from '../pages/categories/CategoryManagement';
import { UserListPage } from '../pages/users/UserManagement';
import { ActivityLogPage } from '../pages/activity/ActivityLog';
import { ScannerPage } from '../pages/scan/QRScanner';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="inventory" element={<InventoryListPage />} />
        <Route path="inventory/:assetNumber" element={<InventoryDetailPage />} />
        <Route path="scanner" element={<ScannerPage />} />
        
        <Route
          path="categories"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <CategoryListPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="users"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <UserListPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="activity-logs"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
              <ActivityLogPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};