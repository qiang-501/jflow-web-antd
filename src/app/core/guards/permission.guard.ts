// permission.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

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
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredPermissions = route.data['permissions'] as string[] | undefined;
  const operator = (route.data['operator'] as 'AND' | 'OR') || 'OR';

  // 如果没有指定权限要求，直接通过
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }

  // 检查权限
  const hasPermission =
    operator === 'AND'
      ? authService.hasAllPermissions(requiredPermissions)
      : authService.hasAnyPermission(requiredPermissions);

  if (!hasPermission) {
    console.warn('Insufficient permissions:', requiredPermissions);
    router.navigate(['/unauthorized']);
    return false;
  }

  return true;
};
