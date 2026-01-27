// permission.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { selectAllPermissions } from '../../store/selectors/permission.selectors';

/**
 * 权限路由守卫
 * 用法：
 * {
 *   path: 'users',
 *   component: UserManagementComponent,
 *   canActivate: [permissionGuard],
 *   data: { permissions: ['user:view'], operator: 'OR' }
 * }
 */
export const permissionGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);

  const requiredPermissions = route.data['permissions'] as string[] | undefined;
  const operator = (route.data['operator'] as 'AND' | 'OR') || 'OR';

  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }

  return store.select(selectAllPermissions).pipe(
    take(1),
    map((permissions) => {
      const userPermissions = permissions.map((p) => p.code);
      const hasPermission = checkPermission(
        userPermissions,
        requiredPermissions,
        operator,
      );

      if (!hasPermission) {
        router.navigate(['/unauthorized']);
      }

      return hasPermission;
    }),
  );
};

function checkPermission(
  userPermissions: string[],
  requiredPermissions: string[],
  operator: 'AND' | 'OR',
): boolean {
  if (operator === 'AND') {
    return requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );
  } else {
    return requiredPermissions.some((permission) =>
      userPermissions.includes(permission),
    );
  }
}
