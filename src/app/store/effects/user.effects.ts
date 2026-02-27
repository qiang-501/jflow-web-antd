// user.effects.ts
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import {
  map,
  catchError,
  mergeMap,
  tap,
  exhaustMap,
  concatMap,
} from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd/message';
import { UserService } from '../../core/services/user.service';
import { UserActions } from '../actions/user.actions';
import { ApiError } from '../../models/store.model';

@Injectable()
export class UserEffects {
  private actions$ = inject(Actions);
  private userService = inject(UserService);
  private message = inject(NzMessageService);

  // 加载用户列表 - 使用 exhaustMap 防止并发请求
  loadUsers$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(UserActions.loadUsers),
      exhaustMap(() => {
        return this.userService.getUsers().pipe(
          map((response) =>
            UserActions.usersLoadedSuccess({ payload: response.data }),
          ),
          catchError((error) => {
            const apiError: ApiError = {
              message: error?.message || '加载用户列表失败',
              code: error?.code,
              status: error?.status,
            };
            return of(UserActions.usersLoadedError({ payload: apiError }));
          }),
        );
      }),
    );
  });

  // 错误处理 - 显示错误消息
  usersLoadedError$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(UserActions.usersLoadedError),
        tap(({ payload }) => {
          this.message.error(payload.message || '操作失败');
        }),
      );
    },
    { dispatch: false },
  );

  // 加载单个用户
  loadUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(UserActions.loadUser),
      exhaustMap(({ id }) => {
        return this.userService.getUserById(id).pipe(
          map((user) => UserActions.userLoadedSuccess({ payload: user })),
          catchError((error) => {
            const apiError: ApiError = {
              message: error?.message || '加载用户失败',
              code: error?.code,
              status: error?.status,
            };
            return of(UserActions.userLoadedError({ payload: apiError }));
          }),
        );
      }),
    );
  });

  userLoadedError$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(UserActions.userLoadedError),
        tap(({ payload }) => {
          this.message.error(payload.message || '加载用户失败');
        }),
      );
    },
    { dispatch: false },
  );

  // 创建用户 - 使用 concatMap 保持顺序
  createUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(UserActions.createUser),
      concatMap(({ user }) => {
        return this.userService.createUser(user).pipe(
          map((newUser) => UserActions.createUserSuccess({ payload: newUser })),
          catchError((error) => {
            const apiError: ApiError = {
              message: error?.message || '创建用户失败',
              code: error?.code,
              status: error?.status,
            };
            return of(UserActions.createUserError({ payload: apiError }));
          }),
        );
      }),
    );
  });

  // 成功后显示消息
  createUserSuccess$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(UserActions.createUserSuccess),
        tap(() => {
          this.message.success('用户创建成功');
        }),
      );
    },
    { dispatch: false },
  );

  createUserError$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(UserActions.createUserError),
        tap(({ payload }) => {
          this.message.error(payload.message || '创建用户失败');
        }),
      );
    },
    { dispatch: false },
  );

  // 更新用户
  updateUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(UserActions.updateUser),
      concatMap(({ id, user }) => {
        return this.userService.updateUser(id, user).pipe(
          map((updatedUser) =>
            UserActions.updateUserSuccess({ payload: updatedUser }),
          ),
          catchError((error) => {
            const apiError: ApiError = {
              message: error?.message || '更新用户失败',
              code: error?.code,
              status: error?.status,
            };
            return of(UserActions.updateUserError({ payload: apiError }));
          }),
        );
      }),
    );
  });

  updateUserSuccess$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(UserActions.updateUserSuccess),
        tap(() => {
          this.message.success('用户更新成功');
        }),
      );
    },
    { dispatch: false },
  );

  updateUserError$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(UserActions.updateUserError),
        tap(({ payload }) => {
          this.message.error(payload.message || '更新用户失败');
        }),
      );
    },
    { dispatch: false },
  );

  // 删除用户
  deleteUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(UserActions.deleteUser),
      concatMap(({ id }) => {
        return this.userService.deleteUser(id).pipe(
          map(() => UserActions.deleteUserSuccess({ id })),
          catchError((error) => {
            const apiError: ApiError = {
              message: error?.message || '删除用户失败',
              code: error?.code,
              status: error?.status,
            };
            return of(UserActions.deleteUserError({ payload: apiError }));
          }),
        );
      }),
    );
  });

  deleteUserSuccess$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(UserActions.deleteUserSuccess),
        tap(() => {
          this.message.success('用户删除成功');
        }),
      );
    },
    { dispatch: false },
  );

  deleteUserError$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(UserActions.deleteUserError),
        tap(({ payload }) => {
          this.message.error(payload.message || '删除用户失败');
        }),
      );
    },
    { dispatch: false },
  );

  // 批量删除用户
  deleteUsers$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(UserActions.deleteUsers),
      concatMap(({ ids }) => {
        return this.userService.deleteUsers(ids).pipe(
          map(() => UserActions.deleteUsersSuccess({ ids })),
          catchError((error) => {
            const apiError: ApiError = {
              message: error?.message || '批量删除用户失败',
              code: error?.code,
              status: error?.status,
            };
            return of(UserActions.deleteUsersError({ payload: apiError }));
          }),
        );
      }),
    );
  });

  deleteUsersSuccess$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(UserActions.deleteUsersSuccess),
        tap(({ ids }) => {
          this.message.success(`成功删除 ${ids.length} 个用户`);
        }),
      );
    },
    { dispatch: false },
  );

  deleteUsersError$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(UserActions.deleteUsersError),
        tap(({ payload }) => {
          this.message.error(payload.message || '批量删除用户失败');
        }),
      );
    },
    { dispatch: false },
  );

  // 分配角色
  assignRoles$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(UserActions.assignRoles),
      concatMap(({ userId, roleIds }) => {
        return this.userService.assignRoles(userId, roleIds).pipe(
          map((user) => UserActions.assignRolesSuccess({ payload: user })),
          catchError((error) => {
            const apiError: ApiError = {
              message: error?.message || '分配角色失败',
              code: error?.code,
              status: error?.status,
            };
            return of(UserActions.assignRolesError({ payload: apiError }));
          }),
        );
      }),
    );
  });

  assignRolesSuccess$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(UserActions.assignRolesSuccess),
        tap(() => {
          this.message.success('角色分配成功');
        }),
      );
    },
    { dispatch: false },
  );

  assignRolesError$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(UserActions.assignRolesError),
        tap(({ payload }) => {
          this.message.error(payload.message || '角色分配失败');
        }),
      );
    },
    { dispatch: false },
  );

  // 重置密码
  resetPassword$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(UserActions.resetPassword),
      concatMap(({ userId, newPassword }) => {
        return this.userService.resetPassword(userId, newPassword).pipe(
          map(() => UserActions.resetPasswordSuccess({ userId })),
          catchError((error) => {
            const apiError: ApiError = {
              message: error?.message || '重置密码失败',
              code: error?.code,
              status: error?.status,
            };
            return of(UserActions.resetPasswordError({ payload: apiError }));
          }),
        );
      }),
    );
  });

  resetPasswordSuccess$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(UserActions.resetPasswordSuccess),
        tap(() => {
          this.message.success('密码重置成功');
        }),
      );
    },
    { dispatch: false },
  );

  resetPasswordError$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(UserActions.resetPasswordError),
        tap(({ payload }) => {
          this.message.error(payload.message || '重置密码失败');
        }),
      );
    },
    { dispatch: false },
  );
}
