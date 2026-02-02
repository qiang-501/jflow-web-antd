// permission.model.ts
export interface Permission {
  id: string;
  name: string;
  code: string; // 权限编码，如 'user:create', 'role:delete'
  type: PermissionType;
  menuId?: string; // 关联的菜单ID
  actionId?: string; // 关联的操作ID
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum PermissionType {
  Menu = 'menu', // 菜单权限
  Action = 'action', // 操作权限（按钮、功能点）
  Data = 'data', // 数据权限
}

export interface MenuPermission {
  id: string;
  menuId: string;
  menuName: string;
  path: string;
  icon?: string;
  parentId?: string;
  orderNum: number;
  visible: boolean;
  actions: ActionPermission[]; // 该菜单下的操作权限
}

export interface ActionPermission {
  id: string;
  name: string;
  code: string; // 如 'add', 'edit', 'delete', 'export'
  menuId: string;
  description?: string;
}

export interface CreatePermissionDto {
  code: string;
  name: string;
  type?: PermissionType;
  description?: string;
  resource?: string;
  action?: string;
}

export interface UpdatePermissionDto {
  code?: string;
  name?: string;
  type?: PermissionType;
  description?: string;
  resource?: string;
  action?: string;
}

export interface PermissionState {
  permissions: Permission[];
  menuPermissions: MenuPermission[];
  selectedPermission: Permission | null;
  loading: boolean;
  error: any;
}

// 权限检查结果
export interface PermissionCheck {
  hasPermission: boolean;
  permissions: string[];
}
