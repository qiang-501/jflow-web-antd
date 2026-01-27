// role.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RoleState } from '../../models/role.model';

export const selectRoleState = createFeatureSelector<RoleState>('role');

export const selectAllRoles = createSelector(
  selectRoleState,
  (state: RoleState) => state.roles,
);

export const selectRoleTree = createSelector(
  selectRoleState,
  (state: RoleState) => state.roleTree,
);

export const selectSelectedRole = createSelector(
  selectRoleState,
  (state: RoleState) => state.selectedRole,
);

export const selectRoleLoading = createSelector(
  selectRoleState,
  (state: RoleState) => state.loading,
);

export const selectRoleError = createSelector(
  selectRoleState,
  (state: RoleState) => state.error,
);

export const selectRoleById = (id: string) =>
  createSelector(selectAllRoles, (roles) =>
    roles.find((role) => role.id === id),
  );

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
