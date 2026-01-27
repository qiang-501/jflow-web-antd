// user.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { UserState } from '../../models/user.model';
import { UserActions } from '../actions/user.actions';

export const initialState: UserState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
};

export const userReducer = createReducer(
  initialState,

  // Load Users
  on(UserActions.loadUsers, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(UserActions.usersLoadedSuccess, (state, { payload }) => ({
    ...state,
    users: payload,
    loading: false,
  })),
  on(UserActions.usersLoadedError, (state, { payload }) => ({
    ...state,
    loading: false,
    error: payload,
  })),

  // Load User
  on(UserActions.loadUser, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(UserActions.userLoadedSuccess, (state, { payload }) => ({
    ...state,
    selectedUser: payload,
    loading: false,
  })),
  on(UserActions.userLoadedError, (state, { payload }) => ({
    ...state,
    loading: false,
    error: payload,
  })),

  // Create User
  on(UserActions.createUser, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(UserActions.createUserSuccess, (state, { payload }) => ({
    ...state,
    users: [...state.users, payload],
    loading: false,
  })),
  on(UserActions.createUserError, (state, { payload }) => ({
    ...state,
    loading: false,
    error: payload,
  })),

  // Update User
  on(UserActions.updateUser, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(UserActions.updateUserSuccess, (state, { payload }) => ({
    ...state,
    users: state.users.map((user) => (user.id === payload.id ? payload : user)),
    selectedUser:
      state.selectedUser?.id === payload.id ? payload : state.selectedUser,
    loading: false,
  })),
  on(UserActions.updateUserError, (state, { payload }) => ({
    ...state,
    loading: false,
    error: payload,
  })),

  // Delete User
  on(UserActions.deleteUser, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(UserActions.deleteUserSuccess, (state, { id }) => ({
    ...state,
    users: state.users.filter((user) => user.id !== id),
    selectedUser: state.selectedUser?.id === id ? null : state.selectedUser,
    loading: false,
  })),
  on(UserActions.deleteUserError, (state, { payload }) => ({
    ...state,
    loading: false,
    error: payload,
  })),

  // Delete Users
  on(UserActions.deleteUsers, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(UserActions.deleteUsersSuccess, (state, { ids }) => ({
    ...state,
    users: state.users.filter((user) => !ids.includes(user.id)),
    loading: false,
  })),
  on(UserActions.deleteUsersError, (state, { payload }) => ({
    ...state,
    loading: false,
    error: payload,
  })),

  // Assign Roles
  on(UserActions.assignRoles, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(UserActions.assignRolesSuccess, (state, { payload }) => ({
    ...state,
    users: state.users.map((user) => (user.id === payload.id ? payload : user)),
    selectedUser:
      state.selectedUser?.id === payload.id ? payload : state.selectedUser,
    loading: false,
  })),
  on(UserActions.assignRolesError, (state, { payload }) => ({
    ...state,
    loading: false,
    error: payload,
  })),

  // Reset Password
  on(UserActions.resetPassword, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(UserActions.resetPasswordSuccess, (state) => ({
    ...state,
    loading: false,
  })),
  on(UserActions.resetPasswordError, (state, { payload }) => ({
    ...state,
    loading: false,
    error: payload,
  })),

  // Select User
  on(UserActions.selectUser, (state, { user }) => ({
    ...state,
    selectedUser: user,
  })),
);
