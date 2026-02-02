# JFlow 快速启动指南

## 后端服务器设置

### 前置要求
- ✅ PostgreSQL 12+ 已安装并运行
- ✅ Node.js 18+ 已安装

### 1. 安装依赖

```bash
cd server
npm install
```

### 2. 配置数据库

编辑 `.env` 文件，设置数据库连接信息：

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=你的密码
DB_DATABASE=jflow
```

### 3. 创建数据库

只需创建空数据库（无需运行SQL脚本）：

```bash
psql -U postgres
CREATE DATABASE jflow;
\q
```

### 4. 自动创建表结构和初始化数据

运行 seed 脚本会自动完成所有设置：
- ✅ 创建所有表结构
- ✅ 创建索引和触发器
- ✅ 插入初始数据

```bash
npm run seed
```

**⚠️ 注意**: seed 脚本会清空并重建整个数据库结构，请在生产环境谨慎使用！

### 5. 启动服务器

```bash
npm run start:dev
```

服务器将在 http://localhost:3000 启动
API 文档在 http://localhost:3000/api/docs

## 默认账号

**管理员账号:**

- 用户名: admin
- 密码: admin123

**普通用户:**

- 用户名: user1
- 密码: user123

## API 端点

- 认证: POST /api/auth/login
- 用户: /api/users
- 角色: /api/roles
- 权限: /api/permissions
- 工作流: /api/workflows
- 表单: /api/forms

## 前端连接

修改前端代理配置 `proxy.conf.json`：

```json
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true
  }
}
```

## 常见问题

### 连接数据库失败

- 检查 PostgreSQL 服务是否启动
- 确认 .env 中的数据库配置正确
- 确保数据库 jflow 已创建

### 端口冲突

修改 .env 中的 PORT 配置

### 表不存在错误

确保已运行 seed 脚本创建数据库结构：

```bash
npm run seed
```

如果需要重置数据库，重新运行 seed 脚本即可（会自动清空并重建）。
