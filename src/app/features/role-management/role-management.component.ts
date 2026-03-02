// role-management.component.ts
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
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTreeModule, NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';

import {
  Role,
  RoleTree,
  CreateRoleDto,
  UpdateRoleDto,
} from '../../models/role.model';
import {
  Permission,
  MenuPermission,
  PermissionType,
} from '../../models/permission.model';
import { RoleService } from '../../core/services/role.service';
import { PermissionService } from '../../core/services/permission.service';

@Component({
  selector: 'app-role-management',
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
    NzPopconfirmModule,
    NzTreeModule,
    NzTreeSelectModule,
    NzSpaceModule,
    NzTagModule,
    NzAlertModule,
    NzCheckboxModule,
  ],
  templateUrl: './role-management.component.html',
  styleUrls: ['./role-management.component.css'],
})
export class RoleManagementComponent implements OnInit {
  private roleService = inject(RoleService);
  private permissionService = inject(PermissionService);
  private fb = inject(FormBuilder);
  private message = inject(NzMessageService);
  private cdr = inject(ChangeDetectorRef);
  roles: Role[] = [];
  roleTree: RoleTree[] = [];
  roleTreeNodes: NzTreeNodeOptions[] = [];
  permissions: Permission[] = [];
  menuPermissions: MenuPermission[] = [];
  permissionTreeNodes: NzTreeNodeOptions[] = [];
  checkedPermissionKeys: string[] = [];
  loading = false;

  roleForm!: FormGroup;
  isModalVisible = false;
  isPermissionModalVisible = false;
  isEditMode = false;
  currentRoleId: string | null = null;
  selectedRole: Role | null = null;

  ngOnInit(): void {
    this.loadRoles();
    this.loadRoleTree();
    this.loadPermissions();
    this.loadMenuPermissions();
    this.initForm();
  }

  async loadRoles(): Promise<void> {
    this.loading = true;
    try {
      const roles = await firstValueFrom(this.roleService.getRoles());
      this.roles = roles;
      this.loading = false;
    } catch (error) {
      console.error('Failed to load roles:', error);
      this.message.error('加载角色列表失败');
      this.loading = false;
    }
    this.cdr.markForCheck();
  }

  async loadRoleTree(): Promise<void> {
    try {
      const tree = await firstValueFrom(this.roleService.getRoleTree());
      this.roleTree = tree;
      this.roleTreeNodes = this.convertToTreeNodes(tree);
    } catch (error) {
      console.error('Failed to load role tree:', error);
      this.message.error('加载角色树失败');
    }
    this.cdr.markForCheck();
  }

  async loadPermissions(): Promise<void> {
    try {
      const permissions = await firstValueFrom(
        this.permissionService.getPermissions(),
      );
      this.permissions = permissions;
    } catch (error) {
      console.error('Failed to load permissions:', error);
      this.message.error('加载权限列表失败');
    }
    this.cdr.markForCheck();
  }

  async loadMenuPermissions(): Promise<void> {
    try {
      // 加载所有权限
      const permissions = await firstValueFrom(
        this.permissionService.getPermissions(),
      );

      // 尝试加载菜单权限树（如果API支持）
      try {
        const menuPermissions = await firstValueFrom(
          this.permissionService.getMenuPermissions(),
        );
        this.menuPermissions = menuPermissions;
        // 将权限按菜单分组构建树
        this.permissionTreeNodes = this.convertPermissionsToTree(
          permissions,
          menuPermissions,
        );
      } catch (error) {
        // 如果菜单权限API不可用，按类型分组
        this.permissionTreeNodes = this.groupPermissionsByType(permissions);
      }
    } catch (error) {
      console.error('Failed to load menu permissions:', error);
      this.message.error('加载权限树失败');
    }
  }

