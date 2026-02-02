# 数据库初始化说明

## 开发环境快速启动

### 1. 创建空数据库
```bash
psql -U postgres
CREATE DATABASE jflow;
\q
```

### 2. 运行自动初始化
```bash
cd server
npm run seed
```

seed 脚本会自动完成以下操作：
1. ✅ 删除并重建所有 ENUM 类型
2. ✅ 创建所有数据表（users, roles, permissions, workflows等）
3. ✅ 创建所有索引（username, email, status等）
4. ✅ 创建自动更新 updated_at 的触发器
5. ✅ 插入初始数据（管理员账号、权限、示例工作流等）

### 3. 验证结果
```bash
# 连接数据库
psql -U postgres -d jflow

# 查看所有表
\dt

# 查看用户数据
SELECT * FROM users;

# 退出
\q
```

## 生产环境部署

**⚠️ 警告**: seed 脚本会清空并重建整个数据库！

### 方案一：首次部署（推荐）

1. 创建数据库
```bash
psql -U postgres
CREATE DATABASE jflow_prod;
\q
```

2. 修改环境变量
```env
DB_DATABASE=jflow_prod
NODE_ENV=production
```

3. 运行初始化
```bash
npm run seed
```

### 方案二：仅创建结构（不插入数据）

1. 使用 SQL 脚本
```bash
psql -U postgres -d jflow_prod -f src/database/schema.sql
```

2. 手动创建管理员账号或自定义初始数据

### 方案三：现有数据库迁移

如果数据库已有数据，**不要运行 seed 脚本**！

使用 TypeORM migrations：
```bash
# 生成迁移文件
npm run typeorm migration:generate -- -n UpdateSchema

# 运行迁移
npm run typeorm migration:run
```

## Schema 创建详情

### ENUM 类型
- `user_status`: active, inactive, locked
- `permission_type`: menu, action, api
- `workflow_status`: draft, pending, in_progress, completed, rejected, cancelled
- `workflow_priority`: low, medium, high, urgent

### 数据表
1. **users** - 用户表
   - 索引: username, email, status
   - 触发器: auto update updated_at

2. **roles** - 角色表
   - 索引: code, parent_id
   - 支持层级结构
   - 触发器: auto update updated_at

3. **permissions** - 权限表
   - 索引: code, type, resource
   - 触发器: auto update updated_at

4. **user_roles** - 用户角色关联表
   - 多对多关系

5. **role_permissions** - 角色权限关联表
   - 多对多关系

6. **workflows** - 工作流表
   - 索引: d_workflow_id, status, priority, created_by, assigned_to
   - 触发器: auto update updated_at

7. **workflow_history** - 工作流历史表
   - 索引: workflow_id, created_at

8. **dynamic_form_configs** - 动态表单配置表
   - 索引: name, active
   - 触发器: auto update updated_at

### 触发器
所有主表都配置了自动更新 `updated_at` 字段的触发器：
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';
```

## 初始数据

运行 seed 后会创建：

### 用户（2个）
- **admin** (密码: admin123) - 超级管理员
- **user1** (密码: user123) - 普通用户

### 角色（2个）
- **super_admin** - 拥有所有权限
- **user** - 基础权限

### 权限（11个）
- user:create, user:edit, user:delete, user:view
- role:manage
- permission:manage
- workflow:create, workflow:edit, workflow:delete, workflow:view
- form:manage

### 表单配置（2个）
- 请假申请表
- 采购申请表

### 工作流实例（3个）
- 张三请假申请（pending）
- 办公用品采购（in_progress）
- 李四病假申请（completed）

## 重置数据库

如需完全重置数据库：

```bash
# 删除数据库
psql -U postgres
DROP DATABASE jflow;
CREATE DATABASE jflow;
\q

# 重新初始化
cd server
npm run seed
```

或者直接重新运行 seed（会自动清空重建）：
```bash
npm run seed
```

## 备份与恢复

### 备份
```bash
# 备份整个数据库
pg_dump -U postgres jflow > backup.sql

# 仅备份数据
pg_dump -U postgres --data-only jflow > data-backup.sql
```

### 恢复
```bash
# 恢复数据库
psql -U postgres jflow < backup.sql
```

## 常见问题

### Q: seed 脚本报错 "database does not exist"
A: 先手动创建数据库：
```bash
psql -U postgres -c "CREATE DATABASE jflow;"
```

### Q: seed 脚本报错 "type already exists"
A: 脚本会自动删除已存在的类型，如仍报错，可手动清理：
```bash
psql -U postgres -d jflow
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
\q
npm run seed
```

### Q: 如何只更新数据不重建表？
A: 修改 run-seed.ts，注释掉 schema 创建部分，只保留数据插入代码。

### Q: 生产环境可以用 seed 吗？
A: **不推荐**！seed 会清空数据库。生产环境应使用 migrations 或手动 SQL 脚本。

## 注意事项

1. ⚠️ seed 脚本会**删除所有现有数据**
2. ✅ 适合开发环境快速初始化
3. ⚠️ 生产环境首次部署可用，后续禁止使用
4. ✅ ENUM 类型变更需要手动处理
5. ✅ 所有密码都经过 bcrypt 加密
