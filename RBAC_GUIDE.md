# RBAC权限管理模块使用指南

## 概述

本项目实现了一个完整的基于角色继承的RBAC（Role-Based Access Control）权限管理模块，包含以下核心功能：

- **用户管理**：创建、编辑、删除用户，分配角色
- **角色管理**：创建、编辑角色，支持角色继承，分配权限
- **菜单-操作权限管理**：管理菜单权限和操作权限

## 模块结构

### 数据模型

#### 用户模型 (User)

```typescript
{
  id: string;
  username: string;
  email: string;
  fullName: string;
  status: UserStatus; // Active, Inactive, Locked
  roleIds: string[]; // 用户拥有的角色ID列表
  createdAt: Date;
  updatedAt: Date;
}
```

#### 角色模型 (Role)

```typescript
{
  id: string;
  name: string;
  code: string;
  description?: string;
  parentId?: string; // 父角色ID，支持角色继承
  permissionIds: string[]; // 角色拥有的权限ID列表
  level: number; // 角色层级
  createdAt: Date;
  updatedAt: Date;
}
```

#### 权限模型 (Permission)

```typescript
{
  id: string;
  name: string;
  code: string; // 如 'user:create', 'role:delete'
  type: PermissionType; // Menu, Action, Data
  menuId?: string;
  actionId?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## 核心功能

### 1. 角色继承

角色可以继承父角色的所有权限。例如：

```typescript
// 父角色：普通用户
{
  id: '1',
  name: '普通用户',
  code: 'user',
  permissionIds: ['view:dashboard', 'view:profile']
}

// 子角色：高级用户（继承普通用户的权限）
{
  id: '2',
  name: '高级用户',
  code: 'advanced_user',
  parentId: '1', // 继承自普通用户
  permissionIds: ['edit:profile', 'export:data']
}

// 实际权限 = 自身权限 + 父角色权限
// 高级用户实际拥有: ['view:dashboard', 'view:profile', 'edit:profile', 'export:data']
```

### 2. 用户管理

访问路径：`/main/users`

功能：

- ✅ 用户列表展示
- ✅ 新增用户（设置用户名、邮箱、密码、角色等）
- ✅ 编辑用户信息
- ✅ 删除用户
- ✅ 重置用户密码
- ✅ 为用户分配多个角色

### 3. 角色管理

访问路径：`/main/roles`

功能：

- ✅ 角色列表展示（含层级结构）
- ✅ 新增角色（支持选择父角色实现继承）
- ✅ 编辑角色信息
- ✅ 删除角色
- ✅ 为角色分配权限
- ✅ 查看角色继承关系

### 4. 菜单-操作权限管理

访问路径：`/main/permissions`

功能：

- ✅ 菜单树展示
- ✅ 为菜单添加操作权限（新增、编辑、删除等）
- ✅ 编辑操作权限
- ✅ 删除操作权限

## 权限检查

### 使用指令进行权限控制

在模板中使用 `*appHasPermission` 指令：

```html
<!-- 单个权限 -->
<button *appHasPermission="'user:create'" nz-button>新增用户</button>

<!-- 多个权限（OR关系） -->
<button *appHasPermission="['user:edit', 'user:delete']" nz-button>操作</button>

<!-- 多个权限（AND关系） -->
<button *appHasPermission="['user:edit', 'admin:access']" [appPermissionOperator]="'AND'" nz-button>高级操作</button>
```

### 使用路由守卫

在路由配置中使用 `permissionGuard`：

```typescript
import { permissionGuard } from "./core/guards";

const routes: Routes = [
  {
    path: "users",
    component: UserManagementComponent,
    canActivate: [permissionGuard],
    data: {
      permissions: ["user:view", "user:manage"],
      operator: "OR", // 可选：AND 或 OR，默认为 OR
    },
  },
];
```

### 在代码中检查权限

```typescript
import { PermissionService } from "./core/services";

export class MyComponent {
  private permissionService = inject(PermissionService);

  checkPermission() {
    this.permissionService.checkPermission("user:create").subscribe((result) => {
      if (result.hasPermission) {
        // 有权限，执行操作
      } else {
        // 无权限
      }
    });
  }
}
```

## NgRx状态管理

### Actions

```typescript
// 用户相关
UserActions.loadUsers();
UserActions.createUser({ user });
UserActions.updateUser({ user });
UserActions.deleteUser({ id });
UserActions.assignRoles({ userId, roleIds });

