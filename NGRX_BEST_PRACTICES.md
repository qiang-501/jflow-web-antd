# NgRx 最佳实践优化指南

本文档记录了对项目 NgRx 状态管理的优化，遵循 NgRx 最佳实践。

## 优化内容概览

### ✅ 1. 使用 @ngrx/entity 管理集合数据

**问题**：手动管理实体集合（用户、角色等）代码冗长且容易出错。

**解决方案**：使用 `@ngrx/entity` 的 `EntityAdapter`

**优势**：

- 自动提供 CRUD 操作方法（addOne, updateOne, removeOne 等）
- 高性能的 O(1) 查找
- 内置的 selectAll, selectEntities, selectIds 选择器
- 减少样板代码

**示例**：

```typescript
// user.reducer.ts
import { createEntityAdapter, EntityAdapter } from "@ngrx/entity";

export const userAdapter: EntityAdapter<User> = createEntityAdapter<User>({
  selectId: (user: User) => user.id,
  sortComparer: false,
});

export const initialState: UserState = userAdapter.getInitialState({
  selectedUserId: null,
  loading: false,
  error: null,
});

// 使用 adapter 方法
on(UserActions.usersLoadedSuccess, (state, { payload }) => userAdapter.setAll(payload, { ...state, loading: false }));
```

**更新的 Selector**：

```typescript
// user.selectors.ts
const { selectAll, selectEntities, selectIds, selectTotal } = userAdapter.getSelectors();

export const selectAllUsers = createSelector(selectUserState, selectAll);
export const selectUserEntities = createSelector(selectUserState, selectEntities);
```

---

### ✅ 2. 添加 @ngrx/store-devtools

**问题**：缺少调试工具，难以追踪状态变化。

**解决方案**：配置 Redux DevTools

**配置**：

```typescript
// app.config.ts
import { provideStoreDevtools } from "@ngrx/store-devtools";

provideStoreDevtools({
  maxAge: 25,
  logOnly: !isDevMode(),
  autoPause: true,
  trace: false,
  traceLimit: 75,
  connectInZone: true,
});
```

**功能**：

- 时间旅行调试
- Action 日志追踪
- 状态快照和回放
- 性能分析

---

### ✅ 3. 环境感知的 MetaReducers

**问题**：所有环境都在控制台打印状态和 action，影响性能且可能泄露敏感信息。

**解决方案**：仅在开发环境启用 debug

```typescript
// app.reducer.ts
import { isDevMode } from "@angular/core";

export function debug(reducer: ActionReducer<any>): ActionReducer<any> {
  return function (state, action) {
    console.log("state", state);
    console.log("action", action);
    return reducer(state, action);
  };
}

export const metaReducers: MetaReducer<any>[] = isDevMode() ? [debug] : [];
```

**好处**：

- 生产环境性能提升
- 避免敏感数据泄露
- 保持开发体验

---

### ✅ 4. 改进 Effects 错误处理和用户通知

**问题**：

- 错误处理不完善，使用 `any` 类型
- 成功操作后缺少用户反馈
- 未使用正确的 RxJS 操作符

**解决方案**：

#### 4.1 类型安全的错误模型

```typescript
// store.model.ts
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}
```

#### 4.2 使用合适的 RxJS 操作符

- `exhaustMap`: 用于加载操作（防止重复请求）
- `concatMap`: 用于 CRUD 操作（保持顺序）
- `mergeMap`: 用于并发操作（谨慎使用）

#### 4.3 添加成功/失败通知

```typescript
// user.effects.ts
createUserSuccess$ = createEffect(
  () => {
    return this.actions$.pipe(
      ofType(UserActions.createUserSuccess),
      tap(() => {
        this.message.success("用户创建成功");
      }),
    );
  },
  { dispatch: false },
);

createUserError$ = createEffect(
  () => {
    return this.actions$.pipe(
      ofType(UserActions.createUserError),
      tap(({ payload }) => {
        this.message.error(payload.message || "创建用户失败");
      }),
    );
  },
  { dispatch: false },
);
```

**好处**：

- 类型安全
- 更好的用户体验
- 避免竞态条件

---

### ✅ 5. 增强 Selectors 组合和缓存

**优化**：

- 使用 Entity Adapter 的选择器
- 添加组合选择器
- 利用 memoization 缓存

```typescript
// 组合选择器 - 获取选中的用户
export const selectSelectedUser = createSelector(selectUserEntities, selectSelectedUserId, (entities, selectedId) => (selectedId ? entities[selectedId] : null));

// 检查是否有数据
export const selectHasUsers = createSelector(selectUserTotal, (total) => total > 0);

// 加载状态组合
export const selectUserLoadingState = createSelector(selectUserLoading, selectUserError, (loading, error) => ({ loading, error }));
```

**好处**：

- 避免重复计算
- 更好的性能
- 代码复用

---

### ✅ 6. 类型安全的 Actions

**更新**：所有 Error Actions 使用 `ApiError` 替代 `any`

```typescript
// user.actions.ts
export const UserActions = createActionGroup({
  source: "User",
  events: {
    "Create User Error": props<{ payload: ApiError }>(), // ✅ 类型安全
    // 而不是
    // 'Create User Error': props<{ payload: any }>(), // ❌ 不安全
  },
});
```

---

## NgRx 最佳实践清单

### 状态管理

