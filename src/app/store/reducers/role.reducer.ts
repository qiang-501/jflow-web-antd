// role.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { RoleState } from '../../models/role.model';
import { RoleActions } from '../actions/role.actions';

export const initialState: RoleState = {
  roles: [],
  roleTree: [],
  selectedRole: null,
  loading: false,
  error: null,
};

export const roleReducer = createReducer(
  initialState,

  // Load Roles
  on(RoleActions.loadRoles, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(RoleActions.rolesLoadedSuccess, (state, { payload }) => ({
    ...state,
    roles: payload,
    loading: false,
  })),
  on(RoleActions.rolesLoadedError, (state, { payload }) => ({
    ...state,
    loading: false,
    error: payload,
  })),

  // Load Role Tree
  on(RoleActions.loadRoleTree, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(RoleActions.roleTreeLoadedSuccess, (state, { payload }) => ({
    ...state,
    roleTree: payload,
    loading: false,
  })),
  on(RoleActions.roleTreeLoadedError, (state, { payload }) => ({
    ...state,
    loading: false,
    error: payload,
  })),

  // Load Role
  on(RoleActions.loadRole, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(RoleActions.roleLoadedSuccess, (state, { payload }) => ({
    ...state,
    selectedRole: payload,
    loading: false,
  })),
  on(RoleActions.roleLoadedError, (state, { payload }) => ({
    ...state,
    loading: false,
    error: payload,
  })),

  // Create Role
  on(RoleActions.createRole, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(RoleActions.createRoleSuccess, (state, { payload }) => ({
    ...state,
    roles: [...state.roles, payload],
    loading: false,
  })),
  on(RoleActions.createRoleError, (state, { payload }) => ({
    ...state,
    loading: false,
    error: payload,
  })),

  // Update Role
  on(RoleActions.updateRole, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(RoleActions.updateRoleSuccess, (state, { payload }) => ({
    ...state,
    roles: state.roles.map((role) => (role.id === payload.id ? payload : role)),
    selectedRole:
      state.selectedRole?.id === payload.id ? payload : state.selectedRole,
    loading: false,
  })),
  on(RoleActions.updateRoleError, (state, { payload }) => ({
    ...state,
    loading: false,
    error: payload,
  })),

  // Delete Role
  on(RoleActions.deleteRole, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(RoleActions.deleteRoleSuccess, (state, { id }) => ({
    ...state,
    roles: state.roles.filter((role) => role.id !== id),
    selectedRole: state.selectedRole?.id === id ? null : state.selectedRole,
    loading: false,
  })),
  on(RoleActions.deleteRoleError, (state, { payload }) => ({
    ...state,
    loading: false,
    error: payload,
  })),

  // Assign Permissions
  on(RoleActions.assignPermissions, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(RoleActions.assignPermissionsSuccess, (state, { payload }) => ({
    ...state,
    roles: state.roles.map((role) => (role.id === payload.id ? payload : role)),
    selectedRole:
      state.selectedRole?.id === payload.id ? payload : state.selectedRole,
    loading: false,
  })),
  on(RoleActions.assignPermissionsError, (state, { payload }) => ({
    ...state,
    loading: false,
    error: payload,
  })),

  // Load Role Inheritance
  on(RoleActions.loadRoleInheritance, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(RoleActions.roleInheritanceLoadedSuccess, (state) => ({
    ...state,
    loading: false,
  })),
  on(RoleActions.roleInheritanceLoadedError, (state, { payload }) => ({
    ...state,
    loading: false,
    error: payload,
  })),

  // Select Role
  on(RoleActions.selectRole, (state, { role }) => ({
    ...state,
    selectedRole: role,
  })),
);
