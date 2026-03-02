import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('debug')
@Controller('debug')
export class DebugController {
  @Get('test-auth')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Test JWT authentication' })
  testAuth(@Request() req: any) {
    console.log('✅ JWT 认证成功！');
    console.log('📌 请求用户信息:', req.user);

    return {
      message: 'JWT Authentication successful!',
      user: req.user,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('no-auth')
  @ApiOperation({ summary: 'Test endpoint without authentication' })
  testNoAuth() {
    return {
      message: 'Public endpoint - no authentication required',
      timestamp: new Date().toISOString(),
    };
  }
}
