// role.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Role,
  RoleTree,
  CreateRoleDto,
  UpdateRoleDto,
  RoleInheritance,
} from '../../models/role.model';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private http = inject(HttpClient);
  private apiUrl = 'api/roles';

  /**
   * 获取所有角色列表
   */
  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl);
  }

  /**
   * 获取角色树（包含继承关系）
   */
  getRoleTree(): Observable<RoleTree[]> {
    return this.http.get<RoleTree[]>(`${this.apiUrl}/tree`);
  }

  /**
   * 根据ID获取角色详情
   */
  getRoleById(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/${id}`);
  }

  /**
   * 创建新角色
   */
  createRole(role: CreateRoleDto): Observable<Role> {
    return this.http.post<Role>(this.apiUrl, role);
  }

  /**
   * 更新角色信息
   */
  updateRole(role: UpdateRoleDto): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}/${role.id}`, role);
  }

  /**
   * 删除角色
   */
  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * 为角色分配权限
   */
  assignPermissions(roleId: string, permissionIds: string[]): Observable<Role> {
    return this.http.post<Role>(`${this.apiUrl}/${roleId}/permissions`, {
      permissionIds,
    });
  }

  /**
   * 获取角色的所有权限（包括继承的）
   */
  getRolePermissions(roleId: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/${roleId}/permissions`);
  }

  /**
   * 获取角色继承关系
   */
  getRoleInheritance(roleId: string): Observable<RoleInheritance[]> {
    return this.http.get<RoleInheritance[]>(
      `${this.apiUrl}/${roleId}/inheritance`,
    );
  }

  /**
   * 获取角色的所有子角色
   */
  getChildRoles(roleId: string): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/${roleId}/children`);
  }

  /**
   * 获取角色的所有父角色链
   */
  getParentRoles(roleId: string): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/${roleId}/parents`);
  }
}
