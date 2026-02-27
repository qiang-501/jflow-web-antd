// user.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { UserState, User } from '../../models/user.model';
import { UserActions } from '../actions/user.actions';

// 创建 Entity Adapter
export const userAdapter: EntityAdapter<User> = createEntityAdapter<User>({
  selectId: (user: User) => user.id,
  sortComparer: false, // 不排序，保持服务器返回的顺序
});

// 使用 adapter 的 getInitialState 方法
export const initialState: UserState = userAdapter.getInitialState({
  selectedUserId: null,
  loading: false,
  error: null,
});

export const userReducer = createReducer(
  initialState,

  // Load Users
  on(UserActions.loadUsers, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(UserActions.usersLoadedSuccess, (state, { payload }) =>
    userAdapter.setAll(payload, {
      ...state,
      loading: false,
    }),
  ),
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
  on(UserActions.userLoadedSuccess, (state, { payload }) =>
    userAdapter.upsertOne(payload, {
      ...state,
      selectedUserId: payload.id,
      loading: false,
    }),
  ),
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
  on(UserActions.createUserSuccess, (state, { payload }) =>
    userAdapter.addOne(payload, {
      ...state,
      loading: false,
    }),
  ),
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
  on(UserActions.updateUserSuccess, (state, { payload }) =>
    userAdapter.updateOne(
      { id: payload.id, changes: payload },
      {
        ...state,
        loading: false,
      },
    ),
  ),
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
  on(UserActions.deleteUserSuccess, (state, { id }) =>
    userAdapter.removeOne(id, {
      ...state,
      selectedUserId: state.selectedUserId === id ? null : state.selectedUserId,
      loading: false,
    }),
  ),
  on(UserActions.deleteUserError, (state, { payload }) => ({
    ...state,
    loading: false,
    error: payload,
  })),

  // Delete Users (批量删除)
  on(UserActions.deleteUsers, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(UserActions.deleteUsersSuccess, (state, { ids }) =>
    userAdapter.removeMany(ids, {
      ...state,
      loading: false,
    }),
  ),
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
  on(UserActions.assignRolesSuccess, (state, { payload }) =>
    userAdapter.updateOne(
      { id: payload.id, changes: payload },
      {
        ...state,
        loading: false,
      },
    ),
  ),
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
    selectedUserId: user?.id ?? null,
  })),
);
