// user.actions.ts
import { createActionGroup, props } from '@ngrx/store';
import { User, CreateUserDto, UpdateUserDto } from '../../models/user.model';
import { ApiError } from '../../models/store.model';

export const UserActions = createActionGroup({
  source: 'User',
  events: {
    // 加载用户列表
    'Load Users': props<{ page?: number }>(),
    'Users Loaded Success': props<{ payload: User[] }>(),
    'Users Loaded Error': props<{ payload: ApiError }>(),

    // 加载单个用户
    'Load User': props<{ id: string }>(),
    'User Loaded Success': props<{ payload: User }>(),
    'User Loaded Error': props<{ payload: ApiError }>(),

    // 创建用户
    'Create User': props<{ user: CreateUserDto }>(),
    'Create User Success': props<{ payload: User }>(),
    'Create User Error': props<{ payload: ApiError }>(),

    // 更新用户
    'Update User': props<{ id: string; user: UpdateUserDto }>(),
    'Update User Success': props<{ payload: User }>(),
    'Update User Error': props<{ payload: ApiError }>(),

    // 删除用户
    'Delete User': props<{ id: string }>(),
    'Delete User Success': props<{ id: string }>(),
    'Delete User Error': props<{ payload: ApiError }>(),

    // 批量删除用户
    'Delete Users': props<{ ids: string[] }>(),
    'Delete Users Success': props<{ ids: string[] }>(),
    'Delete Users Error': props<{ payload: ApiError }>(),

    // 分配角色
    'Assign Roles': props<{ userId: string; roleIds: string[] }>(),
    'Assign Roles Success': props<{ payload: User }>(),
    'Assign Roles Error': props<{ payload: ApiError }>(),

    // 重置密码
    'Reset Password': props<{ userId: string; newPassword: string }>(),
    'Reset Password Success': props<{ userId: string }>(),
    'Reset Password Error': props<{ payload: ApiError }>(),

    // 选择用户
    'Select User': props<{ user: User | null }>(),
  },
});
