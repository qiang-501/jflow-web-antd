// permission.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { PermissionState, Permission } from '../../models/permission.model';
import { PermissionActions } from '../actions/permission.actions';

// 创建 Entity Adapter
export const permissionAdapter: EntityAdapter<Permission> =
  createEntityAdapter<Permission>({
    selectId: (permission: Permission) => permission.id,
    sortComparer: false,
  });

// 使用 adapter 的 getInitialState 方法
export const initialState: PermissionState = permissionAdapter.getInitialState({
  menuPermissions: [],
  selectedPermissionId: null,
  loading: false,
  error: null,
});

export const permissionReducer = createReducer(
  initialState,

  // Load Permissions
  on(PermissionActions.loadPermissions, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(PermissionActions.permissionsLoadedSuccess, (state, { payload }) =>
    permissionAdapter.setAll(payload, {
      ...state,
      loading: false,
    }),
  ),
  on(PermissionActions.permissionsLoadedError, (state, { payload }) => ({
    ...state,
    loading: false,
    error: payload,
  })),

  // Load Menu Permissions
  on(PermissionActions.loadMenuPermissions, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(PermissionActions.menuPermissionsLoadedSuccess, (state, { payload }) => ({
    ...state,
    menuPermissions: payload,
    loading: false,
  })),
  on(PermissionActions.menuPermissionsLoadedError, (state, { payload }) => ({
    ...state,
    loading: false,
    error: payload,
  })),

  // Load Permission
  on(PermissionActions.loadPermission, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(PermissionActions.permissionLoadedSuccess, (state, { payload }) =>
    permissionAdapter.upsertOne(payload, {
      ...state,
      selectedPermissionId: payload.id,
      loading: false,
    }),
  ),
  on(PermissionActions.permissionLoadedError, (state, { payload }) => ({
    ...state,
    loading: false,
    error: payload,
  })),

  // Create Permission
  on(PermissionActions.createPermission, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(PermissionActions.createPermissionSuccess, (state, { payload }) =>
    permissionAdapter.addOne(payload, {
      ...state,
      loading: false,
    }),
  ),
  on(PermissionActions.createPermissionError, (state, { payload }) => ({
    ...state,
    loading: false,
    error: payload,
  })),

  // Update Permission
  on(PermissionActions.updatePermission, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(PermissionActions.updatePermissionSuccess, (state, { payload }) =>
    permissionAdapter.updateOne(
      { id: payload.id, changes: payload },
      {
        ...state,
        loading: false,
      },
    ),
  ),
  on(PermissionActions.updatePermissionError, (state, { payload }) => ({
    ...state,
    loading: false,
    error: payload,
  })),

  // Delete Permission
  on(PermissionActions.deletePermission, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(PermissionActions.deletePermissionSuccess, (state, { id }) =>
    permissionAdapter.removeOne(id, {
      ...state,
      selectedPermissionId:
        state.selectedPermissionId === id ? null : state.selectedPermissionId,
      loading: false,
    }),
  ),
  on(PermissionActions.deletePermissionError, (state, { payload }) => ({
    ...state,
    loading: false,
    error: payload,
  })),

  // Create Menu Action
  on(PermissionActions.createMenuAction, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(PermissionActions.createMenuActionSuccess, (state, { payload }) => ({
    ...state,
    menuPermissions: state.menuPermissions.map((menu) =>
      menu.menuId === payload.menuId
        ? { ...menu, actions: [...menu.actions, payload] }
        : menu,
    ),
    loading: false,
  })),
  on(PermissionActions.createMenuActionError, (state, { payload }) => ({
    ...state,
    loading: false,
    error: payload,
  })),

  // Update Menu Action
  on(PermissionActions.updateMenuAction, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(PermissionActions.updateMenuActionSuccess, (state, { payload }) => ({
    ...state,
    menuPermissions: state.menuPermissions.map((menu) =>
      menu.menuId === payload.menuId
        ? {
            ...menu,
            actions: menu.actions.map((action) =>
              action.id === payload.id ? payload : action,
            ),
          }
        : menu,
    ),
    loading: false,
  })),
  on(PermissionActions.updateMenuActionError, (state, { payload }) => ({
    ...state,
    loading: false,
    error: payload,
  })),

  // Delete Menu Action
  on(PermissionActions.deleteMenuAction, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(
    PermissionActions.deleteMenuActionSuccess,
    (state, { menuId, actionId }) => ({
      ...state,
      menuPermissions: state.menuPermissions.map((menu) =>
        menu.menuId === menuId
          ? {
              ...menu,
              actions: menu.actions.filter((action) => action.id !== actionId),
            }
          : menu,
      ),
      loading: false,
    }),
  ),
  on(PermissionActions.deleteMenuActionError, (state, { payload }) => ({
    ...state,
    loading: false,
    error: payload,
  })),

  // Select Permission
  on(PermissionActions.selectPermission, (state, { permission }) => ({
    ...state,
    selectedPermissionId: permission?.id ?? null,
  })),
);
