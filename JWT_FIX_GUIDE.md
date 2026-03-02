# 🔧 JWT 签名错误修复指南

## ✅ 已修复的问题

**错误**: `JsonWebTokenError: invalid signature`

**原因**: JWT token 生成和验证使用了不同的密钥

**解决方案**: 创建了统一的配置文件 `jwt.config.ts`，确保整个应用使用相同的 JWT_SECRET

---

## 📝 已修改的文件

### 1. **新建**: `server/src/modules/auth/jwt.config.ts`

- 统一管理 JWT_SECRET 和 JWT_EXPIRES_IN
- 应用启动时会打印密钥（仅用于调试）

### 2. **修改**: `server/src/modules/auth/auth.module.ts`

- 从 `jwt.config.ts` 导入 `JWT_SECRET` 和 `JWT_EXPIRES_IN`
- 移除直接读取环境变量的代码

### 3. **修改**: `server/src/modules/auth/jwt.strategy.ts`

- 从 `jwt.config.ts` 导入 `JWT_SECRET`
- 确保验证时使用相同的密钥

### 4. **修改**: `server/src/modules/auth/auth.service.ts`

- 从 `jwt.config.ts` 导入 `JWT_SECRET`
- 日志显示时使用统一的密钥

---

## 🚀 立即执行（必须！）

### 步骤 1: 重启后端服务器

```bash
cd server

# 停止当前服务器（如果正在运行）
# Ctrl+C 或 Cmd+C

# 重启服务器
npm run start:dev
```

### 步骤 2: 观察启动日志

**应该看到以下日志（在服务器启动时只出现一次）:**

```
🔑 [JWT Config] JWT_SECRET: your-secret-key
⏱️  [JWT Config] JWT_EXPIRES_IN: 2h
🔐 [JwtStrategy] 初始化 - JWT_SECRET: your-secret-key
```

**✅ 关键检查**: 这两行的密钥**必须完全相同**：

- `🔑 [JWT Config] JWT_SECRET: XXX`
- `🔐 [JwtStrategy] 初始化 - JWT_SECRET: XXX`

如果相同，说明配置正确！

---

### 步骤 3: 清除浏览器所有 Cookie

**重要**: 旧的 token 是用错误的密钥生成的，必须清除

**方法 1 - 浏览器开发工具**:

1. 按 F12 打开开发工具
2. Application → Storage → Clear site data
3. 刷新页面

**方法 2 - 浏览器控制台**:

```javascript
// 在浏览器控制台执行
document.cookie.split(";").forEach((c) => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
location.reload();
```

---

### 步骤 4: 重新登录

1. 访问登录页面: `http://localhost:4200/login`
2. 输入用户名和密码
3. 点击登录

**观察后端日志**:

```
🔑 [AuthService.login] JWT_SECRET 使用的密钥: your-secret-key
📦 [AuthService.login] Token payload: { sub: 1, username: 'admin', ... }
✅ [AuthService.login] Token 生成成功: eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

**观察浏览器控制台**:

```
🔑 [AuthService] 保存 token 到 cookie: eyJhbGciOiJIUzI1NiIs...
✅ [AuthService] Token 保存验证: 成功
```

---

### 步骤 5: 验证认证成功

登录后，后端应该显示：

```
🛡️ [JwtAuthGuard] 收到请求: /api/permissions/current-user
🔑 [JwtAuthGuard] Authorization header: Bearer eyJhbGciOiJIUzI1NiIsInR...
✅ [JwtStrategy.validate] JWT 验证成功
📦 [JwtStrategy.validate] Payload: { sub: 1, username: 'admin', ... }
👤 [JwtStrategy.validate] 返回用户信息: { userId: 1, username: 'admin', ... }
✅ [JwtAuthGuard] 认证成功, 用户: admin
📌 从 JWT token 获取的用户 ID: 1
```

**✅ 如果看到以上完整日志 → 修复成功！**

---

## 🔐 （可选）设置自定义 JWT 密钥

如果你想使用自定义密钥而不是默认的 `your-secret-key`:

### 创建 `.env` 文件

```bash
# 在 server 目录下创建
cd server
touch .env
```

### 添加配置

```bash
# server/.env
JWT_SECRET=my-super-secret-key-change-this-in-production-12345
JWT_EXPIRES_IN=2h
```

**⚠️ 重要提示**:

1. 修改密钥后**必须重启服务器**
2. 必须**清除浏览器 Cookie**
3. 必须**重新登录**

**生产环境建议**:

- 使用至少 32 个字符的随机字符串
- 不要在代码中硬编码密钥
- 使用环境变量或密钥管理服务

---

## 🧪 测试命令

### 测试登录并获取 token

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your_password"}' \
  -v
```

