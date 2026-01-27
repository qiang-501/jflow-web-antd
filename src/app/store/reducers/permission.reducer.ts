// permission.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { PermissionState } from '../../models/permission.model';
import { PermissionActions } from '../actions/permission.actions';

export const initialState: PermissionState = {
  permissions: [],
  menuPermissions: [],
  selectedPermission: null,
  loading: false,
  error: null,
};

export const permissionReducer = createReducer(
  initialState,

  // Load Permissions
  on(PermissionActions.loadPermissions, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(PermissionActions.permissionsLoadedSuccess, (state, { payload }) => ({
    ...state,
    permissions: payload,
    loading: false,
  })),
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
  on(PermissionActions.permissionLoadedSuccess, (state, { payload }) => ({
    ...state,
    selectedPermission: payload,
    loading: false,
  })),
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
  on(PermissionActions.createPermissionSuccess, (state, { payload }) => ({
    ...state,
    permissions: [...state.permissions, payload],
    loading: false,
  })),
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
  on(PermissionActions.updatePermissionSuccess, (state, { payload }) => ({
    ...state,
    permissions: state.permissions.map((permission) =>
      permission.id === payload.id ? payload : permission,
    ),
    selectedPermission:
      state.selectedPermission?.id === payload.id
        ? payload
        : state.selectedPermission,
    loading: false,
  })),
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
  on(PermissionActions.deletePermissionSuccess, (state, { id }) => ({
    ...state,
    permissions: state.permissions.filter((permission) => permission.id !== id),
    selectedPermission:
      state.selectedPermission?.id === id ? null : state.selectedPermission,
    loading: false,
  })),
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
    selectedPermission: permission,
  })),
);
