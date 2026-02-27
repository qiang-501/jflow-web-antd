/\*\*

- 乐观更新策略实现指南
-
- 本文档介绍如何在现有的 NgRx 实现中添加乐观更新（Optimistic Updates）
  \*/

## 什么是乐观更新？

乐观更新是一种用户体验优化策略：

- 在等待服务器响应之前立即更新 UI
- 假设操作会成功，提前展示结果
- 如果操作失败，则回滚到之前的状态

**优点：**

- UI 响应迅速，无延迟感
- 提升用户体验，特别是在网络慢的情况下

**缺点：**

- 需要实现回滚机制
- 可能出现"闪烁"效果（更新后又回滚）
- 代码复杂度增加

## 实现步骤

### 1. 在 State 中添加乐观更新追踪

```typescript
// user.model.ts
export interface UserState extends EntityState<User> {
  selectedUserId: string | null;
  loading: boolean;
  error: ApiError | null;

  // 新增：乐观更新追踪
  optimisticUpdates: {
    [entityId: string]: {
      operation: "create" | "update" | "delete";
      previousData?: User; // 用于回滚
      timestamp: number;
    };
  };
}

export const initialState: UserState = userAdapter.getInitialState({
  selectedUserId: null,
  loading: false,
  error: null,
  optimisticUpdates: {},
});
```

### 2. 创建乐观更新 Actions

```typescript
// user.actions.ts
export const UserActions = createActionGroup({
  source: "User",
  events: {
    // 现有的 actions...

    // 乐观更新 actions
    "Create User Optimistic": props<{ user: User }>(),
    "Update User Optimistic": props<{ user: User }>(),
    "Delete User Optimistic": props<{ id: string }>(),

    // 回滚 actions
    "Rollback Optimistic Update": props<{ entityId: string }>(),
    "Clear Optimistic Update": props<{ entityId: string }>(),
  },
});
```

### 3. 在 Reducer 中实现乐观更新

```typescript
// user.reducer.ts
export const userReducer = createReducer(
  initialState,

  // 乐观创建
  on(UserActions.createUserOptimistic, (state, { user }) =>
    userAdapter.addOne(user, {
      ...state,
      optimisticUpdates: {
        ...state.optimisticUpdates,
        [user.id]: {
          operation: "create",
          timestamp: Date.now(),
        },
      },
    }),
  ),

  // 乐观更新
  on(UserActions.updateUserOptimistic, (state, { user }) => {
    const previousData = state.entities[user.id];
    return userAdapter.updateOne(
      { id: user.id, changes: user },
      {
        ...state,
        optimisticUpdates: {
          ...state.optimisticUpdates,
          [user.id]: {
            operation: "update",
            previousData,
            timestamp: Date.now(),
          },
        },
      },
    );
  }),

  // 乐观删除
  on(UserActions.deleteUserOptimistic, (state, { id }) => {
    const previousData = state.entities[id];
    return userAdapter.removeOne(id, {
      ...state,
      optimisticUpdates: {
        ...state.optimisticUpdates,
        [id]: {
          operation: "delete",
          previousData,
          timestamp: Date.now(),
        },
      },
    });
  }),

  // 成功时清除乐观更新追踪
  on(UserActions.createUserSuccess, (state, { payload }) => {
    const { [payload.id]: removed, ...rest } = state.optimisticUpdates;
    return userAdapter.upsertOne(payload, {
      ...state,
      loading: false,
      optimisticUpdates: rest,
    });
  }),

  on(UserActions.updateUserSuccess, (state, { payload }) => {
    const { [payload.id]: removed, ...rest } = state.optimisticUpdates;
    return userAdapter.upsertOne(payload, {
      ...state,
      loading: false,
      optimisticUpdates: rest,
    });
  }),

  on(UserActions.deleteUserSuccess, (state, { id }) => {
    const { [id]: removed, ...rest } = state.optimisticUpdates;
    return {
      ...state,
      loading: false,
      optimisticUpdates: rest,
    };
  }),

  // 失败时回滚
  on(UserActions.rollbackOptimisticUpdate, (state, { entityId }) => {
    const update = state.optimisticUpdates[entityId];
    if (!update) return state;

    const { [entityId]: removed, ...rest } = state.optimisticUpdates;
    let newState = { ...state, optimisticUpdates: rest };

    switch (update.operation) {
      case "create":
        // 回滚创建：删除该实体
        return userAdapter.removeOne(entityId, newState);

      case "update":
        // 回滚更新：恢复之前的数据
        if (update.previousData) {
          return userAdapter.upsertOne(update.previousData, newState);
        }
        return newState;

      case "delete":
        // 回滚删除：恢复实体
        if (update.previousData) {
          return userAdapter.addOne(update.previousData, newState);
        }
        return newState;

      default:
        return newState;
    }
  }),

  // 清除乐观更新追踪
  on(UserActions.clearOptimisticUpdate, (state, { entityId }) => {
    const { [entityId]: removed, ...rest } = state.optimisticUpdates;
    return { ...state, optimisticUpdates: rest };
  }),
);
```

