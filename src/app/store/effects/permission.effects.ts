// permission.effects.ts
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, mergeMap } from 'rxjs/operators';
import { PermissionService } from '../../core/services/permission.service';
import { PermissionActions } from '../actions/permission.actions';

@Injectable()
export class PermissionEffects {
  private actions$ = inject(Actions);
  private permissionService = inject(PermissionService);

  // 加载权限列表
  loadPermissions$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PermissionActions.loadPermissions),
      mergeMap(() => {
        return this.permissionService.getPermissions().pipe(
          map((permissions) =>
            PermissionActions.permissionsLoadedSuccess({
              payload: permissions,
            }),
          ),
          catchError((error) =>
            of(PermissionActions.permissionsLoadedError({ payload: error })),
          ),
        );
      }),
    );
  });

  // 加载菜单权限树
  loadMenuPermissions$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PermissionActions.loadMenuPermissions),
      mergeMap(() => {
        return this.permissionService.getMenuPermissions().pipe(
          map((menuPermissions) =>
            PermissionActions.menuPermissionsLoadedSuccess({
              payload: menuPermissions,
            }),
          ),
          catchError((error) =>
            of(
              PermissionActions.menuPermissionsLoadedError({ payload: error }),
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
      mergeMap(({ id }) => {
        return this.permissionService.getPermissionById(id).pipe(
          map((permission) =>
            PermissionActions.permissionLoadedSuccess({ payload: permission }),
          ),
          catchError((error) =>
            of(PermissionActions.permissionLoadedError({ payload: error })),
          ),
        );
      }),
    );
  });

  // 创建权限
  createPermission$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PermissionActions.createPermission),
      mergeMap(({ permission }) => {
        return this.permissionService.createPermission(permission).pipe(
          map((newPermission) =>
            PermissionActions.createPermissionSuccess({
              payload: newPermission,
            }),
          ),
          catchError((error) =>
            of(PermissionActions.createPermissionError({ payload: error })),
          ),
        );
      }),
    );
  });

  // 更新权限
  updatePermission$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PermissionActions.updatePermission),
      mergeMap(({ permission }) => {
        return this.permissionService.updatePermission(permission).pipe(
          map((updatedPermission) =>
            PermissionActions.updatePermissionSuccess({
              payload: updatedPermission,
            }),
          ),
          catchError((error) =>
            of(PermissionActions.updatePermissionError({ payload: error })),
          ),
        );
      }),
    );
  });

  // 删除权限
  deletePermission$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PermissionActions.deletePermission),
      mergeMap(({ id }) => {
        return this.permissionService.deletePermission(id).pipe(
          map(() => PermissionActions.deletePermissionSuccess({ id })),
          catchError((error) =>
            of(PermissionActions.deletePermissionError({ payload: error })),
          ),
        );
      }),
    );
  });

  // 创建菜单操作
  createMenuAction$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PermissionActions.createMenuAction),
      mergeMap(({ menuId, action }) => {
        return this.permissionService.createMenuAction(menuId, action).pipe(
          map((menuAction) =>
            PermissionActions.createMenuActionSuccess({ payload: menuAction }),
          ),
          catchError((error) =>
            of(PermissionActions.createMenuActionError({ payload: error })),
          ),
        );
      }),
    );
  });

  // 更新菜单操作
  updateMenuAction$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PermissionActions.updateMenuAction),
      mergeMap(({ menuId, actionId, action }) => {
        return this.permissionService
          .updateMenuAction(menuId, actionId, action)
          .pipe(
            map((menuAction) =>
              PermissionActions.updateMenuActionSuccess({
                payload: menuAction,
              }),
            ),
            catchError((error) =>
              of(PermissionActions.updateMenuActionError({ payload: error })),
            ),
          );
      }),
    );
  });

  // 删除菜单操作
  deleteMenuAction$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PermissionActions.deleteMenuAction),
      mergeMap(({ menuId, actionId }) => {
        return this.permissionService.deleteMenuAction(menuId, actionId).pipe(
          map(() =>
            PermissionActions.deleteMenuActionSuccess({ menuId, actionId }),
          ),
          catchError((error) =>
            of(PermissionActions.deleteMenuActionError({ payload: error })),
          ),
        );
      }),
    );
  });
}
