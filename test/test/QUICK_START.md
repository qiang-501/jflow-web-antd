# Playwright E2E 测试快速启动指南

## 问题修复总结

已修复的问题：

1. ✅ package.json 中缺少 `@playwright/test` 依赖
2. ✅ 依赖配置错误（playwright vs @playwright/test）
3. ✅ SSL 证书问题（通过设置环境变量解决）
4. ✅ baseURL 配置错误（从 3000 改为 4200）
5. ✅ 测试文件中的类型错误
6. ✅ 测试数据与实际应用不匹配

## 已创建的测试文件

共创建 7 个测试文件，28 个测试用例：

1. **auth.spec.ts** (4 个测试)
   - 登录页面显示
   - 管理员登录
   - 普通用户登录
   - 无效凭证测试

2. **dashboard.spec.ts** (4 个测试)
   - 仪表板显示
   - 侧边栏显示
   - 用户菜单显示
   - 侧边栏折叠

3. **navigation.spec.ts** (5 个测试)
   - 主导航菜单
   - 用户管理导航
   - 角色管理导航
   - 权限管理导航
   - 浏览器后退

4. **user-management.spec.ts** (4 个测试)
   - 页面显示
   - 创建用户模态框
   - 用户搜索
   - 用户详情

5. **role-management.spec.ts** (4 个测试)
   - 页面显示
   - 创建角色模态框
   - 角色列表
   - 编辑角色模态框

6. **permission-management.spec.ts** (4 个测试)
   - 页面显示
   - 菜单树显示
   - 菜单节点选择
   - 添加操作模态框

7. **workflow.spec.ts** (3 个测试)
   - 页面显示
   - 创建工作流模态框
   - 工作流列表

## 快速开始

### 第一步：启动 Angular 应用

```powershell
# 在项目根目录
cd c:\code\open-source\jflow-web-antd
npm start
```

等待应用启动完成（通常需要 30-60 秒），确保可以访问 http://localhost:4200

### 第二步：运行测试

打开新的终端窗口：

```powershell
# 进入测试目录
cd c:\code\open-source\jflow-web-antd\test\test

# 运行所有测试
npm test

# 或者以有头模式运行（可以看到浏览器）
npm run test:headed

# 或者运行特定测试文件
npx playwright test e2e/auth.spec.ts
```

### 第三步：查看测试报告

```powershell
npm run test:report
```

## 测试命令速查

```powershell
# 列出所有测试
npx playwright test --list

# 运行单个测试文件
npx playwright test e2e/auth.spec.ts

# 运行匹配模式的测试
npx playwright test auth

# 以调试模式运行
npm run test:debug

# 以 UI 模式运行（推荐用于开发）
npm run test:ui

# 只运行失败的测试
npx playwright test --last-failed

# 生成代码（录制交互操作）
npx playwright codegen http://localhost:4200
```

## 配置文件说明

### playwright.config.ts

```typescript
- testDir: './e2e'              // 测试目录
- timeout: 30000               // 测试超时 30 秒
- baseURL: 'http://localhost:4200'  // 应用 URL
- workers: 1                   // 单线程运行测试
- retries: 1                   // 失败重试 1 次
```

### package.json 脚本

```json
"test": "playwright test"           // 运行所有测试
"test:headed": "--headed"           // 有头模式
"test:ui": "--ui"                   // UI 模式
"test:debug": "--debug"             // 调试模式
"test:report": "show-report"        // 查看报告
```

## 测试数据

**管理员账户**：

- 用户名: `admin`
- 密码: `admin123`

**普通用户账户**：

- 用户名: `user1`
- 密码: `user123`

## 注意事项

1. **确保应用正在运行**：测试会连接到 http://localhost:4200
2. **数据库状态**：某些测试可能依赖特定的数据库状态
3. **网络延迟**：如果网络较慢，可能需要增加超时时间
4. **并发运行**：当前配置为单线程运行（workers: 1），避免数据冲突

## 故障排除

### 应用未启动

```
Error: page.goto: net::ERR_CONNECTION_REFUSED
```

**解决方案**：确保 Angular 应用正在 http://localhost:4200 运行

### 元素未找到

```
Error: Timeout 5000ms exceeded
```

**解决方案**：检查选择器是否正确，或增加等待时间

### 登录失败

```
Error: Navigation timeout of 30000 ms exceeded
```

**解决方案**：检查用户凭证是否正确（admin/admin123）

## 下一步

1. 运行测试验证所有功能正常
2. 根据实际需求调整测试用例
3. 添加更多测试覆盖边界情况
4. 集成到 CI/CD 流程
5. 定期运行测试确保代码质量

## 测试覆盖率建议

- [ ] 添加表单验证测试
- [ ] 添加错误处理测试
- [ ] 添加权限控制测试
- [ ] 添加数据持久化测试
- [ ] 添加并发操作测试
- [ ] 添加性能测试

## 参考资料

- [Playwright 文档](https://playwright.dev/)
- [Playwright 最佳实践](https://playwright.dev/docs/best-practices)
- [项目 README](./README.md)
