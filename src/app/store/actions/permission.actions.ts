// permission.actions.ts
import { createActionGroup, props, emptyProps } from '@ngrx/store';
import {
  Permission,
  MenuPermission,
  ActionPermission,
  CreatePermissionDto,
  UpdatePermissionDto,
} from '../../models/permission.model';

export const PermissionActions = createActionGroup({
  source: 'Permission',
  events: {
    // 加载权限列表
    'Load Permissions': props<{ page?: number }>(),
    'Permissions Loaded Success': props<{ payload: Permission[] }>(),
    'Permissions Loaded Error': props<{ payload: any }>(),

    // 加载菜单权限树
    'Load Menu Permissions': emptyProps(),
    'Menu Permissions Loaded Success': props<{ payload: MenuPermission[] }>(),
    'Menu Permissions Loaded Error': props<{ payload: any }>(),

    // 加载单个权限
    'Load Permission': props<{ id: string }>(),
    'Permission Loaded Success': props<{ payload: Permission }>(),
    'Permission Loaded Error': props<{ payload: any }>(),

    // 创建权限
    'Create Permission': props<{ permission: CreatePermissionDto }>(),
    'Create Permission Success': props<{ payload: Permission }>(),
    'Create Permission Error': props<{ payload: any }>(),

    // 更新权限
    'Update Permission': props<{ permission: UpdatePermissionDto }>(),
    'Update Permission Success': props<{ payload: Permission }>(),
    'Update Permission Error': props<{ payload: any }>(),

    // 删除权限
    'Delete Permission': props<{ id: string }>(),
    'Delete Permission Success': props<{ id: string }>(),
    'Delete Permission Error': props<{ payload: any }>(),

    // 菜单操作权限
    'Create Menu Action': props<{
      menuId: string;
      action: Omit<ActionPermission, 'id' | 'menuId'>;
    }>(),
    'Create Menu Action Success': props<{ payload: ActionPermission }>(),
    'Create Menu Action Error': props<{ payload: any }>(),

    'Update Menu Action': props<{
      menuId: string;
      actionId: string;
      action: Partial<ActionPermission>;
    }>(),
    'Update Menu Action Success': props<{ payload: ActionPermission }>(),
    'Update Menu Action Error': props<{ payload: any }>(),

    'Delete Menu Action': props<{ menuId: string; actionId: string }>(),
    'Delete Menu Action Success': props<{
      menuId: string;
      actionId: string;
    }>(),
    'Delete Menu Action Error': props<{ payload: any }>(),

    // 选择权限
    'Select Permission': props<{ permission: Permission | null }>(),
  },
});