  initForm(): void {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required]],
      code: ['', [Validators.required]],
      description: [''],
      parentId: [null],
    });
  }

  showAddModal(): void {
    this.isEditMode = false;
    this.currentRoleId = null;
    this.roleForm.reset();
    this.isModalVisible = true;
  }

  showEditModal(role: Role): void {
    this.isEditMode = true;
    this.currentRoleId = role.id;
    this.roleForm.patchValue({
      name: role.name,
      code: role.code,
      description: role.description,
      parentId: role.parentId,
    });
    this.isModalVisible = true;
  }

  showPermissionModal(role: Role): void {
    this.selectedRole = role;
    // 获取角色已有的权限ID列表
    const permissionIds =
      role.permissionIds || role.permissions?.map((p) => String(p.id)) || [];
    this.checkedPermissionKeys = permissionIds;
    this.isPermissionModalVisible = true;
  }

  handleCancel(): void {
    this.isModalVisible = false;
    this.roleForm.reset();
  }

  handlePermissionCancel(): void {
    this.isPermissionModalVisible = false;
    this.checkedPermissionKeys = [];
    this.selectedRole = null;
  }

  async handleSubmit(): Promise<void> {
    if (this.roleForm.valid) {
      const formValue = this.roleForm.value;
      this.loading = true;

      try {
        if (this.isEditMode && this.currentRoleId) {
          const updateDto: UpdateRoleDto = {
            name: formValue.name,
            code: formValue.code,
            description: formValue.description,
            parentId: formValue.parentId,
          };
          await firstValueFrom(
            this.roleService.updateRole(this.currentRoleId, updateDto),
          );
          this.message.success('角色更新成功');
        } else {
          const createDto: CreateRoleDto = {
            name: formValue.name,
            code: formValue.code,
            description: formValue.description,
            parentId: formValue.parentId,
            permissionIds: [],
          };
          await firstValueFrom(this.roleService.createRole(createDto));
          this.message.success('角色创建成功');
        }
        this.handleCancel();
        await this.loadRoles();
        await this.loadRoleTree();
        this.loading = false;
      } catch (error) {
        console.error('Failed to create/update role:', error);
        this.message.error(this.isEditMode ? '角色更新失败' : '角色创建失败');
        this.loading = false;
      }
    } else {
      Object.values(this.roleForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  async handlePermissionSubmit(): Promise<void> {
    if (this.selectedRole && this.checkedPermissionKeys.length > 0) {
      this.loading = true;
      let permissionIds: Number[] = this.checkedPermissionKeys.map((key) =>
        Number(key),
      );
      try {
        await firstValueFrom(
          this.roleService.updateRolePermissions(
            this.selectedRole.id,
            permissionIds,
          ),
        );
        this.message.success('权限分配成功');
        this.handlePermissionCancel();
        await this.loadRoles();
        this.loading = false;
      } catch (error) {
        console.error('Failed to assign permissions:', error);
        this.message.error('权限分配失败');
        this.loading = false;
      }
    } else if (this.checkedPermissionKeys.length === 0) {
      this.message.warning('请至少选择一个权限');
    }
  }

  async deleteRole(id: string): Promise<void> {
    this.loading = true;
    try {
      await firstValueFrom(this.roleService.deleteRole(id));
      this.message.success('角色删除成功');
      await this.loadRoles();
      await this.loadRoleTree();
      this.loading = false;
    } catch (error) {
      console.error('Failed to delete role:', error);
      this.message.error('角色删除失败');
      this.loading = false;
    }
  }

  getRoleHierarchy(role: Role, allRoles: Role[]): string {
    const hierarchy: string[] = [role.name];
    let currentRole = role;

    while (currentRole.parentId) {
      const parentRole = allRoles.find((r) => r.id === currentRole.parentId);
      if (parentRole) {
        hierarchy.unshift(parentRole.name);
        currentRole = parentRole;
      } else {
        break;
      }
    }

    return hierarchy.join(' > ');
  }

  private convertToTreeNodes(roleTree: RoleTree[]): NzTreeNodeOptions[] {
    return roleTree.map((role) => ({
      title: role.name,
      key: role.id,
      value: role.id,
      children: role.children ? this.convertToTreeNodes(role.children) : [],
      isLeaf: !role.children || role.children.length === 0,
    }));
  }

  /**
   * 将权限按类型分组构建树形结构
   */
  private groupPermissionsByType(
    permissions: Permission[],
  ): NzTreeNodeOptions[] {
    const menuPermissions = permissions.filter(
      (p) => p.type === PermissionType.Menu,
    );
    const actionPermissions = permissions.filter(
      (p) => p.type === PermissionType.Action,
    );
    const dataPermissions = permissions.filter(
      (p) => p.type === PermissionType.Data,
    );

    const nodes: NzTreeNodeOptions[] = [];

    if (menuPermissions.length > 0) {
      nodes.push({
        title: '菜单权限',
        key: 'menu-group',
        selectable: false,
        children: menuPermissions.map((p) => ({
          title: `${p.name} (${p.code})`,
          key: String(p.id),
          isLeaf: true,
          icon: 'menu',
        })),
        expanded: true,
        icon: 'folder',
      });
    }

    if (actionPermissions.length > 0) {
      nodes.push({
        title: '操作权限',
        key: 'action-group',
        selectable: false,
        children: actionPermissions.map((p) => ({
          title: `${p.name} (${p.code})`,
          key: String(p.id),
          isLeaf: true,
          icon: 'check-circle',
        })),
        expanded: true,
        icon: 'folder',
      });
    }

    if (dataPermissions.length > 0) {
      nodes.push({
        title: '数据权限',
        key: 'data-group',
        selectable: false,
        children: dataPermissions.map((p) => ({
          title: `${p.name} (${p.code})`,
          key: String(p.id),
          isLeaf: true,
          icon: 'database',
        })),
        expanded: true,
        icon: 'folder',
      });
    }

    return nodes;
  }

  /**
   * 结合菜单信息构建权限树
   */
  private convertPermissionsToTree(
    permissions: Permission[],
    menuPermissions: MenuPermission[],
  ): NzTreeNodeOptions[] {
    // 如果有菜单信息，按菜单分组
    const rootMenus = menuPermissions.filter((menu) => !menu.parentId);

    if (rootMenus.length === 0) {
      // 降级到按类型分组
      return this.groupPermissionsByType(permissions);
    }

    return rootMenus.map((menu) =>
      this.buildMenuPermissionNode(menu, menuPermissions, permissions),
    );
  }

  /**
   * 递归构建菜单权限节点
   */
  private buildMenuPermissionNode(
    menu: MenuPermission,
    allMenus: MenuPermission[],
    permissions: Permission[],
  ): NzTreeNodeOptions {
    const children: NzTreeNodeOptions[] = [];

    // 添加子菜单
    const childMenus = allMenus.filter((m) => m.parentId === menu.menuId);
    childMenus.forEach((childMenu) => {
      children.push(
        this.buildMenuPermissionNode(childMenu, allMenus, permissions),
      );
    });

    // 添加该菜单对应的菜单权限
    const menuPerms = permissions.filter(
      (p) => p.type === PermissionType.Menu && p.menuId === menu.menuId,
    );
    menuPerms.forEach((perm) => {
      children.push({
        title: `${perm.name} (${perm.code})`,
        key: String(perm.id),
        isLeaf: true,
        icon: 'check-circle',
      });
    });

    // 添加该菜单的操作权限
    const actionPerms = permissions.filter(
      (p) => p.type === PermissionType.Action && p.menuId === menu.menuId,
    );
    actionPerms.forEach((perm) => {
      children.push({
        title: `${perm.name} (${perm.code})`,
        key: String(perm.id),
        isLeaf: true,
        icon: 'check-circle',
      });
    });

    return {
      title: `${menu.menuName} (${menu.path})`,
      key: `menu-${menu.menuId}`,
      selectable: false,
      children: children,
      expanded: false,
      icon: menu.icon || 'folder',
    };
  }

  /**
   * 将菜单权限转换为树形节点（旧方法，已弃用）
   */
  private convertToPermissionTree(
    menuPermissions: MenuPermission[],
  ): NzTreeNodeOptions[] {
    // 构建根节点
    const rootMenus = menuPermissions.filter((menu) => !menu.parentId);

    return rootMenus.map((menu) =>
      this.buildPermissionNode(menu, menuPermissions),
    );
  }

  /**
   * 递归构建权限节点（旧方法，已弃用）
   */
  private buildPermissionNode(
    menu: MenuPermission,
    allMenus: MenuPermission[],
  ): NzTreeNodeOptions {
    const children: NzTreeNodeOptions[] = [];

    // 添加子菜单
    const childMenus = allMenus.filter((m) => m.parentId === menu.menuId);
    childMenus.forEach((childMenu) => {
      children.push(this.buildPermissionNode(childMenu, allMenus));
    });

    // 添加操作权限
    if (menu.actions && menu.actions.length > 0) {
      menu.actions.forEach((action) => {
        children.push({
          title: `${action.name} (${action.code})`,
          key: action.id,
          isLeaf: true,
          icon: 'check-circle',
        });
      });
    }

    return {
      title: `${menu.menuName} (${menu.path})`,
      key: menu.menuId,
      children: children,
      expanded: false,
      icon: menu.icon || 'folder',
    };
  }

  /**
   * 权限树checkbox变化事件
   */
  onPermissionCheck(event: any): void {
    // event 可能是 NzFormatEmitEvent，包含 checkedKeys 属性
    if (event && event.checkedKeys) {
      this.checkedPermissionKeys = event.checkedKeys;
    } else if (Array.isArray(event)) {
      this.checkedPermissionKeys = event;
    }
  }
}