### 4. 在 Effects 中触发乐观更新和回滚

```typescript
// user.effects.ts
@Injectable()
export class UserEffects {
  // 方式一：在 Effect 中先触发乐观更新
  createUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.createUser),
      concatMap(({ user }) => {
        // 立即触发乐观更新
        this.store.dispatch(UserActions.createUserOptimistic({ user }));

        return this.userService.createUser(user).pipe(
          map((createdUser) => UserActions.createUserSuccess({ payload: createdUser })),
          catchError((error: any) => {
            // 失败时回滚
            this.store.dispatch(UserActions.rollbackOptimisticUpdate({ entityId: user.id }));
            return of(UserActions.createUserError({ payload: this.handleError(error) }));
          }),
        );
      }),
    ),
  );

  updateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateUser),
      concatMap(({ id, user }) => {
        // 立即触发乐观更新
        this.store.dispatch(UserActions.updateUserOptimistic({ user: { ...user, id } }));

        return this.userService.updateUser(id, user).pipe(
          map((updatedUser) => UserActions.updateUserSuccess({ payload: updatedUser })),
          catchError((error: any) => {
            // 失败时回滚
            this.store.dispatch(UserActions.rollbackOptimisticUpdate({ entityId: id }));
            return of(UserActions.updateUserError({ payload: this.handleError(error) }));
          }),
        );
      }),
    ),
  );

  deleteUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.deleteUser),
      concatMap(({ id }) => {
        // 立即触发乐观删除
        this.store.dispatch(UserActions.deleteUserOptimistic({ id }));

        return this.userService.deleteUser(id).pipe(
          map(() => UserActions.deleteUserSuccess({ id })),
          catchError((error: any) => {
            // 失败时回滚
            this.store.dispatch(UserActions.rollbackOptimisticUpdate({ entityId: id }));
            return of(UserActions.deleteUserError({ payload: this.handleError(error) }));
          }),
        );
      }),
    ),
  );

  // 通知用户回滚操作
  showRollbackNotification$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(UserActions.rollbackOptimisticUpdate),
        tap(() => {
          this.messageService.warning("操作失败，已恢复到之前的状态");
        }),
      ),
    { dispatch: false },
  );

  constructor(
    private actions$: Actions,
    private userService: UserService,
    private store: Store,
    private messageService: NzMessageService,
  ) {}

  private handleError(error: any): ApiError {
    return {
      message: error?.message || "操作失败",
      code: error?.code,
      status: error?.status,
      details: error?.details,
    };
  }
}
```

### 5. 在 Selectors 中添加乐观更新状态查询

```typescript
// user.selectors.ts

// 检查是否有待处理的乐观更新
export const selectHasPendingOptimisticUpdates = createSelector(selectUserState, (state: UserState) => Object.keys(state.optimisticUpdates).length > 0);

// 获取特定实体的乐观更新状态
export const selectOptimisticUpdateForEntity = (entityId: string) => createSelector(selectUserState, (state: UserState) => state.optimisticUpdates[entityId] || null);

// 检查实体是否处于乐观更新中
export const selectIsEntityOptimistic = (entityId: string) => createSelector(selectOptimisticUpdateForEntity(entityId), (update) => update !== null);
```

