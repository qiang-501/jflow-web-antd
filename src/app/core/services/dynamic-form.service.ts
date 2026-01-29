// 动态表单服务
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import {
  DynamicFormConfig,
  FormSubmission,
  CreateFormConfigDto,
  UpdateFormConfigDto,
} from '../../models/dynamic-form.model';

@Injectable({
  providedIn: 'root',
})
export class DynamicFormService {
  private http = inject(HttpClient);
  private apiUrl = 'api/dynamic-forms';

  /**
   * 获取所有表单配置
   */
  getFormConfigs(): Observable<DynamicFormConfig[]> {
    return this.http.get<DynamicFormConfig[]>(this.apiUrl);
  }

  /**
   * 根据ID获取表单配置
   */
  getFormConfigById(id: string): Observable<DynamicFormConfig> {
    return this.http.get<DynamicFormConfig>(`${this.apiUrl}/${id}`);
  }

  /**
   * 获取表单配置（别名方法）
   */
  getFormConfig(id: string): Observable<DynamicFormConfig> {
    return this.getFormConfigById(id);
  }

  /**
   * 创建新表单配置
   */
  createFormConfig(config: CreateFormConfigDto): Observable<DynamicFormConfig> {
    return this.http.post<DynamicFormConfig>(this.apiUrl, config);
  }

  /**
   * 更新表单配置
   */
  updateFormConfig(
    id: string,
    config: UpdateFormConfigDto,
  ): Observable<DynamicFormConfig> {
    return this.http.put<DynamicFormConfig>(`${this.apiUrl}/${id}`, config);
  }

  /**
   * 删除表单配置
   */
  deleteFormConfig(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * 提交表单数据
   */
  submitForm(submission: Partial<FormSubmission>): Observable<FormSubmission> {
    return this.http.post<FormSubmission>(
      `${this.apiUrl}/submissions`,
      submission,
    );
  }

  /**
   * 获取表单提交记录
   */
  getFormSubmissions(formConfigId: string): Observable<FormSubmission[]> {
    return this.http.get<FormSubmission[]>(
      `${this.apiUrl}/${formConfigId}/submissions`,
    );
  }

  /**
   * 验证表单字段
   */
  validateField(field: any, value: any): { valid: boolean; message?: string } {
    const validation = field.validation;
    if (!validation) {
      return { valid: true };
    }

    // 必填验证
    if (validation.required && !value) {
      return { valid: false, message: `${field.label}是必填项` };
    }

    // 最小值验证
    if (validation.min !== undefined && value < validation.min) {
      return {
        valid: false,
        message: `${field.label}不能小于${validation.min}`,
      };
    }

    // 最大值验证
    if (validation.max !== undefined && value > validation.max) {
      return {
        valid: false,
        message: `${field.label}不能大于${validation.max}`,
      };
    }

    // 最小长度验证
    if (
      validation.minLength !== undefined &&
      value?.length < validation.minLength
    ) {
      return {
        valid: false,
        message: `${field.label}长度不能少于${validation.minLength}个字符`,
      };
    }

    // 最大长度验证
    if (
      validation.maxLength !== undefined &&
      value?.length > validation.maxLength
    ) {
      return {
        valid: false,
        message: `${field.label}长度不能超过${validation.maxLength}个字符`,
      };
    }

    // 正则表达式验证
    if (validation.pattern && value) {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(value)) {
        return { valid: false, message: `${field.label}格式不正确` };
      }
    }

    // Email验证
    if (validation.email && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return { valid: false, message: `${field.label}必须是有效的邮箱地址` };
      }
    }

    // URL验证
    if (validation.url && value) {
      const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
      if (!urlRegex.test(value)) {
        return { valid: false, message: `${field.label}必须是有效的URL` };
      }
    }

    return { valid: true };
  }
}
