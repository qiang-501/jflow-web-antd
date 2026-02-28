import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import {
  MenuService,
  Menu,
  CreateMenuDto,
  UpdateMenuDto,
} from '../../core/services/menu.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-menu-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzTagModule,
    NzPopconfirmModule,
    NzSwitchModule,
    NzDividerModule,
    NzSpaceModule,
    NzIconModule,
    NzTreeSelectModule,
    NzBadgeModule,
    NzTooltipModule,
    NzInputNumberModule,
    NzCheckboxModule,
  ],
  templateUrl: './menu-management.component.html',
  styleUrls: ['./menu-management.component.css'],
})
export class MenuManagementComponent implements OnInit {
  private menuService = inject(MenuService);
  private messageService = inject(NzMessageService);
  private cdr = inject(ChangeDetectorRef);
  mapOfExpandedData: { [key: string]: Menu[] } = {};
  menuTree: Menu[] = [];
  displayData: Menu[] = [];
  loading = false;

  isModalVisible = false;
  modalTitle = '创建菜单';
  isEditMode = false;
  currentMenu: Partial<Menu> = {};

  menuTypeOptions = [
    { label: '菜单', value: 'menu' },
    { label: '按钮', value: 'button' },
    { label: '链接', value: 'link' },
  ];

  statusOptions = [
    { label: '启用', value: 'active' },
    { label: '禁用', value: 'inactive' },
  ];

  // 用于父菜单选择的树形数据
  parentMenuNodes: any[] = [];

  ngOnInit(): void {
    this.loadMenuTree();
  }

  updateDisplayData(): void {
    this.displayData = [...this.menuTree];
    this.displayData.forEach((item) => {
      this.mapOfExpandedData[item.id] = this.convertTreeToList(item);
    });
  }

  async loadMenuTree(): Promise<void> {
    this.loading = true;
    try {
      const tree = await firstValueFrom(this.menuService.getMenuTree());
      setTimeout(() => {
        this.menuTree = this.initializeExpandState(tree);
        this.parentMenuNodes = this.buildTreeSelectData(tree);
        this.loading = false;
        this.updateDisplayData();
        this.cdr.detectChanges();
      });
    } catch (error) {
      console.error('Load menu tree error:', error);
      setTimeout(() => {
        this.messageService.error('加载菜单树失败');
        this.loading = false;
        this.cdr.detectChanges();
      });
    }
  }

  /**
   * 初始化菜单树的展开状态
   */
  initializeExpandState(menus: Menu[]): Menu[] {
    return menus.map((menu) => {
      const menuItem: any = {
        ...menu,
        expand: true, // 默认展开所有子菜单
      };

      if (menu.children && menu.children.length > 0) {
        menuItem.children = this.initializeExpandState(menu.children);
      }

      return menuItem;
    });
  }

  buildTreeSelectData(menus: Menu[], parentDisabledId?: number): any[] {
    return menus.map((menu) => ({
      title: menu.title || menu.name,
      value: menu.id,
      key: menu.id,
      disabled: menu.id === parentDisabledId,
      children: menu.children
        ? this.buildTreeSelectData(menu.children, parentDisabledId)
        : [],
    }));
  }

  showCreateModal(): void {
    this.isEditMode = false;
    this.modalTitle = '创建菜单';
    this.currentMenu = {
      type: 'menu',
      status: 'active',
      isVisible: true,
      isCached: false,
      externalLink: false,
      sortOrder: 0,
    };
    this.parentMenuNodes = this.buildTreeSelectData(this.menuTree);
    this.isModalVisible = true;
  }

  showEditModal(menu: Menu): void {
    this.isEditMode = true;
    this.modalTitle = '编辑菜单';
    this.currentMenu = { ...menu };
    // 编辑时，不能选择自己作为父菜单
    this.parentMenuNodes = this.buildTreeSelectData(this.menuTree, menu.id);
    this.isModalVisible = true;
  }

  handleCancel(): void {
    this.isModalVisible = false;
    this.currentMenu = {};
  }

  handleOk(): void {
    if (!this.currentMenu.name) {
      this.messageService.warning('请填写菜单名称');
      return;
    }

    if (this.isEditMode && this.currentMenu.id) {
      this.updateMenu();
    } else {
      this.createMenu();
    }
  }

