# 登录与权限验证功能说明

## 功能概述

已成功实现：

1. ✅ 后端权限检查 API (`POST /permissions/check`)
2. ✅ 前端登录页面
3. ✅ HTTP 拦截器自动处理权限错误
4. ✅ 自动跳转到登录页面

---

## 后端 API

### 权限检查接口

**接口地址**: `POST /permissions/check`

**请求体**:

```json
{
  "code": "workflow:update",
  "userId": 1
}
```

**参数说明**:

- `code` (必填): 权限代码，例如 `"workflow:update"`, `"user:create"`, `"menu:read"` 等
- `userId` (可选): 用户 ID，如果不提供则只检查权限是否存在

**响应示例**:

成功 (200):

```json
{
  "hasPermission": true,
  "message": "User has permission 'workflow:update'"
}
```

权限不足 (403):

```json
{
  "statusCode": 403,
  "message": "User does not have permission 'workflow:update'",
  "error": "Forbidden"
}
```

权限不存在 (404):

```json
{
  "statusCode": 404,
  "message": "Permission with code 'invalid:code' not found",
  "error": "Not Found"
}
```

### 使用示例

```bash
# 检查用户是否有权限
curl -X POST http://localhost:3000/permissions/check \
  -H "Content-Type: application/json" \
  -d '{"code": "workflow:update", "userId": 1}'

# 只检查权限是否存在
curl -X POST http://localhost:3000/permissions/check \
  -H "Content-Type: application/json" \
  -d '{"code": "workflow:update"}'
```

---

## 前端功能

### 1. 登录页面

**路由**: `/login`

**位置**: `src/app/features/login/`

**功能特性**:

- 用户名和密码验证
- 表单验证（密码至少6位）
- 加载状态显示
- 错误提示
- 登录成功后自动跳转
- 保存登录前的页面，登录后返回

**默认账号**:

- 管理员: `admin` / `admin123`
- 普通用户: `user1` / `user123`

**访问方式**:

```
http://localhost:4200/login
```

### 2. HTTP 权限拦截器

**位置**: `src/app/core/interceptors/auth.interceptor.ts`

**功能**:

1. **自动添加 Token**: 每个 HTTP 请求自动添加 `Authorization` 头
2. **401 错误处理**:
   - 清除本地 token 和用户信息
   - 保存当前页面路径
   - 自动跳转到登录页
3. **403 错误处理**:
   - 权限不足时跳转到登录页
   - 提示用户权限不足

**工作流程**:

```
API 请求 → 拦截器添加 Token → 后端验证
                                  ↓
                          401/403 错误
                                  ↓
                  清除本地数据 + 跳转登录页
```

### 3. 登录流程

```
1. 用户访问需要权限的页面
   ↓
2. 未登录或 Token 无效 → 后端返回 401
   ↓
3. 拦截器捕获 401 错误
   ↓
4. 保存当前路径到 localStorage
   ↓
5. 跳转到登录页 (/login)
   ↓
6. 用户输入用户名和密码
   ↓
7. 登录成功获取 Token
   ↓
8. 保存 Token 和用户信息到 localStorage
   ↓
9. 跳转回之前保存的页面
```

---

## 本地存储

登录成功后，以下信息存储在 `localStorage`:

- `token`: JWT 访问令牌
- `user`: 用户信息 JSON
- `returnUrl`: 登录前尝试访问的页面（临时）

---

## 集成测试

### 1. 测试权限检查 API

```bash
# 启动后端
cd server
npm run start:dev

# 测试 API
curl -X POST http://localhost:3000/permissions/check \
  -H "Content-Type: application/json" \
  -d '{"code": "workflow:update", "userId": 1}'
```

### 2. 测试前端登录

```bash
# 启动前端
ng serve

# 访问浏览器
# 1. 打开 http://localhost:4200
# 2. 会自动跳转到 http://localhost:4200/login
# 3. 输入: admin / admin123
# 4. 登录成功后跳转到首页
```

### 3. 测试权限拦截

```typescript
// 在前端代码中调用需要权限的 API
this.http
  .post("/api/permissions/check", {
    code: "workflow:update",
    userId: 1,
  })
  .subscribe({
    next: (res) => console.log("有权限", res),
    error: (err) => {
      // 如果是 403，会自动跳转到登录页
      console.error("权限错误", err);
    },
  });
```

---

## 环境配置

确保 `environment.development.ts` 配置正确：

```typescript
export const environment = {
  production: false,
  apiUrl: "http://localhost:4200/api",
  useMockData: false, // 设为 false 使用真实 API
};
```

确保 `proxy.conf.json` 配置正确：

```json
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true,
    "pathRewrite": {
      "^/api": ""
    }
  }
}
```

---

## 常见问题

### Q1: 登录后仍然跳转到登录页？

**A**: 检查以下内容：

1. 后端是否正常返回 token
2. localStorage 是否正确保存 token
3. 浏览器控制台是否有错误

### Q2: API 调用 404 错误？

**A**: 确保：

1. 后端服务已启动 (npm run start:dev)
2. proxy.conf.json 配置正确
3. Angular 使用 `ng serve` 启动

### Q3: CORS 错误？

**A**: NestJS 已默认启用 CORS，如果仍有问题：

1. 检查 main.ts 中 `app.enableCors()` 是否调用
2. 确认使用 proxy 代理而非直接访问 http://localhost:3000

### Q4: Token 过期怎么办？

**A**: 当前实现会自动跳转到登录页，可以扩展：

- 添加 token 刷新机制
- 添加 token 过期时间检查
- 实现自动续期功能

---

## 扩展功能

可以进一步添加：

1. **记住密码**: 使用 localStorage 保存用户名
2. **路由守卫**: 添加 CanActivate 守卫保护路由
3. **Token 刷新**: 实现 token 自动刷新机制
4. **权限指令**: 创建 `*hasPermission` 指令控制元素显示
5. **多角色支持**: 基于角色动态显示菜单
6. **SSO 集成**: 集成单点登录系统

---

## API 文档

完整的 API 文档可通过 Swagger 访问：

```
http://localhost:3000/api/docs
```

在 Swagger UI 中可以直接测试 `POST /permissions/check` 接口。
