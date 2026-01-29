export interface WorkFlow {
  id: string;
  d_workflow_id: string;
  name: string;
  description?: string;
  status: WorkflowStatus;
  important: string;
  process_id: string;
  due_date: string;
  created_by: string;
  created_on: string;
  updated_by?: string;
  updated_on?: string;
  assignee?: string;
  priority: WorkflowPriority;
  form_config_id?: string; // 关联的动态表单ID
}

export enum WorkflowStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum WorkflowPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface WorkflowStatusHistory {
  id: string;
  workflow_id: string;
  from_status: WorkflowStatus;
  to_status: WorkflowStatus;
  changed_by: string;
  changed_on: string;
  comment?: string;
}

export interface CreateWorkflowDto {
  name: string;
  description?: string;
  priority: WorkflowPriority;
  assignee?: string;
  due_date: string;
}

export interface UpdateWorkflowDto {
  name?: string;
  description?: string;
  status?: WorkflowStatus;
  priority?: WorkflowPriority;
  assignee?: string;
  due_date?: string;
}
