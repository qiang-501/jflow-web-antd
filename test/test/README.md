# JFlow Web E2E Testing

End-to-end testing for jflow-web-antd using Playwright.

## 项目结构

```
test/
├── e2e/                          # 测试用例目录
│   ├── auth.spec.ts             # 认证测试
│   ├── dashboard.spec.ts        # 仪表板测试
│   ├── navigation.spec.ts       # 导航测试
│   ├── user-management.spec.ts  # 用户管理测试
│   ├── role-management.spec.ts  # 角色管理测试
│   ├── permission-management.spec.ts  # 权限管理测试
│   └── workflow.spec.ts         # 工作流测试
├── fixtures/                     # 测试数据
│   └── test-data.ts             # 测试用户凭证和数据
├── utils/                        # 工具函数
│   └── helpers.ts               # 辅助函数（登录、等待等）
├── playwright.config.ts          # Playwright 配置文件
└── package.json                  # 项目依赖
```

## 安装

```bash
cd test
npm install

# 安装浏览器（如果遇到 SSL 证书问题）
$env:NODE_TLS_REJECT_UNAUTHORIZED="0"
npx playwright install chromium
```

## 运行测试

### 前提条件

确保应用程序正在运行：

```bash
# 在项目根目录
npm start
# 应用将运行在 http://localhost:4200
```

### 运行所有测试

```bash
npm test
```

### 运行特定测试文件

```bash
npx playwright test e2e/auth.spec.ts
npx playwright test e2e/user-management.spec.ts
```

### 以有头模式运行（查看浏览器）

```bash
npm run test:headed
```

### 以 UI 模式运行（交互式调试）

```bash
npm run test:ui
```

### 调试模式

```bash
npm run test:debug
```

### 查看测试报告

```bash
npm run test:report
```

## 测试用例说明

### 认证测试 (auth.spec.ts)

- ✅ 验证登录页面显示
- ✅ 管理员账号登录
- ✅ 普通用户账号登录
- ✅ 无效凭证登录失败

### 仪表板测试 (dashboard.spec.ts)

- ✅ 登录后显示仪表板
- ✅ 显示导航侧边栏
- ✅ 显示用户菜单
- ✅ 侧边栏折叠切换

### 导航测试 (navigation.spec.ts)

- ✅ 显示主导航菜单
- ✅ 导航到用户管理
- ✅ 导航到角色管理
- ✅ 导航到权限管理
- ✅ 浏览器后退按钮

### 用户管理测试 (user-management.spec.ts)

- ✅ 显示用户管理页面
- ✅ 打开创建用户模态框
- ✅ 搜索用户
- ✅ 显示用户详情

### 角色管理测试 (role-management.spec.ts)

- ✅ 显示角色管理页面
- ✅ 打开创建角色模态框
- ✅ 显示角色列表
- ✅ 打开编辑角色模态框

### 权限管理测试 (permission-management.spec.ts)

- ✅ 显示权限管理页面
- ✅ 显示菜单树
- ✅ 选择菜单节点显示操作
- ✅ 打开添加操作模态框

### 工作流测试 (workflow.spec.ts)

- ✅ 显示工作流管理页面
- ✅ 打开创建工作流模态框
- ✅ 显示工作流列表

## 测试数据

测试使用以下默认账户（定义在 `fixtures/test-data.ts`）：

- **管理员**: `admin` / `admin123`
- **普通用户**: `user1` / `user123`

## 常见问题

### SSL 证书错误

如果在安装浏览器时遇到 SSL 证书错误：

```powershell
$env:NODE_TLS_REJECT_UNAUTHORIZED="0"
npx playwright install chromium
```

### 应用未运行

确保 Angular 应用正在运行：

```bash
cd c:\code\open-source\jflow-web-antd
npm start
```

测试会连接到 `http://localhost:4200`

### 测试超时

如果测试超时，可以在 `playwright.config.ts` 中增加超时时间：

```typescript
timeout: 60000,  // 增加到 60 秒
```

## 最佳实践

1. **保持测试独立**：每个测试应该独立运行，不依赖其他测试的状态
2. **使用 beforeEach**：在每个测试前重置状态（如重新登录）
3. **等待元素**：使用 Playwright 的自动等待机制，避免硬编码延迟
4. **使用语义选择器**：优先使用文本内容、角色等语义化选择器
5. **截图和视频**：失败时自动截图和录制视频，方便调试

## 持续集成

可以将测试集成到 CI/CD 流程中：

```yaml
# .github/workflows/e2e.yml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Install dependencies
        run: |
          npm ci
          cd test && npm ci
      - name: Install Playwright
        run: cd test && npx playwright install chromium
      - name: Start app
        run: npm start &
      - name: Wait for app
        run: npx wait-on http://localhost:4200
      - name: Run tests
        run: cd test && npm test
```

## 扩展测试

要添加新的测试：

1. 在 `e2e/` 目录下创建新的 `.spec.ts` 文件
2. 导入必要的工具函数和测试数据
3. 编写测试用例
4. 运行并验证测试

示例：

```typescript
import { test, expect } from "@playwright/test";
import { login } from "../utils/helpers";
import { userCredentials } from "../fixtures/test-data";

test.describe("New Feature Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await login(page, userCredentials.admin);
  });

  test("should test new feature", async ({ page }) => {
    // 测试代码
  });
});
```

## 测试覆盖的功能模块

- ✅ 认证系统（登录/登出）
- ✅ 用户管理（CRUD 操作）
- ✅ 角色管理（CRUD 操作）
- ✅ 权限管理（菜单权限、操作权限）
- ✅ 工作流管理
- ✅ 导航和路由

## 技术栈

- **Playwright**: ^1.40.0 - E2E 测试框架
- **TypeScript**: 类型安全的测试代码
- **Ng-Zorro**: Angular UI 组件库（测试目标）

## 参考资料

- [Playwright 官方文档](https://playwright.dev/)
- [Playwright 最佳实践](https://playwright.dev/docs/best-practices)
- [Angular E2E 测试指南](https://angular.io/guide/testing)
