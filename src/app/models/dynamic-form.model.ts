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
  id: string;
  name: string;
  description?: string;
  fields: DynamicFormField[];
  layout?: 'horizontal' | 'vertical' | 'inline';
  created_by?: string;
  created_on?: string;
  updated_by?: string;
  updated_on?: string;
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
  fields: DynamicFormField[];
  layout?: 'horizontal' | 'vertical' | 'inline';
}

export interface UpdateFormConfigDto {
  name?: string;
  description?: string;
  fields?: DynamicFormField[];
  layout?: 'horizontal' | 'vertical' | 'inline';
}
