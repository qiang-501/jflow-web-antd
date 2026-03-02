# JWT 认证 401 错误 - 完整测试步骤

## 📋 准备工作

1. **重启后端服务器**：

```bash
cd server
npm run start:dev
```

2. **清除浏览器缓存和 Cookie**：
   - 打开浏览器开发工具
   - Application → Storage → Clear site data

## 🧪 测试步骤

### 步骤 1: 测试无需认证的端点

验证后端服务器正常运行：

```bash
curl http://localhost:3000/api/debug/no-auth
```

**期望结果**：

```json
{
  "message": "Public endpoint - no authentication required",
  "timestamp": "2024-03-02T..."
}
```

✅ 如果成功 → 后端服务器正常运行
❌ 如果失败 → 检查后端是否启动

---

### 步骤 2: 登录并获取 Token

在浏览器中访问: `http://localhost:4200/login`

输入凭证（使用你的测试账号，例如 `admin` / `password`）

**观察浏览器控制台日志**：

应该看到以下日志序列：

```
✅ 登录成功，开始加载用户权限...
🔑 [AuthService] 保存 token 到 cookie: eyJhbGciOiJIUzI1NiIs...
✅ [AuthService] Token 保存验证: 成功
📝 [AuthService] 保存的 token: eyJhbGciOiJIUzI1NiIs...
🔍 [AuthInterceptor] 拦截请求: /api/permissions/current-user
🔑 [AuthInterceptor] Token 状态: 存在 (eyJhbGciOiJIUzI1NiIs...)
✅ [AuthInterceptor] 已添加 Authorization header
✅ 用户权限已加载并缓存: [...]
✅ 用户权限加载成功
```

**如果看到警告日志**：

```
⚠️ [AuthInterceptor] 没有 token，请求将不包含 Authorization header
```

→ **问题**：Token 没有被保存到 cookie
→ **解决方案**：检查 [DEBUG_AUTH.md](DEBUG_AUTH.md) 的 Cookie 配置部分

---

### 步骤 3: 检查浏览器 Cookie

登录成功后：

1. 打开浏览器开发工具（F12）
2. Application → Cookies → `http://localhost:4200`
3. 查找 `token` cookie

**检查项**：

- ✅ Cookie 名称: `token`
- ✅ Cookie 值: 以 `eyJ` 开头的长字符串
- ✅ Path: `/`
- ✅ SameSite: `Strict`
- ✅ Expires: 未来的时间（2小时后）

**如果 Cookie 不存在**：
→ Token 保存失败，检查浏览器安全策略

---

### 步骤 4: 手动测试带 Token 的请求

1. **从浏览器 Cookie 中复制 token 值**
2. **使用 curl 测试**：

```bash
# 替换 YOUR_TOKEN_HERE 为实际的 token
curl http://localhost:3000/api/debug/test-auth \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -v
```

**期望结果**：

```json
{
  "message": "JWT Authentication successful!",
  "user": {
    "userId": 1,
    "username": "admin",
    "email": "admin@example.com",
    "roles": ["ADMIN"],
    "permissions": ["workflow:create", ...]
  },
  "timestamp": "2024-03-02T..."
}
```

**同时检查后端终端输出**：

```
✅ JWT 认证成功！
📌 请求用户信息: { userId: 1, username: 'admin', ... }
```

#### 如果返回 401：

**后端日志可能显示**：

```
[Nest] ERROR [ExceptionsHandler] Unauthorized
```

**原因和解决方案**：

##### 原因 A: JWT_SECRET 不匹配

检查 token 生成和验证是否使用相同的 secret：

1. **创建 `.env` 文件**（如果不存在）：

```bash
# server/.env
JWT_SECRET=my-super-secret-key-12345
JWT_EXPIRES_IN=2h
```

2. **确保两处配置一致**：

```typescript
// server/src/modules/auth/auth.module.ts
JwtModule.register({
  secret: process.env.JWT_SECRET || "your-secret-key",
  signOptions: { expiresIn: "2h" },
});

// server/src/modules/auth/jwt.strategy.ts
super({
  secretOrKey: process.env.JWT_SECRET || "your-secret-key",
});
```

3. **重启后端服务器**
4. **重新登录获取新 token**

##### 原因 B: Token 格式错误

在 https://jwt.io 解码 token，检查：

- ✅ Header: `{"alg":"HS256","typ":"JWT"}`
- ✅ Payload: `{"sub":1,"username":"admin",...}`
- ✅ 签名可以被验证（输入 JWT_SECRET）

##### 原因 C: Token 过期

检查 payload 中的 `exp` 字段：

```json
{
  "sub": 1,
  "iat": 1234567890,
  "exp": 1234575090 // 检查这个时间是否已过期
}
```

如果过期，重新登录。

