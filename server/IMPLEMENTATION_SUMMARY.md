# 用户权限 API 实现总结

## 📋 实现内容

### 1. 新建 API 端点

**端点**: `GET /api/permissions/current-user`

**功能**: 返回当前用户的所有权限代码列表

### 2. 代码变更

#### 后端文件

##### ✅ permissions.controller.ts

- 添加 `@Get('current-user')` 路由处理器
- 支持通过请求头 `user-id` 或查询参数 `userId` 传递用户ID
- 添加 Swagger API 文档注解
- 路由位置：在 `@Get(':id')` 之前，避免路由冲突

```typescript
@Get('current-user')
@ApiOperation({ summary: 'Get current user permissions' })
getCurrentUserPermissions(
  @Headers('user-id') userIdHeader?: string,
  @Query('userId') userIdQuery?: number,
) {
  const userId = userIdHeader ? parseInt(userIdHeader) : userIdQuery;
  return this.permissionsService.getCurrentUserPermissions(userId || 1);
}
```

##### ✅ permissions.service.ts

- 新增 `getCurrentUserPermissions(userId: number)` 方法
- 查询用户及其所有角色和权限
- 使用 Set 自动去重权限代码
- 返回字符串数组格式的权限列表

```typescript
async getCurrentUserPermissions(userId: number): Promise<string[]> {
  const user = await this.usersRepository.findOne({
    where: { id: userId },
    relations: ['roles', 'roles.permissions'],
  });

  if (!user) {
    throw new NotFoundException(`User with ID ${userId} not found`);
  }

  const permissionCodes = new Set<string>();
  for (const role of user.roles) {
    for (const permission of role.permissions) {
      if (permission.code) {
        permissionCodes.add(permission.code);
      }
    }
  }

  return Array.from(permissionCodes);
}
```

#### 前端文件

##### ✅ login.component.ts

- 导入 `PermissionService`
- 在登录成功后立即调用 `loadUserPermissions()`
- 添加错误处理，确保权限加载失败不阻止登录流程

```typescript
// 登录成功后加载权限
await firstValueFrom(this.permissionService.loadUserPermissions());
console.log("✅ 用户权限加载成功");
```

### 3. 文档

- ✅ `API_CURRENT_USER_PERMISSIONS.md` - 完整的 API 使用文档
- ✅ `test_current_user_permissions.sql` - 测试数据和验证 SQL

## 🔍 API 使用

### 请求示例

```bash
# 使用请求头
curl -X GET "http://localhost:3000/api/permissions/current-user" \
  -H "user-id: 1"

# 使用查询参数
curl -X GET "http://localhost:3000/api/permissions/current-user?userId=1"
```

### 响应示例

```json
["workflow:create", "workflow:update", "workflow:delete", "workflow:view", "workflow:change_status", "user:view", "user:create", "form:manage"]
```

## 🔄 工作流程

```
1. 前端调用 GET /api/permissions/current-user
   ↓
2. 后端查询数据库：
   - 查找用户
   - 加载用户的所有角色
   - 加载每个角色的所有权限
   ↓
3. 收集所有权限代码并去重
   ↓
4. 返回字符串数组
   ↓
5. 前端缓存到 PermissionService
   ↓
6. 指令和组件从缓存读取权限（无需再次请求）
```

## 🎯 集成点

### 应用启动时加载

```typescript
// app.config.ts
{
  provide: APP_INITIALIZER,
  useFactory: initializePermissions,
  deps: [PermissionService, AuthService],
  multi: true,
}
```

### 登录后立即加载

```typescript
// login.component.ts
await firstValueFrom(this.permissionService.loadUserPermissions());
```

### 权限检查

```typescript
// 指令中
this.permissionService.hasPermission("workflow:create").subscribe((hasPermission) => {
  /* ... */
});

// 组件中
if (await this.hasPermission("workflow", "delete")) {
  // 执行操作
}
```

## 📊 数据库关系

```
users (用户表)
  ↓ N:M
user_roles (用户角色关联表)
  ↓
roles (角色表)
  ↓ N:M
role_permissions (角色权限关联表)
  ↓
permissions (权限表)
  └─ code (权限代码，如 'workflow:create')
```

## 🧪 测试

### 插入测试数据

```bash
# 连接数据库并执行
psql -U postgres -d jflow < server/test_current_user_permissions.sql
```

### 验证 API

```bash
# 获取测试用户的权限
curl http://localhost:3000/api/permissions/current-user?userId=1
```

## ⚠️ 注意事项

### 开发环境

- 当前使用 `user-id` 请求头或 `userId` 查询参数
- 未提供用户ID时默认使用ID为1的用户

### 生产环境建议

1. **实现 JWT 认证**

   ```typescript
   @UseGuards(JwtAuthGuard)
   getCurrentUserPermissions(@Request() req) {
     return this.service.getCurrentUserPermissions(req.user.id);
   }
   ```

2. **添加缓存层**
   - 使用 Redis 缓存用户权限
   - 设置合理的过期时间
   - 权限变更时清除缓存

3. **添加速率限制**
   - 防止权限查询接口被滥用

## 📈 性能优化

✅ 已实现：

- 使用 TypeORM relations 一次性加载关联数据
- 使用 Set 去重，避免重复权限
- 前端缓存权限数据，避免重复请求

⚡ 可选优化：

- 添加 Redis 缓存（生产环境）
- 实现增量权限更新
- 使用 GraphQL 优化查询

## 🔗 相关文档

- [前端权限缓存指南](../PERMISSION_CACHE_GUIDE.md)
- [API 详细文档](./API_CURRENT_USER_PERMISSIONS.md)
- [测试 SQL 脚本](./test_current_user_permissions.sql)

## ✅ 检查清单

- [x] 创建 API 端点 `GET /api/permissions/current-user`
- [x] 实现服务层方法 `getCurrentUserPermissions()`
- [x] 添加 Swagger API 文档
- [x] 支持通过请求头和查询参数传递用户ID
- [x] 实现权限去重逻辑
- [x] 添加错误处理（用户不存在）
- [x] 前端集成：在登录后加载权限
- [x] 创建测试数据 SQL 脚本
- [x] 编写完整的 API 使用文档
- [x] 验证前后端集成无错误

## 🎉 完成

后端 API 已成功创建并集成到前端权限缓存系统！
