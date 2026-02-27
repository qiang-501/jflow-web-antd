// user.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserState } from '../../models/user.model';
import { userAdapter } from '../reducers/user.reducer';

export const selectUserState = createFeatureSelector<UserState>('user');

// 使用 Entity Adapter 提供的选择器
const { selectAll, selectEntities, selectIds, selectTotal } =
  userAdapter.getSelectors();

// 导出实体选择器
export const selectAllUsers = createSelector(selectUserState, selectAll);
export const selectUserEntities = createSelector(
  selectUserState,
  selectEntities,
);
export const selectUserIds = createSelector(selectUserState, selectIds);
export const selectUserTotal = createSelector(selectUserState, selectTotal);

// 基础选择器
export const selectSelectedUserId = createSelector(
  selectUserState,
  (state: UserState) => state.selectedUserId,
);

export const selectUserLoading = createSelector(
  selectUserState,
  (state: UserState) => state.loading,
);

export const selectUserError = createSelector(
  selectUserState,
  (state: UserState) => state.error,
);

// 组合选择器 - 获取选中的用户
export const selectSelectedUser = createSelector(
  selectUserEntities,
  selectSelectedUserId,
  (entities, selectedId) => (selectedId ? entities[selectedId] : null),
);

// 参数化选择器
export const selectUserById = (id: string) =>
  createSelector(selectUserEntities, (entities) => entities[id]);

export const selectUsersByRole = (roleId: string) =>
  createSelector(selectAllUsers, (users) =>
    users.filter((user) => user.roleIds.includes(roleId)),
  );

export const selectActiveUsers = createSelector(selectAllUsers, (users) =>
  users.filter((user) => user.status === 'active'),
);

// 组合选择器 - 检查是否有数据
export const selectHasUsers = createSelector(
  selectUserTotal,
  (total) => total > 0,
);

// 组合选择器 - 加载状态
export const selectUserLoadingState = createSelector(
  selectUserLoading,
  selectUserError,
  (loading, error) => ({ loading, error }),
);
