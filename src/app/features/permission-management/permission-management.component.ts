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
import { Observable } from 'rxjs';

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

  PermissionType = PermissionType;

  constructor() {
    this.menuPermissions$ = this.store.select(selectMenuPermissions);
    this.loading$ = this.store.select(selectPermissionLoading);
  }

  ngOnInit(): void {
    this.store.dispatch(PermissionActions.loadMenuPermissions());
    this.initForms();

    // Subscribe to menu permissions to build tree
    this.menuPermissions$.subscribe((menus) => {
      this.treeNodes = this.buildTree(menus);
    });
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
      this.selectedMenu = node.origin['data'] as MenuPermission;
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
