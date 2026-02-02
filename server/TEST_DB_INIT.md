# 数据库初始化测试指南

## 快速测试流程

### 1. 准备环境

确保已安装：
- ✅ Node.js 18+
- ✅ PostgreSQL 12+
- ✅ 已安装项目依赖 (`npm install`)

### 2. 创建测试数据库

```bash
# 连接 PostgreSQL
psql -U postgres

# 创建测试数据库
CREATE DATABASE jflow_test;

# 验证
\l

# 退出
\q
```

### 3. 配置环境变量

临时修改 `.env` 文件：
```env
DB_DATABASE=jflow_test
```

或在命令行设置：
```bash
# Windows
set DB_DATABASE=jflow_test
npm run seed

# Linux/Mac
DB_DATABASE=jflow_test npm run seed
```

### 4. 运行初始化脚本

```bash
cd server
npm run seed
```

### 5. 验证输出

应该看到以下日志：

```
Database connected
Creating database schema...
Creating ENUM types...
Synchronizing database schema...
Creating indexes...
Creating triggers...
Database schema created successfully!
Seeding permissions...
Seeding roles...
Seeding users...
Seeding form configs...
Seeding workflows...
Seeding completed successfully!

Default credentials:
Admin - username: admin, password: admin123
User - username: user1, password: user123

✅ Database seeded successfully
```

### 6. 验证数据库结构

```bash
# 连接到测试数据库
psql -U postgres -d jflow_test

# 1. 查看所有表
\dt

# 应该显示：
# users
# roles
# permissions
# user_roles
# role_permissions
# workflows
# workflow_history
# dynamic_form_configs

# 2. 查看ENUM类型
\dT

# 应该显示：
# user_status
# permission_type
# workflow_status
# workflow_priority

# 3. 查看索引
\di

# 4. 查看触发器
SELECT tgname FROM pg_trigger WHERE tgname LIKE '%updated_at%';

# 5. 验证数据
SELECT COUNT(*) FROM users;          -- 应该是 2
SELECT COUNT(*) FROM roles;          -- 应该是 2
SELECT COUNT(*) FROM permissions;    -- 应该是 11
SELECT COUNT(*) FROM workflows;      -- 应该是 3
SELECT COUNT(*) FROM dynamic_form_configs; -- 应该是 2

# 6. 查看用户详情
SELECT id, username, email, full_name, status FROM users;

# 7. 退出
\q
```

### 7. 测试API连接

启动服务器：
```bash
npm run start:dev
```

测试登录：
```bash
# Windows (PowerShell)
Invoke-RestMethod -Uri http://localhost:3000/api/auth/login -Method POST -ContentType "application/json" -Body '{"username":"admin","password":"admin123"}'

# Linux/Mac
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

应该返回包含 `access_token` 的响应。

### 8. 访问Swagger文档

浏览器打开：http://localhost:3000/api/docs

应该看到完整的API文档。

## 重置测试

### 完全重置
```bash
# 删除数据库
psql -U postgres
DROP DATABASE jflow_test;
CREATE DATABASE jflow_test;
\q

# 重新初始化
npm run seed
```

### 快速重置（保留数据库）
直接运行 seed 会自动清空并重建：
```bash
npm run seed
```

## 验证清单

- [ ] ✅ 数据库连接成功
- [ ] ✅ 8个表全部创建
- [ ] ✅ 4个ENUM类型创建
- [ ] ✅ 所有索引创建成功
- [ ] ✅ 触发器创建成功
- [ ] ✅ 2个用户插入成功
- [ ] ✅ 2个角色插入成功
- [ ] ✅ 11个权限插入成功
- [ ] ✅ 2个表单配置插入成功
- [ ] ✅ 3个工作流插入成功
- [ ] ✅ 用户角色关联正确
- [ ] ✅ 角色权限关联正确
- [ ] ✅ API服务启动成功
- [ ] ✅ 登录接口正常
- [ ] ✅ Swagger文档可访问

## 常见测试问题

### 问题1: "database does not exist"
**原因**: 未创建数据库
**解决**: 
```bash
psql -U postgres -c "CREATE DATABASE jflow_test;"
```

### 问题2: "relation already exists"
**原因**: 表已存在
**解决**: seed脚本会自动处理，如仍报错：
```bash
npm run seed  # 再次运行会自动清空重建
```

### 问题3: "type already exists"
**原因**: ENUM类型已存在
**解决**: seed脚本会自动DROP已存在的类型，无需手动处理

### 问题4: "password authentication failed"
**原因**: 密码错误
**解决**: 检查 .env 中的 DB_PASSWORD

### 问题5: seed成功但API报错
**原因**: 可能是环境变量不一致
**解决**: 确保启动API时使用相同的 .env 配置

## 性能测试

### 测试初始化速度
```bash
# Windows
Measure-Command { npm run seed }

# Linux/Mac
time npm run seed
```

正常应该在 5-10 秒完成。

### 测试数据完整性
```sql
-- 验证外键关系
SELECT 
  u.username,
  r.name as role_name
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id;

-- 验证权限分配
SELECT 
  r.name as role_name,
  p.name as permission_name,
  p.code as permission_code
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
ORDER BY r.name, p.code;

-- 验证工作流关联
SELECT 
  w.name,
  w.status,
  f.name as form_name
FROM workflows w
LEFT JOIN dynamic_form_configs f ON w.form_config_id = f.id;
```

## 自动化测试脚本

创建测试脚本 `test-db-init.sh`:

```bash
#!/bin/bash

echo "🧪 Starting database initialization test..."

# 创建测试数据库
echo "📦 Creating test database..."
psql -U postgres -c "DROP DATABASE IF EXISTS jflow_test;"
psql -U postgres -c "CREATE DATABASE jflow_test;"

# 运行seed
echo "🌱 Running seed script..."
DB_DATABASE=jflow_test npm run seed

# 验证
echo "✅ Verifying..."
psql -U postgres -d jflow_test -c "\dt" | grep -q "users" && echo "✓ Tables created"
psql -U postgres -d jflow_test -c "SELECT COUNT(*) FROM users;" | grep -q "2" && echo "✓ Users seeded"
psql -U postgres -d jflow_test -c "SELECT COUNT(*) FROM roles;" | grep -q "2" && echo "✓ Roles seeded"
psql -U postgres -d jflow_test -c "SELECT COUNT(*) FROM permissions;" | grep -q "11" && echo "✓ Permissions seeded"

echo "🎉 Test completed!"
```

使用：
```bash
chmod +x test-db-init.sh
./test-db-init.sh
```
