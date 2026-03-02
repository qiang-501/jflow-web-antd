// permission.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import {
  Permission,
  MenuPermission,
  ActionPermission,
  CreatePermissionDto,
  UpdatePermissionDto,
  PermissionCheck,
} from '../../models/permission.model';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  private http = inject(HttpClient);
  private apiUrl = 'api/permissions';

  // 缓存用户的权限列表
  private userPermissionsCache$ = new BehaviorSubject<string[]>([]);
  private isPermissionsLoaded = false;
  private isLoading = false;

  /**
   * 获取所有权限列表
   */
  getPermissions(): Observable<Permission[]> {
    return this.http
      .get<{ data: Permission[]; total: number }>(this.apiUrl)
      .pipe(map((response) => response.data || (response as any)));
  }

  /**
   * 获取菜单权限树
   */
  getMenuPermissions(): Observable<MenuPermission[]> {
    return this.http.get<MenuPermission[]>(`${this.apiUrl}/menus`);
  }

  /**
   * 根据菜单ID获取菜单权限详情
   */
  getMenuPermissionByMenuId(menuId: string): Observable<MenuPermission> {
    return this.http.get<MenuPermission>(`${this.apiUrl}/menus/${menuId}`);
  }

  /**
   * 根据ID获取权限详情
   */
  getPermissionById(id: string): Observable<Permission> {
    return this.http.get<Permission>(`${this.apiUrl}/${id}`);
  }

  /**
   * 创建新权限
   */
  createPermission(permission: CreatePermissionDto): Observable<Permission> {
    return this.http.post<Permission>(this.apiUrl, permission);
  }

  /**
   * 更新权限信息
   */
  updatePermission(
    id: string,
    permission: UpdatePermissionDto,
  ): Observable<Permission> {
    return this.http.put<Permission>(`${this.apiUrl}/${id}`, permission);
  }

  /**
   * 删除权限
   */
  deletePermission(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * 为菜单创建操作权限
   */
  createMenuAction(
    menuId: string,
    action: Omit<ActionPermission, 'id' | 'menuId'>,
  ): Observable<ActionPermission> {
    return this.http.post<ActionPermission>(
      `${this.apiUrl}/menus/${menuId}/actions`,
      action,
    );
  }

  /**
   * 更新菜单的操作权限
   */
  updateMenuAction(
    menuId: string,
    actionId: string,
    action: Partial<ActionPermission>,
  ): Observable<ActionPermission> {
    return this.http.put<ActionPermission>(
      `${this.apiUrl}/menus/${menuId}/actions/${actionId}`,
      action,
    );
  }

  /**
   * 删除菜单的操作权限
   */
  deleteMenuAction(menuId: string, actionId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/menus/${menuId}/actions/${actionId}`,
    );
  }

  /**
   * 批量检查权限
   */
  checkPermissions(permissionCodes: string[]): Observable<PermissionCheck> {
    return this.http.post<PermissionCheck>(`${this.apiUrl}/check-batch`, {
      codes: permissionCodes,
    });
  }

  /**
   * 获取当前用户的所有权限
   */
  getCurrentUserPermissions(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/current-user`);
  }

  /**
   * 加载并缓存当前用户的所有权限
   * 应用启动时调用一次
   */
  loadUserPermissions(): Observable<string[]> {
    if (this.isLoading) {
      // 如果正在加载，返回当前缓存的 Observable
      return this.userPermissionsCache$.asObservable();
    }
    this.isLoading = true;
    return this.getCurrentUserPermissions().pipe(
      tap((permissions) => {
        this.userPermissionsCache$.next(permissions);
        this.isPermissionsLoaded = true;
        this.isLoading = false;
        console.log('✅ 用户权限已加载并缓存:', permissions);
      }),
      catchError((error) => {
        console.error('❌ 加载用户权限失败:', error);
        this.isLoading = false;
        this.userPermissionsCache$.next([]);
        return of([]);
      }),
    );
  }

  /**
   * 从缓存中检查权限（快速、不发送网络请求）
   */
  hasPermission(
    permissionCheck: { resource: string; action: string } | string,
  ): Observable<boolean> {
    const code =
      typeof permissionCheck === 'string'
        ? permissionCheck
        : `${permissionCheck.resource}:${permissionCheck.action}`;

    return this.userPermissionsCache$.pipe(
      map((permissions) => {
        const hasPermission = permissions.includes(code);
        console.log(
          `🔍 权限检查 [${code}]:`,
          hasPermission ? '✅ 有权限' : '❌ 无权限',
        );
        return hasPermission;
      }),
    );
  }

  /**
   * 获取缓存的权限列表（Observable）
   */
  getUserPermissionsCache(): Observable<string[]> {
    return this.userPermissionsCache$.asObservable();
  }

  /**
   * 获取缓存的权限列表（当前值）
   */
  getUserPermissionsCacheValue(): string[] {
    return this.userPermissionsCache$.value;
  }

  /**
   * 检查权限是否已加载
   */
  isPermissionsCacheLoaded(): boolean {
    return this.isPermissionsLoaded;
  }

  /**
   * 清除权限缓存（用户登出时调用）
   */
  clearPermissionsCache(): void {
    this.userPermissionsCache$.next([]);
    this.isPermissionsLoaded = false;
    console.log('🗑️ 权限缓存已清除');
  }

  /**
   * 检查当前用户是否拥有指定权限（发送网络请求）
   * @deprecated 建议使用 hasPermission() 方法从缓存检查
   */
  checkPermission(
    permissionCheck: { resource: string; action: string } | string,
  ): Observable<PermissionCheck> {
    const code =
      typeof permissionCheck === 'string'
        ? permissionCheck
        : `${permissionCheck.resource}:${permissionCheck.action}`;
    return this.http.post<PermissionCheck>(`${this.apiUrl}/check`, {
      code: code,
    });
  }

  private handleError(err: any) {
    return new Promise((resove) => {
      resove(err);
    });
  }
}
