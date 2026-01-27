// user.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserState } from '../../models/user.model';

export const selectUserState = createFeatureSelector<UserState>('user');

export const selectAllUsers = createSelector(
  selectUserState,
  (state: UserState) => state.users,
);

export const selectSelectedUser = createSelector(
  selectUserState,
  (state: UserState) => state.selectedUser,
);

export const selectUserLoading = createSelector(
  selectUserState,
  (state: UserState) => state.loading,
);

export const selectUserError = createSelector(
  selectUserState,
  (state: UserState) => state.error,
);

export const selectUserById = (id: string) =>
  createSelector(selectAllUsers, (users) =>
    users.find((user) => user.id === id),
  );

export const selectUsersByRole = (roleId: string) =>
  createSelector(selectAllUsers, (users) =>
    users.filter((user) => user.roleIds.includes(roleId)),
  );

export const selectActiveUsers = createSelector(selectAllUsers, (users) =>
  users.filter((user) => user.status === 'active'),
);
