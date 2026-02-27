// role.model.ts
import { EntityState } from '@ngrx/entity';
import { ApiError } from './store.model';
import { Permission } from './permission.model';

export interface Role {
  id: string;
  name: string;
  code: string; // 角色编码，用于程序中判断
  description?: string;
  parentId?: string; // 父角色ID，支持角色继承
  permissionIds?: string[]; // 角色拥有的权限ID列表（用于前端）
  permissions?: Permission[]; // 角色拥有的权限对象列表（从后端返回）
  createdAt: Date;
  updatedAt: Date;
  level: number; // 角色层级，用于显示和继承计算
}

export interface RoleTree extends Role {
  children?: RoleTree[];
}

export interface CreateRoleDto {
  name: string;
  code: string;
  description?: string;
  parentId?: number;
  level?: number;
  permissionIds?: number[];
}

export interface UpdateRoleDto {
  name?: string;
  code?: string;
  description?: string;
  parentId?: number;
  level?: number;
  permissionIds?: number[];
}

// 使用 EntityState 管理角色集合
export interface RoleState extends EntityState<Role> {
  roleTree: RoleTree[];
  selectedRoleId: string | null;
  loading: boolean;
  error: ApiError | null;
}

// 角色继承关系
export interface RoleInheritance {
  roleId: string;
  inheritedRoleId: string;
  inheritedPermissions: string[]; // 继承的权限ID列表
}
