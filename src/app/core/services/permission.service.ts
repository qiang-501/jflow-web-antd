// permission.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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

  /**
   * 获取所有权限列表
   */
  getPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(this.apiUrl);
  }

  /**
   * 获取菜单权限树
   */
  getMenuPermissions(): Observable<MenuPermission[]> {
    return this.http.get<MenuPermission[]>(`${this.apiUrl}/menus`);
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
  updatePermission(permission: UpdatePermissionDto): Observable<Permission> {
    return this.http.put<Permission>(
      `${this.apiUrl}/${permission.id}`,
      permission,
    );
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
   * 检查当前用户是否拥有指定权限
   */
  checkPermission(permissionCode: string): Observable<PermissionCheck> {
    return this.http.post<PermissionCheck>(`${this.apiUrl}/check`, {
      code: permissionCode,
    });
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
}
