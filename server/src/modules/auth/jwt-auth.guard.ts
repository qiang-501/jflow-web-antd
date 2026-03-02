import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    console.log('🛡️ [JwtAuthGuard] 收到请求:', request.url);
    console.log(
      '🔑 [JwtAuthGuard] Authorization header:',
      authHeader ? authHeader.substring(0, 30) + '...' : '不存在',
    );

    if (!authHeader) {
      console.error('❌ [JwtAuthGuard] 缺少 Authorization header');
      throw new UnauthorizedException('Missing authorization header');
    }

    if (!authHeader.startsWith('Bearer ')) {
      console.error(
        '❌ [JwtAuthGuard] Authorization header 格式错误，必须以 "Bearer " 开头',
      );
      throw new UnauthorizedException('Invalid authorization header format');
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      console.error('❌ [JwtAuthGuard] 认证失败');
      console.error(
        '📋 错误信息:',
        err?.message || info?.message || '未知错误',
      );
      console.error('📋 详细信息:', info);

      throw err || new UnauthorizedException(info?.message || 'Unauthorized');
    }

    console.log('✅ [JwtAuthGuard] 认证成功, 用户:', user.username);
    return user;
  }
}
