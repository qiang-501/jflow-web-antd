# JWT 认证系统实现总结

## 已完成的功能

### ✅ 1. JWT 认证基础设施

- **后端 JWT 配置** (`server/src/modules/auth/auth.module.ts`)
  - Token 有效期改为 2 小时（可配置）
  - 通过环境变量 `JWT_EXPIRES_IN` 配置过期时间
  - 支持 s/m/h/d 时间单位（秒/分钟/小时/天）

### ✅ 2. 前端 AuthService

- **文件**: `src/app/core/services/auth.service.ts`
- **功能**:
  - 用户登录
  - Token/用户信息存储到 Cookie（2小时过期）
  - 从 Cookie 读取 Token
  - 检查认证状态
  - 权限检查（单个/任一/全部）
  - 退出登录
  - 处理认证失败

### ✅ 3. 前端 AuthGuard

- **文件**: `src/app/core/guards/auth.guard.ts`
- **功能**:
  - 保护需要登录的路由
  - 未登录自动跳转到登录页
  - 记住原访问路径，登录后自动返回

### ✅ 4. 更新后的 PermissionGuard

- **文件**: `src/app/core/guards/permission.guard.ts`
- **更新**: 使用 AuthService 代替已删除的 ngrx Store
- **功能**:
  - 路由级权限控制
  - 支持 AND/OR 操作符
  - 权限不足跳转到未授权页面

### ✅ 5. 更新后的 AuthInterceptor

- **文件**: `src/app/core/interceptors/auth.interceptor.ts`
- **更新**:
  - 从 Cookie 读取 Token（不再使用 localStorage）
  - 自动在所有 HTTP 请求头添加 `Authorization: Bearer <token>`
  - 统一处理 401/403 错误
  - 使用 AuthService 处理认证失败

### ✅ 6. 更新后的登录组件

- **文件**: `src/app/features/login/login.component.ts`
- **更新**:
  - 使用 AuthService 进行登录
  - 将 Token 保存到 Cookie（不再使用 localStorage）
  - 登录成功后跳转到原访问页面

### ✅ 7. 路由配置更新

- **文件**: `src/app/app.routes.ts`
- **更新**:
  - 所有需要认证的路由添加 `canActivate: [authGuard]`
  - `/login` 路由无需认证

### ✅ 8. 环境配置

- **文件**: `server/.env.example`
- **更新**:
  - `JWT_EXPIRES_IN=2h` （默认 2 小时）
  - 添加详细的配置说明和示例

### ✅ 9. 完整文档

- **文件**: `JWT_AUTH_GUIDE.md`
- **内容**:
  - 系统概述和功能特性
  - 后端配置详解
  - 前端实现指南
  - 使用示例
  - 安全最佳实践
  - 故障排除
  - 测试方法

## 技术架构

