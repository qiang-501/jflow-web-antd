// role.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RoleState } from '../../models/role.model';
import { roleAdapter } from '../reducers/role.reducer';

export const selectRoleState = createFeatureSelector<RoleState>('role');

// 使用 Entity Adapter 提供的选择器
const { selectAll, selectEntities, selectIds, selectTotal } =
  roleAdapter.getSelectors();

// 导出实体选择器
export const selectAllRoles = createSelector(selectRoleState, selectAll);
export const selectRoleEntities = createSelector(
  selectRoleState,
  selectEntities,
);
export const selectRoleIds = createSelector(selectRoleState, selectIds);
export const selectRoleTotal = createSelector(selectRoleState, selectTotal);

// 基础选择器
export const selectRoleTree = createSelector(
  selectRoleState,
  (state: RoleState) => state.roleTree,
);

export const selectSelectedRoleId = createSelector(
  selectRoleState,
  (state: RoleState) => state.selectedRoleId,
);

export const selectRoleLoading = createSelector(
  selectRoleState,
  (state: RoleState) => state.loading,
);

export const selectRoleError = createSelector(
  selectRoleState,
  (state: RoleState) => state.error,
);

// 组合选择器 - 获取选中的角色
export const selectSelectedRole = createSelector(
  selectRoleEntities,
  selectSelectedRoleId,
  (entities, selectedId) => (selectedId ? entities[selectedId] : null),
);

// 参数化选择器
export const selectRoleById = (id: string) =>
  createSelector(selectRoleEntities, (entities) => entities[id]);

export const selectChildRoles = (parentId: string) =>
  createSelector(selectAllRoles, (roles) =>
    roles.filter((role) => role.parentId === parentId),
  );

export const selectRootRoles = createSelector(selectAllRoles, (roles) =>
  roles.filter((role) => !role.parentId),
);

export const selectRolesByLevel = (level: number) =>
  createSelector(selectAllRoles, (roles) =>
    roles.filter((role) => role.level === level),
  );

// 组合选择器 - 检查是否有数据
export const selectHasRoles = createSelector(
  selectRoleTotal,
  (total) => total > 0,
);

// 组合选择器 - 加载状态
export const selectRoleLoadingState = createSelector(
  selectRoleLoading,
  selectRoleError,
  (loading, error) => ({ loading, error }),
);
