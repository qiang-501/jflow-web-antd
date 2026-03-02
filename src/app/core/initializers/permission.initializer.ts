import { PermissionService } from '../services/permission.service';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

/**
 * 权限初始化函数
 * 在应用启动时加载用户权限并缓存
 *
 * 注意：只有在用户已登录的情况下才加载权限
 */
export function initializePermissions(
  permissionService: PermissionService,
  authService: AuthService,
) {
  return async () => {
    try {
      // 检查用户是否已登录
      const isLoggedIn = authService.isAuthenticated();
      const token = authService.getToken();

      console.log('🚀 [APP_INITIALIZER] 开始初始化权限');
      console.log('🔐 [APP_INITIALIZER] 认证状态:', isLoggedIn);
      console.log(
        '🔑 [APP_INITIALIZER] Token 状态:',
        token ? '存在 (' + token.substring(0, 20) + '...)' : '不存在',
      );

      if (!isLoggedIn) {
        console.log('⏭️ 用户未登录，跳过权限初始化');
        return;
      }

      console.log('🚀 开始加载用户权限...');

      // 加载用户权限
      await firstValueFrom(permissionService.loadUserPermissions());

      console.log('✅ 权限初始化完成');
    } catch (error) {
      console.error('❌ 权限初始化失败:', error);
      // 不阻止应用启动，即使权限加载失败
    }
  };
}
