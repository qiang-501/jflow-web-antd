// role-management.component.ts
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
import { map } from 'rxjs/operators';

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

import {
  Role,
  RoleTree,
  CreateRoleDto,
  UpdateRoleDto,
} from '../../models/role.model';
import { Permission } from '../../models/permission.model';
import { RoleActions } from '../../store/actions/role.actions';
import { PermissionActions } from '../../store/actions/permission.actions';
import {
  selectAllRoles,
  selectRoleTree,
  selectRoleLoading,
} from '../../store/selectors/role.selectors';
import { selectAllPermissions } from '../../store/selectors/permission.selectors';

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
  ],
  templateUrl: './role-management.component.html',
  styleUrls: ['./role-management.component.css'],
})
export class RoleManagementComponent implements OnInit {
  private store = inject(Store);
  private fb = inject(FormBuilder);
  private message = inject(NzMessageService);

  roles$: Observable<Role[]>;
  roleTree$: Observable<RoleTree[]>;
  roleTreeNodes$: Observable<NzTreeNodeOptions[]>;
  permissions$: Observable<Permission[]>;
  loading$: Observable<boolean>;

  roleForm!: FormGroup;
  permissionForm!: FormGroup;
  isModalVisible = false;
  isPermissionModalVisible = false;
  isEditMode = false;
  currentRoleId: string | null = null;
  selectedRole: Role | null = null;

  constructor() {
    this.roles$ = this.store.select(selectAllRoles);
    this.roleTree$ = this.store.select(selectRoleTree);
    this.permissions$ = this.store.select(selectAllPermissions);
    this.loading$ = this.store.select(selectRoleLoading);

    // 转换 RoleTree 为 NzTreeNodeOptions
    this.roleTreeNodes$ = this.roleTree$.pipe(
      map((tree) => this.convertToTreeNodes(tree)),
    );
  }

  ngOnInit(): void {
    this.store.dispatch(RoleActions.loadRoles({}));
    this.store.dispatch(RoleActions.loadRoleTree());
    this.store.dispatch(PermissionActions.loadPermissions({}));
    this.initForm();
  }

  initForm(): void {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required]],
      code: ['', [Validators.required]],
      description: [''],
      parentId: [null],
    });

    this.permissionForm = this.fb.group({
      permissionIds: [[], [Validators.required]],
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
    this.permissionForm.patchValue({
      permissionIds: role.permissionIds,
    });
    this.isPermissionModalVisible = true;
  }

  handleCancel(): void {
    this.isModalVisible = false;
    this.roleForm.reset();
  }

  handlePermissionCancel(): void {
    this.isPermissionModalVisible = false;
    this.permissionForm.reset();
    this.selectedRole = null;
  }

  handleSubmit(): void {
    if (this.roleForm.valid) {
      const formValue = this.roleForm.value;

      if (this.isEditMode && this.currentRoleId) {
        const updateDto: UpdateRoleDto = {
          name: formValue.name,
          code: formValue.code,
          description: formValue.description,
          parentId: formValue.parentId,
        };
        this.store.dispatch(
          RoleActions.updateRole({ id: this.currentRoleId, role: updateDto }),
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
        this.store.dispatch(RoleActions.createRole({ role: createDto }));
        this.message.success('角色创建成功');
      }

      this.handleCancel();
    } else {
      Object.values(this.roleForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  handlePermissionSubmit(): void {
    if (this.permissionForm.valid && this.selectedRole) {
      const permissionIds = this.permissionForm.value.permissionIds;
      this.store.dispatch(
        RoleActions.assignPermissions({
          roleId: this.selectedRole.id,
          permissionIds,
        }),
      );
      this.message.success('权限分配成功');
      this.handlePermissionCancel();
    }
  }

  deleteRole(id: string): void {
    this.store.dispatch(RoleActions.deleteRole({ id }));
    this.message.success('角色删除成功');
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
}
