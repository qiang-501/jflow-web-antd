# JWT 认证问题诊断指南

## 当前添加的调试日志

### 1. Token 生成日志 (AuthService.login)

```
🔑 [AuthService.login] JWT_SECRET 使用的密钥: your-secret-key
📦 [AuthService.login] Token payload: { sub: 1, username: 'admin', ... }
✅ [AuthService.login] Token 生成成功: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Strategy 初始化日志 (JwtStrategy)

```
🔐 [JwtStrategy] 初始化 - JWT_SECRET: your-secret-key
```

### 3. Token 验证日志 (JwtStrategy.validate)

```
✅ [JwtStrategy.validate] JWT 验证成功
📦 [JwtStrategy.validate] Payload: { sub: 1, username: 'admin', ... }
👤 [JwtStrategy.validate] 返回用户信息: { userId: 1, username: 'admin', ... }
```

### 4. Guard 检查日志 (JwtAuthGuard)

```
🛡️ [JwtAuthGuard] 收到请求: /api/permissions/current-user
🔑 [JwtAuthGuard] Authorization header: Bearer eyJhbGciOiJIUzI1NiIsInR...
✅ [JwtAuthGuard] 认证成功, 用户: admin
```

## 诊断步骤

### 步骤 1: 重启后端服务器

```bash
cd server
npm run start:dev
```

**观察启动日志，查找：**

```
🔐 [JwtStrategy] 初始化 - JWT_SECRET: your-secret-key
```

**检查项：**

- ✅ 如果显示 `your-secret-key` → 使用默认密钥
- ✅ 如果显示其他值 → 使用了环境变量中的密钥

---

### 步骤 2: 执行登录请求

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your_password"}' \
  -v
```

**观察后端日志：**

#### 成功的日志应该显示：

```
🔑 [AuthService.login] JWT_SECRET 使用的密钥: your-secret-key
📦 [AuthService.login] Token payload: { sub: 1, username: 'admin', email: '...', roles: [...], permissions: [...] }
✅ [AuthService.login] Token 生成成功: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 关键检查：

1. **密钥一致性**：登录时使用的密钥应与 Strategy 初始化时的密钥相同
2. **Payload 完整性**：确保包含 `sub`、`username`、`email`、`roles`、`permissions`

**响应应该包含：**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

---

### 步骤 3: 使用 Token 访问受保护的端点

```bash
# 将 YOUR_TOKEN 替换为步骤 2 获取的 access_token
curl http://localhost:3000/api/permissions/current-user \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -v
```

**观察后端日志：**

#### 🎯 成功的完整日志序列：

```
🛡️ [JwtAuthGuard] 收到请求: /api/permissions/current-user
🔑 [JwtAuthGuard] Authorization header: Bearer eyJhbGciOiJIUzI1NiIsInR...
✅ [JwtStrategy.validate] JWT 验证成功
📦 [JwtStrategy.validate] Payload: { sub: 1, username: 'admin', email: 'admin@example.com', roles: ['ADMIN'], permissions: [...], iat: 1234567890, exp: 1234575090 }
👤 [JwtStrategy.validate] 返回用户信息: { userId: 1, username: 'admin', email: 'admin@example.com', roles: ['ADMIN'], permissions: [...] }
✅ [JwtAuthGuard] 认证成功, 用户: admin
📌 从 JWT token 获取的用户 ID: 1
```

#### ❌ 失败场景分析：

**场景 A: 缺少 Authorization header**

```
🛡️ [JwtAuthGuard] 收到请求: /api/permissions/current-user
🔑 [JwtAuthGuard] Authorization header: 不存在
❌ [JwtAuthGuard] 缺少 Authorization header
```

**原因**：前端没有发送 token
**解决**：检查 AuthInterceptor 是否正常工作

---

**场景 B: Header 格式错误**

```
🛡️ [JwtAuthGuard] 收到请求: /api/permissions/current-user
🔑 [JwtAuthGuard] Authorization header: eyJhbGciOiJIUzI1NiIsInR5cCI6Ik...
❌ [JwtAuthGuard] Authorization header 格式错误，必须以 "Bearer " 开头
```

**原因**：token 前面缺少 "Bearer " 前缀
**解决**：确保发送 `Authorization: Bearer <token>`

---

**场景 C: JWT 签名验证失败**

```
🛡️ [JwtAuthGuard] 收到请求: /api/permissions/current-user
🔑 [JwtAuthGuard] Authorization header: Bearer eyJhbGciOiJIUzI1NiIsInR...
❌ [JwtAuthGuard] 认证失败
📋 错误信息: invalid signature
📋 详细信息: { name: 'JsonWebTokenError', message: 'invalid signature' }
```

**原因**：JWT_SECRET 不匹配
**解决方案**：

1. **比较两处日志中的密钥：**
   - 登录时：`🔑 [AuthService.login] JWT_SECRET 使用的密钥: XXX`
   - 初始化时：`🔐 [JwtStrategy] 初始化 - JWT_SECRET: XXX`
2. **如果密钥不同**，检查以下文件：

   ```typescript
   // server/src/modules/auth/auth.module.ts
   JwtModule.register({
     secret: process.env.JWT_SECRET || "your-secret-key",
   });

   // server/src/modules/auth/jwt.strategy.ts
   super({
     secretOrKey: process.env.JWT_SECRET || "your-secret-key",
   });
   ```

3. **统一密钥方法**：

   ```bash
   # 删除 .env 文件（如果存在）
   rm server/.env

   # 或者创建统一的 .env
   echo "JWT_SECRET=my-super-secret-key-12345" > server/.env
   echo "JWT_EXPIRES_IN=2h" >> server/.env
   ```

4. **重启服务器**
5. **重新登录获取新 token**

---

**场景 D: Token 过期**

```
🛡️ [JwtAuthGuard] 收到请求: /api/permissions/current-user
🔑 [JwtAuthGuard] Authorization header: Bearer eyJhbGciOiJIUzI1NiIsInR...
❌ [JwtAuthGuard] 认证失败
📋 错误信息: jwt expired
📋 详细信息: { name: 'TokenExpiredError', message: 'jwt expired', expiredAt: '2024-03-02T10:00:00.000Z' }
```

**原因**：token 已超过有效期（默认 2 小时）
**解决**：重新登录获取新 token

---

**场景 E: Token 格式错误**

```
🛡️ [JwtAuthGuard] 收到请求: /api/permissions/current-user
🔑 [JwtAuthGuard] Authorization header: Bearer invalid-token
❌ [JwtAuthGuard] 认证失败
📋 错误信息: jwt malformed
📋 详细信息: { name: 'JsonWebTokenError', message: 'jwt malformed' }
```

**原因**：token 不是有效的 JWT 格式
**解决**：检查 token 是否被截断或损坏

---

## 快速修复步骤

### 🔧 如果遇到 "invalid signature" 错误：

```bash
# 1. 停止服务器 (Ctrl+C)

