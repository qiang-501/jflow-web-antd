// permission.effects.ts
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, exhaustMap, concatMap, tap } from 'rxjs/operators';
import { PermissionService } from '../../core/services/permission.service';
import { PermissionActions } from '../actions/permission.actions';
import { ApiError } from '../../models/store.model';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable()
export class PermissionEffects {
  private actions$ = inject(Actions);
  private permissionService = inject(PermissionService);
  private messageService = inject(NzMessageService);

  // 加载权限列表
  loadPermissions$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PermissionActions.loadPermissions),
      exhaustMap(() => {
        return this.permissionService.getPermissions().pipe(
          map((permissions) =>
            PermissionActions.permissionsLoadedSuccess({
              payload: permissions,
            }),
          ),
          catchError((error) =>
            of(
              PermissionActions.permissionsLoadedError({
                payload: this.handleError(error),
              }),
            ),
          ),
        );
      }),
    );
  });

  // 加载菜单权限树
  loadMenuPermissions$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PermissionActions.loadMenuPermissions),
      exhaustMap(() => {
        return this.permissionService.getMenuPermissions().pipe(
          map((menuPermissions) =>
            PermissionActions.menuPermissionsLoadedSuccess({
              payload: menuPermissions,
            }),
          ),
          catchError((error) =>
            of(
              PermissionActions.menuPermissionsLoadedError({
                payload: this.handleError(error),
              }),
            ),
          ),
        );
      }),
    );
  });

  // 加载单个权限
  loadPermission$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PermissionActions.loadPermission),
      exhaustMap(({ id }) => {
        return this.permissionService.getPermissionById(id).pipe(
          map((permission) =>
            PermissionActions.permissionLoadedSuccess({ payload: permission }),
          ),
          catchError((error) =>
            of(
              PermissionActions.permissionLoadedError({
                payload: this.handleError(error),
              }),
            ),
          ),
        );
      }),
    );
  });

  // 创建权限
  createPermission$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PermissionActions.createPermission),
      concatMap(({ permission }) => {
        return this.permissionService.createPermission(permission).pipe(
          map((newPermission) =>
            PermissionActions.createPermissionSuccess({
              payload: newPermission,
            }),
          ),
          catchError((error) =>
            of(
              PermissionActions.createPermissionError({
                payload: this.handleError(error),
              }),
            ),
          ),
        );
      }),
    );
  });

  // 更新权限
  updatePermission$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PermissionActions.updatePermission),
      concatMap(({ id, permission }) => {
        return this.permissionService.updatePermission(id, permission).pipe(
          map((updatedPermission) =>
            PermissionActions.updatePermissionSuccess({
              payload: updatedPermission,
            }),
          ),
          catchError((error) =>
            of(
              PermissionActions.updatePermissionError({
                payload: this.handleError(error),
              }),
            ),
          ),
        );
      }),
    );
  });

  // 删除权限
  deletePermission$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PermissionActions.deletePermission),
      concatMap(({ id }) => {
        return this.permissionService.deletePermission(id).pipe(
          map(() => PermissionActions.deletePermissionSuccess({ id })),
          catchError((error) =>
            of(
              PermissionActions.deletePermissionError({
                payload: this.handleError(error),
              }),
            ),
          ),
        );
      }),
    );
  });

  // 创建菜单操作
  createMenuAction$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PermissionActions.createMenuAction),
      concatMap(({ menuId, action }) => {
        return this.permissionService.createMenuAction(menuId, action).pipe(
          map((menuAction) =>
            PermissionActions.createMenuActionSuccess({ payload: menuAction }),
          ),
          catchError((error) =>
            of(
              PermissionActions.createMenuActionError({
                payload: this.handleError(error),
              }),
            ),
          ),
        );
      }),
    );
  });

  // 更新菜单操作
  updateMenuAction$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PermissionActions.updateMenuAction),
      concatMap(({ menuId, actionId, action }) => {
        return this.permissionService
          .updateMenuAction(menuId, actionId, action)
          .pipe(
            map((menuAction) =>
              PermissionActions.updateMenuActionSuccess({
                payload: menuAction,
              }),
            ),
            catchError((error) =>
              of(
                PermissionActions.updateMenuActionError({
                  payload: this.handleError(error),
                }),
              ),
            ),
          );
      }),
    );
  });

  // 删除菜单操作
  deleteMenuAction$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PermissionActions.deleteMenuAction),
      concatMap(({ menuId, actionId }) => {
        return this.permissionService.deleteMenuAction(menuId, actionId).pipe(
          map(() =>
            PermissionActions.deleteMenuActionSuccess({ menuId, actionId }),
          ),
          catchError((error) =>
            of(
              PermissionActions.deleteMenuActionError({
                payload: this.handleError(error),
              }),
            ),
          ),
        );
      }),
    );
  });

  // 通知 Effects
  showCreateSuccessNotification$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(PermissionActions.createPermissionSuccess),
        tap(() => this.messageService.success('权限创建成功')),
      ),
    { dispatch: false },
  );

  showUpdateSuccessNotification$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(PermissionActions.updatePermissionSuccess),
        tap(() => this.messageService.success('权限更新成功')),
      ),
    { dispatch: false },
  );

  showDeleteSuccessNotification$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(PermissionActions.deletePermissionSuccess),
        tap(() => this.messageService.success('权限删除成功')),
      ),
    { dispatch: false },
  );

  showMenuActionSuccessNotification$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          PermissionActions.createMenuActionSuccess,
          PermissionActions.updateMenuActionSuccess,
          PermissionActions.deleteMenuActionSuccess,
        ),
        tap(() => this.messageService.success('菜单操作更新成功')),
      ),
    { dispatch: false },
  );

  showErrorNotification$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          PermissionActions.permissionsLoadedError,
          PermissionActions.menuPermissionsLoadedError,
          PermissionActions.permissionLoadedError,
          PermissionActions.createPermissionError,
          PermissionActions.updatePermissionError,
          PermissionActions.deletePermissionError,
          PermissionActions.createMenuActionError,
          PermissionActions.updateMenuActionError,
          PermissionActions.deleteMenuActionError,
        ),
        tap(({ payload }) =>
          this.messageService.error(payload.message || '操作失败'),
        ),
      ),
    { dispatch: false },
  );

  private handleError(error: any): ApiError {
    return {
      message: error?.message || '操作失败',
      code: error?.code,
      status: error?.status,
      details: error?.details,
    };
  }
}
