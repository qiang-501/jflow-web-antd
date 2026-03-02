import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_SECRET } from './jwt.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    console.log('🔐 [JwtStrategy] 初始化 - JWT_SECRET:', JWT_SECRET);

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
    });
  }

  async validate(payload: any) {
    console.log('✅ [JwtStrategy.validate] JWT 验证成功');
    console.log('📦 [JwtStrategy.validate] Payload:', payload);

    // payload 包含 JWT token 中的信息
    // 返回的对象会被挂载到 request.user 上
    const user = {
      userId: payload.sub,
      username: payload.username,
      email: payload.email,
      roles: payload.roles,
      permissions: payload.permissions,
    };

    console.log('👤 [JwtStrategy.validate] 返回用户信息:', user);
    return user;
  }
}
