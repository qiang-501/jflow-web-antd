# 权限缓存机制实现文档

## 概述

为了优化权限检查性能，避免每次检查权限都发送网络请求，我们实现了基于服务的权限缓存机制。

## 实现方案

采用轻量级的服务缓存方案，而非引入完整的 NgRx Store 系统：

- ✅ 使用 `BehaviorSubject` 缓存用户权限
- ✅ 应用启动时自动加载权限（`APP_INITIALIZER`）
- ✅ 所有权限检查从缓存读取，无需网络请求
- ✅ 用户登出时自动清除缓存

## 核心文件

### 1. PermissionService 更新

**文件**: [src/app/core/services/permission.service.ts](src/app/core/services/permission.service.ts)

**新增功能**:

```typescript
// 缓存用户的权限列表
private userPermissionsCache$ = new BehaviorSubject<string[]>([]);
private isPermissionsLoaded = false;
private isLoading = false;

// 加载并缓存当前用户的所有权限
loadUserPermissions(): Observable<string[]>

// 从缓存中检查权限（快速、不发送网络请求）
hasPermission(permissionCheck: string | { resource: string; action: string }): Observable<boolean>

// 获取缓存的权限列表
getUserPermissionsCache(): Observable<string[]>
getUserPermissionsCacheValue(): string[]

// 检查权限是否已加载
isPermissionsCacheLoaded(): boolean

// 清除权限缓存（用户登出时调用）
clearPermissionsCache(): void
```

### 2. HasPermissionDirective 更新

**文件**: [src/app/shared/directives/has-permission.directive.ts](src/app/shared/directives/has-permission.directive.ts)

**变更**:

- 从 `checkPermission()` 改为使用 `hasPermission()`
- 直接从缓存读取权限，不再发送 HTTP 请求

```typescript
// 使用缓存的权限进行检查（不发送网络请求）
this.permissionService
  .hasPermission(this.appHasPermission)
  .pipe(takeUntil(this.destroy$))
  .subscribe({
    next: (hasPermission) => {
      // 根据权限结果显示/隐藏元素
    },
  });
```

### 3. 权限初始化器

**文件**: [src/app/core/initializers/permission.initializer.ts](src/app/core/initializers/permission.initializer.ts)

```typescript
export function initializePermissions(permissionService: PermissionService, authService: AuthService) {
  return async () => {
    // 检查用户是否已登录
    const isLoggedIn = authService.isAuthenticated();

    if (!isLoggedIn) {
      console.log("⏭️ 用户未登录，跳过权限初始化");
      return;
    }

    console.log("🚀 开始加载用户权限...");

    // 加载用户权限
    await firstValueFrom(permissionService.loadUserPermissions());

    console.log("✅ 权限初始化完成");
  };
}
```

### 4. 应用配置更新

**文件**: [src/app/app.config.ts](src/app/app.config.ts)

```typescript
import { APP_INITIALIZER } from "@angular/core";
import { initializePermissions } from "./core/initializers/permission.initializer";

export const appConfig: ApplicationConfig = {
  providers: [
    // ... 其他 providers

    // 应用启动时初始化权限缓存
    {
      provide: APP_INITIALIZER,
      useFactory: initializePermissions,
      deps: [PermissionService, AuthService],
      multi: true,
    },
  ],
};
```

### 5. 组件中使用

**文件**: [src/app/features/workflow/workflow.component.ts](src/app/features/workflow/workflow.component.ts)

```typescript
/**
 * 检查权限的辅助方法（用于业务逻辑）
 * 从缓存中检查，不发送网络请求
 */
async hasPermission(resource: string, action: string): Promise<boolean> {
  try {
    const hasPermission = await firstValueFrom(
      this.permissionService.hasPermission({ resource, action }),
    );
    return hasPermission;
  } catch (error) {
    console.error('Permission check failed:', error);
    return false;
  }
}
```

### 6. 登出时清除缓存

**文件**: [src/app/core/services/auth.service.ts](src/app/core/services/auth.service.ts)

