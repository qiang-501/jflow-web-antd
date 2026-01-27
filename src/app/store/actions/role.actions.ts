// role.actions.ts
import { createActionGroup, props, emptyProps } from '@ngrx/store';
import {
  Role,
  RoleTree,
  CreateRoleDto,
  UpdateRoleDto,
  RoleInheritance,
} from '../../models/role.model';

export const RoleActions = createActionGroup({
  source: 'Role',
  events: {
    // 加载角色列表
    'Load Roles': props<{ page?: number }>(),
    'Roles Loaded Success': props<{ payload: Role[] }>(),
    'Roles Loaded Error': props<{ payload: any }>(),

    // 加载角色树
    'Load Role Tree': emptyProps(),
    'Role Tree Loaded Success': props<{ payload: RoleTree[] }>(),
    'Role Tree Loaded Error': props<{ payload: any }>(),

    // 加载单个角色
    'Load Role': props<{ id: string }>(),
    'Role Loaded Success': props<{ payload: Role }>(),
    'Role Loaded Error': props<{ payload: any }>(),

    // 创建角色
    'Create Role': props<{ role: CreateRoleDto }>(),
    'Create Role Success': props<{ payload: Role }>(),
    'Create Role Error': props<{ payload: any }>(),

    // 更新角色
    'Update Role': props<{ role: UpdateRoleDto }>(),
    'Update Role Success': props<{ payload: Role }>(),
    'Update Role Error': props<{ payload: any }>(),

    // 删除角色
    'Delete Role': props<{ id: string }>(),
    'Delete Role Success': props<{ id: string }>(),
    'Delete Role Error': props<{ payload: any }>(),

    // 分配权限
    'Assign Permissions': props<{ roleId: string; permissionIds: string[] }>(),
    'Assign Permissions Success': props<{ payload: Role }>(),
    'Assign Permissions Error': props<{ payload: any }>(),

    // 获取角色继承关系
    'Load Role Inheritance': props<{ roleId: string }>(),
    'Role Inheritance Loaded Success': props<{
      payload: RoleInheritance[];
    }>(),
    'Role Inheritance Loaded Error': props<{ payload: any }>(),

    // 选择角色
    'Select Role': props<{ role: Role | null }>(),
  },
});
