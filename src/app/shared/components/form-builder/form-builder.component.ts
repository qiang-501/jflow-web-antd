import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormArray,
} from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTagModule } from 'ng-zorro-antd/tag';
import {
  DynamicFormConfig,
  DynamicFormField,
  FieldType,
  FieldOption,
} from '../../../models/dynamic-form.model';
import { DynamicFormService } from '../../../core/services/dynamic-form.service';
import { DynamicFormRendererComponent } from '../dynamic-form-renderer/dynamic-form-renderer.component';

@Component({
  selector: 'app-form-builder',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzTableModule,
    NzModalModule,
    NzIconModule,
    NzSwitchModule,
    NzInputNumberModule,
    NzCardModule,
    NzDividerModule,
    NzPopconfirmModule,
    NzTagModule,
    DynamicFormRendererComponent,
  ],
  templateUrl: './form-builder.component.html',
  styleUrl: './form-builder.component.css',
})
export class FormBuilderComponent implements OnInit {
  private fb = inject(FormBuilder);
  private message = inject(NzMessageService);
  private formService = inject(DynamicFormService);

  formConfigs: DynamicFormConfig[] = [];
  loading = false;

  // 模态框控制
  isConfigModalVisible = false;
  isFieldModalVisible = false;
  isPreviewModalVisible = false;

  configForm!: FormGroup;
  fieldForm!: FormGroup;
  currentConfig: DynamicFormConfig | null = null;
  previewConfig: DynamicFormConfig | null = null;
  editingFieldIndex: number = -1;

  FieldType = FieldType;
  fieldTypes = [
    { label: '文本', value: FieldType.TEXT },
    { label: '数字', value: FieldType.NUMBER },
    { label: '文本域', value: FieldType.TEXTAREA },
    { label: '下拉选择', value: FieldType.SELECT },
    { label: '多选下拉', value: FieldType.MULTI_SELECT },
    { label: '日期', value: FieldType.DATE },
    { label: '日期范围', value: FieldType.DATE_RANGE },
    { label: '复选框', value: FieldType.CHECKBOX },
    { label: '单选按钮', value: FieldType.RADIO },
    { label: '开关', value: FieldType.SWITCH },
    { label: '邮箱', value: FieldType.EMAIL },
    { label: 'URL', value: FieldType.URL },
    { label: '文件上传', value: FieldType.FILE },
  ];

  ngOnInit(): void {
    this.initForms();
    this.loadFormConfigs();
  }