- ✅ 使用 `@ngrx/entity` 管理集合
- ✅ 保持状态扁平化
- ✅ 使用不可变数据模式
- ✅ 避免在 Store 中存储非序列化数据

### Actions

- ✅ 使用 `createActionGroup` 组织相关 Actions
- ✅ Actions 描述"发生了什么"，而非"做什么"
- ✅ 为错误使用类型安全的接口
- ✅ 使用统一的命名约定

### Reducers

- ✅ 使用 `createReducer` 和 `on`
- ✅ 保持纯函数
- ✅ 使用 Entity Adapter 的辅助方法
- ✅ 不执行副作用操作

### Effects

- ✅ 一个 Effect 只处理一个 Action
- ✅ 使用合适的 RxJS 操作符
- ✅ 始终处理错误（catchError）
- ✅ 添加用户通知
- ✅ 使用 `{ dispatch: false }` 对于非分发的 Effects

### Selectors

- ✅ 使用 `createSelector` 实现 memoization
- ✅ 组合小的选择器创建复杂查询
- ✅ 使用 Entity Adapter 的选择器
- ✅ 避免在 Selector 中执行昂贵的操作

### 开发工具

- ✅ 配置 Redux DevTools
- ✅ 仅在开发环境启用调试
- ✅ 使用环境配置管理功能开关

---

## 操作符使用指南

### exhaustMap

**用途**：忽略内部 Observable 完成前的新值  
**场景**：搜索、加载数据（防止重复请求）

### concatMap

**用途**：按顺序处理，等待前一个完成  
**场景**：CRUD 操作、需要保证顺序的操作

### switchMap

**用途**：取消之前的，处理最新的  
**场景**：搜索输入、自动完成

### mergeMap

**用途**：并发处理所有值  
**场景**：独立的并发操作（谨慎使用）

---

## 后续优化建议

### 1. 使用 @ngrx/component-store

对于组件局部状态，考虑使用 ComponentStore：

```typescript
@Injectable()
export class UserFormStore extends ComponentStore<UserFormState> {
  // 组件级状态管理
}
```

### 2. 实现乐观更新

对于某些操作，先更新本地状态，再调用 API：

```typescript
on(UserActions.deleteUser, (state, { id }) => userAdapter.removeOne(id, { ...state, loading: true }));
```

### 3. 添加实体缓存策略

实现智能缓存，避免不必要的 API 调用：

```typescript
loadUsers$ = createEffect(() =>
  this.actions$.pipe(
    ofType(UserActions.loadUsers),
    withLatestFrom(this.store.select(selectLastLoadTime)),
    filter(([_, lastLoad]) => !lastLoad || Date.now() - lastLoad > 60000),
    // ...
  ),
);
```

### 4. 使用 Router Store

更好地集成路由和状态：

```typescript
import { routerReducer } from "@ngrx/router-store";
// 监听路由变化并加载相应数据
```

### 5. 添加单元测试

为 Reducers、Selectors、Effects 添加测试：

```typescript
describe("UserReducer", () => {
  it("should add user on createUserSuccess", () => {
    const user = { id: "1", name: "Test" };
    const action = UserActions.createUserSuccess({ payload: user });
    const state = userReducer(initialState, action);
    expect(selectAllUsers.projector(state)).toContain(user);
  });
});
```

---

## 性能优化建议

1. **使用 OnPush 变更检测策略**

   ```typescript
   @Component({
     changeDetection: ChangeDetectionStrategy.OnPush,
   })
   ```

2. **避免在模板中使用函数**
   使用 Selector 而非方法：

   ```html
   <!-- ❌ 避免 -->
   <div>{{ getUserById(id) }}</div>

   <!-- ✅ 推荐 -->
   <div>{{ (user$ | async) }}</div>
   ```

3. **使用 trackBy 函数**

   ```html
   <div *ngFor="let user of users; trackBy: trackById"></div>
   ```

4. **批量操作使用 adapter 方法**
   ```typescript
   // 使用 addMany 而非多次 addOne
   userAdapter.addMany(users, state);
   ```

---

## 迁移注意事项

### 更新的文件

- ✅ `src/app/models/store.model.ts` - 新增
- ✅ `src/app/models/user.model.ts` - UserState 使用 EntityState
- ✅ `src/app/models/role.model.ts` - 错误类型更新
- ✅ `src/app/models/permission.model.ts` - 错误类型更新
- ✅ `src/app/store/reducers/user.reducer.ts` - 使用 Entity Adapter
- ✅ `src/app/store/selectors/user.selectors.ts` - 新增选择器
- ✅ `src/app/store/effects/user.effects.ts` - 错误处理和通知
- ✅ `src/app/store/actions/user.actions.ts` - 类型安全
- ✅ `src/app/app.reducer.ts` - 环境感知
- ✅ `src/app/app.config.ts` - DevTools 配置

### 组件更新

组件中的选择器调用无需更改，因为我们保持了相同的导出名称。

---

## 参考资源

- [NgRx 官方文档](https://ngrx.io/)
- [NgRx Entity](https://ngrx.io/guide/entity)
- [NgRx Best Practices](https://ngrx.io/guide/eslint-plugin/rules)
- [RxJS 操作符决策树](https://rxjs.dev/operator-decision-tree)

---

**优化完成日期**: {{ new Date().toISOString().split('T')[0] }}
**优化版本**: v2.0
