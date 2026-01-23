# 共享模块使用指南

本文档说明如何使用项目中的共享组件、指令、管道和工具类。

## 共享组件

### LoadingComponent - 加载指示器

显示加载状态的组件。

**导入:**

```typescript
import { LoadingComponent } from "./shared/components";
```

**使用:**

```html
<app-loading [loading]="isLoading" [message]="'正在加载数据...'"> </app-loading>
```

**属性:**

- `loading`: boolean - 是否显示加载状态
- `message`: string - 加载提示信息（可选）

### ConfirmDialogComponent - 确认对话框

显示确认对话框的组件。

**导入:**

```typescript
import { ConfirmDialogComponent } from "./shared/components";
```

**使用:**

```html
<app-confirm-dialog [visible]="showDialog" [title]="'确认删除'" [message]="'确定要删除这条记录吗？'" [confirmText]="'确定'" [cancelText]="'取消'" (confirm)="onConfirm()" (cancel)="onCancel()"> </app-confirm-dialog>
```

**属性:**

- `visible`: boolean - 是否显示对话框
- `title`: string - 对话框标题
- `message`: string - 对话框内容
- `confirmText`: string - 确认按钮文字
- `cancelText`: string - 取消按钮文字

**事件:**

- `confirm`: 点击确认按钮时触发
- `cancel`: 点击取消按钮时触发

## 共享指令

### DebounceClickDirective - 防抖点击

防止按钮被快速重复点击。

**导入:**

```typescript
import { DebounceClickDirective } from "./shared/directives";
```

**使用:**

```html
<button appDebounceClick [debounceTime]="300" (debounceClick)="handleClick()">点击我</button>
```

**属性:**

- `debounceTime`: number - 防抖延迟时间（毫秒），默认300
- `debounceClick`: Function - 防抖后的点击事件

### PermissionDirective - 权限控制

根据用户权限显示/隐藏元素。

**导入:**

```typescript
import { PermissionDirective } from "./shared/directives";
```

**使用:**

```html
<!-- 单个权限 -->
<button *appPermission="'admin'">管理员按钮</button>

<!-- 多个权限（满足其一即可） -->
<button *appPermission="['admin', 'editor']">编辑按钮</button>
```

### AutoFocusDirective - 自动聚焦

页面加载时自动聚焦到指定输入框。

**导入:**

```typescript
import { AutoFocusDirective } from "./shared/directives";
```

**使用:**

```html
<input type="text" appAutoFocus placeholder="自动聚焦" />

<!-- 条件聚焦 -->
<input type="text" [appAutoFocus]="shouldFocus" />
```

## 共享管道

### TimeAgoPipe - 相对时间

将时间戳转换为相对时间描述。

**导入:**

```typescript
import { TimeAgoPipe } from "./shared/pipes";
```

**使用:**

```html
<span>{{ createdAt | timeAgo }}</span>
<!-- 输出: "2 hours ago" -->
```

### FileSizePipe - 文件大小格式化

将字节数转换为可读的文件大小。

**导入:**

```typescript
import { FileSizePipe } from "./shared/pipes";
```

**使用:**

```html
<span>{{ fileSize | fileSize }}</span>
<!-- 输入: 1024, 输出: "1 KB" -->

<span>{{ fileSize | fileSize:0 }}</span>
<!-- 不显示小数 -->
```

### HighlightPipe - 高亮搜索词

在文本中高亮显示搜索关键词。

**导入:**

```typescript
import { HighlightPipe } from "./shared/pipes";
```

**使用:**

```html
<div [innerHTML]="text | highlight:searchTerm"></div>
```

**样式:**

```css
mark {
  background-color: yellow;
  padding: 2px;
}
```

### SafeHtmlPipe - 安全HTML

标记HTML字符串为安全（已进行XSS防护）。

**导入:**

```typescript
import { SafeHtmlPipe } from "./shared/pipes";
```

**使用:**

```html
<div [innerHTML]="htmlContent | safeHtml"></div>
```

## 工具类

### StorageUtil - 本地存储

类型安全的localStorage操作。

**导入:**

```typescript
import { StorageUtil } from "./core/utils";
```

**使用:**

```typescript
// 保存数据
StorageUtil.setItem("user", { id: 1, name: "John" });

// 读取数据
const user = StorageUtil.getItem<User>("user");

// 读取数据（带默认值）
const settings = StorageUtil.getItem("settings", { theme: "light" });

// 删除数据
StorageUtil.removeItem("user");

// 检查是否存在
if (StorageUtil.hasItem("token")) {
  // ...
}

// 清空所有
StorageUtil.clear();
```

### DateUtil - 日期工具

日期格式化和计算工具。

**导入:**

```typescript
import { DateUtil } from "./core/utils";
```

**使用:**

