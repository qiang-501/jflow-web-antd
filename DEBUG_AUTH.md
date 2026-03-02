# JWT 认证问题诊断指南

## 问题现象

登录成功后访问 `/api/permissions/current-user` 返回 401 未授权错误。

## 诊断步骤

### 1. 检查浏览器控制台日志

刷新页面或重新登录，查看控制台输出：

```
🔑 [AuthService] 保存 token 到 cookie: eyJhbGciOiJIUzI1NiIs...
✅ [AuthService] Token 保存验证: 成功
📝 [AuthService] 保存的 token: eyJhbGciOiJIUzI1NiIs...
```

**如果没有看到这些日志** → Token 没有被正确保存

### 2. 检查 APP_INITIALIZER 日志

```
🚀 [APP_INITIALIZER] 开始初始化权限
🔐 [APP_INITIALIZER] 认证状态: true
🔑 [APP_INITIALIZER] Token 状态: 存在 (eyJhbGciOiJIUzI1NiIs...)
```

**如果显示 Token 不存在** → Cookie 存储有问题

### 3. 检查 AuthInterceptor 日志

```
🔍 [AuthInterceptor] 拦截请求: /api/permissions/current-user
🔑 [AuthInterceptor] Token 状态: 存在 (eyJhbGciOiJIUzI1NiIs...)
✅ [AuthInterceptor] 已添加 Authorization header
```

**如果显示警告** → AuthInterceptor 没有获取到 token

### 4. 检查浏览器 Cookie

1. 打开浏览器开发工具
2. Application → Cookies → 当前域名
3. 查找 `token` cookie
4. 检查值、过期时间、Path、SameSite

**期望值**：

- Name: `token`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWI...` （JWT 格式）
- Path: `/`
- SameSite: `Strict`
- Expires: 2小时后

### 5. 检查网络请求

打开 Network 选项卡，刷新页面：

1. 找到 `current-user` 请求
2. 查看 Request Headers
3. 确认有 `Authorization: Bearer eyJhbGciOiJIUzI1NiIs...`

**如果没有 Authorization header** → AuthInterceptor 配置问题

### 6. 检查后端 JWT_SECRET

**前端和后端必须使用相同的 JWT_SECRET！**

#### 检查后端配置：

```typescript
// server/src/modules/auth/auth.module.ts
JwtModule.register({
  secret: process.env.JWT_SECRET || "your-secret-key",
  signOptions: { expiresIn: "2h" },
});

// server/src/modules/auth/jwt.strategy.ts
super({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  ignoreExpiration: false,
  secretOrKey: process.env.JWT_SECRET || "your-secret-key",
});
```

**重要**：两处的 `secretOrKey` 必须完全一致！

#### 创建 .env 文件（如果没有）：

```bash
# server/.env
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRES_IN=2h
```

### 7. 验证 JWT Token

使用 [jwt.io](https://jwt.io) 解码 token：

1. 复制 cookie 中的 token
2. 访问 https://jwt.io
3. 粘贴 token 到 Encoded 框
4. 检查 Payload：

```json
{
  "sub": 1,           // 用户 ID
  "username": "admin",
  "email": "admin@example.com",
  "roles": ["ADMIN"],
  "permissions": ["workflow:create", ...],
  "iat": 1234567890,
  "exp": 1234575090
}
```

5. 在 Verify Signature 处输入 `JWT_SECRET`
6. 检查是否显示 "Signature Verified"

**如果签名验证失败** → 前后端 JWT_SECRET 不一致

## 常见问题及解决方案

### 问题 1: Token 没有被保存

**原因**：Cookie 跨域问题
**解决**：

- 前端和后端必须在同一域名下，或配置正确的 CORS
- 检查 proxy.conf.json 配置

### 问题 2: AuthInterceptor 没有添加 header

**原因**：`provideHttpClient()` 没有配置 `withInterceptorsFromDi()`
**解决**：

```typescript
// app.config.ts
provideHttpClient(withInterceptorsFromDi()),
```

### 问题 3: 后端返回 401

**原因**：JWT_SECRET 不匹配或 token 过期
**解决**：

1. 确保前后端使用相同的 JWT_SECRET
2. 重新登录获取新 token
3. 检查 token 是否过期（jwt.io）

### 问题 4: CORS 错误

**原因**：后端没有配置 CORS
**解决**：

```typescript
// server/src/main.ts
app.enableCors({
  origin: "http://localhost:4200",
  credentials: true,
});
```

## 快速测试命令

### 测试登录并获取 token：

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}' \
  -v
```

### 测试带 token 的权限请求：

```bash
curl http://localhost:3000/api/permissions/current-user \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -v
```

## 后端日志检查

在 `permissions.controller.ts` 的 `getCurrentUserPermissions` 方法中已添加日志：

```typescript
console.log("📌 从 JWT token 获取的用户 ID:", userId);
```

检查后端终端输出：

- 如果显示正确的 userId → Token 验证成功
- 如果没有日志 → 请求没有到达控制器（可能被 Guard 拦截）
- 如果显示错误 → JWT 验证失败

## 终极解决方案

如果以上都不work，尝试完全重置：

1. **清除所有 Cookie**：

```typescript
// 浏览器控制台执行
document.cookie.split(";").forEach((c) => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
```

2. **重启后端服务器**：

```bash
cd server
npm run start:dev
```

3. **重新登录**

4. **观察所有日志输出**

## 联系信息

如果问题仍然存在，请提供：

- 浏览器控制台完整日志
- Cookie 截图
- Network 请求详情
- 后端终端日志
