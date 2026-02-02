# PostgreSQL 安装与配置指南

## Windows 安装

### 1. 下载 PostgreSQL
访问官网下载：https://www.postgresql.org/download/windows/

推荐使用 PostgreSQL 12 或更高版本。

### 2. 安装步骤
1. 运行安装程序
2. 选择安装路径
3. 选择组件（全部勾选）
4. 设置数据目录
5. **设置超级用户密码**（请记住这个密码）
6. 设置端口（默认 5432）
7. 选择区域设置（默认）
8. 完成安装

### 3. 验证安装
打开命令行，输入：
```bash
psql --version
```

## 创建数据库

### 方法 1: 使用 pgAdmin（图形界面）
1. 打开 pgAdmin
2. 连接到 PostgreSQL 服务器
3. 右键 "Databases" → "Create" → "Database"
4. 输入数据库名：`jflow`
5. 点击 "Save"

### 方法 2: 使用命令行
```bash
# 连接到 PostgreSQL
psql -U postgres

# 创建数据库
CREATE DATABASE jflow;

# 查看数据库
\l

# 退出
\q
```

## 配置环境变量

编辑 `.env` 文件：
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=你安装时设置的密码
DB_DATABASE=jflow
```

## 常用 PostgreSQL 命令

### 连接数据库
```bash
psql -U postgres -d jflow
```

### 数据库管理
```sql
-- 列出所有数据库
\l

-- 连接到数据库
\c jflow

-- 列出所有表
\dt

-- 查看表结构
\d users

-- 查看表数据
SELECT * FROM users;

-- 退出
\q
```

### 用户管理
```sql
-- 创建新用户
CREATE USER jflow_user WITH PASSWORD 'password';

-- 授权
GRANT ALL PRIVILEGES ON DATABASE jflow TO jflow_user;

-- 授予表权限
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO jflow_user;
```

## pgAdmin 使用

pgAdmin 是 PostgreSQL 的图形管理工具，随 PostgreSQL 一起安装。

### 启动 pgAdmin
1. 从开始菜单启动 pgAdmin
2. 设置主密码（首次使用）
3. 左侧树形菜单展开 "Servers" → "PostgreSQL"

### 常用功能
- **查看数据**: 右键表 → "View/Edit Data" → "All Rows"
- **执行 SQL**: 点击 "Tools" → "Query Tool"
- **备份**: 右键数据库 → "Backup"
- **恢复**: 右键数据库 → "Restore"

## 运行初始化脚本

### 使用命令行
```bash
# 运行 schema.sql
psql -U postgres -d jflow -f src/database/schema.sql

# 或者在 psql 中
\i src/database/schema.sql
```

### 使用 pgAdmin
1. 打开 Query Tool
2. 点击 "Open File" 选择 `schema.sql`
3. 点击 "Execute" 运行

## 常见问题

### 无法连接数据库
1. 确认 PostgreSQL 服务正在运行
   - Windows: 服务 → PostgreSQL
   - 或使用命令: `pg_ctl status`
2. 检查端口是否被占用
3. 确认用户名和密码正确

### 权限错误
```sql
-- 给当前用户所有权限
GRANT ALL PRIVILEGES ON DATABASE jflow TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
```

### 密码认证失败
1. 找到 `pg_hba.conf` 文件（通常在 PostgreSQL 安装目录的 `data` 文件夹）
2. 修改认证方式：
```
# IPv4 local connections:
host    all             all             127.0.0.1/32            md5
```
3. 重启 PostgreSQL 服务

## PostgreSQL vs MySQL 主要区别

| 特性 | PostgreSQL | MySQL |
|------|------------|-------|
| 默认端口 | 5432 | 3306 |
| 命令行工具 | psql | mysql |
| 自增主键 | SERIAL | AUTO_INCREMENT |
| JSON 类型 | JSONB | JSON |
| 布尔类型 | BOOLEAN | TINYINT |
| 退出命令 | \q | exit; |

## 性能优化建议

### 1. 调整连接池
```env
# TypeORM 配置
extra: {
  max: 10,  // 最大连接数
  min: 2,   // 最小连接数
}
```

### 2. 启用查询日志（开发环境）
```typescript
logging: process.env.NODE_ENV === 'development',
```

### 3. 使用索引
schema.sql 中已包含必要的索引定义。

## 备份与恢复

### 备份数据库
```bash
# 备份整个数据库
pg_dump -U postgres jflow > jflow_backup.sql

# 仅备份数据
pg_dump -U postgres --data-only jflow > jflow_data.sql

# 仅备份结构
pg_dump -U postgres --schema-only jflow > jflow_schema.sql
```

### 恢复数据库
```bash
# 恢复数据库
psql -U postgres jflow < jflow_backup.sql
```

## 推荐工具

1. **pgAdmin** - 官方图形管理工具（已随 PostgreSQL 安装）
2. **DBeaver** - 通用数据库管理工具
3. **DataGrip** - JetBrains 的数据库 IDE
4. **TablePlus** - 现代化的数据库管理工具

## 更多资源

- 官方文档：https://www.postgresql.org/docs/
- 中文教程：https://www.runoob.com/postgresql/postgresql-tutorial.html
- TypeORM 文档：https://typeorm.io/
