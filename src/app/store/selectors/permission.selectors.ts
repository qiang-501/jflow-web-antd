// permission.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PermissionState, PermissionType } from '../../models/permission.model';
import { permissionAdapter } from '../reducers/permission.reducer';

export const selectPermissionState =
  createFeatureSelector<PermissionState>('permission');

// 使用 Entity Adapter 提供的选择器
const { selectAll, selectEntities, selectIds, selectTotal } =
  permissionAdapter.getSelectors();

// 导出实体选择器
export const selectAllPermissions = createSelector(
  selectPermissionState,
  selectAll,
);
export const selectPermissionEntities = createSelector(
  selectPermissionState,
  selectEntities,
);
export const selectPermissionIds = createSelector(
  selectPermissionState,
  selectIds,
);
export const selectPermissionTotal = createSelector(
  selectPermissionState,
  selectTotal,
);

// 基础选择器
export const selectMenuPermissions = createSelector(
  selectPermissionState,
  (state: PermissionState) => state.menuPermissions,
);

export const selectSelectedPermissionId = createSelector(
  selectPermissionState,
  (state: PermissionState) => state.selectedPermissionId,
);

export const selectPermissionLoading = createSelector(
  selectPermissionState,
  (state: PermissionState) => state.loading,
);

export const selectPermissionError = createSelector(
  selectPermissionState,
  (state: PermissionState) => state.error,
);

// 组合选择器 - 获取选中的权限
export const selectSelectedPermission = createSelector(
  selectPermissionEntities,
  selectSelectedPermissionId,
  (entities, selectedId) => (selectedId ? entities[selectedId] : null),
);

// 参数化选择器
export const selectPermissionById = (id: string) =>
  createSelector(selectPermissionEntities, (entities) => entities[id]);

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

// 组合选择器 - 检查是否有数据
export const selectHasPermissions = createSelector(
  selectPermissionTotal,
  (total) => total > 0,
);

// 组合选择器 - 加载状态
export const selectPermissionLoadingState = createSelector(
  selectPermissionLoading,
  selectPermissionError,
  (loading, error) => ({ loading, error }),
);