// 角色相关
RoleActions.loadRoles();
RoleActions.loadRoleTree();
RoleActions.createRole({ role });
RoleActions.assignPermissions({ roleId, permissionIds });

// 权限相关
PermissionActions.loadPermissions();
PermissionActions.loadMenuPermissions();
PermissionActions.createMenuAction({ menuId, action });
```

### Selectors

```typescript
// 用户选择器
selectAllUsers;
selectSelectedUser;
selectUserById(id);
selectUsersByRole(roleId);

// 角色选择器
selectAllRoles;
selectRoleTree;
selectRoleById(id);
selectChildRoles(parentId);

// 权限选择器
selectAllPermissions;
selectMenuPermissions;
selectPermissionsByType(type);
```

## API接口

所有API已在 `fake-backend.interceptor.ts` 中实现模拟响应：

### 用户API

- `GET /api/users` - 获取用户列表
- `GET /api/users/:id` - 获取用户详情
- `POST /api/users` - 创建用户
- `PUT /api/users/:id` - 更新用户
- `DELETE /api/users/:id` - 删除用户
- `POST /api/users/:id/roles` - 分配角色

### 角色API

- `GET /api/roles` - 获取角色列表
- `GET /api/roles/tree` - 获取角色树
- `GET /api/roles/:id` - 获取角色详情
- `POST /api/roles` - 创建角色
- `PUT /api/roles/:id` - 更新角色
- `DELETE /api/roles/:id` - 删除角色
- `POST /api/roles/:id/permissions` - 分配权限

### 权限API

- `GET /api/permissions` - 获取权限列表
- `GET /api/permissions/menus` - 获取菜单权限树
- `POST /api/permissions/menus/:menuId/actions` - 创建菜单操作
- `DELETE /api/permissions/menus/:menuId/actions/:actionId` - 删除操作

## 菜单配置

权限管理相关菜单已添加到 `menu.model.ts`：

```typescript
{
  id: '6',
  title: 'Access Control',
  icon: 'safety',
  level: 1,
  children: [
    { id: '7', title: 'Users', link: 'main/users' },
    { id: '8', title: 'Roles', link: 'main/roles' },
    { id: '9', title: 'Permissions', link: 'main/permissions' }
  ]
}
```

## 最佳实践

1. **角色设计**
   - 使用角色继承避免权限重复配置
   - 角色命名要清晰，使用语义化的code
   - 合理规划角色层级，避免过深的继承链

2. **权限命名**
   - 使用统一的命名规范：`资源:操作`
   - 例如：`user:create`, `role:delete`, `report:export`

3. **权限检查**
   - 前端权限检查用于UI展示控制
   - 后端必须进行权限验证，前端检查不能替代后端验证

4. **性能优化**
   - 权限数据可以缓存在本地存储
   - 避免频繁请求权限接口

## 扩展功能建议

1. **数据权限**：基于用户角色限制数据访问范围
2. **权限缓存**：使用localStorage缓存用户权限
3. **审计日志**：记录权限变更历史
4. **权限模板**：预设常用角色权限模板
5. **批量操作**：支持批量分配/撤销权限

## 故障排查

### 权限不生效

1. 检查用户是否已分配角色
2. 检查角色是否已分配权限
3. 检查权限代码是否匹配
4. 查看浏览器控制台是否有错误

### 角色继承问题

1. 确认父角色ID正确
2. 检查是否存在循环继承
3. 验证权限继承逻辑

## 技术栈

- Angular 18+ (Standalone Components)
- NgRx (状态管理)
- NG-ZORRO (UI组件库)
- RxJS (响应式编程)

## 文件结构

```
src/app/
├── models/
│   ├── user.model.ts
│   ├── role.model.ts
│   └── permission.model.ts
├── core/
│   ├── services/
│   │   ├── user.service.ts
│   │   ├── role.service.ts
│   │   └── permission.service.ts
│   ├── guards/
│   │   └── permission.guard.ts
│   └── interceptors/
│       └── fake-backend.interceptor.ts
├── shared/
│   └── directives/
│       └── permission-check.directive.ts
├── features/
│   ├── user-management/
│   ├── role-management/
│   └── permission-management/
└── store/
    ├── actions/
    ├── reducers/
    ├── effects/
    └── selectors/
```
