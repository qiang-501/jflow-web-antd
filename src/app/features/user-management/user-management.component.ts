// user-management.component.ts
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
import { UserActions } from '../../store/actions/user.actions';
import { RoleActions } from '../../store/actions/role.actions';
import {
  selectAllUsers,
  selectUserLoading,
} from '../../store/selectors/user.selectors';
import { selectAllRoles } from '../../store/selectors/role.selectors';

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
  private store = inject(Store);
  private fb = inject(FormBuilder);
  private modal = inject(NzModalService);
  private message = inject(NzMessageService);

  users$: Observable<User[]>;
  roles$: Observable<Role[]>;
  loading$: Observable<boolean>;

  userForm!: FormGroup;
  isModalVisible = false;
  isEditMode = false;
  currentUserId: string | null = null;

  UserStatus = UserStatus;

  constructor() {
    this.users$ = this.store.select(selectAllUsers);
    this.roles$ = this.store.select(selectAllRoles);
    this.loading$ = this.store.select(selectUserLoading);
  }

  ngOnInit(): void {
    this.store.dispatch(UserActions.loadUsers({}));
    this.store.dispatch(RoleActions.loadRoles({}));
    this.initForm();
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

  handleSubmit(): void {
    if (this.userForm.valid) {
      const formValue = this.userForm.getRawValue();

      if (this.isEditMode && this.currentUserId) {
        const updateDto: UpdateUserDto = {
          username: formValue.username,
          email: formValue.email,
          fullName: formValue.fullName,
          status: formValue.status,
          roleIds: formValue.roleIds,
        };
        this.store.dispatch(
          UserActions.updateUser({ id: this.currentUserId, user: updateDto }),
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
        this.store.dispatch(UserActions.createUser({ user: createDto }));
        this.message.success('用户创建成功');
      }

      this.handleCancel();
    } else {
      Object.values(this.userForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  deleteUser(id: string): void {
    this.store.dispatch(UserActions.deleteUser({ id }));
    this.message.success('用户删除成功');
  }

  resetPassword(user: User): void {
    this.modal.confirm({
      nzTitle: '重置密码',
      nzContent: `确定要重置用户 ${user.username} 的密码吗？`,
      nzOnOk: () => {
        const newPassword = this.generateRandomPassword();
        this.store.dispatch(
          UserActions.resetPassword({ userId: user.id, newPassword }),
        );
        this.message.success(`密码已重置为: ${newPassword}`);
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
