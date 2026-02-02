// user.effects.ts
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, mergeMap } from 'rxjs/operators';
import { UserService } from '../../core/services/user.service';
import { UserActions } from '../actions/user.actions';

@Injectable()
export class UserEffects {
  private actions$ = inject(Actions);
  private userService = inject(UserService);

  // 加载用户列表
  loadUsers$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(UserActions.loadUsers),
      mergeMap(() => {
        return this.userService.getUsers().pipe(
          map((response) =>
            UserActions.usersLoadedSuccess({ payload: response.data }),
          ),
          catchError((error) =>
            of(UserActions.usersLoadedError({ payload: error })),
          ),
        );
      }),
    );
  });

  // 加载单个用户
  loadUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(UserActions.loadUser),
      mergeMap(({ id }) => {
        return this.userService.getUserById(id).pipe(
          map((user) => UserActions.userLoadedSuccess({ payload: user })),
          catchError((error) =>
            of(UserActions.userLoadedError({ payload: error })),
          ),
        );
      }),
    );
  });

  // 创建用户
  createUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(UserActions.createUser),
      mergeMap(({ user }) => {
        return this.userService.createUser(user).pipe(
          map((newUser) => UserActions.createUserSuccess({ payload: newUser })),
          catchError((error) =>
            of(UserActions.createUserError({ payload: error })),
          ),
        );
      }),
    );
  });

  // 更新用户
  updateUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(UserActions.updateUser),
      mergeMap(({ id, user }) => {
        return this.userService.updateUser(id, user).pipe(
          map((updatedUser) =>
            UserActions.updateUserSuccess({ payload: updatedUser }),
          ),
          catchError((error) =>
            of(UserActions.updateUserError({ payload: error })),
          ),
        );
      }),
    );
  });

  // 删除用户
  deleteUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(UserActions.deleteUser),
      mergeMap(({ id }) => {
        return this.userService.deleteUser(id).pipe(
          map(() => UserActions.deleteUserSuccess({ id })),
          catchError((error) =>
            of(UserActions.deleteUserError({ payload: error })),
          ),
        );
      }),
    );
  });

  // 批量删除用户
  deleteUsers$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(UserActions.deleteUsers),
      mergeMap(({ ids }) => {
        return this.userService.deleteUsers(ids).pipe(
          map(() => UserActions.deleteUsersSuccess({ ids })),
          catchError((error) =>
            of(UserActions.deleteUsersError({ payload: error })),
          ),
        );
      }),
    );
  });

  // 分配角色
  assignRoles$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(UserActions.assignRoles),
      mergeMap(({ userId, roleIds }) => {
        return this.userService.assignRoles(userId, roleIds).pipe(
          map((user) => UserActions.assignRolesSuccess({ payload: user })),
          catchError((error) =>
            of(UserActions.assignRolesError({ payload: error })),
          ),
        );
      }),
    );
  });

  // 重置密码
  resetPassword$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(UserActions.resetPassword),
      mergeMap(({ userId, newPassword }) => {
        return this.userService.resetPassword(userId, newPassword).pipe(
          map(() => UserActions.resetPasswordSuccess({ userId })),
          catchError((error) =>
            of(UserActions.resetPasswordError({ payload: error })),
          ),
        );
      }),
    );
  });
}
