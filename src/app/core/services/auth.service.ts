import { Injectable, inject, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { PermissionService } from './permission.service';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    username: string;
    email: string;
    fullName: string;
    status: string;
    roles: any[];
    permissions: string[];
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private injector = inject(Injector);

  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // 初始化时从 cookie 中恢复用户信息
    const user = this.getUserFromStorage();
    if (user) {
      this.currentUserSubject.next(user);
    }
  }

  /**
   * 登录
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${environment.apiUrl}/auth/login`,
      credentials,
    );
  }

  /**
   * 保存认证信息到 cookie
   */
  saveAuth(token: string, user: any): void {
    console.log(
      '🔑 [AuthService] 保存 token 到 cookie:',
      token.substring(0, 20) + '...',
    );
    // 保存 token 到 cookie（2小时过期）
    this.setCookie('token', token, 2);

    // 保存用户信息到 cookie
    this.setCookie('user', JSON.stringify(user), 2);

    // 更新当前用户
    this.currentUserSubject.next(user);

    // 验证 token 是否被正确保存
    const savedToken = this.getToken();
    console.log(
      '✅ [AuthService] Token 保存验证:',
      savedToken ? '成功' : '失败',
    );
    if (savedToken) {
      console.log(
        '📝 [AuthService] 保存的 token:',
        savedToken.substring(0, 20) + '...',
      );
    }
  }

  /**
   * 获取 token
   */
  getToken(): string | null {
    return this.getCookie('token');
  }

  /**
   * 获取当前用户
   */
  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  /**
   * 从存储中获取用户信息
   */
  private getUserFromStorage(): any {
    const userStr = this.getCookie('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error('Failed to parse user from cookie', e);
        return null;
      }
    }
    return null;
  }

  /**
   * 检查是否已认证
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  /**
   * 检查用户是否有指定权限
   */
  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.permissions) {
      return false;
    }
    return user.permissions.includes(permission);
  }

  /**
   * 检查用户是否有任一指定权限
   */
  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some((permission) => this.hasPermission(permission));
  }

  /**
   * 检查用户是否有所有指定权限
   */
  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every((permission) => this.hasPermission(permission));
  }

  /**
   * 退出登录
   */
  logout(): void {
    // 清除 cookie
    this.deleteCookie('token');
    this.deleteCookie('user');

    // 清除当前用户
    this.currentUserSubject.next(null);

    // 清除权限缓存
    try {
      // 动态导入 PermissionService 类并使用 injector 获取实例
      import('./permission.service').then(({ PermissionService }) => {
        const permissionService = this.injector.get(PermissionService);
        permissionService.clearPermissionsCache();
      });
    } catch (error) {
      console.error('Failed to clear permissions cache:', error);
    }

    // 跳转到登录页
    this.router.navigate(['/login']);
  }

  /**
   * 处理认证失败（401/403）
   */
  handleAuthError(): void {
    // 清除认证信息
    this.deleteCookie('token');
    this.deleteCookie('user');
    this.currentUserSubject.next(null);

    // 保存当前路径，登录后跳转回来
    const currentUrl = this.router.url;
    if (currentUrl !== '/login') {
      sessionStorage.setItem('returnUrl', currentUrl);
    }

    // 跳转到登录页
    this.router.navigate(['/login']);
  }

  /**
   * 获取登录后的跳转地址
   */
  getReturnUrl(): string {
    const returnUrl = sessionStorage.getItem('returnUrl') || '/';
    sessionStorage.removeItem('returnUrl');
    return returnUrl;
  }

  // ============ Cookie 操作工具方法 ============

  /**
   * 设置 Cookie
   * @param name Cookie 名称
   * @param value Cookie 值
   * @param hours 过期时间（小时）
   */
  private setCookie(name: string, value: string, hours: number): void {
    const date = new Date();
    date.setTime(date.getTime() + hours * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/;SameSite=Strict`;
  }

  /**
   * 获取 Cookie
   * @param name Cookie 名称
   */
  private getCookie(name: string): string | null {
    const nameEQ = name + '=';
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }

    return null;
  }

  /**
   * 删除 Cookie
   * @param name Cookie 名称
   */
  private deleteCookie(name: string): void {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }
}
