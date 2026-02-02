# Mock 数据文件说明

本目录包含应用程序的所有Mock数据，用于开发和测试环境。

## 数据文件列表

### 1. menuResult.json

- **用途**: 菜单结构数据
- **说明**: 定义应用程序的导航菜单结构

### 2. menuActions.json

- **用途**: 菜单操作权限数据
- **说明**: 定义各菜单项的可用操作

### 3. mockUsers.json

- **用途**: 用户数据
- **说明**: 包含管理员和普通用户的模拟数据
- **默认用户**:
  - admin (系统管理员)
  - user1 (普通用户)

### 4. mockRoles.json

- **用途**: 角色数据
- **说明**: 定义系统中的角色及其权限映射
- **默认角色**:
  - super_admin (超级管理员)
  - user (普通用户)

### 5. mockPermissions.json

- **用途**: 权限数据
- **说明**: 定义系统中所有可用的权限
- **权限类型**:
  - action: 操作权限
  - menu: 菜单权限

### 6. mockMenuPermissions.json

- **用途**: 菜单权限关联数据
- **说明**: 定义菜单与其可用操作的关联关系

### 7. mockWorkflows.json

- **用途**: 工作流数据
- **说明**: 包含工作流实例的模拟数据
- **字段说明**:
  - status: draft, pending, in_progress, review, completed, cancelled
  - priority: low, medium, high, urgent

### 8. mockWorkflowHistory.json

- **用途**: 工作流历史记录
- **说明**: 记录工作流状态变更的历史

### 9. mockFormConfigs.json

- **用途**: 动态表单配置
- **说明**: 定义动态表单的结构和字段
- **支持的字段类型**:
  - text, number, textarea, select, date, switch, etc.

## 使用方式

这些数据文件在 `fake-backend.interceptor.ts` 中被导入和使用，为前端提供模拟的API响应。

## 修改数据

如需修改Mock数据，直接编辑对应的JSON文件即可。修改后无需重启开发服务器，刷新页面即可看到更新。

## 注意事项

1. 所有日期字段使用ISO 8601格式字符串
2. 枚举值需要与TypeScript模型定义保持一致
3. 修改数据结构时，请同步更新对应的TypeScript接口定义
