# 菜单管理功能

## 功能概述

菜单管理功能提供了完整的菜单CRUD操作，支持层级菜单结构、菜单类型管理、权限控制等功能。

### 核心特性

- ✅ **双视图模式**: 支持树形视图和列表视图自由切换
- ✅ **层级结构**: 支持无限层级的父子菜单关系
- ✅ **树形展示**: 在树形视图中直观展示菜单层级结构
- ✅ **完整CRUD**: 创建、编辑、删除、查询菜单
- ✅ **智能父菜单选择**: 使用树形下拉框，自动防止循环引用
- ✅ **状态管理**: 支持启用/禁用菜单状态
- ✅ **可见性控制**: 控制菜单是否在侧边栏显示
- ✅ **权限控制**: 基于RBAC的细粒度权限管理
- ✅ **分页支持**: 列表视图支持后端分页，树形视图支持前端分页
- ✅ **实时切换**: 状态和可见性支持一键切换

## 技术栈

- **前端**: Angular 21 + Ng-Zorro (Ant Design)
- **后端**: NestJS + TypeORM
- **权限控制**: 基于RBAC的菜单级和操作级权限

## 数据库表结构

### menus 表

```sql
CREATE TABLE menus (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,           -- 菜单唯一标识(英文)
  title VARCHAR(100) NOT NULL,                 -- 菜单显示标题
  type VARCHAR(20) NOT NULL,                   -- 菜单类型: menu/button/link
  parent_id INTEGER REFERENCES menus(id),      -- 父菜单ID
  path VARCHAR(255),                           -- 路由路径
  icon VARCHAR(100),                           -- 图标名称
  component VARCHAR(255),                      -- 组件路径
  permission VARCHAR(100),                     -- 权限标识
  sort_order INTEGER DEFAULT 0,                -- 排序值(越小越靠前)
  status VARCHAR(20) DEFAULT 'active',         -- 状态: active/inactive
  is_visible BOOLEAN DEFAULT true,             -- 是否可见
  meta JSONB,                                  -- 扩展元数据
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 字段说明

- **name**: 菜单的唯一英文标识，如 `user-management`
- **title**: 在界面上显示的菜单名称，支持多语言
- **type**: 菜单类型
  - `menu`: 菜单项
  - `button`: 按钮
  - `link`: 外部链接
- **parent_id**: 父菜单ID，为null表示顶级菜单
- **path**: 路由路径，如 `main/users`
- **icon**: Ant Design 图标名称，如 `user`
- **component**: 组件文件路径(可选)
- **permission**: 权限标识，如 `menu:view`
- **sort_order**: 排序顺序，数字越小越靠前
- **status**: 菜单状态
  - `active`: 激活
  - `inactive`: 停用
- **is_visible**: 是否在菜单栏中可见
- **meta**: JSON格式的扩展数据，可存储额外配置

## API 接口

### 1. 获取菜单列表 (分页)

```http
GET /menus?page=1&limit=20&search=user
```

**响应示例**:

```json
{
  "data": [
    {
      "id": 1,
      "name": "user-management",
      "title": "用户管理",
      "type": "menu",
      "parentId": null,
      "path": "main/users",
      "icon": "user",
      "permission": "menu:view",
      "sortOrder": 1,
      "status": "active",
      "isVisible": true
    }
  ],
  "total": 100
}
```

### 2. 获取菜单树

```http
GET /menus/tree
```

**响应示例**:

```json
[
  {
    "id": 1,
    "name": "system",
    "title": "系统管理",
    "children": [
      {
        "id": 2,
        "name": "user-management",
        "title": "用户管理",
        "children": []
      }
    ]
  }
]
```

### 3. 获取单个菜单

```http
GET /menus/:id
```

### 4. 创建菜单

```http
POST /menus
Content-Type: application/json

{
  "name": "user-management",
  "title": "用户管理",
  "type": "menu",
  "parentId": 1,
  "path": "main/users",
  "icon": "user",
  "permission": "user:view",
  "sortOrder": 1,
  "status": "active",
  "isVisible": true
}
```

### 5. 更新菜单

```http
PUT /menus/:id
Content-Type: application/json

