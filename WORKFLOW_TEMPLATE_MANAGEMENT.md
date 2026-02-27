# 工作流模板管理功能

## 功能概述

新增了工作流模板管理功能，允许管理员创建、编辑、删除和查看工作流模板。

## 已完成的实现

### 1. 组件文件

创建了以下文件：

- `src/app/features/workflow/workflow-template-management.component.ts` - 主组件逻辑
- `src/app/features/workflow/workflow-template-management.component.html` - 模板视图
- `src/app/features/workflow/workflow-template-management.component.css` - 样式文件

### 2. 路由配置

在 `src/app/features/main.routes.ts` 中添加了路由：

```typescript
{
  path: 'workflow-templates',
  loadComponent: () =>
    import('./workflow/workflow-template-management.component').then(
      (m) => m.WorkflowTemplateManagementComponent,
    ),
}
```

访问路径：`/main/workflow-templates`

### 3. 菜单配置

在 `src/assets/data/menuResult.json` 中添加了菜单项：

```json
{
  "id": "10",
  "title": "Workflow Templates",
  "icon": "project",
  "level": 2,
  "link": "workflow-templates",
  "permission": "workflow-template:view"
}
```

菜单位置：User Management > Workflow Templates

### 4. 权限配置

在 `src/assets/data/mockPermissions.json` 中添加了以下权限：

| ID  | 权限名称       | 权限编码                 | 类型   | 说明             |
| --- | -------------- | ------------------------ | ------ | ---------------- |
| 7   | 工作流模板查看 | workflow-template:view   | menu   | 访问模板管理页面 |
| 8   | 工作流模板创建 | workflow-template:create | action | 创建新模板       |
| 9   | 工作流模板编辑 | workflow-template:edit   | action | 编辑现有模板     |
| 10  | 工作流模板删除 | workflow-template:delete | action | 删除模板         |

## 功能特性

### 模板列表

- ✅ 分页显示所有工作流模板
- ✅ 显示模板编码、名称、分类、优先级、状态
- ✅ 支持快速启用/禁用模板
- ✅ 显示创建时间

### 创建模板

- ✅ 必填字段：模板编码（唯一）、模板名称
- ✅ 可选字段：分类、描述、默认优先级、状态
- ✅ 默认优先级选项：低、中、高、紧急
- ✅ 状态开关：启用/禁用

### 编辑模板

- ✅ 编辑所有字段（模板编码除外，不可修改）
- ✅ 实时更新模板信息
- ✅ 支持切换模板状态

### 删除模板

- ✅ 带确认提示的安全删除
- ✅ 删除后自动刷新列表

### 状态管理

- ✅ 快速切换模板启用/禁用状态
- ✅ 使用开关组件直观显示状态

## 权限控制

### 菜单访问控制

用户必须拥有 `workflow-template:view` 权限才能在菜单中看到并访问"Workflow Templates"菜单项。

### 操作权限（待实现）

可以在组件中添加操作级别的权限控制：

```typescript
// 示例：检查用户权限
canCreate = this.authService.hasPermission("workflow-template:create");
canEdit = this.authService.hasPermission("workflow-template:edit");
canDelete = this.authService.hasPermission("workflow-template:delete");
```

在模板中使用：

```html
<button *ngIf="canCreate" nz-button nzType="primary" (click)="showCreateModal()">创建模板</button>
```

## API 端点

组件使用以下后端 API（已修复）：

- `GET /api/workflow-templates` - 获取模板列表（分页）
- `GET /api/workflow-templates/active` - 获取活跃模板
- `GET /api/workflow-templates/:id` - 获取单个模板
- `POST /api/workflow-templates` - 创建模板
- `PUT /api/workflow-templates/:id` - 更新模板
- `DELETE /api/workflow-templates/:id` - 删除模板

## 使用说明

### 管理员配置权限

1. 进入"角色管理"页面
2. 选择需要授予权限的角色
3. 在权限分配中勾选：
   - `workflow-template:view` - 必需，查看模板列表
   - `workflow-template:create` - 可选，创建模板
   - `workflow-template:edit` - 可选，编辑模板
   - `workflow-template:delete` - 可选，删除模板
4. 保存权限配置

### 用户使用

1. 登录系统
2. 在左侧菜单 "User Management" 下找到 "Workflow Templates"
3. 点击进入模板管理页面
4. 根据权限进行相应操作

## 后续改进建议

### 功能增强

1. **批量操作**
   - 批量启用/禁用模板
   - 批量删除模板
   - 批量导入/导出模板

2. **搜索和筛选**
   - 按模板编码搜索
   - 按模板名称搜索
   - 按分类筛选
   - 按状态筛选

3. **表单配置**
   - 关联动态表单配置
   - 可视化表单设计器
   - 表单预览功能

4. **角色分配**
   - 配置默认审批人角色
   - 多级审批配置
   - 条件分支配置

5. **模板详情**
   - 查看模板使用统计
   - 查看关联的工作流实例
   - 使用历史记录

### 权限细化

1. 区分读写权限
2. 添加审核权限
3. 添加导入导出权限

### UI/UX 优化

1. 添加模板预览功能
2. 复制模板功能
3. 模板版本管理
4. 拖拽排序

## 技术栈

- **Angular 21** - 前端框架
- **Ng-Zorro (Ant Design)** - UI 组件库
- **RxJS** - 响应式编程
- **TypeScript** - 类型安全
- **Standalone Components** - 独立组件架构

## 测试检查清单

- [ ] 页面加载正常
- [ ] 模板列表显示正确
- [ ] 创建模板功能正常
- [ ] 编辑模板功能正常
- [ ] 删除模板带确认提示
- [ ] 状态切换实时生效
- [ ] 分页功能正常
- [ ] 权限控制生效
- [ ] 菜单项显示正确
- [ ] API 调用正常
- [ ] 错误处理友好
- [ ] 成功提示清晰

## 注意事项

1. **模板编码唯一性**：创建模板时，编码必须唯一，编辑时不可修改
2. **删除影响**：删除模板前应确认没有关联的工作流实例
3. **权限管理**：确保正确配置角色权限，避免未授权访问
4. **数据备份**：重要操作前建议备份数据

---

**创建时间**：2024年  
**最后更新**：2024年