**期望响应**:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### 测试受保护的端点

```bash
# 替换 YOUR_TOKEN 为上面获取的 access_token
curl http://localhost:3000/api/permissions/current-user \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -v
```

**期望响应**: HTTP 200 + 权限数组

```json
["workflow:create", "workflow:update", ...]
```

---

## ❌ 如果仍然失败

### 诊断检查清单

检查后端启动时的这两行日志：

```
🔑 [JWT Config] JWT_SECRET: ???
🔐 [JwtStrategy] 初始化 - JWT_SECRET: ???
```

#### 场景 A: 两个密钥不同

```
🔑 [JWT Config] JWT_SECRET: my-custom-key
🔐 [JwtStrategy] 初始化 - JWT_SECRET: your-secret-key
```

**说明**: 环境变量读取有问题

**解决**:

1. 检查 `.env` 文件是否在正确位置 (`server/.env`)
2. 确保 `.env` 文件格式正确（无 BOM、无多余空格）
3. 完全停止服务器后重新启动
4. 尝试删除 `.env` 文件，使用默认值

#### 场景 B: 登录成功但访问 API 仍然 401

**检查登录时的日志**:

```
🔑 [AuthService.login] JWT_SECRET 使用的密钥: XXX
```

**检查访问 API 时的错误日志**:

```
❌ [JwtAuthGuard] 认证失败
📋 错误信息: invalid signature
```

**说明**: 使用了旧的 token

**解决**: 清除 Cookie 后重新登录

#### 场景 C: 看不到任何 JWT Config 日志

**说明**: 配置文件未被加载

**解决**:

1. 确认文件存在: `server/src/modules/auth/jwt.config.ts`
2. 重启 TypeScript 编译器
3. 完全重启服务器

---

## 📊 成功的完整日志示例

**服务器启动时**:

```
[Nest] Starting Nest application...
🔑 [JWT Config] JWT_SECRET: your-secret-key
⏱️  [JWT Config] JWT_EXPIRES_IN: 2h
🔐 [JwtStrategy] 初始化 - JWT_SECRET: your-secret-key
[Nest] ApplicationModule dependencies initialized
```

**登录时**:

```
🔑 [AuthService.login] JWT_SECRET 使用的密钥: your-secret-key
📦 [AuthService.login] Token payload: { sub: 1, username: 'admin', email: 'admin@example.com', roles: ['ADMIN'], permissions: [...] }
✅ [AuthService.login] Token 生成成功: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**访问 API 时**:

```
🛡️ [JwtAuthGuard] 收到请求: /api/permissions/current-user
🔑 [JwtAuthGuard] Authorization header: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
✅ [JwtStrategy.validate] JWT 验证成功
📦 [JwtStrategy.validate] Payload: { sub: 1, username: 'admin', email: 'admin@example.com', roles: ['ADMIN'], permissions: [...], iat: 1709380800, exp: 1709388000 }
👤 [JwtStrategy.validate] 返回用户信息: { userId: 1, username: 'admin', email: 'admin@example.com', roles: ['ADMIN'], permissions: [...] }
✅ [JwtAuthGuard] 认证成功, 用户: admin
📌 从 JWT token 获取的用户 ID: 1
```

---

## ✨ 总结

**修复方式**:

- ✅ 创建统一的 JWT 配置文件
- ✅ 所有模块从同一个地方导入密钥
- ✅ 添加详细日志便于调试

**必须执行**:

1. ✅ 重启后端服务器
2. ✅ 清除浏览器 Cookie
3. ✅ 重新登录

**验证成功标志**:

- ✅ 启动时两个密钥日志相同
- ✅ 登录成功获得 token
- ✅ 访问 API 看到完整的验证成功日志

如果按照以上步骤操作后仍有问题，请提供完整的后端日志输出！
