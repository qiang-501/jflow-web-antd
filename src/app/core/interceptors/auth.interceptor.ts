import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    // 从 cookie 中获取 token 并添加到请求头
    const token = this.authService.getToken();
    console.log('🔍 [AuthInterceptor] 拦截请求:', request.url);
    console.log(
      '🔑 [AuthInterceptor] Token 状态:',
      token ? '存在 (' + token.substring(0, 20) + '...)' : '不存在',
    );

    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('✅ [AuthInterceptor] 已添加 Authorization header');
    } else {
      console.warn(
        '⚠️ [AuthInterceptor] 没有 token，请求将不包含 Authorization header',
      );
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // 处理 401 未授权错误或 403 权限不足错误
        if (error.status === 401 || error.status === 403) {
          console.warn(
            `${error.status === 401 ? 'Unauthorized' : 'Forbidden'} - redirecting to login`,
          );
          // 使用 AuthService 统一处理认证失败
          this.authService.handleAuthError();
        }

        return throwError(() => error);
      }),
    );
  }
}
