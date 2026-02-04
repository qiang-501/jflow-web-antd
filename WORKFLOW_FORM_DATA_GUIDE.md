# Workflow 动态表单数据存储功能

## 概述

本功能实现了将 workflow（工作流）的动态表单数据保存到数据库的能力。用户填写动态表单后，表单数据会被持久化存储，支持后续的查询、更新和删除操作。

## 功能特性

- ✅ 保存工作流表单数据到数据库
- ✅ 支持查询工作流的表单数据
- ✅ 支持更新已存在的表单数据
- ✅ 支持删除表单数据
- ✅ 表单数据以 JSONB 格式存储，灵活且高效
- ✅ 记录提交人和提交时间
- ✅ 自动关联工作流和表单配置

## 数据库设计

### 新增表：workflow_form_data

```sql
CREATE TABLE workflow_form_data (
  id SERIAL PRIMARY KEY,
  workflow_id INT NOT NULL UNIQUE,         -- 工作流ID（唯一约束）
  form_config_id INT NOT NULL,             -- 表单配置ID
  form_data JSONB NOT NULL,                -- 表单数据（JSON格式）
  submitted_by INT NULL,                   -- 提交用户ID
  submitted_at TIMESTAMP DEFAULT NOW(),    -- 提交时间
  updated_at TIMESTAMP DEFAULT NOW(),      -- 更新时间
  FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE,
  FOREIGN KEY (form_config_id) REFERENCES dynamic_form_configs(id) ON DELETE CASCADE,
  FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE SET NULL
);
```

### 索引

- `idx_workflow_form_data_workflow_id` - 工作流ID索引
- `idx_workflow_form_data_form_config_id` - 表单配置ID索引
- `idx_workflow_form_data_submitted_at` - 提交时间索引

## 后端实现

### 1. 实体类 (Entity)

**文件**: `server/src/modules/workflows/workflow-form-data.entity.ts`

定义了 `WorkflowFormData` 实体，映射到 `workflow_form_data` 表。

### 2. DTO 类 (Data Transfer Objects)

**文件**: `server/src/modules/workflows/workflow-form-data.dto.ts`

- `CreateWorkflowFormDataDto` - 创建表单数据的 DTO
- `UpdateWorkflowFormDataDto` - 更新表单数据的 DTO

### 3. Service 层方法

**文件**: `server/src/modules/workflows/workflows.service.ts`

新增方法：

- `saveFormData(dto)` - 保存表单数据（自动判断创建或更新）
- `getFormData(workflowId)` - 获取表单数据
- `updateFormData(workflowId, dto)` - 更新表单数据
- `deleteFormData(workflowId)` - 删除表单数据

### 4. Controller API 端点

**文件**: `server/src/modules/workflows/workflows.controller.ts`

新增端点：

| 方法   | 路径                           | 描述               |
| ------ | ------------------------------ | ------------------ |
| POST   | `/api/workflows/:id/form-data` | 保存工作流表单数据 |
| GET    | `/api/workflows/:id/form-data` | 获取工作流表单数据 |
| PUT    | `/api/workflows/:id/form-data` | 更新工作流表单数据 |
| DELETE | `/api/workflows/:id/form-data` | 删除工作流表单数据 |

## 前端实现

### 1. Service 方法

**文件**: `src/app/core/services/workflow.service.ts`

新增方法：

- `saveWorkflowFormData(workflowId, formData)` - 保存表单数据
- `getWorkflowFormData(workflowId)` - 获取表单数据
- `updateWorkflowFormData(workflowId, formData)` - 更新表单数据
- `deleteWorkflowFormData(workflowId)` - 删除表单数据

### 2. Component 集成

**文件**: `src/app/features/workflow/workflow.component.ts`

更新了 `handleFormSubmit()` 方法，在用户提交表单时自动调用 API 保存数据。

## 使用示例

### API 调用示例

#### 1. 保存表单数据

