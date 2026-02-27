// role.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { RoleState, Role } from '../../models/role.model';
import { RoleActions } from '../actions/role.actions';

// 创建 Entity Adapter
export const roleAdapter: EntityAdapter<Role> = createEntityAdapter<Role>({
  selectId: (role: Role) => role.id,
  sortComparer: false,
});

// 使用 adapter 的 getInitialState 方法
export const initialState: RoleState = roleAdapter.getInitialState({
  roleTree: [],
  selectedRoleId: null,
  loading: false,
  error: null,
});

export const roleReducer = createReducer(
  initialState,

  // Load Roles
  on(RoleActions.loadRoles, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(RoleActions.rolesLoadedSuccess, (state, { payload }) =>
    roleAdapter.setAll(payload, {
      ...state,
      loading: false,
    }),
  ),
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
  on(RoleActions.roleLoadedSuccess, (state, { payload }) =>
    roleAdapter.upsertOne(payload, {
      ...state,
      selectedRoleId: payload.id,
      loading: false,
    }),
  ),
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
  on(RoleActions.createRoleSuccess, (state, { payload }) =>
    roleAdapter.addOne(payload, {
      ...state,
      loading: false,
    }),
  ),
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
  on(RoleActions.updateRoleSuccess, (state, { payload }) =>
    roleAdapter.updateOne(
      { id: payload.id, changes: payload },
      {
        ...state,
        loading: false,
      },
    ),
  ),
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
  on(RoleActions.deleteRoleSuccess, (state, { id }) =>
    roleAdapter.removeOne(id, {
      ...state,
      selectedRoleId: state.selectedRoleId === id ? null : state.selectedRoleId,
      loading: false,
    }),
  ),
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
  on(RoleActions.assignPermissionsSuccess, (state, { payload }) =>
    roleAdapter.updateOne(
      { id: payload.id, changes: payload },
      {
        ...state,
        loading: false,
      },
    ),
  ),
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
    selectedRoleId: role?.id ?? null,
  })),
);