---

### 步骤 5: 测试 current-user API

在浏览器控制台执行（登录状态下）：

```javascript
fetch("/api/permissions/current-user", {
  headers: {
    Authorization: `Bearer ${document.cookie.split("token=")[1]?.split(";")[0]}`,
  },
})
  .then((r) => r.json())
  .then(console.log)
  .catch(console.error);
```

**期望结果**：

```json
[
  "workflow:create",
  "workflow:update",
  "workflow:delete",
  "user:view",
  "user:create",
  ...
]
```

**如果返回 401**：
→ 前往步骤 6 检查 AuthInterceptor

---

### 步骤 6: 验证 AuthInterceptor

打开 Network 选项卡，刷新页面，找到 `current-user` 请求：

**检查 Request Headers**：

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**如果没有 Authorization header**：

1. **确认 `app.config.ts` 配置**：

```typescript
(provideHttpClient(withInterceptorsFromDi()),
  {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true,
  });
```

2. **检查控制台日志**：

```
🔍 [AuthInterceptor] 拦截请求: /api/permissions/current-user
🔑 [AuthInterceptor] Token 状态: 存在 (...)
✅ [AuthInterceptor] 已添加 Authorization header
```

如果看不到这些日志 → AuthInterceptor 没有被触发

---

## 🔧 常见问题解决方案

### 问题 1: "Token 状态: 不存在"

**症状**：

```
⚠️ [AuthInterceptor] 没有 token，请求将不包含 Authorization header
```

**解决方案**：

1. 检查登录是否成功
2. 检查 `authService.saveAuth()` 是否被调用
3. 检查浏览器 Cookie 设置
4. 尝试清除所有 Cookie 后重新登录

### 问题 2: 后端持续返回 401

**症状**：

- Token 存在
- Authorization header 存在
- 但仍然返回 401

**解决方案**：

```bash
# 1. 停止后端服务器
# 2. 删除 .env 文件（如果存在）
# 3. 创建新的 .env 文件
echo "JWT_SECRET=test-secret-key-12345" > server/.env
echo "JWT_EXPIRES_IN=2h" >> server/.env

# 4. 重启后端
cd server
npm run start:dev

# 5. 清除浏览器 Cookie
# 6. 重新登录
```

### 问题 3: CORS 错误

**症状**：

```
Access to fetch at 'http://localhost:3000/api/...' from origin 'http://localhost:4200'
has been blocked by CORS policy
```

**解决方案**：
确认 `server/src/main.ts` 配置：

```typescript
app.enableCors({
  origin: "http://localhost:4200",
  credentials: true,
});
```

### 问题 4: JwtStrategy 未注册

**症状**：
后端日志显示找不到 'jwt' 策略

**解决方案**：
确认 `auth.module.ts` 配置：

```typescript
@Module({
  imports: [UsersModule, PassportModule, JwtModule.register({...})],
  providers: [AuthService, JwtStrategy],  // ← 确保包含 JwtStrategy
  exports: [AuthService],
})
```

---

## 📊 完整诊断清单

使用这个清单逐项检查：

- [ ] 后端服务器正常运行
- [ ] 登录成功（返回 access_token）
- [ ] Token 被保存到 Cookie
- [ ] Cookie 值是有效的 JWT 格式
- [ ] AuthInterceptor 正确读取 token
- [ ] Authorization header 被添加到请求
- [ ] JWT_SECRET 在前后端一致
- [ ] Token 未过期
- [ ] JwtStrategy 已注册
- [ ] JwtAuthGuard 已应用到端点
- [ ] CORS 配置正确

---

## 🆘 仍然无法解决？

提供以下信息以获得帮助：

1. **浏览器控制台完整日志**（Console 选项卡）
2. **Network 请求详情**
   - Request Headers
   - Response Status
   - Response Body
3. **Cookie 截图**（Application → Cookies）
4. **后端终端日志**
5. **Token 内容**（在 jwt.io 解码后的 JSON）

---

## ✅ 测试成功标志

当一切正常时，你应该看到：

**浏览器控制台**：

```
🔑 [AuthService] 保存 token 到 cookie: eyJhbG...
✅ [AuthService] Token 保存验证: 成功
🔍 [AuthInterceptor] 拦截请求: /api/permissions/current-user
🔑 [AuthInterceptor] Token 状态: 存在 (eyJhbG...)
✅ [AuthInterceptor] 已添加 Authorization header
✅ 用户权限已加载并缓存: [...]
```

**后端终端**：

```
✅ JWT 认证成功！
📌 从 JWT token 获取的用户 ID: 1
```

**Network 选项卡**：

- Status: `200 OK`
- Request Headers: `Authorization: Bearer eyJ...`
- Response: `["workflow:create", ...]`
