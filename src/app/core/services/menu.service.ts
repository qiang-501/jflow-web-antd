import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Menu {
  id: number;
  name: string;
  title: string;
  description?: string;
  path?: string;
  icon?: string;
  component?: string;
  type: 'menu' | 'button' | 'link';
  status: 'active' | 'inactive';
  parentId?: number;
  sortOrder: number;
  isVisible: boolean;
  isCached: boolean;
  externalLink: boolean;
  meta?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
  children?: Menu[];
  expand?: boolean; // 用于树形表格的展开状态
  level?: number; // 用于树形表格的层级
  parent?: Menu;
}

export interface CreateMenuDto {
  name: string;
  title?: string;
  description?: string;
  path?: string;
  icon?: string;
  component?: string;
  type?: 'menu' | 'button' | 'link';
  status?: 'active' | 'inactive';
  parentId?: number;
  sortOrder?: number;
  isVisible?: boolean;
  isCached?: boolean;
  externalLink?: boolean;
  meta?: Record<string, any>;
}

export interface UpdateMenuDto extends Partial<CreateMenuDto> {}

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private http = inject(HttpClient);
  private apiUrl = 'api/menus';

  /**
   * 获取所有菜单（分页）
   */
  getMenus(params?: {
    page?: number;
    limit?: number;
  }): Observable<{ data: Menu[]; total: number }> {
    return this.http.get<{ data: Menu[]; total: number }>(this.apiUrl, {
      params: params as any,
    });
  }

  /**
   * 获取菜单树结构
   */
  getMenuTree(): Observable<Menu[]> {
    return this.http.get<Menu[]>(`${this.apiUrl}/tree`);
  }

  /**
   * 根据ID获取菜单
   */
  getMenuById(id: number): Observable<Menu> {
    return this.http.get<Menu>(`${this.apiUrl}/${id}`);
  }

  /**
   * 创建菜单
   */
  createMenu(menu: CreateMenuDto): Observable<Menu> {
    return this.http.post<Menu>(this.apiUrl, menu);
  }

  /**
   * 更新菜单
   */
  updateMenu(id: number, menu: UpdateMenuDto): Observable<Menu> {
    return this.http.put<Menu>(`${this.apiUrl}/${id}`, menu);
  }

  /**
   * 删除菜单
   */
  deleteMenu(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * 更新菜单排序
   */
  updateSortOrder(
    menuOrders: Array<{ id: number; sortOrder: number }>,
  ): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/sort/update`, menuOrders);
  }
}
