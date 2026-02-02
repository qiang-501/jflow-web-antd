export interface WorkFlow {
  id: number;
  dWorkflowId: string;
  name: string;
  description?: string;
  status: WorkflowStatus;
  priority: WorkflowPriority;
  formConfigId?: number;
  createdBy?: number;
  assignedTo?: number;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
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
  dWorkflowId: string;
  name: string;
  description?: string;
  status?: WorkflowStatus;
  priority?: WorkflowPriority;
  formConfigId?: number;
  createdBy?: number;
  assignedTo?: number;
  dueDate?: string;
}

export interface UpdateWorkflowDto {
  name?: string;
  description?: string;
  status?: WorkflowStatus;
  priority?: WorkflowPriority;
  formConfigId?: number;
  assignedTo?: number;
  dueDate?: string;
}
