// permission.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PermissionState, PermissionType } from '../../models/permission.model';

export const selectPermissionState =
  createFeatureSelector<PermissionState>('permission');

export const selectAllPermissions = createSelector(
  selectPermissionState,
  (state: PermissionState) => state.permissions,
);

export const selectMenuPermissions = createSelector(
  selectPermissionState,
  (state: PermissionState) => state.menuPermissions,
);

export const selectSelectedPermission = createSelector(
  selectPermissionState,
  (state: PermissionState) => state.selectedPermission,
);

export const selectPermissionLoading = createSelector(
  selectPermissionState,
  (state: PermissionState) => state.loading,
);

export const selectPermissionError = createSelector(
  selectPermissionState,
  (state: PermissionState) => state.error,
);

export const selectPermissionById = (id: string) =>
  createSelector(selectAllPermissions, (permissions) =>
    permissions.find((permission) => permission.id === id),
  );

export const selectPermissionsByType = (type: PermissionType) =>
  createSelector(selectAllPermissions, (permissions) =>
    permissions.filter((permission) => permission.type === type),
  );

export const selectPermissionsByMenu = (menuId: string) =>
  createSelector(selectAllPermissions, (permissions) =>
    permissions.filter((permission) => permission.menuId === menuId),
  );

export const selectMenuPermissionById = (menuId: string) =>
  createSelector(selectMenuPermissions, (menus) =>
    menus.find((menu) => menu.menuId === menuId),
  );
