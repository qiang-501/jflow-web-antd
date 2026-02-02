// role.effects.ts
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, mergeMap } from 'rxjs/operators';
import { RoleService } from '../../core/services/role.service';
import { RoleActions } from '../actions/role.actions';

@Injectable()
export class RoleEffects {
  private actions$ = inject(Actions);
  private roleService = inject(RoleService);

  // 加载角色列表
  loadRoles$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(RoleActions.loadRoles),
      mergeMap(() => {
        return this.roleService.getRoles().pipe(
          map((roles) => RoleActions.rolesLoadedSuccess({ payload: roles })),
          catchError((error) =>
            of(RoleActions.rolesLoadedError({ payload: error })),
          ),
        );
      }),
    );
  });

  // 加载角色树
  loadRoleTree$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(RoleActions.loadRoleTree),
      mergeMap(() => {
        return this.roleService.getRoleTree().pipe(
          map((roleTree) =>
            RoleActions.roleTreeLoadedSuccess({ payload: roleTree }),
          ),
          catchError((error) =>
            of(RoleActions.roleTreeLoadedError({ payload: error })),
          ),
        );
      }),
    );
  });

  // 加载单个角色
  loadRole$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(RoleActions.loadRole),
      mergeMap(({ id }) => {
        return this.roleService.getRoleById(id).pipe(
          map((role) => RoleActions.roleLoadedSuccess({ payload: role })),
          catchError((error) =>
            of(RoleActions.roleLoadedError({ payload: error })),
          ),
        );
      }),
    );
  });

  // 创建角色
  createRole$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(RoleActions.createRole),
      mergeMap(({ role }) => {
        return this.roleService.createRole(role).pipe(
          map((newRole) => RoleActions.createRoleSuccess({ payload: newRole })),
          catchError((error) =>
            of(RoleActions.createRoleError({ payload: error })),
          ),
        );
      }),
    );
  });

  // 更新角色
  updateRole$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(RoleActions.updateRole),
      mergeMap(({ id, role }) => {
        return this.roleService.updateRole(id, role).pipe(
          map((updatedRole) =>
            RoleActions.updateRoleSuccess({ payload: updatedRole }),
          ),
          catchError((error) =>
            of(RoleActions.updateRoleError({ payload: error })),
          ),
        );
      }),
    );
  });

  // 删除角色
  deleteRole$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(RoleActions.deleteRole),
      mergeMap(({ id }) => {
        return this.roleService.deleteRole(id).pipe(
          map(() => RoleActions.deleteRoleSuccess({ id })),
          catchError((error) =>
            of(RoleActions.deleteRoleError({ payload: error })),
          ),
        );
      }),
    );
  });

  // 分配权限
  assignPermissions$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(RoleActions.assignPermissions),
      mergeMap(({ roleId, permissionIds }) => {
        return this.roleService.assignPermissions(roleId, permissionIds).pipe(
          map((role) =>
            RoleActions.assignPermissionsSuccess({ payload: role }),
          ),
          catchError((error) =>
            of(RoleActions.assignPermissionsError({ payload: error })),
          ),
        );
      }),
    );
  });

  // 加载角色继承关系
  loadRoleInheritance$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(RoleActions.loadRoleInheritance),
      mergeMap(({ roleId }) => {
        return this.roleService.getRoleInheritance(roleId).pipe(
          map((inheritance) =>
            RoleActions.roleInheritanceLoadedSuccess({ payload: inheritance }),
          ),
          catchError((error) =>
            of(RoleActions.roleInheritanceLoadedError({ payload: error })),
          ),
        );
      }),
    );
  });
}
