import { WorkflowPriority } from './work-flow';

export interface WorkflowTemplate {
  id: number;
  code: string;
  name: string;
  description?: string;
  category?: string;
  formConfigId?: number;
  formConfig?: any;
  defaultPriority: WorkflowPriority;
  defaultAssigneeRoleId?: number;
  defaultAssigneeRole?: any;
  estimatedDuration?: number;
  active: boolean;
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkflowTemplateDto {
  code: string;
  name: string;
  description?: string;
  category?: string;
  formConfigId?: number;
  defaultPriority?: WorkflowPriority;
  defaultAssigneeRoleId?: number;
  estimatedDuration?: number;
  active?: boolean;
  createdBy?: number;
}

export interface UpdateWorkflowTemplateDto {
  name?: string;
  description?: string;
  category?: string;
  formConfigId?: number;
  defaultPriority?: WorkflowPriority;
  defaultAssigneeRoleId?: number;
  estimatedDuration?: number;
  active?: boolean;
}
