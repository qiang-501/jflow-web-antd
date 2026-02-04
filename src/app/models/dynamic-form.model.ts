// 动态表单模型定义

export enum FieldType {
  TEXT = 'text',
  NUMBER = 'number',
  TEXTAREA = 'textarea',
  SELECT = 'select',
  MULTI_SELECT = 'multi_select',
  DATE = 'date',
  DATE_RANGE = 'date_range',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  SWITCH = 'switch',
  EMAIL = 'email',
  URL = 'url',
  FILE = 'file',
}

export interface FieldOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface FieldValidation {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  email?: boolean;
  url?: boolean;
  custom?: {
    validator: string;
    message: string;
  };
}

// 新增：FormField 接口，对应后端数据库表结构
export interface FormField {
  id?: number;
  formConfigId?: number;
  fieldKey: string;
  fieldType: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  required: boolean;
  disabled: boolean;
  readonly: boolean;
  orderIndex: number;
  span: number;
  options?: any; // JSON 类型，存储下拉选项等
  validators?: any; // JSON 类型，存储验证规则
  createdAt?: string;
  updatedAt?: string;
}

// 保留旧的接口用于向后兼容
export interface DynamicFormField {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  defaultValue?: any;
  placeholder?: string;
  helpText?: string;
  validation?: FieldValidation;
  options?: FieldOption[];
  disabled?: boolean;
  hidden?: boolean;
  order: number;
  width?: number; // 栅格宽度 1-24
  dependsOn?: {
    field: string;
    value: any;
  };
}

export interface DynamicFormConfig {
  id: number;
  name: string;
  description?: string;
  fields: FormField[]; // 修改：从 any 改为 FormField[]
  layout?: string;
  labelWidth?: string;
  labelAlign?: string;
  version?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FormSubmission {
  id: string;
  form_config_id: string;
  workflow_id?: string;
  data: { [key: string]: any };
  submitted_by: string;
  submitted_on: string;
}

export interface CreateFormConfigDto {
  name: string;
  description?: string;
  fields?: FormField[]; // 修改：从 any 改为 FormField[]
  layout?: string;
  labelWidth?: string;
  labelAlign?: string;
  version?: number;
  active?: boolean;
}

export interface UpdateFormConfigDto {
  name?: string;
  description?: string;
  fields?: FormField[]; // 修改：从 any 改为 FormField[]
  layout?: string;
  labelWidth?: string;
  labelAlign?: string;
  version?: number;
  active?: boolean;
}