```typescript
// 格式化日期
const formatted = DateUtil.format(new Date(), "YYYY-MM-DD HH:mm:ss");

// 计算日期差异
const days = DateUtil.getDaysDiff("2024-01-01", "2024-01-10"); // 9

// 检查日期范围
const inRange = DateUtil.isInRange("2024-01-05", "2024-01-01", "2024-01-31"); // true

// 获取今天开始时间
const startOfDay = DateUtil.getStartOfDay();

// 获取今天结束时间
const endOfDay = DateUtil.getEndOfDay();
```

### ValidationUtil - 验证工具

常用验证方法。

**导入:**

```typescript
import { ValidationUtil } from "./core/utils";
```

**使用:**

```typescript
// 验证邮箱
ValidationUtil.isEmail("test@example.com"); // true

// 验证手机号
ValidationUtil.isPhoneNumber("13800138000"); // true

// 验证URL
ValidationUtil.isUrl("https://example.com"); // true

// 验证身份证
ValidationUtil.isIdCard("110101199001011234"); // true

// 检查密码强度
const strength = ValidationUtil.getPasswordStrength("Abc123!@#");
// 返回: 0-弱, 1-中, 2-强

// 检查是否为空
ValidationUtil.isEmpty(""); // true
ValidationUtil.isEmpty([]); // true
ValidationUtil.isEmpty({}); // true
```

### ArrayUtil - 数组工具

数组操作辅助方法。

**导入:**

```typescript
import { ArrayUtil } from "./core/utils";
```

**使用:**

```typescript
// 数组去重
const unique = ArrayUtil.unique([1, 2, 2, 3, 3, 4]); // [1, 2, 3, 4]

// 根据属性去重
const users = [
  { id: 1, name: "John" },
  { id: 2, name: "Jane" },
  { id: 1, name: "John Doe" },
];
const uniqueUsers = ArrayUtil.uniqueBy(users, "id");

// 数组分组
const grouped = ArrayUtil.groupBy(
  [
    { type: "A", value: 1 },
    { type: "B", value: 2 },
    { type: "A", value: 3 },
  ],
  "type",
);
// 结果: { A: [...], B: [...] }

// 数组分页
const page2 = ArrayUtil.paginate([1, 2, 3, 4, 5, 6], 2, 2); // [3, 4]

// 数组求和
const sum = ArrayUtil.sum([1, 2, 3, 4, 5]); // 15

// 数组平均值
const avg = ArrayUtil.average([1, 2, 3, 4, 5]); // 3

// 打乱数组
const shuffled = ArrayUtil.shuffle([1, 2, 3, 4, 5]);

// 数组扁平化
const flat = ArrayUtil.flatten([1, [2, 3], [4, [5, 6]]]); // [1, 2, 3, 4, 5, 6]
```

## 在组件中使用

### TypeScript组件示例

```typescript
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LoadingComponent, ConfirmDialogComponent } from "./shared/components";
import { DebounceClickDirective, AutoFocusDirective } from "./shared/directives";
import { TimeAgoPipe, FileSizePipe } from "./shared/pipes";
import { StorageUtil, DateUtil, ValidationUtil } from "./core/utils";

@Component({
  selector: "app-example",
  standalone: true,
  imports: [CommonModule, LoadingComponent, ConfirmDialogComponent, DebounceClickDirective, AutoFocusDirective, TimeAgoPipe, FileSizePipe],
  templateUrl: "./example.component.html",
})
export class ExampleComponent {
  isLoading = false;
  showDialog = false;
  createdAt = new Date();
  fileSize = 1024 * 1024; // 1MB

  ngOnInit() {
    // 使用工具类
    const user = StorageUtil.getItem("user");
    const formattedDate = DateUtil.format(new Date(), "YYYY-MM-DD");

    if (ValidationUtil.isEmail("test@example.com")) {
      console.log("Valid email");
    }
  }

  handleClick() {
    console.log("Debounced click");
  }

  onConfirm() {
    this.showDialog = false;
    // 执行删除操作
  }

  onCancel() {
    this.showDialog = false;
  }
}
```

## 最佳实践

1. **按需导入**: 只导入需要的组件、指令和管道
2. **类型安全**: 使用工具类时指定泛型类型
3. **错误处理**: 工具类已包含错误处理，但仍需在业务层添加必要的验证
4. **性能优化**: 防抖指令可以有效防止重复操作，建议在所有提交按钮上使用
5. **权限控制**: 结合实际的权限系统实现PermissionDirective的逻辑

## 扩展建议

可以根据项目需要添加更多共享资源：

- **组件**: 表格组件、表单组件、图表组件等
- **指令**: 拖拽指令、懒加载指令、复制到剪贴板指令等
- **管道**: 货币格式化、数字格式化、截断文本等
- **工具类**: HTTP工具、加密工具、下载工具等
