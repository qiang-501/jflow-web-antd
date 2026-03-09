import {
  Component,
  OnInit,
  inject,
  Input,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormArray,
} from '@angular/forms';
import { firstValueFrom } from 'rxjs';
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
import { NzAlertModule } from 'ng-zorro-antd/alert';
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
    NzAlertModule,
    DynamicFormRendererComponent,
  ],
  templateUrl: './form-builder.component.html',
  styleUrl: './form-builder.component.css',
})
export class FormBuilderComponent implements OnInit {
  private fb = inject(FormBuilder);
  private message = inject(NzMessageService);
  private formService = inject(DynamicFormService);
  private cdr = inject(ChangeDetectorRef);

  @Input() formConfigId?: number; // 指定要编辑的表单ID
  @Input() createMode = false; // 是否为创建模式（仅创建新表单，不显示列表）

  formConfigs: DynamicFormConfig[] = [];
  loading = false;
  singleFormMode = false; // 是否为单表单编辑模式

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
    if (this.createMode) {
      // 创建模式：不加载任何表单，直接打开创建对话框
      this.singleFormMode = false;
      this.formConfigs = [];
      // 使用setTimeout避免ExpressionChangedAfterItHasBeenCheckedError
      setTimeout(() => {
        this.showConfigModal();
      });
    } else if (this.formConfigId) {
      // 单表单编辑模式：只加载指定的表单
      this.singleFormMode = true;
      this.loadSingleFormConfig(this.formConfigId);
    } else {
      // 普通模式：加载所有表单
      this.singleFormMode = false;
      this.loadFormConfigs();
    }
  }

  initForms(): void {
    this.configForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      layout: ['vertical'],
    });

    this.fieldForm = this.fb.group({
      fieldKey: ['', [Validators.required]],
      label: ['', [Validators.required]],
      fieldType: [FieldType.TEXT, [Validators.required]],
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

  async loadFormConfigs(): Promise<void> {
    this.loading = true;
    try {
      const response = await firstValueFrom(this.formService.getFormConfigs());
      // 确保每个配置的 fields 都是数组
      this.formConfigs = response.data.map((config) => ({
        ...config,
        fields: Array.isArray(config.fields) ? config.fields : [],
      }));
      this.loading = false;
    } catch (error) {
      console.error('加载表单配置失败:', error);
      this.message.error('加载表单配置失败');
      this.loading = false;
    }
  }

  // 加载单个表单配置
  async loadSingleFormConfig(id: number): Promise<void> {
    this.loading = true;
    try {
      const config = await firstValueFrom(
        this.formService.getFormConfigById(id),
      );
      // 确保 fields 是数组
      this.formConfigs = [
        {
          ...config,
          fields: Array.isArray(config.fields) ? config.fields : [],
        },
      ];
      // 自动设置为当前编辑的表单
      this.currentConfig = this.formConfigs[0];
      this.loading = false;
      this.cdr.markForCheck();
    } catch (error) {
      console.error('加载表单配置失败:', error);
      this.message.error('加载表单配置失败');
      this.loading = false;
    }
  }

  getMockConfigs(): DynamicFormConfig[] {
    return [
      {
        id: 1,
        name: '员工信息表单',
        description: '用于收集员工基本信息',
        layout: 'vertical',
        fields: [
          {
            fieldKey: 'name',
            fieldType: FieldType.TEXT,
            label: '姓名',
            required: true,
            disabled: false,
            readonly: false,
            orderIndex: 1,
            span: 12,
            validators: { required: true },
          },
          {
            fieldKey: 'email',
            fieldType: FieldType.EMAIL,
            label: '邮箱',
            required: true,
            disabled: false,
            readonly: false,
            orderIndex: 2,
            span: 12,
            validators: { required: true, email: true },
          },
        ],
        createdAt: '2026-01-20',
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

  async handleConfigOk(): Promise<void> {
    if (this.configForm.valid) {
      const formValue = this.configForm.value;
      if (this.currentConfig) {
        // 更新现有配置
        // 准备发送到服务器的数据，移除不必要的字段
        const cleanedFields = this.currentConfig.fields.map((field: any) => {
          const { id, formConfigId, createdAt, updatedAt, ...cleanField } =
            field;
          return cleanField;
        });

        const updateDto = {
          name: formValue.name,
          description: formValue.description,
          layout: formValue.layout,
          fields: cleanedFields,
        };

        try {
          const updatedConfig = await firstValueFrom(
            this.formService.updateFormConfig(
              Number(this.currentConfig.id),
              updateDto,
            ),
          );
          const index = this.formConfigs.findIndex(
            (c) => c.id === this.currentConfig!.id,
          );
          if (index >= 0) {
            this.formConfigs[index] = updatedConfig;
          }
          this.currentConfig = updatedConfig;
          this.message.success('表单配置已更新');
          this.isConfigModalVisible = false;
          this.cdr.markForCheck();
        } catch (error: any) {
          console.error('更新表单配置失败:', error);
          this.message.error(error.error?.message || '更新表单配置失败');
        }
      } else {
        // 创建新配置
        const createDto = {
          name: formValue.name,
          description: formValue.description,
          layout: formValue.layout,
          fields: [],
        };

        try {
          const newConfig = await firstValueFrom(
            this.formService.createFormConfig(createDto),
          );
          this.formConfigs.push(newConfig);
          this.currentConfig = newConfig;
          this.message.success('表单配置已创建');
          this.isConfigModalVisible = false;
          this.cdr.markForCheck();
        } catch (error: any) {
          console.error('创建表单配置失败:', error);
          this.message.error(error.error?.message || '创建表单配置失败');
        }
      }
    }
  }

  showFieldModal(config: DynamicFormConfig, fieldIndex?: number): void {
    this.currentConfig = config;
    this.editingFieldIndex = fieldIndex !== undefined ? fieldIndex : -1;

    const fields = this.getConfigFields(config);
    if (fieldIndex !== undefined && fields[fieldIndex]) {
      const field = fields[fieldIndex];
      this.fieldForm.patchValue({
        fieldKey: field.fieldKey || field.name,
        label: field.label,
        fieldType: field.fieldType || field.type,
        defaultValue: field.defaultValue,
        placeholder: field.placeholder,
        helpText: field.helpText,
        width: field.span || field.width || 24,
        disabled: field.disabled || false,
        hidden: field.hidden || false,
        required:
          field.required ||
          field.validation?.required ||
          field.validators?.required ||
          false,
        min: field.validators?.min || field.validation?.min,
        max: field.validators?.max || field.validation?.max,
        minLength: field.validators?.minLength || field.validation?.minLength,
        maxLength: field.validators?.maxLength || field.validation?.maxLength,
        pattern: field.validators?.pattern || field.validation?.pattern,
        email: field.validators?.email || field.validation?.email || false,
        url: field.validators?.url || field.validation?.url || false,
      });

      // 加载选项
      this.optionsFormArray.clear();
      field.options?.forEach((opt: FieldOption) => {
        this.optionsFormArray.push(
          this.fb.group({
            label: [opt.label],
            value: [opt.value],
          }),
        );
      });
    } else {
      this.fieldForm.reset({
        fieldType: FieldType.TEXT,
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

  async handleFieldOk(): Promise<void> {
    if (this.fieldForm.valid && this.currentConfig) {
      const formValue = this.fieldForm.value;
      const fields = this.getConfigFields(this.currentConfig);

      // 构造符合后端 FormField 接口的字段对象
      const field: any = {
        id:
          this.editingFieldIndex >= 0 && fields[this.editingFieldIndex]
            ? fields[this.editingFieldIndex].id
            : undefined,
        fieldKey: formValue.fieldKey,
        fieldType: formValue.fieldType,
        label: formValue.label,
        placeholder: formValue.placeholder,
        defaultValue: formValue.defaultValue,
        required: formValue.required,
        disabled: formValue.disabled,
        readonly: false,
        orderIndex:
          this.editingFieldIndex >= 0 && fields[this.editingFieldIndex]
            ? fields[this.editingFieldIndex].orderIndex
            : fields.length,
        span: formValue.width || 24,
        options:
          this.optionsFormArray.value.length > 0
            ? this.optionsFormArray.value
            : null,
        validators: {
          required: formValue.required,
          min: formValue.min,
          max: formValue.max,
          minLength: formValue.minLength,
          maxLength: formValue.maxLength,
          pattern: formValue.pattern,
          email: formValue.email,
          url: formValue.url,
        },
      };

      if (this.editingFieldIndex >= 0) {
        fields[this.editingFieldIndex] = field;
      } else {
        fields.push(field);
      }

      // 更新 config.fields
      this.currentConfig.fields = fields;

      // 准备发送到服务器的数据，移除不必要的字段
      const cleanedFields = fields.map((field: any) => {
        const { id, formConfigId, createdAt, updatedAt, ...cleanField } = field;
        return cleanField;
      });

      // 更新到服务器
      const updateDto = {
        name: this.currentConfig.name,
        description: this.currentConfig.description,
        layout: this.currentConfig.layout,
        fields: cleanedFields,
      };

      try {
        const updatedConfig = await firstValueFrom(
          this.formService.updateFormConfig(
            Number(this.currentConfig.id),
            updateDto,
          ),
        );
        const index = this.formConfigs.findIndex(
          (c) => c.id === this.currentConfig!.id,
        );
        if (index >= 0) {
          this.formConfigs[index] = updatedConfig;
        }
        this.currentConfig = updatedConfig;
        const action = this.editingFieldIndex >= 0 ? '更新' : '添加';
        this.message.success(`字段已${action}`);
        this.isFieldModalVisible = false;
        this.cdr.markForCheck();
      } catch (error: any) {
        console.error('保存字段失败:', error);
        this.message.error(error.error?.message || '保存字段失败');
      }
    }
  }

  async deleteField(config: DynamicFormConfig, index: number): Promise<void> {
    const fields = this.getConfigFields(config);
    fields.splice(index, 1);
    fields.forEach((f: any, i: number) => (f.orderIndex = i));

    // 更新 config.fields
    config.fields = fields;

    // 准备发送到服务器的数据，移除不必要的字段
    const cleanedFields = fields.map((field: any) => {
      const { id, formConfigId, createdAt, updatedAt, ...cleanField } = field;
      return cleanField;
    });

    // 更新到服务器
    const updateDto = {
      name: config.name,
      description: config.description,
      layout: config.layout,
      fields: cleanedFields,
    };

    try {
      const updatedConfig = await firstValueFrom(
        this.formService.updateFormConfig(Number(config.id), updateDto),
      );
      const configIndex = this.formConfigs.findIndex((c) => c.id === config.id);
      if (configIndex >= 0) {
        this.formConfigs[configIndex] = updatedConfig;
      }
      this.message.success('字段已删除');
      this.cdr.markForCheck();
    } catch (error: any) {
      console.error('删除字段失败:', error);
      this.message.error(error.error?.message || '删除字段失败');
      // 恢复字段
      await this.loadFormConfigs();
    }
  }

  moveField(
    config: DynamicFormConfig,
    index: number,
    direction: 'up' | 'down',
  ): void {
    const fields = this.getConfigFields(config);
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;

    const temp = fields[index];
    fields[index] = fields[newIndex];
    fields[newIndex] = temp;

    fields.forEach((f: any, i: number) => (f.orderIndex = i));

    // 更新 config.fields
    config.fields = fields;
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

  async deleteConfig(id: number): Promise<void> {
    try {
      await firstValueFrom(this.formService.deleteFormConfig(id));
      this.formConfigs = this.formConfigs.filter((c) => c.id !== id);
      this.message.success('表单配置已删除');
      this.cdr.markForCheck();
    } catch (error: any) {
      console.error('删除表单配置失败:', error);
      this.message.error(error.error?.message || '删除表单配置失败');
    }
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

  // 获取配置的字段数组
  getConfigFields(config: DynamicFormConfig): any[] {
    if (!config.fields) return [];
    // 如果已经是数组，直接返回，避免创建新引用
    if (Array.isArray(config.fields)) {
      return config.fields;
    }
    // 如果不是数组，返回空数组（只在必要时创建新数组）
    return [];
  }

  // 获取字段数组的长度
  getFieldsLength(config: DynamicFormConfig): number {
    if (!config.fields) return 0;
    return Array.isArray(config.fields) ? config.fields.length : 0;
  }
}
