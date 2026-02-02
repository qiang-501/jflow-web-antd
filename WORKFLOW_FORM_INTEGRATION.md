# 工作流表单集成功能说明

## 概述

本次更新为工作流创建流程添加了表单配置选择和编辑功能，允许用户在创建工作流时直接关联、创建或编辑动态表单配置。

## 主要功能

### 1. 创建工作流时关联表单

在创建工作流的模态框中，新增了"关联表单"字段：

- **表单选择下拉框**: 从现有表单配置中选择
- **新建表单按钮**: 打开表单构建器创建新表单（需要 `form:manage` 权限）
- **编辑选中表单按钮**: 编辑已选中的表单配置（需要 `form:manage` 权限）

### 2. 权限控制

新增权限标识：

- `canManageForms`: 控制创建和编辑表单的权限，基于 `form:manage` 权限

### 3. 表单生命周期

```
创建工作流 → 选择/创建表单 → 关联表单ID → 提交工作流
              ↓
          打开表单构建器
              ↓
          创建/编辑表单
              ↓
          自动刷新表单列表
```

## 技术实现

### 组件变更 (workflow.component.ts)

#### 新增属性

```typescript
// 表单配置列表
formConfigs: DynamicFormConfig[] = [];
formConfigsLoading = false;

// 权限控制
canManageForms = false; // 管理表单权限
```

#### 新增方法

```typescript
// 加载表单配置列表
loadFormConfigs(): void

// 创建新表单配置（在创建工作流时）
createNewFormConfig(): void

// 编辑选中的表单配置（在创建工作流时）
editFormConfigInCreate(): void

// 处理表单构建器关闭（含表单列表刷新）
handleFormBuilderClose(): void
```

#### 表单结构更新

```typescript
createForm = this.fb.group({
  dWorkflowId: ["", [Validators.required]],
  name: ["", [Validators.required, Validators.minLength(3)]],
  description: [""],
  priority: [WorkflowPriority.MEDIUM, [Validators.required]],
  assignedTo: [null],
  dueDate: [null, [Validators.required]],
  formConfigId: [null], // 新增：关联的表单配置
});
```

### 模板变更 (workflow.component.html)

在创建工作流模态框中添加了表单配置选择区域：

```html
<nz-form-item>
  <nz-form-label>关联表单</nz-form-label>
  <nz-form-control>
    <!-- 表单选择下拉框 -->
    <nz-input-group [nzSuffix]="suffixTemplate">
      <nz-select formControlName="formConfigId" nzPlaceHolder="请选择表单配置" nzShowSearch nzAllowClear [nzLoading]="formConfigsLoading">
        <nz-option *ngFor="let form of formConfigs" [nzValue]="form.id" [nzLabel]="form.name">
          <!-- 显示表单名称和描述 -->
        </nz-option>
      </nz-select>
    </nz-input-group>

    <!-- 新建表单按钮 -->
    <ng-template #suffixTemplate>
      <button nz-button nzType="link" nzSize="small" (click)="createNewFormConfig()" *ngIf="canManageForms">
        <span nz-icon nzType="plus"></span>
        新建表单
      </button>
    </ng-template>

    <!-- 编辑选中表单按钮 -->
    <div style="margin-top: 8px;">
      <button nz-button nzType="link" nzSize="small" (click)="editFormConfigInCreate()" [disabled]="!createForm.get('formConfigId')?.value" *ngIf="canManageForms">
        <span nz-icon nzType="edit"></span>
        编辑选中表单
      </button>
    </div>
  </nz-form-control>
</nz-form-item>
```

## 使用流程

### 场景 1: 选择现有表单

1. 点击"创建工作流"按钮
2. 填写基本信息（工作流ID、名称、描述等）
3. 在"关联表单"下拉框中选择已有表单
4. 提交创建工作流

### 场景 2: 创建新表单

1. 点击"创建工作流"按钮
2. 填写基本信息
3. 点击"新建表单"按钮
4. 在表单构建器中设计新表单
5. 保存表单后，表单列表自动刷新
6. 手动选择刚创建的表单（或根据需求改进为自动选中）
7. 提交创建工作流

### 场景 3: 编辑现有表单后使用

1. 点击"创建工作流"按钮
2. 填写基本信息
3. 在"关联表单"下拉框中选择要使用的表单
4. 点击"编辑选中表单"按钮
5. 在表单构建器中修改表单配置
6. 保存后返回工作流创建页面
7. 提交创建工作流（表单ID已选中）

## 权限要求

- **查看表单列表**: 所有有创建工作流权限的用户
- **新建表单**: 需要 `form:manage` 权限
- **编辑表单**: 需要 `form:manage` 权限

## API 调用

### 加载表单列表

```typescript
GET /api/forms
Response: {
  data: DynamicFormConfig[],
  total: number
}
```

### 创建工作流时提交表单ID

```typescript
POST /api/workflows
Body: {
  dWorkflowId: string,
  name: string,
  description: string,
  priority: WorkflowPriority,
  assignedTo: number,
  dueDate: string,
  formConfigId: number // 可选，表单配置ID
}
```

## 后续优化建议

1. **自动选中新建表单**: 当用户创建新表单后，自动将新表单ID设置到 `formConfigId` 字段
2. **表单预览**: 在选择表单时，提供表单预览功能
3. **表单搜索**: 当表单数量较多时，提供更高级的搜索和过滤功能
4. **表单模板**: 提供常用表单模板，快速创建标准表单
5. **表单复制**: 允许基于现有表单复制并修改

## 相关文件

- `src/app/features/workflow/workflow.component.ts` - 组件逻辑
- `src/app/features/workflow/workflow.component.html` - 组件模板
- `src/app/core/services/dynamic-form.service.ts` - 表单服务
- `src/app/models/work-flow.ts` - 工作流模型定义
- `src/app/shared/components/form-builder/form-builder.component.ts` - 表单构建器