# 2. 确保没有环境变量干扰
cd server

# 3. 删除可能存在的 .env 文件
rm .env 2>/dev/null || true

# 4. 重启服务器
npm run start:dev

# 5. 在浏览器清除 Cookie

# 6. 重新登录
```

### 🔑 设置自定义密钥：

```bash
# server/.env
JWT_SECRET=my-custom-secret-key-change-in-production
JWT_EXPIRES_IN=2h
```

**重要**：修改密钥后必须重启服务器并重新登录！

---

## 验证 Token 内容

使用 [jwt.io](https://jwt.io) 解码 token：

### 1. 复制 access_token

### 2. 访问 https://jwt.io

### 3. 粘贴 token

**检查 Header：**

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**检查 Payload：**

```json
{
  "sub": 1,
  "username": "admin",
  "email": "admin@example.com",
  "roles": ["ADMIN"],
  "permissions": ["workflow:create", "workflow:update", ...],
  "iat": 1234567890,
  "exp": 1234575090
}
```

**验证签名：**

- 在 "Verify Signature" 处输入密钥（例如：`your-secret-key`）
- 应该显示 "Signature Verified" ✅

---

## 常见问题总结

| 错误信息                            | 原因                | 解决方案                       |
| ----------------------------------- | ------------------- | ------------------------------ |
| Missing authorization header        | 前端未发送 token    | 检查 AuthInterceptor           |
| Invalid authorization header format | 缺少 "Bearer " 前缀 | 确保格式为 `Bearer <token>`    |
| invalid signature                   | JWT_SECRET 不匹配   | 统一密钥，重启服务器，重新登录 |
| jwt expired                         | Token 过期          | 重新登录                       |
| jwt malformed                       | Token 格式错误      | 检查 token 完整性              |

---

## 测试清单

- [ ] 后端服务器已重启
- [ ] 看到 JwtStrategy 初始化日志
- [ ] 登录成功，获得 access_token
- [ ] 登录日志显示正确的密钥
- [ ] JWT_SECRET 在两处一致
- [ ] Token 在 jwt.io 可以成功解码
- [ ] 签名验证通过
- [ ] Token 未过期
- [ ] 使用 token 访问受保护端点成功
- [ ] 看到完整的验证成功日志

---

## 仍然有问题？

请提供以下信息：

1. **后端完整日志**（从启动到请求失败的所有日志）
2. **登录时的日志**（包括密钥信息）
3. **认证失败时的日志**（包括错误详情）
4. **Token 内容**（在 jwt.io 解码后）
5. **是否使用了 .env 文件**
6. **.env 文件内容**（如果有）

完整的日志序列应该能清楚地显示问题所在！
