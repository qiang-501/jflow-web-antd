import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import {
  DynamicFormConfig,
  DynamicFormField,
  FormField,
  FieldType,
} from '../../../models/dynamic-form.model';
import { DynamicFormService } from '../../../core/services/dynamic-form.service';

@Component({
  selector: 'app-dynamic-form-renderer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzDatePickerModule,
    NzCheckboxModule,
    NzRadioModule,
    NzSwitchModule,
    NzButtonModule,
    NzGridModule,
    NzUploadModule,
    NzInputNumberModule,
  ],
  templateUrl: './dynamic-form-renderer.component.html',
  styleUrl: './dynamic-form-renderer.component.css',
})
export class DynamicFormRendererComponent implements OnInit {
  private fb = inject(FormBuilder);
  private formService = inject(DynamicFormService);

  @Input() formConfig!: DynamicFormConfig;
  @Input() initialData?: { [key: string]: any };
  @Output() formSubmit = new EventEmitter<{ [key: string]: any }>();
  @Output() formCancel = new EventEmitter<void>();

  form!: FormGroup;
  FieldType = FieldType;

  // 缓存可见字段列表，避免每次都创建新数组
  private _cachedVisibleFields: DynamicFormField[] | null = null;

  // 获取表单布局类型
  get formLayout(): 'horizontal' | 'vertical' | 'inline' {
    const layout = this.formConfig.layout;
    if (layout === 'horizontal' || layout === 'inline') {
      return layout;
    }
    return 'vertical';
  }

  ngOnInit(): void {
    this.buildForm();
    if (this.initialData) {
      this.form.patchValue(this.initialData);
    }
  }

  buildForm(): void {
    const group: { [key: string]: any } = {};

    // 转换 FormField 数组为 DynamicFormField 数组
    let fields: DynamicFormField[] = [];

    if (Array.isArray(this.formConfig.fields)) {
      // 检查是否是FormField格式 (有fieldKey属性)
      const firstField = this.formConfig.fields[0];
      if (firstField && 'fieldKey' in firstField) {
        // 是FormField格式，需要转换
        fields = this.formService.convertFormFieldsToDynamicFields(
          this.formConfig.fields,
        );
      } else {
        // 已经是DynamicFormField格式，但需要正确类型转换
        fields = this.formConfig.fields as any as DynamicFormField[];
      }
    }

    fields
      .sort((a: DynamicFormField, b: DynamicFormField) => a.order - b.order)
      .forEach((field: DynamicFormField) => {
        const validators = this.buildValidators(field);
        group[field.name] = [
          field.defaultValue !== undefined ? field.defaultValue : null,
          validators,
        ];
      });

    this.form = this.fb.group(group);

    // 计算并缓存可见字段
    this._cachedVisibleFields = fields
      .filter((field: DynamicFormField) => !field.hidden)
      .sort((a: DynamicFormField, b: DynamicFormField) => a.order - b.order);

    // 设置字段依赖关系
    fields.forEach((field: DynamicFormField) => {
      if (field.dependsOn) {
        const dependField = this.form.get(field.dependsOn.field);
        dependField?.valueChanges.subscribe((value) => {
          const currentField = this.form.get(field.name);
          if (value === field.dependsOn!.value) {
            currentField?.enable();
          } else {
            currentField?.disable();
          }
        });
      }

      if (field.disabled) {
        this.form.get(field.name)?.disable();
      }
    });
  }

  buildValidators(field: DynamicFormField): any[] {
    const validators = [];

    if (field.validation?.required) {
      validators.push(Validators.required);
    }

    if (field.validation?.min !== undefined) {
      validators.push(Validators.min(field.validation.min));
    }

    if (field.validation?.max !== undefined) {
      validators.push(Validators.max(field.validation.max));
    }

    if (field.validation?.minLength !== undefined) {
      validators.push(Validators.minLength(field.validation.minLength));
    }

    if (field.validation?.maxLength !== undefined) {
      validators.push(Validators.maxLength(field.validation.maxLength));
    }

    if (field.validation?.pattern) {
      validators.push(Validators.pattern(field.validation.pattern));
    }

    if (field.validation?.email) {
      validators.push(Validators.email);
    }

    return validators;
  }

  getVisibleFields(): DynamicFormField[] {
    // 返回缓存的可见字段列表
    return this._cachedVisibleFields || [];
  }

  getFieldWidth(field: DynamicFormField): number {
    return field.width || 24;
  }

  isFieldVisible(field: DynamicFormField): boolean {
    if (field.hidden) return false;

    if (field.dependsOn) {
      const dependValue = this.form.get(field.dependsOn.field)?.value;
      return dependValue === field.dependsOn.value;
    }

    return true;
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.formSubmit.emit(this.form.value);
    } else {
      Object.values(this.form.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  getErrorMessage(field: DynamicFormField): string {
    const control = this.form.get(field.name);
    if (!control || !control.errors || !control.dirty) {
      return '';
    }

    if (control.errors['required']) {
      return `${field.label}是必填项`;
    }

    if (control.errors['min']) {
      return `${field.label}不能小于${field.validation?.min}`;
    }

    if (control.errors['max']) {
      return `${field.label}不能大于${field.validation?.max}`;
    }

    if (control.errors['minlength']) {
      return `${field.label}长度不能少于${field.validation?.minLength}个字符`;
    }

    if (control.errors['maxlength']) {
      return `${field.label}长度不能超过${field.validation?.maxLength}个字符`;
    }

    if (control.errors['pattern']) {
      return `${field.label}格式不正确`;
    }

    if (control.errors['email']) {
      return `${field.label}必须是有效的邮箱地址`;
    }

    return '输入格式不正确';
  }
}
