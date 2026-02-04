# Workflow模板和动态表单配置重构

## 概述

本次更新实现了两个主要功能：

1. **Workflow模板系统**：支持创建可重用的workflow模板，新的workflow可以从模板继承并扩展
2. **动态表单配置重构**：将表单字段从JSON字段改为关系型数据库表存储

## 数据库变更

### 新增表

#### 1. workflow_templates (Workflow模板表)

存储可重用的workflow模板配置：

- `id`: 主键
- `code`: 唯一的模板代码
- `name`: 模板名称
- `description`: 模板描述
- `category`: 模板分类（如：HR、Finance、IT等）
- `form_config_id`: 关联的表单配置ID
- `default_priority`: 默认优先级
- `default_assignee_role_id`: 默认分配角色ID
- `estimated_duration`: 预计完成时长（分钟）
- `active`: 是否激活
- `created_by`: 创建者ID
- `created_at`, `updated_at`: 时间戳

#### 2. form_fields (表单字段表)

存储动态表单的字段配置（从JSONB重构）：

- `id`: 主键
- `form_config_id`: 关联的表单配置ID
- `field_key`: 字段键名
- `field_type`: 字段类型（input, select, date等）
- `label`: 字段标签
- `placeholder`: 占位符
- `default_value`: 默认值
- `required`: 是否必填
- `disabled`: 是否禁用
- `readonly`: 是否只读
- `order_index`: 字段排序索引
- `span`: 栅格跨度（1-24）
- `options`: 字段选项（JSONB，用于select等）
- `validators`: 验证器配置（JSONB）
- `created_at`, `updated_at`: 时间戳

### 表结构变更

#### workflows 表

- 新增字段：`template_id` - 关联workflow模板ID（可选）

#### dynamic_form_configs 表

- 删除字段：`fields` (JSONB) - 已迁移到form_fields表

## API端点

### Workflow模板 API

#### 获取所有模板

```
GET /workflow-templates?page=1&limit=10&category=HR
```

#### 获取模板分类列表

```
GET /workflow-templates/categories
```

#### 获取单个模板

```
GET /workflow-templates/:id
GET /workflow-templates/code/:code
```

#### 创建模板

```
POST /workflow-templates
Content-Type: application/json

{
  "code": "CUSTOM_WORKFLOW",
  "name": "自定义工作流",
  "description": "描述",
  "category": "General",
  "formConfigId": 1,
  "defaultPriority": "medium",
  "defaultAssigneeRoleId": 2,
  "estimatedDuration": 120,
  "active": true
}
```

#### 更新模板

```
PUT /workflow-templates/:id
Content-Type: application/json

{
  "name": "更新的名称",
  "active": false
}
```

#### 删除模板

```
DELETE /workflow-templates/:id
```

### Workflow API 新增

#### 从模板创建Workflow

```
POST /workflows/from-template/:templateId
Content-Type: application/json

{
  "dWorkflowId": "WF-2026-001",
  "name": "请假申请 - 张三",
  "description": "年假申请",
  "assignedTo": 5,
  "dueDate": "2026-02-15T00:00:00Z"
}
```

从模板创建时，workflow会自动继承模板的：

- 优先级（可覆盖）
- 表单配置（可覆盖）
- 描述（可覆盖）

### 动态表单 API

表单配置API保持不变，但请求/响应格式略有调整：

#### 创建表单配置

```
POST /forms
Content-Type: application/json

{
  "name": "employee_leave_form",
  "description": "员工请假表单",
  "layout": "vertical",
  "labelAlign": "right",
  "fields": [
    {
      "fieldKey": "leave_type",
      "fieldType": "select",
      "label": "请假类型",
      "required": true,
      "orderIndex": 0,
      "span": 12,
      "options": {
        "items": [
          { "label": "年假", "value": "annual" },
          { "label": "病假", "value": "sick" }
        ]
      }
    },
    {
      "fieldKey": "start_date",
      "fieldType": "date",
      "label": "开始日期",
      "required": true,
      "orderIndex": 1,
      "span": 12
    }
  ]
}
```

#### 响应格式

```json
{
  "id": 1,
  "name": "employee_leave_form",
  "description": "员工请假表单",
  "layout": "vertical",
  "labelAlign": "right",
  "version": 1,
  "active": true,
  "fields": [
    {
      "id": 1,
      "formConfigId": 1,
      "fieldKey": "leave_type",
      "fieldType": "select",
      "label": "请假类型",
      "required": true,
      "orderIndex": 0,
      "span": 12,
      "options": { ... },
      "createdAt": "2026-02-04T...",
      "updatedAt": "2026-02-04T..."
    }
  ],
  "createdAt": "2026-02-04T...",
  "updatedAt": "2026-02-04T..."
}
```

## 使用场景

### 1. 创建并使用Workflow模板

```typescript
// 1. 创建表单配置
const formConfig = await formService.create({
  name: "expense_report_form",
  fields: [
    { fieldKey: "amount", fieldType: "number", label: "金额", required: true },
    { fieldKey: "category", fieldType: "select", label: "类别", required: true },
  ],
});

// 2. 创建workflow模板
const template = await templateService.create({
  code: "EXPENSE_REPORT",
  name: "费用报销",
  category: "Finance",
  formConfigId: formConfig.id,
  defaultPriority: "medium",
  estimatedDuration: 180,
});

// 3. 从模板创建具体的workflow实例
const workflow = await workflowService.createFromTemplate(template.id, {
  dWorkflowId: "WF-2026-001",
  name: "差旅费报销 - 李四",
  assignedTo: 10,
  dueDate: "2026-02-20T00:00:00Z",
});
```

### 2. 扩展模板

创建workflow时可以覆盖模板的任何属性：

```typescript
const workflow = await workflowService.createFromTemplate(templateId, {
  dWorkflowId: "WF-2026-002",
  name: "紧急报销",
  priority: "urgent", // 覆盖模板的默认优先级
  formConfigId: customFormId, // 使用不同的表单配置
  description: "特殊情况的费用报销",
});
```

## 数据迁移

运行迁移脚本将现有数据升级：

```bash
cd server/src/database/migrations
psql -U your_username -d jflow -f 001_add_workflow_templates_and_form_fields.sql
```

迁移脚本会：

1. 创建新的`form_fields`表
2. 将现有`dynamic_form_configs.fields`中的JSONB数据迁移到`form_fields`表
3. 删除`dynamic_form_configs.fields`列
4. 创建`workflow_templates`表
5. 在`workflows`表中添加`template_id`列
6. 插入示例模板数据

## 优势

### Workflow模板系统

- ✅ 可重用性：定义一次，多次使用
- ✅ 一致性：确保同类workflow使用统一配置
- ✅ 可维护性：集中管理workflow配置
- ✅ 灵活性：支持继承并按需扩展

### 关系型表单字段存储

- ✅ 更好的查询性能：可以直接查询和索引字段
- ✅ 数据完整性：通过外键约束保证引用完整性
- ✅ 易于扩展：添加新字段属性更简单
- ✅ 更好的类型安全：每个字段属性都有明确的类型

## 注意事项

1. **向后兼容性**：迁移脚本会自动转换现有数据，无需手动操作
2. **版本控制**：更新表单字段会自动递增版本号
3. **级联删除**：删除表单配置会自动删除关联的字段
4. **字段排序**：使用`orderIndex`控制字段显示顺序

## 下一步

考虑实现：

- Workflow模板版本控制
- 模板继承链（模板可以基于其他模板）
- 字段级别的权限控制
- 表单字段的条件显示逻辑
