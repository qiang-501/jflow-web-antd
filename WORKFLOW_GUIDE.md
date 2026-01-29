# 工作流管理系统使用指南

## 功能概述

工作流管理系统提供了完整的工作流生命周期管理功能，包括：

### 1. 创建工作流

- **权限要求**: `workflow:create`
- **功能**: 创建新的工作流实例
- **字段**:
  - 工作流名称（必填）
  - 描述（可选）
  - 优先级（低/中/高/紧急）
  - 负责人（可选）
  - 截止日期（必填）

### 2. 编辑工作流

- **权限要求**: `workflow:update`
- **功能**: 修改现有工作流的基本信息
- **可编辑字段**: 名称、描述、优先级、负责人、截止日期

### 3. 工作流状态管理

- **权限要求**: `workflow:change_status`
- **功能**: 修改工作流状态
- **状态流转**:
  - 草稿 → 待处理 → 进行中 → 审核中 → 已完成
  - 任何状态 → 已取消

### 4. 历史追踪

- **权限要求**: 无（所有人可查看）
- **功能**: 查看工作流状态变更历史
- **信息**:
  - 状态变更时间
  - 操作人
  - 状态变化（从状态 → 到状态）
  - 备注信息

### 5. 删除工作流

- **权限要求**: `workflow:delete`
- **功能**: 删除工作流（需要二次确认）

## 工作流状态说明

| 状态   | 说明                 | 颜色 |
| ------ | -------------------- | ---- |
| 草稿   | 工作流已创建但未提交 | 灰色 |
| 待处理 | 已提交，等待处理     | 橙色 |
| 进行中 | 正在处理中           | 蓝色 |
| 审核中 | 处理完成，等待审核   | 青色 |
| 已完成 | 工作流已完成         | 绿色 |
| 已取消 | 工作流已取消         | 红色 |

## 优先级说明

| 优先级 | 说明                 | 颜色 |
| ------ | -------------------- | ---- |
| 低     | 不紧急的任务         | 灰色 |
| 中     | 正常优先级           | 蓝色 |
| 高     | 需要尽快处理         | 橙色 |
| 紧急   | 最高优先级，立即处理 | 红色 |

## 权限配置

### 工作流相关权限

```typescript
// 权限代码格式: workflow:{action}
const workflowPermissions = [
  "workflow:create", // 创建工作流
  "workflow:update", // 编辑工作流
  "workflow:delete", // 删除工作流
  "workflow:change_status", // 修改工作流状态
];
```

### 配置步骤

1. 进入"权限管理"页面
2. 找到"工作流"相关权限
3. 将权限分配给相应的角色
4. 在"角色管理"中将角色分配给用户

## API接口说明

### 获取工作流列表

```
GET /api/workflows
Query Parameters:
  - page: 页码
  - pageSize: 每页数量
  - status: 状态筛选
  - priority: 优先级筛选
Response:
  {
    data: WorkFlow[],
    total: number
  }
```

### 创建工作流

```
POST /api/workflows
Body:
  {
    name: string,
    description?: string,
    priority: WorkflowPriority,
    assignee?: string,
    due_date: string
  }
Response: WorkFlow
```

### 更新工作流

```
PUT /api/workflows/:id
Body:
  {
    name?: string,
    description?: string,
    priority?: WorkflowPriority,
    assignee?: string,
    due_date?: string
  }
Response: WorkFlow
```

### 修改状态

```
PATCH /api/workflows/:id/status
Body:
  {
    status: WorkflowStatus,
    comment?: string
  }
Response: WorkFlow
```

### 查看历史

```
GET /api/workflows/:id/history
Response: WorkflowStatusHistory[]
```

### 删除工作流

```
DELETE /api/workflows/:id
Response: 204 No Content
```

## 使用示例

### 创建工作流示例代码

```typescript
import { WorkflowService } from './core/services/workflow.service';
import { WorkflowPriority } from './models/work-flow';

// 注入服务
constructor(private workflowService: WorkflowService) {}

// 创建工作流
createWorkflow() {
  const newWorkflow = {
    name: '系统升级',
    description: '升级到最新版本',
    priority: WorkflowPriority.HIGH,
    assignee: 'user1',
    due_date: '2026-02-15'
  };

  this.workflowService.createWorkflow(newWorkflow).subscribe({
    next: (workflow) => {
      console.log('工作流创建成功:', workflow);
    },
    error: (err) => {
      console.error('创建失败:', err);
    }
  });
}
```

### 修改状态示例代码

```typescript
import { WorkflowStatus } from './models/work-flow';

changeStatus(workflowId: string) {
  this.workflowService.changeWorkflowStatus(
    workflowId,
    WorkflowStatus.IN_PROGRESS,
    '开始处理该任务'
  ).subscribe({
    next: (workflow) => {
      console.log('状态修改成功:', workflow);
    },
    error: (err) => {
      console.error('修改失败:', err);
    }
  });
}
```

## 常见问题

### Q: 为什么我看不到"创建工作流"按钮？

A: 请检查您的账号是否有 `workflow:create` 权限。联系管理员分配相应权限。

### Q: 如何查看工作流的完整历史记录？

A: 在工作流列表中，点击任意工作流行的"历史记录"按钮即可查看该工作流的所有状态变更记录。

### Q: 可以批量修改工作流状态吗？

A: 当前版本不支持批量操作，每次只能修改一个工作流的状态。

### Q: 删除的工作流可以恢复吗？

A: 当前版本删除是永久性的，无法恢复。建议使用"已取消"状态代替删除操作。

## 未来功能规划

- [ ] 批量操作（批量修改状态、批量删除等）
- [ ] 工作流模板功能
- [ ] 工作流导出/导入
- [ ] 邮件通知功能
- [ ] 工作流统计报表
- [ ] 工作流关联文档附件
- [ ] 工作流评论功能
- [ ] 自定义工作流字段
