// permission-management.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, take } from 'rxjs';

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
import { PermissionActions } from '../../store/actions/permission.actions';
import {
  selectMenuPermissions,
  selectPermissionLoading,
} from '../../store/selectors/permission.selectors';
import { MenuService } from '../../core/services/menu.service';
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
  private store = inject(Store);
  private fb = inject(FormBuilder);
  private message = inject(NzMessageService);
  private menuService = inject(MenuService);
  private permissionService = inject(PermissionService);

  menuPermissions$: Observable<MenuPermission[]>;
  loading$: Observable<boolean>;

  menuForm!: FormGroup;
  actionForm!: FormGroup;
  isMenuModalVisible = false;
  isActionModalVisible = false;
  isEditMode = false;
  selectedMenu: MenuPermission | null = null;
  selectedAction: ActionPermission | null = null;

  treeNodes: NzTreeNodeOptions[] = [];
  menuPermissions: MenuPermission[] = [];

  PermissionType = PermissionType;

  constructor() {
    this.menuPermissions$ = this.store.select(selectMenuPermissions);
    this.loading$ = this.store.select(selectPermissionLoading);
  }

  ngOnInit(): void {
    // 先加载菜单权限数据
    this.store.dispatch(PermissionActions.loadMenuPermissions());

    // 订阅菜单权限数据
    this.menuPermissions$.subscribe((permissions) => {
      console.log('Loaded menu permissions:', permissions);
      this.menuPermissions = permissions;

      // 如果当前有选中的菜单，更新其权限数据
      if (this.selectedMenu) {
        const updated = permissions.find(
          (p) => p.menuId === this.selectedMenu!.menuId,
        );
        if (updated) {
          this.selectedMenu = updated;
          console.log('Updated selectedMenu with new data:', this.selectedMenu);
        }
      }
    });

    // 加载菜单树用于显示
    this.menuService.getMenuTree().subscribe((menus) => {
      console.log('Loaded menu tree:', menus);
      this.treeNodes = this.convertMenusToTreeNodes(menus);
    });

    this.initForms();
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

  onTreeClick(event: NzFormatEmitEvent): void {
    const node = event.node;
    if (node && node.origin['data']) {
      const nodeData = node.origin['data'] as any;
      const menuId = nodeData.menuId || nodeData.id;

      console.log('Tree node clicked, menuId:', menuId);
      console.log('Node data:', nodeData);

      // 发送 API 请求获取菜单权限数据
      this.permissionService.getMenuPermissionByMenuId(menuId).subscribe({
        next: (menuPermission) => {
          console.log('API Response - Found menu permission:', menuPermission);
          console.log('Actions count:', menuPermission.actions?.length || 0);
          this.selectedMenu = menuPermission;
        },
        error: (error) => {
          console.error('API Error - Failed to load menu permission:', error);

          if (error.status === 404) {
            // 没有找到权限数据，创建一个默认的菜单权限对象
            console.log(
              'No permission found for menuId:',
              menuId,
              'creating default',
            );
            this.selectedMenu = {
              id: nodeData.id || menuId,
              menuId: menuId,
              menuName: nodeData.menuName || nodeData.title,
              path: nodeData.path || '',
              icon: nodeData.icon,
              orderNum: nodeData.orderNum || 0,
              visible: nodeData.visible !== false,
              actions: [],
            };
          } else {
            this.message.error('加载菜单权限失败');
          }
        },
      });
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

  handleActionSubmit(): void {
    if (this.actionForm.valid && this.selectedMenu) {
      const formValue = this.actionForm.value;

      if (this.isEditMode && this.selectedAction) {
        this.store.dispatch(
          PermissionActions.updateMenuAction({
            menuId: this.selectedMenu.menuId,
            actionId: this.selectedAction.id,
            action: formValue,
          }),
        );
        this.message.success('操作权限更新成功');
      } else {
        this.store.dispatch(
          PermissionActions.createMenuAction({
            menuId: this.selectedMenu.menuId,
            action: formValue,
          }),
        );
        this.message.success('操作权限创建成功');
      }

      this.handleActionCancel();
    } else {
      Object.values(this.actionForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  deleteAction(action: ActionPermission): void {
    if (this.selectedMenu) {
      this.store.dispatch(
        PermissionActions.deleteMenuAction({
          menuId: this.selectedMenu.menuId,
          actionId: action.id,
        }),
      );
      this.message.success('操作权限删除成功');
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
