import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DynamicFormConfig } from '../forms/form-config.entity';

export enum WorkflowStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export enum WorkflowPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('workflows')
export class Workflow {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'd_workflow_id', unique: true, length: 50 })
  dWorkflowId: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: WorkflowStatus,
    enumName: 'workflow_status',
    default: WorkflowStatus.DRAFT,
  })
  status: WorkflowStatus;

  @Column({
    type: 'enum',
    enum: WorkflowPriority,
    enumName: 'workflow_priority',
    default: WorkflowPriority.MEDIUM,
  })
  priority: WorkflowPriority;

  @Column({ name: 'form_config_id', nullable: true })
  formConfigId: number;

  @ManyToOne(() => DynamicFormConfig, { nullable: true })
  @JoinColumn({ name: 'form_config_id' })
  formConfig: DynamicFormConfig;

  @Column({ name: 'created_by', nullable: true })
  createdBy: number;

  @Column({ name: 'assigned_to', nullable: true })
  assignedTo: number;

  @Column({ name: 'due_date', type: 'timestamp', nullable: true })
  dueDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