### 6. 在组件中使用

```typescript
// user-list.component.ts
export class UserListComponent {
  users$ = this.store.select(selectAllUsers);
  hasPendingUpdates$ = this.store.select(selectHasPendingOptimisticUpdates);

  constructor(private store: Store) {}

  deleteUser(user: User) {
    // 乐观删除：UI 立即响应
    this.store.dispatch(UserActions.deleteUser({ id: user.id }));
    // 用户会立即看到该用户从列表中消失
  }

  updateUser(user: User, changes: Partial<User>) {
    // 乐观更新：UI 立即显示新值
    this.store.dispatch(
      UserActions.updateUser({
        id: user.id,
        user: { ...user, ...changes },
      }),
    );
    // 用户会立即看到更新后的值
  }
}
```

```html
<!-- user-list.component.html -->
<div *ngIf="hasPendingUpdates$ | async" class="optimistic-indicator">
  <nz-spin nzSimple [nzSize]="'small'"></nz-spin>
  <span>正在同步...</span>
</div>

<nz-table [nzData]="users$ | async">
  <tbody>
    <tr *ngFor="let user of users$ | async">
      <td>{{ user.username }}</td>
      <td>
        <!-- 显示乐观更新指示器 -->
        <nz-tag *ngIf="(selectIsEntityOptimistic(user.id) | async)" nzColor="processing"> 同步中 </nz-tag>
      </td>
    </tr>
  </tbody>
</nz-table>
```

## 最佳实践

### 1. 何时使用乐观更新？

✅ **适合使用：**

- 删除操作（通常成功率高）
- 简单的状态切换（启用/禁用）
- 低风险的更新操作

❌ **不适合使用：**

- 复杂的业务验证操作
- 涉及金钱/支付的操作
- 需要服务器生成数据的操作（如 ID）

### 2. 超时处理

```typescript
// 添加超时清理 Effect
cleanupStaleOptimisticUpdates$ = createEffect(() =>
  this.actions$.pipe(
    ofType(UserActions.createUserOptimistic, UserActions.updateUserOptimistic, UserActions.deleteUserOptimistic),
    concatMap((action) => {
      const entityId = "id" in action ? action.id : action.user.id;

      // 5 秒后如果还没有收到响应，清除乐观更新标记
      return of(UserActions.clearOptimisticUpdate({ entityId })).pipe(
        delay(5000),
        // 取消条件：收到成功或失败响应
        takeUntil(this.actions$.pipe(ofType(UserActions.createUserSuccess, UserActions.createUserError, UserActions.updateUserSuccess, UserActions.updateUserError, UserActions.deleteUserSuccess, UserActions.deleteUserError, UserActions.rollbackOptimisticUpdate))),
      );
    }),
  ),
);
```

### 3. 视觉反馈

```css
/* 为乐观更新的元素添加视觉提示 */
.optimistic-row {
  opacity: 0.7;
  background-color: #f0f5ff;
  transition: opacity 0.3s ease;
}

.optimistic-indicator {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 8px 16px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 8px;
}
```

## 实现示例顺序

建议按以下顺序为各模块实现乐观更新：

1. **User 模块** - 从删除操作开始
2. **Role 模块** - 删除和启用/禁用操作
3. **Permission 模块** - 删除操作
4. **Workflow 模块** - 状态变更操作

每个模块完成后验证：

- ✅ 操作立即反映在 UI 上
- ✅ 网络错误时正确回滚
- ✅ 用户能看到明确的状态指示
- ✅ 没有数据不一致的情况

## 注意事项

1. **ID 生成**：如果 ID 由服务器生成，乐观创建需要使用临时 ID，成功后替换
2. **并发操作**：同一实体的多个乐观更新需要排队处理
3. **离线支持**：考虑与 IndexedDB 结合实现真正的离线优先
4. **测试**：务必测试回滚场景和边界情况

## 总结

乐观更新是提升用户体验的强大工具，但需要谨慎实现：

- 从低风险操作开始
- 确保回滚机制可靠
- 提供清晰的视觉反馈
- 充分测试边界情况
