# JWT 认证系统完整指南

## 概述

本系统使用 JWT (JSON Web Token) 进行用户认证和授权。Token 存储在浏览器 Cookie 中，默认有效期为 2 小时，可通过环境变量配置。

## 功能特性

### 1. JWT Token 认证

- ✅ 使用 JWT 标准进行 token 加密和验证
- ✅ Token 默认有效期 2 小时
- ✅ 有效期可通过环境变量配置
- ✅ Token 自动包含用户信息、角色和权限

### 2. Cookie 存储

- ✅ Token 存储在 HTTP Cookie 中（更安全）
- ✅ Cookie 设置了 SameSite=Strict 防止 CSRF 攻击
- ✅ 过期时间与 Token 一致
- ✅ 用户信息同时存储在 Cookie 中

### 3. 自动认证检查

- ✅ 所有受保护路由自动验证 token
- ✅ Token 失效自动跳转登录页
- ✅ 记住原访问路径，登录后自动跳转
- ✅ 所有 HTTP 请求自动携带 token

### 4. 权限控制

- ✅ 路由级权限守卫
- ✅ 支持 AND/OR 操作符
- ✅ 从用户 token 中提取权限信息

## 后端配置

### 1. 环境变量配置

在 `server/.env` 文件中配置 JWT 参数：

```bash
# JWT Secret Key（生产环境必须修改）
JWT_SECRET=your-super-secret-key-change-in-production

# JWT Token 有效期
# 格式：数字 + 单位
# s = 秒 (seconds)
# m = 分钟 (minutes)
# h = 小时 (hours)
# d = 天 (days)
# 示例：
# JWT_EXPIRES_IN=60s    # 60秒
# JWT_EXPIRES_IN=30m    # 30分钟
# JWT_EXPIRES_IN=2h     # 2小时（默认）
# JWT_EXPIRES_IN=7d     # 7天
JWT_EXPIRES_IN=2h
```

### 2. JWT Module 配置

在 `server/src/modules/auth/auth.module.ts` 中：

```typescript
JwtModule.register({
  secret: process.env.JWT_SECRET || 'your-secret-key',
  signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '2h' },
}),
```

### 3. Token Payload 结构

```typescript
{
  sub: userId,           // 用户 ID
  username: 'john',      // 用户名
  email: 'john@example.com',
  roles: ['admin'],      // 角色代码数组
  permissions: ['user:view', 'user:create'], // 权限代码数组
  iat: 1234567890,       // 签发时间
  exp: 1234574890        // 过期时间
}
```

### 4. 登录接口

**POST** `/api/auth/login`

请求：

```json
{
  "username": "admin",
  "password": "password123"
}
```

响应：

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "fullName": "Administrator",
    "status": "active",
    "roles": [...],
    "permissions": ["user:view", "user:create", ...]
  }
}
```

## 前端实现

### 1. AuthService

位置：`src/app/core/services/auth.service.ts`

主要方法：

```typescript
// 登录
login(credentials: LoginRequest): Observable<LoginResponse>

// 保存认证信息到 Cookie
saveAuth(token: string, user: any): void

// 获取 Token
getToken(): string | null

// 检查是否已认证
isAuthenticated(): boolean

// 检查权限
hasPermission(permission: string): boolean
hasAnyPermission(permissions: string[]): boolean
hasAllPermissions(permissions: string[]): boolean

// 退出登录
logout(): void

// 处理认证失败
handleAuthError(): void
```

### 2. AuthGuard

位置：`src/app/core/guards/auth.guard.ts`

用法：

```typescript
// 在路由配置中使用
{
  path: 'dashboard',
  component: DashboardComponent,
  canActivate: [authGuard]  // 需要登录才能访问
}
```

### 3. PermissionGuard

位置：`src/app/core/guards/permission.guard.ts`

用法：

```typescript
// 单个权限（OR 操作）
{
  path: 'users',
  component: UserManagementComponent,
  canActivate: [authGuard, permissionGuard],
  data: { permissions: ['user:view'] }
}

