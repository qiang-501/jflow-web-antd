import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    // 添加 token 到请求头
    const token = localStorage.getItem('token');
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // 处理 401 未授权错误
        if (error.status === 401) {
          console.warn('Unauthorized access - redirecting to login');
          // 清除本地存储
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // 保存当前路径，登录后跳转回来
          const currentUrl = this.router.url;
          if (currentUrl !== '/login') {
            localStorage.setItem('returnUrl', currentUrl);
          }
          // 跳转到登录页
          this.router.navigate(['/login']);
        }

        // 处理 403 权限不足错误
        if (error.status === 403) {
          console.warn('Forbidden - insufficient permissions');
          // 可以选择跳转到登录页或显示错误提示
          // 这里选择跳转到登录页
          const currentUrl = this.router.url;
          if (currentUrl !== '/login') {
            localStorage.setItem('returnUrl', currentUrl);
          }
          this.router.navigate(['/login']);
        }

        return throwError(() => error);
      }),
    );
  }
}
