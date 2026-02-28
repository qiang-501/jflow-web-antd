import { inject } from '@angular/core';
import {
  Router,
  CanActivateFn,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * 认证路由守卫
 * 检查用户是否已登录，未登录则跳转到登录页
 *
 * 用法：
 * {
 *   path: 'dashboard',
 *   component: DashboardComponent,
 *   canActivate: [authGuard]
 * }
 */
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 检查是否已认证
  if (authService.isAuthenticated()) {
    return true;
  }

  // 未认证，保存当前路径并跳转到登录页
  sessionStorage.setItem('returnUrl', state.url);
  router.navigate(['/login']);
  return false;
};
