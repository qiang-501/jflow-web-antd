# RBAC权限管理模块 - 快速开始

## 🎉 功能完成

已成功实现完整的基于角色继承的RBAC权限管理模块！

## 📋 主要功能

### 1. 用户管理 (`/main/users`)

- ✅ 用户CRUD操作
- ✅ 多角色分配
- ✅ 密码重置
- ✅ 用户状态管理

### 2. 角色管理 (`/main/roles`)

- ✅ 角色CRUD操作
- ✅ **角色继承**（支持多层级）
- ✅ 权限分配
- ✅ 层级关系可视化

### 3. 权限管理 (`/main/permissions`)

- ✅ 菜单树展示
- ✅ 操作权限管理
- ✅ 权限类型分类

## 🚀 快速启动

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm start
```

### 3. 访问应用

打开浏览器访问: `http://localhost:4200`

### 4. 访问权限管理模块

导航到：

- 用户管理: `/main/users`
- 角色管理: `/main/roles`
- 权限管理: `/main/permissions`

## 📁 项目结构

```
src/app/
├── models/                    # 数据模型
│   ├── user.model.ts         # 用户模型
│   ├── role.model.ts         # 角色模型（支持继承）
│   └── permission.model.ts   # 权限模型
│
├── core/                      # 核心模块
│   ├── services/             # 服务
│   │   ├── user.service.ts
│   │   ├── role.service.ts
│   │   └── permission.service.ts
│   ├── guards/               # 路由守卫
│   │   └── permission.guard.ts
│   ├── utils/                # 工具类
│   │   └── rbac.helper.ts   # RBAC辅助工具
│   └── interceptors/         # 拦截器
│       └── fake-backend.interceptor.ts  # Mock API
│
├── shared/                    # 共享模块
│   └── directives/           # 指令
│       └── permission-check.directive.ts
│
├── features/                  # 功能模块
│   ├── user-management/      # 用户管理
│   ├── role-management/      # 角色管理
│   └── permission-management/  # 权限管理
│
└── store/                     # NgRx状态管理
    ├── actions/              # Actions
    ├── reducers/             # Reducers
    ├── effects/              # Effects
    └── selectors/            # Selectors
```

## 💡 使用示例

### 权限指令

```html
<!-- 单个权限 -->
<button *appHasPermission="'user:create'" nz-button>新增用户</button>

<!-- 多个权限（OR） -->
<button *appHasPermission="['user:edit', 'user:delete']" nz-button>操作</button>

<!-- 多个权限（AND） -->
<button *appHasPermission="['user:edit', 'admin:access']" [appPermissionOperator]="'AND'" nz-button>高级操作</button>
```

### 路由守卫

```typescript
{
  path: 'users',
  component: UserManagementComponent,
  canActivate: [permissionGuard],
  data: { permissions: ['user:view'] }
}
```

### 角色继承示例

```typescript
// 父角色
{
  id: '1',
  name: '普通用户',
  permissionIds: ['view:dashboard', 'view:profile']
}

// 子角色（继承父角色的所有权限）
{
  id: '2',
  name: '高级用户',
  parentId: '1',  // 继承自普通用户
  permissionIds: ['edit:profile', 'export:data']
}

// 实际权限 = ['view:dashboard', 'view:profile', 'edit:profile', 'export:data']
```

## 📚 文档

详细文档请查看：

- [RBAC使用指南](RBAC_GUIDE.md) - 完整功能说明和API文档
- [实现总结](RBAC_IMPLEMENTATION.md) - 技术实现详情

## 🔧 Mock数据

项目使用 `fake-backend.interceptor.ts` 提供Mock API响应，包括：

### 预置用户

- `admin` / `admin@example.com` - 超级管理员
- `user1` / `user1@example.com` - 普通用户

### 预置角色

- 超级管理员 - 拥有所有权限
- 普通用户 - 继承自超级管理员，基础权限

### 预置权限

- 用户相关：`user:create`, `user:edit`, `user:delete`
- 角色相关：`role:view`, `role:manage`
- 权限相关：`permission:manage`

## ⚠️ 注意事项

### TypeScript编译问题

如果遇到模块找不到的错误：

1. 重启 TypeScript 服务器（VS Code: `Ctrl+Shift+P` → `TypeScript: Restart TS Server`）
2. 清理并重新编译：
   ```bash
   rm -rf dist node_modules/.cache
   npm start
   ```

### 后端集成

当前使用Mock API，实际项目中需要：

1. 替换 `fake-backend.interceptor.ts` 中的逻辑
2. 配置真实的API端点
3. 实现后端权限验证

## 🎨 技术栈

- **Angular 18+** - Standalone Components
- **NgRx** - 状态管理
- **NG-ZORRO** - UI组件库
- **RxJS** - 响应式编程
- **TypeScript** - 类型安全

## 📝 待办事项

- [ ] 添加单元测试
- [ ] 添加E2E测试
- [ ] 实现数据权限
- [ ] 添加权限变更审计日志
- [ ] 性能优化（虚拟滚动）
- [ ] 国际化支持

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License
