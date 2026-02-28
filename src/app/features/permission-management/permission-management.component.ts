// permission-management.component.ts
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';
import {
  NzTreeModule,
  NzFormatEmitEvent,
  NzTreeNodeOptions,
} from 'ng-zorro-antd/tree';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzEmptyModule } from 'ng-zorro-antd/empty';

import {
  MenuPermission,
  ActionPermission,
  PermissionType,
} from '../../models/permission.model';
import { Menu, MenuService } from '../../core/services/menu.service';
import { PermissionService } from '../../core/services/permission.service';

@Component({
  selector: 'app-permission-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzTreeModule,
    NzCardModule,
    NzTagModule,
    NzSpaceModule,
    NzPopconfirmModule,
    NzEmptyModule,
  ],
  templateUrl: './permission-management.component.html',
  styleUrls: ['./permission-management.component.css'],
})
export class PermissionManagementComponent implements OnInit {
  private fb = inject(FormBuilder);
  private message = inject(NzMessageService);
  private menuService = inject(MenuService);
  private permissionService = inject(PermissionService);
  private cdr = inject(ChangeDetectorRef);

  menuPermissions: MenuPermission[] = [];
  loading = false;

  menuForm!: FormGroup;
  actionForm!: FormGroup;
  isMenuModalVisible = false;
  isActionModalVisible = false;
  isEditMode = false;
  selectedMenu: MenuPermission | null = null;
  selectedAction: ActionPermission | null = null;

  treeNodes: NzTreeNodeOptions[] = [];

  PermissionType = PermissionType;

  ngOnInit(): void {
    this.loadMenuTree();
    this.initForms();
  }

  async loadMenuPermissions(menuId: string): Promise<void> {
    try {
      const menuPermission = await firstValueFrom(
        this.permissionService.getMenuPermissionByMenuId(menuId),
      );
      console.log('API Response - Found menu permission:', menuPermission);
      console.log('Actions count:', menuPermission.actions?.length || 0);
      this.selectedMenu = menuPermission;
    } catch (error: any) {
      console.error('API Error - Failed to load menu permission:', error);
    }
    this.cdr.markForCheck();
  }

  async loadMenuTree(): Promise<void> {
    const menuTree = await firstValueFrom(this.menuService.getMenuTree());
    this.treeNodes = this.convertMenusToTreeNodes(menuTree);
    this.cdr.markForCheck();
    console.log('Loaded menu tree:', this.treeNodes);
  }

  initForms(): void {
    this.menuForm = this.fb.group({
      menuName: ['', [Validators.required]],
      path: ['', [Validators.required]],
      icon: [''],
      orderNum: [0, [Validators.required]],
      visible: [true],
    });

    this.actionForm = this.fb.group({
      name: ['', [Validators.required]],
      code: ['', [Validators.required]],
      description: [''],
    });
  }

  convertMenusToTreeNodes(menus: any[]): NzTreeNodeOptions[] {
    return menus.map((menu) => ({
      key: String(menu.id),
      title: menu.title || menu.name,
      expanded: true,
      children: menu.children
        ? this.convertMenusToTreeNodes(menu.children)
        : [],
      isLeaf: !menu.children || menu.children.length === 0,
      icon: menu.icon,
      data: {
        id: String(menu.id),
        menuId: menu.link || String(menu.id), // 使用 link 作为 menuId，如果没有 link 则使用 id
        menuName: menu.title || menu.name,
        path: menu.link || menu.path || '',
        icon: menu.icon,
        orderNum: menu.level || 0,
        visible: true,
        actions: [],
      },
    }));
  }

  buildTree(menus: MenuPermission[]): NzTreeNodeOptions[] {
    const map = new Map<string, NzTreeNodeOptions>();
    const roots: NzTreeNodeOptions[] = [];

    // First pass: create all nodes
    menus.forEach((menu) => {
      map.set(menu.menuId, {
        key: menu.menuId,
        title: menu.menuName,
        expanded: false,
        children: [],
        isLeaf: !menu.parentId,
        data: menu,
      });
    });

    // Second pass: build hierarchy
    menus.forEach((menu) => {
      const node = map.get(menu.menuId);
      if (node) {
        if (menu.parentId) {
          const parent = map.get(menu.parentId);
          if (parent) {
            parent.children = parent.children || [];
            parent.children.push(node);
            parent.isLeaf = false;
          } else {
            roots.push(node);
          }
        } else {
          roots.push(node);
        }
      }
    });

    return roots;
  }

  async onTreeClick(event: NzFormatEmitEvent): Promise<void> {
    const node = event.node;
    if (node && node.origin['data']) {
      const nodeData = node.origin['data'] as any;
      const menuId = nodeData.menuId || nodeData.id;

      console.log('Tree node clicked, menuId:', menuId);
      console.log('Node data:', nodeData);
      this.loadMenuPermissions(menuId);
      // 发送 API 请求获取菜单权限数据
    }
  }

  showAddActionModal(): void {
    if (!this.selectedMenu) {
      this.message.warning('请先选择一个菜单');
      return;
    }
    this.isEditMode = false;
    this.selectedAction = null;
    this.actionForm.reset();
    this.isActionModalVisible = true;
  }

  showEditActionModal(action: ActionPermission): void {
    this.isEditMode = true;
    this.selectedAction = action;
    this.actionForm.patchValue({
      name: action.name,
      code: action.code,
      description: action.description,
    });
    this.isActionModalVisible = true;
  }

  handleActionCancel(): void {
    this.isActionModalVisible = false;
    this.actionForm.reset();
    this.selectedAction = null;
  }

  async handleActionSubmit(): Promise<void> {
    if (this.actionForm.valid && this.selectedMenu) {
      let formValue = this.actionForm.value;
      formValue.menuName = this.selectedMenu.menuName;
      this.loading = true;
      try {
        if (this.isEditMode && this.selectedAction) {
          await firstValueFrom(
            this.permissionService.updateMenuAction(
              this.selectedMenu.menuId,
              this.selectedAction.id,
              formValue,
            ),
          );
          this.message.success('操作权限更新成功');
        } else {
          await firstValueFrom(
            this.permissionService.createMenuAction(
              this.selectedMenu.menuId,
              formValue,
            ),
          );
          this.message.success('操作权限创建成功');
        }
        this.handleActionCancel();
        await this.loadMenuPermissions(this.selectedMenu.menuId);
        this.loading = false;
      } catch (error) {
        console.error('Failed to create/update action:', error);
        this.message.error(
          this.isEditMode ? '操作权限更新失败' : '操作权限创建失败',
        );
        this.loading = false;
      }
    } else {
      Object.values(this.actionForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  async deleteAction(action: ActionPermission): Promise<void> {
    if (this.selectedMenu) {
      this.loading = true;
      try {
        await firstValueFrom(
          this.permissionService.deleteMenuAction(
            this.selectedMenu.menuId,
            action.id,
          ),
        );
        this.message.success('操作权限删除成功');
        await this.loadMenuPermissions(this.selectedMenu.menuId);
        this.loading = false;
      } catch (error) {
        console.error('Failed to delete action:', error);
        this.message.error('操作权限删除失败');
        this.loading = false;
      }
    }
  }

  getActionTypeColor(code: string): string {
    const colorMap: { [key: string]: string } = {
      add: 'green',
      create: 'green',
      edit: 'blue',
      update: 'blue',
      delete: 'red',
      remove: 'red',
      view: 'default',
      export: 'orange',
      import: 'purple',
    };
    return colorMap[code.toLowerCase()] || 'default';
  }
}