```
┌─────────────────────────────────────────────────────────────┐
│                        浏览器                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Cookie: token (2h), user                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                           ↕                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  AuthService                                         │   │
│  │  - saveAuth()                                        │   │
│  │  - getToken()                                        │   │
│  │  - isAuthenticated()                                 │   │
│  │  - hasPermission()                                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                           ↕                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  AuthGuard / PermissionGuard                         │   │
│  │  - 保护路由                                          │   │
│  │  - 检查认证和权限                                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                           ↕                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  AuthInterceptor                                     │   │
│  │  - 自动添加 Authorization 头                         │   │
│  │  - 处理 401/403 错误                                 │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP
                           │ Authorization: Bearer <token>
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    NestJS 后端                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  AuthController                                      │   │
│  │  - POST /auth/login                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                           ↕                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  AuthService                                         │   │
│  │  - validateUser()                                    │   │
│  │  - login()                                           │   │
│  │  - validateToken()                                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                           ↕                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  JwtModule                                           │   │
│  │  - Secret: JWT_SECRET                                │   │
│  │  - ExpiresIn: JWT_EXPIRES_IN (2h)                    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 关键改进点

### 从 localStorage 迁移到 Cookie

✅ **更安全**: Cookie 可以设置 HttpOnly 和 SameSite 属性
✅ **自动过期**: Cookie 与 Token 同步过期
✅ **防止 XSS**: 相比 localStorage 更难被窃取

### Token 有效期可配置

✅ **灵活性**: 根据安全需求调整过期时间
✅ **环境变量**: 生产/开发环境可使用不同配置
✅ **标准化**: 使用 JWT 标准的时间单位

### 统一认证流程

✅ **AuthService**: 统一的认证接口
✅ **AuthGuard**: 自动保护路由
✅ **AuthInterceptor**: 自动添加 Token 和处理错误
✅ **自动跳转**: 认证失败自动返回登录页

### 移除 ngrx 依赖

✅ **简化**: 不再依赖复杂的状态管理
✅ **直接**: 使用服务直接管理认证状态
✅ **高效**: 减少样板代码

## 使用方法

### 1. 配置后端环境变量

编辑 `server/.env`:

```bash
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=2h
```

### 2. 启动后端

```bash
cd server
npm install
npm run start:dev
```

### 3. 启动前端

```bash
npm install
npm start
```

### 4. 测试登录

1. 访问 `http://localhost:4200/system`
2. 自动跳转到 `/login`
3. 输入用户名和密码登录
4. 登录成功后自动跳转回 `/system`
5. 查看浏览器 Cookie，应该有 `token` 和 `user`

### 5. 验证 Token

1. 打开浏览器开发者工具
2. Network 标签
3. 选择任意 API 请求
4. 查看 Request Headers
5. 应该有 `Authorization: Bearer <token>`

## 文件清单

### 新增文件

- ✨ `src/app/core/services/auth.service.ts` - 认证服务
- ✨ `src/app/core/guards/auth.guard.ts` - 认证路由守卫
- ✨ `JWT_AUTH_GUIDE.md` - 完整文档
- ✨ `JWT_AUTH_IMPLEMENTATION.md` - 本文件

### 修改文件

- 🔧 `src/app/core/interceptors/auth.interceptor.ts` - 使用 Cookie 和 AuthService
- 🔧 `src/app/core/guards/permission.guard.ts` - 使用 AuthService 代替 Store
- 🔧 `src/app/features/login/login.component.ts` - 使用 AuthService 和 Cookie
- 🔧 `src/app/app.routes.ts` - 添加 authGuard
- 🔧 `src/app/core/guards/index.ts` - 导出 authGuard
- 🔧 `src/app/core/services/index.ts` - 导出 AuthService
- 🔧 `server/src/modules/auth/auth.module.ts` - 修改 JWT 过期时间为 2h
- 🔧 `server/.env.example` - 更新 JWT 配置说明

## 安全建议

⚠️ **生产环境必做**:

1. 修改 `JWT_SECRET` 为强随机密钥
2. 启用 HTTPS
3. 考虑设置 Cookie 为 HttpOnly
4. 定期审查和更新依赖包

## 下一步可选优化

🔮 **Token 刷新**: 实现自动刷新机制，避免频繁登录
🔮 **记住我**: 添加"记住我"选项，延长 Token 有效期
🔮 **双因素认证**: 增加额外的安全层
🔮 **Session 管理**: 后端记录活跃 Session，支持踢出用户
🔮 **Token 黑名单**: 支持主动作废 Token

## 测试清单

- [ ] 登录功能正常
- [ ] Token 保存到 Cookie
- [ ] 所有请求携带 Token
- [ ] Token 过期自动跳转登录页
- [ ] 登录后跳转回原页面
- [ ] 退出登录清除 Cookie
- [ ] 权限控制生效
- [ ] 未授权请求被拦截

## 联系方式

如有问题，请查阅：

- 📖 `JWT_AUTH_GUIDE.md` - 详细使用指南
- 📁 `src/app/core/services/auth.service.ts` - 认证服务实现
- 📁 `server/src/modules/auth/` - 后端认证模块