```typescript
POST /api/workflows/1/form-data
Content-Type: application/json

{
  "formConfigId": 1,
  "formData": {
    "leaveType": "annual",
    "startDate": "2024-12-20",
    "endDate": "2024-12-22",
    "reason": "家庭事务需要处理"
  },
  "submittedBy": 1
}
```

#### 2. 获取表单数据

```typescript
GET / api / workflows / 1 / form - data;
```

响应：

```json
{
  "id": 1,
  "workflowId": 1,
  "formConfigId": 1,
  "formData": {
    "leaveType": "annual",
    "startDate": "2024-12-20",
    "endDate": "2024-12-22",
    "reason": "家庭事务需要处理"
  },
  "submittedBy": 1,
  "submittedAt": "2024-12-05T10:30:00Z",
  "updatedAt": "2024-12-05T10:30:00Z"
}
```

### 前端代码示例

```typescript
// 在 Angular 组件中使用
handleFormSubmit(formData: any): void {
  const saveData = {
    formConfigId: this.selectedWorkflow.formConfigId,
    formData: formData,
    submittedBy: this.currentUser?.id
  };

  this.workflowService
    .saveWorkflowFormData(this.selectedWorkflow.id, saveData)
    .subscribe({
      next: (result) => {
        this.message.success('表单数据保存成功');
        this.loadWorkflows();
      },
      error: (error) => {
        this.message.error('表单数据保存失败');
      }
    });
}
```

## 数据迁移

### 新数据库

如果是全新数据库，运行 seed 脚本会自动创建表和示例数据：

```bash
cd server
npm run seed
```

### 现有数据库

如果是现有数据库，执行迁移脚本：

```bash
psql -U postgres -d jflow -f server/src/database/migrations/001_add_workflow_form_data.sql
```

或者在 SQL 工具中直接执行迁移文件内容。

## 示例数据

Seed 脚本包含了三条示例数据：

1. **请假申请** - 年假申请（workflow_id: 1）
2. **采购申请** - MacBook Pro 采购（workflow_id: 2）
3. **病假申请** - 感冒病假（workflow_id: 3）

## 注意事项

1. **唯一性约束**: 每个 workflow 只能有一条表单数据记录。如果多次提交，会更新现有记录。
2. **级联删除**: 删除 workflow 时，关联的表单数据会自动删除。
3. **JSONB 类型**: 表单数据使用 JSONB 存储，支持 PostgreSQL 的 JSON 查询功能。
4. **验证**: DTO 类包含了基本的数据验证，确保数据完整性。

## 测试建议

1. 创建一个工作流
2. 为工作流关联动态表单配置
3. 填写并提交表单
4. 检查数据库中的 `workflow_form_data` 表
5. 尝试获取、更新和删除表单数据

## 扩展性

该功能设计为可扩展的：

- 可以添加版本控制（记录表单数据的历史版本）
- 可以添加审批流程（基于表单数据的审批）
- 可以添加导出功能（将表单数据导出为 Excel/PDF）
- 可以添加数据统计分析功能

## 相关文件

### 后端

- `server/src/modules/workflows/workflow-form-data.entity.ts` - 实体定义
- `server/src/modules/workflows/workflow-form-data.dto.ts` - DTO 定义
- `server/src/modules/workflows/workflows.service.ts` - Service 实现
- `server/src/modules/workflows/workflows.controller.ts` - Controller 实现
- `server/src/modules/workflows/workflows.module.ts` - 模块注册
- `server/src/database/schema.sql` - 数据库 Schema
- `server/src/database/seeds/run-seed.ts` - Seed 脚本
- `server/src/database/migrations/001_add_workflow_form_data.sql` - 迁移脚本

### 前端

- `src/app/core/services/workflow.service.ts` - Service 方法
- `src/app/features/workflow/workflow.component.ts` - Component 集成

## 版本历史

- **v1.0.0** (2024-12-05) - 初始版本
  - 实现基本的 CRUD 操作
  - 添加数据库表和索引
  - 集成前后端代码