  async createMenu(): Promise<void> {
    const dto: CreateMenuDto = {
      name: this.currentMenu.name!,
      title: this.currentMenu.title,
      description: this.currentMenu.description,
      path: this.currentMenu.path,
      icon: this.currentMenu.icon,
      component: this.currentMenu.component,
      type: this.currentMenu.type as any,
      status: this.currentMenu.status as any,
      parentId: this.currentMenu.parentId,
      sortOrder: this.currentMenu.sortOrder || 0,
      isVisible: this.currentMenu.isVisible !== false,
      isCached: this.currentMenu.isCached || false,
      externalLink: this.currentMenu.externalLink || false,
    };

    try {
      await firstValueFrom(this.menuService.createMenu(dto));
      this.messageService.success('创建成功');
      this.isModalVisible = false;
      await this.loadMenuTree();
    } catch (error: any) {
      this.messageService.error(error?.error?.message || '创建失败');
      console.error('Create menu error:', error);
    }
  }

  async updateMenu(): Promise<void> {
    const id = this.currentMenu.id!;
    const dto: UpdateMenuDto = {
      name: this.currentMenu.name,
      title: this.currentMenu.title,
      description: this.currentMenu.description,
      path: this.currentMenu.path,
      icon: this.currentMenu.icon,
      component: this.currentMenu.component,
      type: this.currentMenu.type as any,
      status: this.currentMenu.status as any,
      parentId: this.currentMenu.parentId,
      sortOrder: this.currentMenu.sortOrder,
      isVisible: this.currentMenu.isVisible,
      isCached: this.currentMenu.isCached,
      externalLink: this.currentMenu.externalLink,
    };

    try {
      await firstValueFrom(this.menuService.updateMenu(id, dto));
      this.messageService.success('更新成功');
      this.isModalVisible = false;
      await this.loadMenuTree();
    } catch (error: any) {
      this.messageService.error(error?.error?.message || '更新失败');
      console.error('Update menu error:', error);
    }
  }

  async deleteMenu(id: number): Promise<void> {
    try {
      await firstValueFrom(this.menuService.deleteMenu(id));
      this.messageService.success('删除成功');
      await this.loadMenuTree();
    } catch (error: any) {
      this.messageService.error(
        error?.error?.message || '删除失败，请先删除子菜单',
      );
      console.error('Delete menu error:', error);
    }
  }

  async toggleStatus(menu: Menu): Promise<void> {
    const dto: UpdateMenuDto = {
      status: menu.status === 'active' ? 'inactive' : 'active',
    };

    try {
      await firstValueFrom(this.menuService.updateMenu(menu.id, dto));
      setTimeout(() => {
        menu.status = dto.status as any;
        this.messageService.success('状态更新成功');
        this.cdr.detectChanges();
      });
    } catch (error) {
      this.messageService.error('状态更新失败');
      console.error('Toggle status error:', error);
    }
  }

  async toggleVisible(menu: Menu): Promise<void> {
    const dto: UpdateMenuDto = {
      isVisible: !menu.isVisible,
    };

    try {
      await firstValueFrom(this.menuService.updateMenu(menu.id, dto));
      setTimeout(() => {
        menu.isVisible = dto.isVisible!;
        this.messageService.success('可见性更新成功');
        this.cdr.detectChanges();
      });
    } catch (error) {
      this.messageService.error('可见性更新失败');
      console.error('Toggle visible error:', error);
    }
  }

  getTypeText(type: string): string {
    const typeMap: Record<string, string> = {
      menu: '菜单',
      button: '按钮',
      link: '链接',
    };
    return typeMap[type] || type;
  }

  getTypeColor(type: string): string {
    const colorMap: Record<string, string> = {
      menu: 'blue',
      button: 'green',
      link: 'orange',
    };
    return colorMap[type] || 'default';
  }

  getStatusColor(status: string): string {
    return status === 'active' ? 'success' : 'default';
  }

  getStatusText(status: string): string {
    return status === 'active' ? '启用' : '禁用';
  }

  collapse(array: Menu[], data: Menu, $event: boolean): void {
    if (!$event) {
      if (data.children) {
        data.children.forEach((d) => {
          const target = array.find((a) => a.id === d.id)!;
          target.expand = false;
          this.collapse(array, target, false);
        });
      } else {
        return;
      }
    }
  }

  convertTreeToList(root: Menu): Menu[] {
    const stack: Menu[] = [];
    const array: Menu[] = [];
    const hashMap = {};
    stack.push({ ...root, level: 0, expand: false });

    while (stack.length !== 0) {
      const node = stack.pop()!;
      this.visitNode(node, hashMap, array);
      if (node.children) {
        for (let i = node.children.length - 1; i >= 0; i--) {
          stack.push({
            ...node.children[i],
            level: node.level! + 1,
            expand: false,
            parent: node,
          });
        }
      }
    }

    return array;
  }

  visitNode(
    node: Menu,
    hashMap: { [id: string]: boolean },
    array: Menu[],
  ): void {
    if (!hashMap[node.id]) {
      hashMap[node.id] = true;
      array.push(node);
    }
  }
}