  initForms(): void {
    this.configForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      layout: ['vertical'],
    });

    this.fieldForm = this.fb.group({
      name: ['', [Validators.required]],
      label: ['', [Validators.required]],
      type: [FieldType.TEXT, [Validators.required]],
      defaultValue: [''],
      placeholder: [''],
      helpText: [''],
      width: [24],
      disabled: [false],
      hidden: [false],
      required: [false],
      min: [null],
      max: [null],
      minLength: [null],
      maxLength: [null],
      pattern: [''],
      email: [false],
      url: [false],
      options: this.fb.array([]),
    });
  }

  get optionsFormArray(): FormArray {
    return this.fieldForm.get('options') as FormArray;
  }

  loadFormConfigs(): void {
    this.loading = true;
    setTimeout(() => {
      this.formConfigs = this.getMockConfigs();
      this.loading = false;
    }, 500);
  }

  getMockConfigs(): DynamicFormConfig[] {
    return [
      {
        id: '1',
        name: '员工信息表单',
        description: '用于收集员工基本信息',
        layout: 'vertical',
        fields: [
          {
            id: 'f1',
            name: 'name',
            label: '姓名',
            type: FieldType.TEXT,
            validation: { required: true },
            order: 1,
            width: 12,
          },
          {
            id: 'f2',
            name: 'email',
            label: '邮箱',
            type: FieldType.EMAIL,
            validation: { required: true, email: true },
            order: 2,
            width: 12,
          },
        ],
        created_by: 'admin',
        created_on: '2026-01-20',
      },
    ];
  }

  showConfigModal(config?: DynamicFormConfig): void {
    this.currentConfig = config || null;
    if (config) {
      this.configForm.patchValue({
        name: config.name,
        description: config.description,
        layout: config.layout || 'vertical',
      });
    } else {
      this.configForm.reset({ layout: 'vertical' });
    }
    this.isConfigModalVisible = true;
  }

  handleConfigOk(): void {
    if (this.configForm.valid) {
      const formValue = this.configForm.value;
      if (this.currentConfig) {
        this.currentConfig.name = formValue.name;
        this.currentConfig.description = formValue.description;
        this.currentConfig.layout = formValue.layout;
        this.message.success('表单配置已更新');
      } else {
        const newConfig: DynamicFormConfig = {
          id: Date.now().toString(),
          name: formValue.name,
          description: formValue.description,
          layout: formValue.layout,
          fields: [],
          created_by: 'current_user',
          created_on: new Date().toISOString(),
        };
        this.formConfigs.push(newConfig);
        this.currentConfig = newConfig;
        this.message.success('表单配置已创建');
      }
      this.isConfigModalVisible = false;
    }
  }

  showFieldModal(config: DynamicFormConfig, fieldIndex?: number): void {
    this.currentConfig = config;
    this.editingFieldIndex = fieldIndex !== undefined ? fieldIndex : -1;

    if (fieldIndex !== undefined) {
      const field = config.fields[fieldIndex];
      this.fieldForm.patchValue({
        name: field.name,
        label: field.label,
        type: field.type,
        defaultValue: field.defaultValue,
        placeholder: field.placeholder,
        helpText: field.helpText,
        width: field.width || 24,
        disabled: field.disabled || false,
        hidden: field.hidden || false,
        required: field.validation?.required || false,
        min: field.validation?.min,
        max: field.validation?.max,
        minLength: field.validation?.minLength,
        maxLength: field.validation?.maxLength,
        pattern: field.validation?.pattern,
        email: field.validation?.email || false,
        url: field.validation?.url || false,
      });

      // 加载选项
      this.optionsFormArray.clear();
      field.options?.forEach((opt) => {
        this.optionsFormArray.push(
          this.fb.group({
            label: [opt.label],
            value: [opt.value],
          }),
        );
      });
    } else {
      this.fieldForm.reset({
        type: FieldType.TEXT,
        width: 24,
        disabled: false,
        hidden: false,
        required: false,
      });
      this.optionsFormArray.clear();
    }

    this.isFieldModalVisible = true;
  }

  addOption(): void {
    this.optionsFormArray.push(
      this.fb.group({
        label: [''],
        value: [''],
      }),
    );
  }

  removeOption(index: number): void {
    this.optionsFormArray.removeAt(index);
  }

  handleFieldOk(): void {
    if (this.fieldForm.valid && this.currentConfig) {
      const formValue = this.fieldForm.value;

      const field: DynamicFormField = {
        id:
          this.editingFieldIndex >= 0
            ? this.currentConfig.fields[this.editingFieldIndex].id
            : `f${Date.now()}`,
        name: formValue.name,
        label: formValue.label,
        type: formValue.type,
        defaultValue: formValue.defaultValue,
        placeholder: formValue.placeholder,
        helpText: formValue.helpText,
        width: formValue.width,
        disabled: formValue.disabled,
        hidden: formValue.hidden,
        order:
          this.editingFieldIndex >= 0
            ? this.currentConfig.fields[this.editingFieldIndex].order
            : this.currentConfig.fields.length + 1,
        validation: {
          required: formValue.required,
          min: formValue.min,
          max: formValue.max,
          minLength: formValue.minLength,
          maxLength: formValue.maxLength,
          pattern: formValue.pattern,
          email: formValue.email,
          url: formValue.url,
        },
        options:
          this.optionsFormArray.value.length > 0
            ? this.optionsFormArray.value
            : undefined,
      };

      if (this.editingFieldIndex >= 0) {
        this.currentConfig.fields[this.editingFieldIndex] = field;
        this.message.success('字段已更新');
      } else {
        this.currentConfig.fields.push(field);
        this.message.success('字段已添加');
      }

      this.isFieldModalVisible = false;
    }
  }

  deleteField(config: DynamicFormConfig, index: number): void {
    config.fields.splice(index, 1);
    config.fields.forEach((f, i) => (f.order = i + 1));
    this.message.success('字段已删除');
  }

  moveField(
    config: DynamicFormConfig,
    index: number,
    direction: 'up' | 'down',
  ): void {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= config.fields.length) return;

    const temp = config.fields[index];
    config.fields[index] = config.fields[newIndex];
    config.fields[newIndex] = temp;

    config.fields.forEach((f, i) => (f.order = i + 1));
  }

  previewForm(config: DynamicFormConfig): void {
    this.previewConfig = config;
    this.isPreviewModalVisible = true;
  }

  handlePreviewSubmit(data: any): void {
    console.log('表单提交数据:', data);
    this.message.success('表单提交成功');
    this.isPreviewModalVisible = false;
  }

  deleteConfig(id: string): void {
    this.formConfigs = this.formConfigs.filter((c) => c.id !== id);
    this.message.success('表单配置已删除');
  }

  needsOptions(type: FieldType): boolean {
    return [FieldType.SELECT, FieldType.MULTI_SELECT, FieldType.RADIO].includes(
      type,
    );
  }

  getFieldTypeLabel(type: FieldType): string {
    const fieldType = this.fieldTypes.find((t) => t.value === type);
    return fieldType ? fieldType.label : type;
  }
}
