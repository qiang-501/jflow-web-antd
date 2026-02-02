import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzMessageService } from 'ng-zorro-antd/message';
import { environment } from '../../../environments/environment';

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
  loginForm!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private message: NzMessageService,
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  submitForm(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      const loginData = this.loginForm.value;

      this.http
        .post<any>(`${environment.apiUrl}/auth/login`, loginData)
        .subscribe({
          next: (response) => {
            this.loading = false;
            // 存储 token 和用户信息
            localStorage.setItem('token', response.access_token);
            localStorage.setItem('user', JSON.stringify(response.user));

            this.message.success('登录成功');

            // 跳转到首页或之前想访问的页面
            const returnUrl = localStorage.getItem('returnUrl') || '/';
            localStorage.removeItem('returnUrl');
            this.router.navigate([returnUrl]);
          },
          error: (error) => {
            this.loading = false;
            console.error('Login error:', error);

            if (error.status === 401) {
              this.message.error('用户名或密码错误');
            } else {
              this.message.error(
                error.error?.message || '登录失败，请稍后重试',
              );
            }
          },
        });
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
