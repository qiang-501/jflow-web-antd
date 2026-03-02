import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from '../../core/services/auth.service';
import { PermissionService } from '../../core/services/permission.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCardModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private permissionService = inject(PermissionService);
  private message = inject(NzMessageService);

  loginForm!: FormGroup;
  loading = false;

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  async submitForm(): Promise<void> {
    if (this.loginForm.valid) {
      this.loading = true;
      const loginData = this.loginForm.value;

      try {
        const response = await firstValueFrom(
          this.authService.login(loginData),
        );

        // 将 token 和用户信息保存到 cookie
        this.authService.saveAuth(response.access_token, response.user);

        console.log('✅ 登录成功，开始加载用户权限...');

        // 立即加载用户权限到缓存
        try {
          await firstValueFrom(this.permissionService.loadUserPermissions());
          console.log('✅ 用户权限加载成功');
        } catch (permError) {
          console.error('⚠️ 权限加载失败（不影响登录）:', permError);
          // 权限加载失败不阻止登录流程
        }

        this.message.success('登录成功');

        // 跳转到首页或之前想访问的页面
        const returnUrl = this.authService.getReturnUrl();
        this.router.navigate([returnUrl]);
      } catch (error: any) {
        console.error('Login error:', error);

        if (error.status === 401) {
          this.message.error('用户名或密码错误');
        } else {
          this.message.error(error.error?.message || '登录失败，请稍后重试');
        }
      } finally {
        this.loading = false;
      }
    } else {
      Object.values(this.loginForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
}
