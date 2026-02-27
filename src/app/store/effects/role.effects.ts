// role.effects.ts
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, exhaustMap, concatMap, tap } from 'rxjs/operators';
import { RoleService } from '../../core/services/role.service';
import { RoleActions } from '../actions/role.actions';
import { ApiError } from '../../models/store.model';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable()
export class RoleEffects {
  private actions$ = inject(Actions);
  private roleService = inject(RoleService);
  private messageService = inject(NzMessageService);

  // 加载角色列表
  loadRoles$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(RoleActions.loadRoles),
      exhaustMap(() => {
        return this.roleService.getRoles().pipe(
          map((roles) => RoleActions.rolesLoadedSuccess({ payload: roles })),
          catchError((error) =>
            of(
              RoleActions.rolesLoadedError({
                payload: this.handleError(error),
              }),
            ),
          ),
        );
      }),
    );
  });

  // 加载角色树
  loadRoleTree$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(RoleActions.loadRoleTree),
      exhaustMap(() => {
        return this.roleService.getRoleTree().pipe(
          map((roleTree) =>
            RoleActions.roleTreeLoadedSuccess({ payload: roleTree }),
          ),
          catchError((error) =>
            of(
              RoleActions.roleTreeLoadedError({
                payload: this.handleError(error),
              }),
            ),
          ),
        );
      }),
    );
  });

  // 加载单个角色
  loadRole$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(RoleActions.loadRole),
      exhaustMap(({ id }) => {
        return this.roleService.getRoleById(id).pipe(
          map((role) => RoleActions.roleLoadedSuccess({ payload: role })),
          catchError((error) =>
            of(
              RoleActions.roleLoadedError({ payload: this.handleError(error) }),
            ),
          ),
        );
      }),
    );
  });

  // 创建角色
  createRole$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(RoleActions.createRole),
      concatMap(({ role }) => {
        return this.roleService.createRole(role).pipe(
          map((newRole) => RoleActions.createRoleSuccess({ payload: newRole })),
          catchError((error) =>
            of(
              RoleActions.createRoleError({ payload: this.handleError(error) }),
            ),
          ),
        );
      }),
    );
  });

  // 更新角色
  updateRole$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(RoleActions.updateRole),
      concatMap(({ id, role }) => {
        return this.roleService.updateRole(id, role).pipe(
          map((updatedRole) =>
            RoleActions.updateRoleSuccess({ payload: updatedRole }),
          ),
          catchError((error) =>
            of(
              RoleActions.updateRoleError({ payload: this.handleError(error) }),
            ),
          ),
        );
      }),
    );
  });

  // 删除角色
  deleteRole$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(RoleActions.deleteRole),
      concatMap(({ id }) => {
        return this.roleService.deleteRole(id).pipe(
          map(() => RoleActions.deleteRoleSuccess({ id })),
          catchError((error) =>
            of(
              RoleActions.deleteRoleError({ payload: this.handleError(error) }),
            ),
          ),
        );
      }),
    );
  });

  // 分配权限
  assignPermissions$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(RoleActions.assignPermissions),
      concatMap(({ roleId, permissionIds }) => {
        return this.roleService.assignPermissions(roleId, permissionIds).pipe(
          map((role) =>
            RoleActions.assignPermissionsSuccess({ payload: role }),
          ),
          catchError((error) =>
            of(
              RoleActions.assignPermissionsError({
                payload: this.handleError(error),
              }),
            ),
          ),
        );
      }),
    );
  });

  // 加载角色继承关系
  loadRoleInheritance$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(RoleActions.loadRoleInheritance),
      exhaustMap(({ roleId }) => {
        return this.roleService.getRoleInheritance(roleId).pipe(
          map((inheritance) =>
            RoleActions.roleInheritanceLoadedSuccess({ payload: inheritance }),
          ),
          catchError((error) =>
            of(
              RoleActions.roleInheritanceLoadedError({
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
        ofType(RoleActions.createRoleSuccess),
        tap(() => this.messageService.success('角色创建成功')),
      ),
    { dispatch: false },
  );

  showUpdateSuccessNotification$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(RoleActions.updateRoleSuccess),
        tap(() => this.messageService.success('角色更新成功')),
      ),
    { dispatch: false },
  );

  showDeleteSuccessNotification$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(RoleActions.deleteRoleSuccess),
        tap(() => this.messageService.success('角色删除成功')),
      ),
    { dispatch: false },
  );

  showAssignPermissionsSuccessNotification$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(RoleActions.assignPermissionsSuccess),
        tap(() => this.messageService.success('权限分配成功')),
      ),
    { dispatch: false },
  );

  showErrorNotification$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          RoleActions.rolesLoadedError,
          RoleActions.roleTreeLoadedError,
          RoleActions.roleLoadedError,
          RoleActions.createRoleError,
          RoleActions.updateRoleError,
          RoleActions.deleteRoleError,
          RoleActions.assignPermissionsError,
          RoleActions.roleInheritanceLoadedError,
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
