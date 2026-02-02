# 创建工作流时新建表单优化

## 问题描述

在创建工作流时点击"新建表单"按钮，表单构建器会显示所有已有的表单列表，这不符合用户期望。用户希望直接进入创建新表单的界面，而不是看到其他表单。

## 解决方案

添加"创建模式"（Create Mode）支持，使表单构建器在创建新表单时：

1. 不加载和显示其他表单列表
2. 直接打开"创建表单配置"对话框
3. 用户只能看到和操作正在创建的新表单

## 技术实现

### 1. FormBuilderComponent 改动

**新增输入属性：**

```typescript
@Input() createMode = false; // 是否为创建模式（仅创建新表单，不显示列表）
```

**修改初始化逻辑：**

```typescript
ngOnInit(): void {
  this.initForms();
  if (this.createMode) {
    // 创建模式：不加载任何表单，直接打开创建对话框
    this.singleFormMode = false;
    this.formConfigs = [];
    this.showConfigModal(); // 直接打开创建表单对话框
  } else if (this.formConfigId) {
    // 单表单编辑模式：只加载指定的表单
    this.singleFormMode = true;
    this.loadSingleFormConfig(this.formConfigId);
  } else {
    // 普通模式：加载所有表单
    this.singleFormMode = false;
    this.loadFormConfigs();
  }
}
```

**修改模板逻辑：**

```html
<!-- 只在非单表单模式且有表单时显示头部 -->
<div class="header" *ngIf="!singleFormMode && formConfigs.length > 0">
  <h2>动态表单配置</h2>
  <button nz-button nzType="primary" (click)="showConfigModal()">
    <span nz-icon nzType="plus"></span>
    创建表单
  </button>
</div>
```

### 2. WorkflowComponent 改动

**新增属性：**

```typescript
isCreatingNewForm = false; // 是否正在创建新表单（不显示其他表单）
```

**修改创建新表单方法：**

```typescript
createNewFormConfig(): void {
  if (!this.canManageForms) {
    this.message.warning('您没有创建表单的权限');
    return;
  }

  // 打开表单构建器，创建新表单（仅创建模式）
  this.selectedWorkflow = null;
  this.isCreatingNewForm = true; // 设置为创建模式
  this.isFormBuilderModalVisible = true;
}
```

**修改编辑表单方法：**

```typescript
editFormConfigInCreate(): void {
  // ... 验证逻辑 ...

  // 创建临时工作流对象，用于传递给表单构建器
  this.selectedWorkflow = {
    id: 0,
    formConfigId: formConfigId,
  } as WorkFlow;
  this.isCreatingNewForm = false; // 不是创建模式，是编辑模式
  this.isFormBuilderModalVisible = true;
}
```

**修改其他打开表单构建器的方法：**

```typescript
openFormBuilder(workflow?: WorkFlow): void {
  // ... 验证逻辑 ...

  this.selectedWorkflow = workflow || null;
  this.isCreatingNewForm = false; // 不是创建模式
  this.isFormBuilderModalVisible = true;
}
```

**修改关闭处理：**

```typescript
handleFormBuilderClose(): void {
  this.isFormBuilderModalVisible = false;
  this.isCreatingNewForm = false; // 重置创建模式标识
  this.loadFormConfigs(); // 刷新表单列表
  this.selectedWorkflow = null;
}
```

**修改模板：**

```html
<!-- 表单构建器模态框 -->
<nz-modal
  [nzVisible]="isFormBuilderModalVisible"
  [nzTitle]="
    isCreatingNewForm
      ? '创建新表单'
      : selectedWorkflow
      ? '编辑工作流表单: ' + selectedWorkflow.name
      : '动态表单管理'
  "
  (nzOnCancel)="handleFormBuilderClose()"
  [nzFooter]="null"
  nzWidth="1200px"
  [nzBodyStyle]="{ padding: '0' }"
>
  <ng-container *nzModalContent>
    <app-form-builder [formConfigId]="selectedWorkflow?.formConfigId" [createMode]="isCreatingNewForm"></app-form-builder>
  </ng-container>
</nz-modal>
```

## 使用场景

### 场景 1: 创建工作流时新建表单（优化后）

1. 用户点击"创建工作流"
2. 填写基本信息
3. 点击"新建表单"按钮
4. **表单构建器直接打开"创建表单配置"对话框**
5. **不显示其他已有表单列表**
6. 用户填写表单名称、描述、布局
7. 保存后可以添加字段
8. 完成后关闭，表单列表自动刷新
9. 用户可在下拉框中选择刚创建的表单

### 场景 2: 编辑现有表单（保持不变）

1. 用户在工作流创建页面选择已有表单
2. 点击"编辑选中表单"按钮
3. **表单构建器只显示选中的表单**
4. 用户可以编辑该表单的字段
5. 保存后返回

### 场景 3: 普通表单管理（保持不变）

1. 用户从菜单进入"动态表单管理"
2. **表单构建器显示所有表单列表**
3. 用户可以创建、编辑、删除表单

## 模式对比

| 模式       | createMode | formConfigId | singleFormMode | formConfigs | 显示内容                   |
| ---------- | ---------- | ------------ | -------------- | ----------- | -------------------------- |
| 创建模式   | true       | undefined    | false          | []          | 直接打开创建对话框，无列表 |
| 单表单编辑 | false      | number       | true           | [单个表单]  | 只显示一个表单，可编辑字段 |
| 普通模式   | false      | undefined    | false          | [所有表单]  | 显示所有表单，可管理       |

## 测试验证

1. **创建模式测试**：
   - 创建工作流 → 点击"新建表单" → 应该直接打开创建表单对话框
   - 不应该显示任何已有表单列表
   - 对话框标题应为"创建新表单"

2. **编辑模式测试**：
   - 选择表单 → 点击"编辑选中表单" → 应该只显示选中的表单
   - 可以编辑字段

3. **普通模式测试**：
   - 从菜单进入动态表单管理 → 应该显示所有表单列表
   - 可以创建、编辑、删除表单

## 相关文件

- `src/app/shared/components/form-builder/form-builder.component.ts`
- `src/app/shared/components/form-builder/form-builder.component.html`
- `src/app/features/workflow/workflow.component.ts`
- `src/app/features/workflow/workflow.component.html`