{
  "title": "用户管理(修改)",
  "status": "inactive"
}
```

### 6. 删除菜单

```http
DELETE /menus/:id
```

**注意**: 如果菜单有子菜单，将无法删除

### 7. 更新排序

```http
PUT /menus/sort/update
Content-Type: application/json

[
  { "id": 1, "sortOrder": 1 },
  { "id": 2, "sortOrder": 2 }
]
```

## 权限配置

### 权限标识

在 `src/assets/data/mockPermissions.json` 中添加以下权限:

```json
{
  "id": 11,
  "name": "menu:view",
  "code": "menu:view",
  "description": "查看菜单"
},
{
  "id": 12,
  "name": "menu:create",
  "code": "menu:create",
  "description": "创建菜单"
},
{
  "id": 13,
  "name": "menu:edit",
  "code": "menu:edit",
  "description": "编辑菜单"
},
{
  "id": 14,
  "name": "menu:delete",
  "code": "menu:delete",
  "description": "删除菜单"
}
```

### 菜单入口配置

在 `src/assets/data/menuResult.json` 中添加菜单项:

```json
{
  "id": 11,
  "title": "Menus",
  "name": "Menus",
  "icon": "menu",
  "link": "menus",
  "open": false,
  "permission": "menu:view",
  "children": []
}
```

## 前端组件

### 文件结构

```
src/app/
├── core/services/
│   └── menu.service.ts              # 菜单服务
└── features/system/
    ├── menu-management.component.ts   # 菜单管理组件
    ├── menu-management.component.html # 模板文件
    └── menu-management.component.css  # 样式文件
