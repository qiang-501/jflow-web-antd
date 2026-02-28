// user-management.component.ts
import { Component, OnInit, inject } from '@angular/core';
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
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpaceModule } from 'ng-zorro-antd/space';

import {
  User,
  UserStatus,
  CreateUserDto,
  UpdateUserDto,
} from '../../models/user.model';
import { Role } from '../../models/role.model';
import { UserService } from '../../core/services/user.service';
import { RoleService } from '../../core/services/role.service';

@Component({
  selector: 'app-user-management',
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
    NzTagModule,
    NzSpaceModule,
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
})
export class UserManagementComponent implements OnInit {
  private userService = inject(UserService);
  private roleService = inject(RoleService);
  private fb = inject(FormBuilder);
  private modal = inject(NzModalService);
  private message = inject(NzMessageService);

  users: User[] = [];
  roles: Role[] = [];
  loading = false;

  userForm!: FormGroup;
  isModalVisible = false;
  isEditMode = false;
  currentUserId: string | null = null;

  UserStatus = UserStatus;

  constructor() {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
    this.initForm();
  }

  async loadUsers(): Promise<void> {
    this.loading = true;
    try {
      const response = await firstValueFrom(this.userService.getUsers());
      this.users = response.data;
      this.loading = false;
    } catch (error) {
      console.error('Error loading users:', error);
      this.message.error('加载用户列表失败');
      this.loading = false;
    }
  }

  async loadRoles(): Promise<void> {
    try {
      const roles = await firstValueFrom(this.roleService.getRoles());
      this.roles = roles;
    } catch (error) {
      console.error('Error loading roles:', error);
      this.message.error('加载角色列表失败');
    }
  }

  initForm(): void {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      fullName: ['', [Validators.required]],
      phone: [''],
      roleIds: [[], [Validators.required]],
      status: [UserStatus.Active],
    });
  }

  showAddModal(): void {
    this.isEditMode = false;
    this.currentUserId = null;
    this.userForm.reset({ status: UserStatus.Active, roleIds: [] });
    this.userForm
      .get('password')
      ?.setValidators([Validators.required, Validators.minLength(6)]);
    this.isModalVisible = true;
  }

  showEditModal(user: User): void {
    this.isEditMode = true;
    this.currentUserId = user.id;
    this.userForm.patchValue({
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      roleIds: user.roleIds,
      status: user.status,
    });
    this.userForm.get('username')?.disable();
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.isModalVisible = true;
  }

  handleCancel(): void {
    this.isModalVisible = false;
    this.userForm.reset();
    this.userForm.get('username')?.enable();
  }

  async handleSubmit(): Promise<void> {
    if (this.userForm.valid) {
      const formValue = this.userForm.getRawValue();

      try {
        if (this.isEditMode && this.currentUserId) {
          const updateDto: UpdateUserDto = {
            username: formValue.username,
            email: formValue.email,
            fullName: formValue.fullName,
            status: formValue.status,
            roleIds: formValue.roleIds,
          };
          await firstValueFrom(
            this.userService.updateUser(this.currentUserId, updateDto),
          );
          this.message.success('用户更新成功');
        } else {
          const createDto: CreateUserDto = {
            username: formValue.username,
            email: formValue.email,
            password: formValue.password,
            fullName: formValue.fullName,
            status: formValue.status,
            roleIds: formValue.roleIds,
          };
          await firstValueFrom(this.userService.createUser(createDto));
          this.message.success('用户创建成功');
        }
        await this.loadUsers();
        this.handleCancel();
      } catch (error) {
        console.error('Error creating/updating user:', error);
        this.message.error(this.isEditMode ? '用户更新失败' : '用户创建失败');
      }
    } else {
      Object.values(this.userForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await firstValueFrom(this.userService.deleteUser(id));
      this.message.success('用户删除成功');
      await this.loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      this.message.error('用户删除失败');
    }
  }

  resetPassword(user: User): void {
    this.modal.confirm({
      nzTitle: '重置密码',
      nzContent: `确定要重置用户 ${user.username} 的密码吗？`,
      nzOnOk: async () => {
        const newPassword = this.generateRandomPassword();
        try {
          await firstValueFrom(
            this.userService.resetPassword(user.id, newPassword),
          );
          this.message.success(`密码已重置为: ${newPassword}`);
        } catch (error) {
          console.error('Error resetting password:', error);
          this.message.error('密码重置失败');
        }
      },
    });
  }

  private generateRandomPassword(): string {
    return Math.random().toString(36).slice(-8);
  }

  getStatusColor(status: UserStatus): string {
    switch (status) {
      case UserStatus.Active:
        return 'success';
      case UserStatus.Inactive:
        return 'default';
      case UserStatus.Locked:
        return 'error';
      default:
        return 'default';
    }
  }
}