// 多个权限（OR 操作，任一即可）
{
  path: 'settings',
  component: SettingsComponent,
  canActivate: [authGuard, permissionGuard],
  data: {
    permissions: ['settings:view', 'admin:full'],
    operator: 'OR'  // 默认值
  }
}

// 多个权限（AND 操作，全部必须）
{
  path: 'sensitive-data',
  component: SensitiveComponent,
  canActivate: [authGuard, permissionGuard],
  data: {
    permissions: ['data:view', 'data:sensitive'],
    operator: 'AND'  // 需要同时拥有两个权限
  }
}
```

### 4. AuthInterceptor

位置：`src/app/core/interceptors/auth.interceptor.ts`

功能：

- 自动从 Cookie 读取 Token
- 自动在所有请求头添加 `Authorization: Bearer <token>`
- 捕获 401/403 错误并跳转登录页

配置（已在 `app.config.ts` 中）：

```typescript
provideHttpClient(withInterceptors([authInterceptor]));
```

### 5. Cookie 配置

Token Cookie 设置：

- **名称**: `token`
- **有效期**: 与 JWT 一致（默认 2 小时）
- **Path**: `/`
- **SameSite**: `Strict`（防止 CSRF）
- **HttpOnly**: 否（需要 JavaScript 访问）

用户信息 Cookie 设置：

- **名称**: `user`
- **内容**: JSON 格式的用户信息
- **有效期**: 与 JWT 一致

## 使用示例

### 1. 登录组件

```typescript
export class LoginComponent {
  constructor(
    private authService: AuthService,
    private router: Router,
    private message: NzMessageService,
  ) {}

  async onLogin() {
    try {
      const response = await firstValueFrom(this.authService.login(this.loginForm.value));

      // 保存认证信息到 Cookie
      this.authService.saveAuth(response.access_token, response.user);

      this.message.success("登录成功");

      // 跳转到原访问页面或首页
      const returnUrl = this.authService.getReturnUrl();
      this.router.navigate([returnUrl]);
    } catch (error) {
      this.message.error("登录失败");
    }
  }
}
```

### 2. 在组件中获取当前用户

```typescript
export class ProfileComponent {
  user$ = this.authService.currentUser$;

  constructor(private authService: AuthService) {}

  getCurrentUser() {
    const user = this.authService.getCurrentUser();
    console.log("Current user:", user);
  }
}
```

### 3. 在模板中使用

```html
<!-- 检查是否登录 -->
<div *ngIf="authService.isAuthenticated()">
  欢迎, {{ (authService.currentUser$ | async)?.username }}
  <button (click)="authService.logout()">退出登录</button>
</div>

<!-- 根据权限显示/隐藏 -->
<button *ngIf="authService.hasPermission('user:create')">创建用户</button>
```

### 4. 退出登录

```typescript
logout() {
  this.authService.logout();  // 清除 Cookie 并跳转到登录页
}
```

## 安全最佳实践

### 1. JWT Secret 管理

⚠️ **生产环境必须修改 JWT_SECRET**

```bash
# 生成强随机密钥（推荐）
openssl rand -base64 64

# 或使用在线工具：https://randomkeygen.com/
```

在生产环境的 `.env` 文件中：

```bash
JWT_SECRET=<your-generated-strong-secret-key>
```

### 2. Token 有效期设置建议

- **短期应用**（高安全要求）：30m - 1h
- **一般应用**：2h - 4h（默认）
- **低安全要求**：1d - 7d

```bash
# 高安全
JWT_EXPIRES_IN=1h

# 标准（推荐）
JWT_EXPIRES_IN=2h