```typescript
logout(): void {
  // 清除 cookie
  this.deleteCookie('token');
  this.deleteCookie('user');

  // 清除当前用户
  this.currentUserSubject.next(null);

  // 清除权限缓存
  import('./permission.service').then(({ PermissionService }) => {
    const permissionService = this.injector.get(PermissionService);
    permissionService.clearPermissionsCache();
  });

  // 跳转到登录页
  this.router.navigate(['/login']);
}
```

## 使用方式

### 在模板中使用指令

```html
<!-- 简单用法 -->
<button *appHasPermission="'workflow:create'" (click)="createWorkflow()">创建工作流</button>

<!-- 对象格式 -->
<button *appHasPermission="{ resource: 'workflow', action: 'update' }">编辑</button>

<!-- 带 else 模板 -->
<ng-container *appHasPermission="'form:manage'; else noPermission">
  <button (click)="manageForm()">管理表单</button>
</ng-container>
<ng-template #noPermission>
  <button disabled nz-tooltip="无权限">管理表单</button>
</ng-template>
```

### 在组件中使用方法

```typescript
async someAction(): Promise<void> {
  // 检查权限
  if (!(await this.hasPermission('workflow', 'delete'))) {
    this.message.warning('您没有删除权限');
    return;
  }

  // 执行操作
  // ...
}
```

## 工作流程

```
1. 应用启动
   ↓
2. APP_INITIALIZER 执行
   ↓
3. 检查用户是否登录
   ↓
4. 如果已登录，调用 loadUserPermissions()
   ↓
5. 从后端获取用户所有权限：GET /api/permissions/current-user
   ↓
6. 将权限数组缓存到 BehaviorSubject
   ↓
7. 组件和指令从缓存读取权限（无需网络请求）
   ↓
8. 用户登出时清除缓存
```

## 性能优势

### 优化前

- 每次权限检查都发送 HTTP 请求
- 如果页面有 10 个按钮 = 10 个 HTTP 请求
- 网络延迟导致按钮显示延迟
- 增加服务器负载

### 优化后

- ✅ 应用启动时只加载一次权限
- ✅ 所有权限检查从内存读取（毫秒级）
- ✅ 按钮立即显示/隐藏，无延迟
- ✅ 减少 90%+ 的权限相关 HTTP 请求

## 日志输出

系统会在控制台输出权限相关日志：

```
🚀 开始加载用户权限...
✅ 用户权限已加载并缓存: ["workflow:create", "workflow:update", ...]
🔍 权限检查 [workflow:create]: ✅ 有权限
🔍 权限检查 [workflow:delete]: ❌ 无权限
🗑️ 权限缓存已清除
```

## API 兼容性

### 新方法（推荐）

```typescript
// 从缓存检查权限（推荐）
permissionService.hasPermission('workflow:create'): Observable<boolean>
```

### 旧方法（已废弃但仍可用）

```typescript
// 发送网络请求检查权限（已标记为 @deprecated）
permissionService.checkPermission({ resource: 'workflow', action: 'create' }): Observable<PermissionCheck>
```

## 注意事项

1. **首次加载时机**: 权限在 APP_INITIALIZER 中加载，确保在应用完全启动前完成
2. **登录后刷新**: 用户登录成功后，应该刷新页面或手动调用 `loadUserPermissions()`
3. **权限变更**: 如果用户权限在会话期间被修改，需要重新登录或调用 `loadUserPermissions()` 刷新缓存
4. **未登录用户**: 如果用户未登录，权限缓存为空数组，所有权限检查返回 false

## 扩展功能

未来可以考虑添加：

- 自动刷新权限（定时轮询）
- WebSocket 实时更新权限变更
- 权限粒度控制（页面级、按钮级、字段级）
- 权限预加载策略配置
- 离线缓存支持

## 总结

通过使用服务级缓存机制，我们实现了：

- ✅ **性能优化**: 减少 90%+ 的 HTTP 请求
- ✅ **用户体验**: 按钮立即响应，无延迟
- ✅ **代码简洁**: 统一的权限检查接口
- ✅ **易于维护**: 集中式权限管理
- ✅ **轻量级方案**: 无需引入 NgRx 等重型库
