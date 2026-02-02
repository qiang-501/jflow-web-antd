# 数据库自动初始化功能说明

## 功能概述

已将数据库 schema 创建脚本整合到 `run-seed.ts` 中，现在运行 `npm run seed` 会自动：

1. ✅ 创建所有 ENUM 类型
2. ✅ 创建所有数据表
3. ✅ 创建所有索引
4. ✅ 创建自动更新 updated_at 的触发器
5. ✅ 插入初始测试数据

## 核心改动

### 1. run-seed.ts 增强

**位置**: `server/src/database/seeds/run-seed.ts`

**新增功能**:
- 自动删除并重建 ENUM 类型
- 使用 TypeORM synchronize 创建表结构
- 自动创建所有必要的索引
- 创建 PostgreSQL 触发器函数和触发器
- 完整的日志输出

**关键代码**:
```typescript
// 创建 ENUM 类型
await dataSource.query(`CREATE TYPE user_status AS ENUM ('active', 'inactive', 'locked')`);

// 同步表结构
await dataSource.synchronize(true); // true = drop existing first

// 创建索引
await dataSource.query('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)');

// 创建触发器
await dataSource.query(`CREATE OR REPLACE FUNCTION update_updated_at_column()...`);
```

### 2. 使用方式简化

**之前**:
```bash
# 步骤1: 手动运行SQL
psql -U postgres -d jflow -f src/database/schema.sql

# 步骤2: 运行seed
npm run seed
```

**现在**:
```bash
# 一步完成
npm run seed
```

### 3. 文档更新

新增和更新的文档：

- ✅ `DATABASE_INIT.md` - 详细的数据库初始化说明
- ✅ `TEST_DB_INIT.md` - 测试验证指南
- ✅ `README.md` - 更新数据库设置说明
- ✅ `QUICK_START.md` - 简化启动流程
- ✅ `POSTGRESQL_GUIDE.md` - PostgreSQL安装配置指南

## 执行流程

```
npm run seed
    ↓
连接数据库
    ↓
删除旧的 ENUM 类型
    ↓
创建新的 ENUM 类型
    ↓
同步表结构（删除并重建）
    ↓
创建索引
    ↓
创建触发器
    ↓
插入初始数据
    ↓
完成
```

## 创建的数据库对象

### ENUM 类型 (4个)
- `user_status`: 用户状态
- `permission_type`: 权限类型
- `workflow_status`: 工作流状态
- `workflow_priority`: 工作流优先级

### 数据表 (8个)
1. `users` - 用户表
2. `roles` - 角色表
3. `permissions` - 权限表
4. `user_roles` - 用户角色关联
5. `role_permissions` - 角色权限关联
6. `workflows` - 工作流表
7. `workflow_history` - 工作流历史
8. `dynamic_form_configs` - 动态表单配置

### 索引 (17个)
- users: username, email, status
- roles: code, parent_id
- permissions: code, type, resource
- dynamic_form_configs: name, active
- workflows: d_workflow_id, status, priority, created_by, assigned_to
- workflow_history: workflow_id, created_at

### 触发器 (5个)
所有主表的 `updated_at` 自动更新触发器

### 初始数据
- 2 个用户
- 2 个角色
- 11 个权限
- 2 个表单配置
- 3 个工作流示例

## 优势

### ✅ 开发效率提升
- 一键初始化，无需手动执行多个命令
- 自动处理依赖关系
- 完整的日志输出，便于调试

### ✅ 一致性保证
- 代码和数据库结构同步
- 避免手动SQL脚本过时
- TypeORM entities 作为唯一数据源

### ✅ 易于维护
- 修改 entity 后自动同步
- 集中式管理
- 版本控制友好

### ✅ 测试友好
- 快速创建测试数据库
- 可重复执行
- 清空重建功能

## 使用场景

### ✅ 适用场景
1. **本地开发环境** - 快速搭建开发环境
2. **CI/CD测试** - 自动化测试数据库
3. **演示环境** - 快速重置演示数据
4. **首次部署** - 生产环境首次初始化

### ⚠️ 不适用场景
1. **生产环境数据迁移** - 会删除所有数据
2. **已有数据的数据库** - 会清空现有数据
3. **需要保留历史数据** - 使用 TypeORM migrations

## 生产环境注意事项

### ⚠️ 危险操作警告

seed 脚本会执行以下**破坏性操作**：
- `DROP TYPE ... CASCADE` - 删除ENUM类型及依赖
- `dataSource.synchronize(true)` - 删除并重建所有表
- 清空所有数据

### 生产环境替代方案

**方案1**: 仅首次部署使用
```bash
# 首次部署时运行
npm run seed

# 后续使用 migrations
npm run typeorm migration:generate
npm run typeorm migration:run
```

**方案2**: 手动执行SQL
```bash
psql -U postgres -d jflow_prod -f src/database/schema.sql
# 手动插入必要的初始数据
```

**方案3**: 分离schema和数据
```typescript
// 创建专门的 create-schema.ts
// 只创建结构，不插入数据
```

## 回滚方案

如果误执行了 seed 导致数据丢失：

### 有备份
```bash
psql -U postgres jflow < backup.sql
```

### 无备份
数据无法恢复，只能重建：
```bash
npm run seed  # 重新创建结构和测试数据
```

## 扩展功能

### 添加新表
1. 创建 entity 文件
2. 添加到 `dataSource.entities`
3. 运行 `npm run seed` 自动创建

### 修改表结构
1. 修改 entity 文件
2. 运行 `npm run seed` 自动同步

### 添加初始数据
在 `run-seed.ts` 中添加数据插入代码

## 常见问题

**Q: 每次运行都会删除数据吗？**
A: 是的，seed 脚本会清空并重建数据库。

**Q: 如何只创建结构不插入数据？**
A: 注释掉 seed 脚本中的数据插入部分，或使用 schema.sql。

**Q: 可以增量更新吗？**
A: 不可以，seed 是全量重建。增量更新请使用 TypeORM migrations。

**Q: 生产环境可以用吗？**
A: 仅首次部署可以，后续禁止使用，改用 migrations。

**Q: 如何自定义初始数据？**
A: 修改 `run-seed.ts` 中的数据插入代码。

## 相关文档

- [DATABASE_INIT.md](DATABASE_INIT.md) - 详细初始化说明
- [TEST_DB_INIT.md](TEST_DB_INIT.md) - 测试验证指南
- [POSTGRESQL_GUIDE.md](POSTGRESQL_GUIDE.md) - PostgreSQL指南
- [README.md](README.md) - 项目总览
- [QUICK_START.md](QUICK_START.md) - 快速启动

## 总结

这次改动将数据库初始化流程简化为一条命令，大大提升了开发效率。同时保留了手动SQL脚本作为备选方案，兼顾了灵活性和安全性。

**核心原则**: 
- 开发环境追求效率 → 使用 seed 脚本
- 生产环境追求安全 → 使用 migrations 或手动SQL
