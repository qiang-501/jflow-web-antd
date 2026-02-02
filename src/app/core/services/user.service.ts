// user.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, CreateUserDto, UpdateUserDto } from '../../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = 'api/users';

  /**
   * 获取所有用户列表
   */
  getUsers(): Observable<{ data: User[]; total: number }> {
    return this.http.get<{ data: User[]; total: number }>(this.apiUrl);
  }

  /**
   * 根据ID获取用户详情
   */
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  /**
   * 创建新用户
   */
  createUser(user: CreateUserDto): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  /**
   * 更新用户信息
   */
  updateUser(id: string, user: UpdateUserDto): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  /**
   * 删除用户
   */
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * 批量删除用户
   */
  deleteUsers(ids: string[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/batch-delete`, { ids });
  }

  /**
   * 重置用户密码
   */
  resetPassword(userId: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${userId}/reset-password`, {
      password: newPassword,
    });
  }

  /**
   * 为用户分配角色
   */
  assignRoles(userId: string, roleIds: string[]): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/${userId}/roles`, { roleIds });
  }

  /**
   * 获取用户的所有权限（包括继承的）
   */
  getUserPermissions(userId: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/${userId}/permissions`);
  }
}
