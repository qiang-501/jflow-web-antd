# 角色权限管理 API 文档

## 概述

新增了一组 API 端点，用于管理角色的权限关系。这些端点允许您对角色的权限进行添加、修改和删除操作。

## API 端点

### 1. 获取角色的所有权限

获取指定角色的所有权限列表。

**请求**

```
GET /api/roles/{role_id}/permissions
```

**路径参数**

- `role_id` (number): 角色 ID

**响应示例**

```json
[
  {
    "id": 1,
    "code": "user:view",
    "name": "查看用户",
    "type": "action",
    "description": "允许查看用户列表",
    "resource": "user",
    "action": "view",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": 2,
    "code": "user:create",
    "name": "创建用户",
    "type": "action",
    "description": "允许创建新用户",
    "resource": "user",
    "action": "create",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

**状态码**

- `200 OK`: 成功返回权限列表
- `404 Not Found`: 角色不存在

---

### 2. 添加权限到角色

向指定角色添加新的权限（保留现有权限，只添加新的）。

**请求**

```
POST /api/roles/{role_id}/permissions
```

**路径参数**

- `role_id` (number): 角色 ID

**请求体**

```json
{
  "permissionIds": [3, 4, 5]
}
```

**字段说明**

- `permissionIds` (number[]): 要添加的权限 ID 数组

**响应示例**

```json
{
  "id": 1,
  "name": "管理员",
  "code": "admin",
  "description": "系统管理员角色",
  "parentId": null,
  "level": 1,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "permissions": [
    {
      "id": 1,
      "code": "user:view",
      "name": "查看用户",
      ...
    },
    {
      "id": 2,
      "code": "user:create",
      "name": "创建用户",
      ...
    },
    {
      "id": 3,
      "code": "user:edit",
      "name": "编辑用户",
      ...
    }
  ]
}
```

**行为说明**

- 只会添加角色当前还没有的权限
- 如果某些权限已经存在，会自动跳过（避免重复）
- 返回更新后的完整角色信息，包括所有权限

**状态码**

- `200 OK`: 成功添加权限
- `404 Not Found`: 角色不存在或某些权限 ID 不存在

---

### 3. 更新角色的所有权限

替换角色的所有权限（删除旧的，设置为新的）。

**请求**

```
PUT /api/roles/{role_id}/permissions
```

**路径参数**

- `role_id` (number): 角色 ID

**请求体**

```json
{
  "permissionIds": [1, 5, 8, 10]
}
```

**字段说明**

- `permissionIds` (number[]): 新的权限 ID 数组（会替换所有现有权限）

**响应示例**

```json
{
  "id": 1,
  "name": "管理员",
  "code": "admin",
  "description": "系统管理员角色",
  "parentId": null,
  "level": 1,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "permissions": [
    {
      "id": 1,
      "code": "user:view",
      "name": "查看用户",
      ...
    },
    {
      "id": 5,
      "code": "role:manage",
      "name": "管理角色",
      ...
    },
    ...
  ]
}
```

**行为说明**

- 会完全替换角色的权限列表
- 原有的权限会被移除，只保留新指定的权限
- 如果 `permissionIds` 为空数组，会移除角色的所有权限

**状态码**

- `200 OK`: 成功更新权限
- `404 Not Found`: 角色不存在或某些权限 ID 不存在

---

### 4. 从角色删除指定权限

从角色中移除单个指定的权限。

**请求**

```
DELETE /api/roles/{role_id}/permissions/{permission_id}
```

**路径参数**

- `role_id` (number): 角色 ID
- `permission_id` (number): 要删除的权限 ID

**响应示例**

```json
{
  "id": 1,
  "name": "管理员",
  "code": "admin",
  "description": "系统管理员角色",
  "parentId": null,
  "level": 1,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "permissions": [
    {
      "id": 1,
      "code": "user:view",
      "name": "查看用户",
      ...
    }
    // permission_id 对应的权限已被移除
  ]
}
```

**状态码**

- `200 OK`: 成功删除权限
- `404 Not Found`: 角色不存在或权限不在该角色中

---

## 使用场景

### 场景 1: 为新角色分配权限

```javascript
// 1. 创建角色
const role = await axios.post("/api/roles", {
  name: "编辑员",
  code: "editor",
  description: "内容编辑员",
});