```

### MenuService

提供菜单相关的HTTP操作:

```typescript
export class MenuService {
  getMenus(page: number, limit: number, search?: string): Observable<{ data: Menu[]; total: number }>;
  getMenuTree(): Observable<Menu[]>;
  getMenuById(id: number): Observable<Menu>;
  createMenu(dto: CreateMenuDto): Observable<Menu>;
  updateMenu(id: number, dto: UpdateMenuDto): Observable<Menu>;
  deleteMenu(id: number): Observable<void>;
  updateSortOrder(sortData: { id: number; sortOrder: number }[]): Observable<void>;
}
```

### MenuManagementComponent

主要功能:

- ✅ 菜单列表展示 (分页)
- ✅ 创建菜单
- ✅ 编辑菜单
- ✅ 删除菜单
- ✅ 状态切换
- ✅ 可见性切换
- ✅ 父菜单选择 (树形下拉)
- ✅ 权限控制

### 组件特性

1. **双视图模式**:
   - 树形视图：以层级结构展示菜单，直观显示父子关系
   - 列表视图：平铺展示所有菜单，便于快速查找
   - 一键切换：通过按钮组即可切换视图模式
2. **树形表格**:
   - 自动识别children属性展示层级结构
   - 展开/折叠功能，控制子菜单显示
   - 缩进显示，清晰呈现层级关系
   - 支持多层嵌套
3. **智能父菜单选择**:
   - 使用树形下拉框选择父菜单
   - 编辑时自动禁用当前菜单，防止循环引用
   - 支持清空选择，设为顶级菜单
4. **状态管理**:
   - 状态徽章：使用不同颜色显示菜单状态
   - 类型标签：用颜色标签区分菜单类型
   - 可见性开关：一键切换菜单可见性
   - 状态开关：快速启用/禁用菜单
5. **权限控制**: 根据用户权限显示/隐藏操作按钮

6. **分页支持**:
   - 列表视图：后端分页，性能更好
   - 树形视图：前端分页，保持结构完整

## 使用说明

### 1. 访问菜单管理

在侧边栏点击 "Menus" 进入菜单管理页面 (需要 `menu:view` 权限)

### 2. 切换视图模式

菜单管理支持两种显示模式：

- **树形视图** (推荐): 以层级结构展示所有菜单和子菜单，可以清晰看到父子关系
  - 点击菜单名称左侧的展开图标可查看子菜单
  - 子菜单会自动缩进显示，层级关系清晰
  - 支持前端分页
  - 只有包含子菜单的项才显示展开图标
  - 适合查看完整的菜单层级结构
- **列表视图**: 平铺显示所有菜单
  - 支持后端分页
  - 显示父菜单列
  - 适合快速查找和编辑单个菜单

点击页面右上角的视图切换按钮即可在两种模式间切换。

### 3. 子菜单管理

在**树形视图**中：

1. 父菜单左侧有展开/折叠图标
2. 点击图标可展开查看子菜单
3. 子菜单会缩进显示，层级关系清晰
4. 支持多层嵌套结构

创建子菜单：

1. 点击"創建菜单"按钮
2. 在"父菜单"下拉框中选择父级菜单
3. 填写其他信息后保存
4. 新创建的子菜单会显示在父菜单下方

### 4. 创建菜单

1. 点击"创建菜单"按钮
2. 填写菜单信息:
   - **Name**: 唯一英文标识 (必填)
   - **Title**: 显示标题 (必填)
   - **Type**: 菜单类型 (必填)
   - **Parent**: 父菜单 (可选，不选则为顶级菜单)
   - **Path**: 路由路径
   - **Icon**: 图标名称
   - **Component**: 组件路径
   - **Permission**: 权限标识
   - **Sort Order**: 排序值
   - **Status**: 状态
   - **Visible**: 是否可见
3. 点击"确认"保存

### 5. 编辑菜单

1. 在列表中找到要编辑的菜单
2. 点击"编辑"按钮
3. 修改信息后点击"确认"保存

**注意**: 编辑时不能选择自身作为父菜单，系统会自动禁用该选项以防止循环引用。

### 6. 删除菜单

1. 在列表中找到要删除的菜单
2. 点击"删除"按钮
3. 确认删除操作

**注意**: 有子菜单的菜单无法删除，需先删除所有子菜单后才能删除父菜单。

### 7. 切换状态/可见性

直接点击列表中的状态开关或可见性开关即可切换

## 注意事项

1. **唯一性约束**: 菜单name字段必须唯一
2. **父子关系**: 不能选择自身作为父菜单，避免循环引用
3. **删除限制**: 有子菜单的菜单无法删除
4. **权限控制**: 操作按钮根据用户权限自动显示/隐藏
5. **路由配置**: 创建菜单后，需要在前端路由配置中添加对应的路由规则

## 扩展开发

### 添加新的菜单类型

1. 在后端 `menu.entity.ts` 中添加新的 `MenuType` 枚举值
2. 在前端组件的 `menuTypes` 数组中添加对应选项
3. 根据需要调整UI显示逻辑

### 自定义元数据

使用 `meta` 字段存储自定义数据:

```typescript
const menu = {
  name: "example",
  title: "Example",
  meta: {
    external: true,
    targetBlank: true,
    customData: "value",
  },
};
```

## 常见问题

### Q: 菜单创建后不显示在侧边栏?

A: 检查以下几点:

1. 菜单状态是否为 `active`
2. `isVisible` 是否为 `true`
3. 是否配置了正确的 `permission`
4. 用户角色是否有对应权限

### Q: 无法删除菜单?

A: 可能原因:

1. 该菜单有子菜单，需先删除子菜单
2. 没有 `menu:delete` 权限

### Q: 父菜单选择器为空?

A: 菜单树需要从后端加载，检查:

1. `/menus/tree` API是否正常
2. 是否有菜单数据
3. 网络请求是否成功

## 后续优化建议

1. **拖拽排序**: 支持通过拖拽调整菜单顺序
2. **批量操作**: 支持批量启用/停用/删除菜单
3. **导入导出**: 支持菜单配置的导入导出
4. **菜单预览**: 实时预览菜单在侧边栏的显示效果
5. **多语言支持**: title字段支持多语言配置
6. **图标选择器**: 提供可视化的图标选择组件
