# API: 获取当前用户权限

## 端点信息

**URL**: `GET /api/permissions/current-user`

**描述**: 获取当前登录用户的所有权限代码列表

## 认证方式

目前支持两种方式传递用户ID（用于开发和测试）：

1. **请求头** (推荐): `user-id: <用户ID>`
2. **查询参数**: `?userId=<用户ID>`

> 注意：在生产环境中，应该从 JWT token 中自动提取用户ID，不需要手动传递。

## 请求示例

### 使用请求头

```bash
curl -X GET "http://localhost:3000/api/permissions/current-user" \
  -H "user-id: 1"
```

### 使用查询参数

```bash
curl -X GET "http://localhost:3000/api/permissions/current-user?userId=1"
```

### 默认行为（无参数）

如果既没有提供请求头也没有提供查询参数，API 将默认返回用户ID为1的权限：

```bash
curl -X GET "http://localhost:3000/api/permissions/current-user"
```

## 响应格式

### 成功响应 (200 OK)

返回一个字符串数组，包含用户所有权限的代码：

```json
["workflow:create", "workflow:update", "workflow:delete", "workflow:view", "workflow:change_status", "user:view", "user:create", "user:update", "user:delete", "role:view", "role:create", "form:manage"]
```

**字段说明**:

- 每个权限代码格式为 `<资源>:<操作>`
- 例如: `workflow:create` 表示创建工作流的权限
- 权限代码自动去重（通过 Set 处理）

### 错误响应

#### 用户不存在 (404 Not Found)

```json
{
  "statusCode": 404,
  "message": "User with ID 999 not found",
  "error": "Not Found"
}
```

## 权限来源

权限通过以下方式获取：

1. 查询用户及其关联的角色
2. 遍历每个角色的权限列表
3. 收集所有权限代码
4. 自动去重并返回

```
User (用户)
  └─> Roles (角色) [1..N]
       └─> Permissions (权限) [1..N]
            └─> code (权限代码)
```

## 前端集成

### Angular HttpClient 调用

```typescript
// permission.service.ts
getCurrentUserPermissions(): Observable<string[]> {
  return this.http.get<string[]>(`${this.apiUrl}/current-user`);
}
```

### 应用启动时加载

```typescript
// app.config.ts
{
  provide: APP_INITIALIZER,
  useFactory: (permissionService: PermissionService) => {
    return () => permissionService.loadUserPermissions();
  },
  deps: [PermissionService],
  multi: true,
}
```

### 登录后立即加载

```typescript
// login.component.ts
async login() {
  const response = await this.authService.login(credentials);
  this.authService.saveAuth(response.access_token, response.user);

  // 加载用户权限
  await firstValueFrom(this.permissionService.loadUserPermissions());

  this.router.navigate(['/']);
}
```

## 性能优化

### 服务端优化

✅ 已实现：

- 使用 TypeORM relations 一次性加载用户、角色和权限
- 使用 Set 进行去重，避免重复权限
- 添加日志记录便于调试

### 前端优化

✅ 建议：

- 使用 `BehaviorSubject` 缓存权限数据
- 只在应用启动和登录时加载一次
- 使用缓存数据进行权限检查，避免重复请求

## 数据库查询

该API执行的SQL查询（简化版）：

```sql
SELECT user.*, role.*, permission.*
FROM users user
LEFT JOIN user_roles ur ON ur.user_id = user.id
LEFT JOIN roles role ON role.id = ur.role_id
LEFT JOIN role_permissions rp ON rp.role_id = role.id
LEFT JOIN permissions permission ON permission.id = rp.permission_id
WHERE user.id = ?
```

## 调试信息

服务端会在控制台输出日志：

```
User 1 has 12 permissions: [
  'workflow:create',
  'workflow:update',
  ...
]
```

## 安全建议

⚠️ **生产环境改进**:

1. **实现JWT认证**

   ```typescript
   @UseGuards(JwtAuthGuard)
   @Get('current-user')
   getCurrentUserPermissions(@Request() req) {
     return this.permissionsService.getCurrentUserPermissions(req.user.id);
   }
   ```

2. **添加权限缓存**
   - 使用 Redis 缓存用户权限
   - 设置合理的过期时间（如 15 分钟）
   - 角色权限变更时清除相关用户缓存

3. **添加日志审计**
   - 记录权限查询日志
   - 监控异常的权限访问模式

## 测试用例

### 成功案例

```typescript
describe("GET /api/permissions/current-user", () => {
  it("应该返回用户的所有权限", async () => {
    const response = await request(app.getHttpServer()).get("/api/permissions/current-user").set("user-id", "1").expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toMatch(/^[\w]+:[\w]+$/);
  });
});
```

### 错误案例

```typescript
it("应该在用户不存在时返回404", async () => {
  await request(app.getHttpServer()).get("/api/permissions/current-user?userId=999999").expect(404);
});
```

## 相关文档

- [权限缓存指南](../PERMISSION_CACHE_GUIDE.md)
- [RBAC 实现文档](../RBAC_IMPLEMENTATION.md)
- [权限管理指南](../RBAC_GUIDE.md)

## 更新日志

### v1.0.0 (2026-03-02)

- ✅ 创建 GET `/api/permissions/current-user` 端点
- ✅ 支持通过请求头和查询参数传递用户ID
- ✅ 自动去重权限代码
- ✅ 添加详细的API文档和Swagger注解
- ✅ 添加错误处理和日志记录