// 2. 添加权限
await axios.post(`/api/roles/${role.id}/permissions`, {
  permissionIds: [1, 2, 3, 5], // 添加查看、创建、编辑等权限
});
```

### 场景 2: 增量添加权限

```javascript
// 角色原有权限：[1, 2, 3]
// 现在想再添加权限 4 和 5
await axios.post("/api/roles/1/permissions", {
  permissionIds: [4, 5],
});
// 结果：角色拥有权限 [1, 2, 3, 4, 5]
```

### 场景 3: 重新定义角色权限

```javascript
// 角色原有权限：[1, 2, 3, 4, 5]
// 现在想完全改为只有权限 1, 6, 7
await axios.put("/api/roles/1/permissions", {
  permissionIds: [1, 6, 7],
});
// 结果：角色拥有权限 [1, 6, 7]，原有的 2, 3, 4, 5 被移除
```

### 场景 4: 移除单个权限

```javascript
// 从角色中移除权限 3
await axios.delete("/api/roles/1/permissions/3");
```

### 场景 5: 清空角色所有权限

```javascript
// 使用 PUT 方法传入空数组
await axios.put("/api/roles/1/permissions", {
  permissionIds: [],
});
// 结果：角色没有任何权限
```

---

## 错误处理

### 错误响应示例

```json
{
  "statusCode": 404,
  "message": "Role with ID 999 not found",
  "error": "Not Found"
}
```

```json
{
  "statusCode": 404,
  "message": "One or more permissions not found",
  "error": "Not Found"
}
```

```json
{
  "statusCode": 404,
  "message": "Permission 123 not found in role 1",
  "error": "Not Found"
}
```

---

## 前端集成示例

### Angular Service 示例

```typescript
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../environments/environment";

@Injectable({
  providedIn: "root",
})
export class RolePermissionService {
  private apiUrl = `${environment.apiUrl}/roles`;

  constructor(private http: HttpClient) {}

  // 获取角色权限
  getRolePermissions(roleId: number): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.apiUrl}/${roleId}/permissions`);
  }

  // 添加权限到角色
  addPermissionsToRole(roleId: number, permissionIds: number[]): Observable<Role> {
    return this.http.post<Role>(`${this.apiUrl}/${roleId}/permissions`, { permissionIds });
  }

  // 更新角色所有权限
  updateRolePermissions(roleId: number, permissionIds: number[]): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}/${roleId}/permissions`, { permissionIds });
  }

  // 删除角色的某个权限
  removePermissionFromRole(roleId: number, permissionId: number): Observable<Role> {
    return this.http.delete<Role>(`${this.apiUrl}/${roleId}/permissions/${permissionId}`);
  }
}
```

### 使用示例

```typescript
export class RoleManagementComponent {
  constructor(private rolePermissionService: RolePermissionService) {}

  async assignPermissions(roleId: number, permissionIds: number[]) {
    try {
      const updatedRole = await firstValueFrom(this.rolePermissionService.addPermissionsToRole(roleId, permissionIds));
      console.log("Permissions added:", updatedRole);
    } catch (error) {
      console.error("Failed to add permissions:", error);
    }
  }

  async replacePermissions(roleId: number, newPermissionIds: number[]) {
    try {
      const updatedRole = await firstValueFrom(this.rolePermissionService.updateRolePermissions(roleId, newPermissionIds));
      console.log("Permissions updated:", updatedRole);
    } catch (error) {
      console.error("Failed to update permissions:", error);
    }
  }

  async removePermission(roleId: number, permissionId: number) {
    try {
      const updatedRole = await firstValueFrom(this.rolePermissionService.removePermissionFromRole(roleId, permissionId));
      console.log("Permission removed:", updatedRole);
    } catch (error) {
      console.error("Failed to remove permission:", error);
    }
  }
}
```

---

## 数据库结构

### role_permissions 关联表

```sql
CREATE TABLE role_permissions (
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);
```

这是一个多对多关系的中间表：

- 一个角色可以有多个权限
- 一个权限可以属于多个角色

---

## 测试

### 使用 cURL 测试

```bash
# 1. 获取角色权限
curl http://localhost:3000/api/roles/1/permissions

# 2. 添加权限到角色
curl -X POST http://localhost:3000/api/roles/1/permissions \
  -H "Content-Type: application/json" \
  -d '{"permissionIds": [3, 4, 5]}'

# 3. 更新角色所有权限
curl -X PUT http://localhost:3000/api/roles/1/permissions \
  -H "Content-Type: application/json" \
  -d '{"permissionIds": [1, 2, 3]}'

# 4. 删除角色的某个权限
curl -X DELETE http://localhost:3000/api/roles/1/permissions/3
```

---

## 注意事项

1. **权限验证**:
   - 添加或更新权限时，系统会验证所有权限 ID 是否存在
   - 如果有任何一个权限 ID 不存在，整个操作会失败

2. **事务处理**:
   - 所有操作都是原子性的
   - 如果操作失败，不会有部分权限被修改

3. **避免重复**:
   - POST 方法会自动跳过已存在的权限
   - 不会产生重复的权限关联

4. **级联删除**:
   - 如果删除角色，其权限关联会自动清除
   - 如果删除权限，其与角色的关联也会自动清除

5. **性能考虑**:
   - 建议批量操作使用 PUT 方法
   - 避免在循环中多次调用 POST 方法

---

## 版本信息

- **版本**: 1.0.0
- **最后更新**: 2026-02-28
- **作者**: GitHub Copilot
