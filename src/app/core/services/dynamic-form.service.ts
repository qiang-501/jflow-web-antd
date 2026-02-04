// 动态表单服务
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  DynamicFormConfig,
  DynamicFormField,
  FormField,
  FormSubmission,
  CreateFormConfigDto,
  UpdateFormConfigDto,
} from '../../models/dynamic-form.model';

@Injectable({
  providedIn: 'root',
})
export class DynamicFormService {
  private http = inject(HttpClient);
  private apiUrl = 'api/forms';

  /**
   * 获取所有表单配置
   */
  getFormConfigs(): Observable<{ data: DynamicFormConfig[]; total: number }> {
    return this.http.get<{ data: DynamicFormConfig[]; total: number }>(
      this.apiUrl,
    );
  }

  /**
   * 根据ID获取表单配置
   */
  getFormConfigById(id: number): Observable<DynamicFormConfig> {
    return this.http.get<DynamicFormConfig>(`${this.apiUrl}/${id}`);
  }

  /**
   * 获取表单配置（别名方法）
   */
  getFormConfig(id: number): Observable<DynamicFormConfig> {
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
    id: number,
    config: UpdateFormConfigDto,
  ): Observable<DynamicFormConfig> {
    return this.http.put<DynamicFormConfig>(`${this.apiUrl}/${id}`, config);
  }

  /**
   * 删除表单配置
   */
  deleteFormConfig(id: number): Observable<void> {
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
  getFormSubmissions(formConfigId: number): Observable<FormSubmission[]> {
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

  /**
   * 将后端的FormField数组转换为前端DynamicFormField格式
   */
  convertFormFieldsToDynamicFields(fields: FormField[]): DynamicFormField[] {
    return fields.map((field, index) => ({
      id: field.id?.toString() || field.fieldKey,
      name: field.fieldKey,
      label: field.label,
      type: field.fieldType as any,
      defaultValue: field.defaultValue,
      placeholder: field.placeholder,
      validation: field.validators
        ? {
            required: field.required,
            ...field.validators,
          }
        : { required: field.required },
      options: field.options?.items || field.options,
      disabled: field.disabled,
      hidden: false,
      order: field.orderIndex ?? index,
      width: field.span,
    }));
  }

  /**
   * 将前端DynamicFormField转换为后端FormField格式
   */
  convertDynamicFieldsToFormFields(
    fields: DynamicFormField[],
    formConfigId?: number,
  ): FormField[] {
    return fields.map((field, index) => ({
      formConfigId,
      fieldKey: field.name,
      fieldType: field.type,
      label: field.label,
      placeholder: field.placeholder,
      defaultValue: field.defaultValue?.toString(),
      required: field.validation?.required || false,
      disabled: field.disabled || false,
      readonly: false,
      orderIndex: field.order ?? index,
      span: field.width || 24,
      options: field.options
        ? { items: Array.isArray(field.options) ? field.options : [] }
        : null,
      validators: field.validation || null,
    }));
  }
}