# 宽松
JWT_EXPIRES_IN=1d
```

### 3. HTTPS

生产环境必须使用 HTTPS，否则 Cookie 可能被拦截。

### 4. Cookie 安全增强（可选）

如果不需要 JavaScript 访问 token，可以设置 HttpOnly Cookie：

后端设置（NestJS）：

```typescript
@Post('login')
async login(@Body() loginDto: LoginDto, @Res() response: Response) {
  const result = await this.authService.login(loginDto);

  // 设置 HttpOnly Cookie
  response.cookie('token', result.access_token, {
    httpOnly: true,  // JavaScript 无法访问
    secure: true,    // 仅 HTTPS
    sameSite: 'strict',
    maxAge: 2 * 60 * 60 * 1000  // 2 小时
  });

  return response.json({ user: result.user });
}
```

## 故障排除

### 1. Token 过期

**症状**: 用户突然被踢出登录
**原因**: Token 超过有效期
**解决**:

- 增加 `JWT_EXPIRES_IN` 时间
- 实现 Token 刷新机制（可选）

### 2. 401 Unauthorized

**症状**: 所有请求返回 401
**原因**:

- Token 未携带
- Token 格式错误
- Token 已过期

**解决**:

1. 检查 Cookie 中是否有 token
2. 检查 AuthInterceptor 是否正确添加 Authorization 头
3. 验证后端 JWT_SECRET 配置

### 3. CORS 问题

**症状**: Cookie 未设置
**原因**: 跨域请求未允许携带凭证

**解决**:
后端（NestJS）：

```typescript
app.enableCors({
  origin: "http://localhost:4200",
  credentials: true, // 允许携带 Cookie
});
```

前端（Angular）：

```typescript
this.http.get("/api/users", {
  withCredentials: true, // 携带 Cookie
});
```

### 4. Token 在浏览器刷新后丢失

**症状**: 刷新页面后需要重新登录
**原因**: Cookie 过期或未正确设置

**解决**:

1. 检查 Cookie 的 expires 设置
2. 确认 Cookie path 为 `/`
3. 验证 Cookie 未被浏览器阻止

## Token 刷新机制（可选增强）

如果需要自动刷新 Token，可以实现以下机制：

### 后端添加刷新接口

```typescript
@Post('refresh')
async refreshToken(@Req() req: Request) {
  const oldToken = req.cookies.token;
  const payload = this.jwtService.verify(oldToken);

  // 生成新 Token
  const newToken = this.jwtService.sign({
    sub: payload.sub,
    username: payload.username,
    // ...
  });

  return { access_token: newToken };
}
```

### 前端自动刷新

```typescript
// 在 AuthService 中添加
scheduleTokenRefresh() {
  // 在 Token 过期前 5 分钟刷新
  const expiresIn = 2 * 60 * 60 * 1000; // 2 小时
  const refreshTime = expiresIn - 5 * 60 * 1000; // 提前 5 分钟

  setTimeout(() => {
    this.refreshToken().subscribe(response => {
      this.saveAuth(response.access_token, this.getCurrentUser());
      this.scheduleTokenRefresh(); // 递归调度
    });
  }, refreshTime);
}
```

## 测试

### 1. 测试登录

```bash
curl -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"username":"admin","password":"password123"}' \\
  -c cookies.txt  # 保存 Cookie
```

### 2. 测试携带 Token 的请求

```bash
curl http://localhost:3000/api/users \\
  -b cookies.txt  # 使用保存的 Cookie
```

### 3. 前端测试

1. 打开浏览器开发者工具
2. Application -> Cookies
3. 检查 `token` 和 `user` Cookie
4. Network -> 查看请求头是否包含 `Authorization: Bearer <token>`

## 总结

✅ **已完成**:

- JWT 认证系统完整实现
- Token 存储在 Cookie 中（2 小时有效期）
- 有效期可通过 `JWT_EXPIRES_IN` 环境变量配置
- 所有请求自动携带 token
- 认证失败自动跳转登录页
- 路由守卫保护受保护页面
- 权限检查机制

🔐 **安全特性**:

- Cookie SameSite=Strict
- JWT Secret 可配置
- Token 过期自动处理
- 401/403 统一拦截

📝 **配置文件**:

- 后端：`server/.env`
- 路由守卫：`src/app/core/guards/`
- 认证服务：`src/app/core/services/auth.service.ts`
- 拦截器：`src/app/core/interceptors/auth.interceptor.ts`
