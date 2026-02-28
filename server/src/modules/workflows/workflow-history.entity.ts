import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Workflow } from '../workflows/workflow.entity';

export enum ChangeType {
  STATUS_CHANGE = 'status_change',
  FORM_DATA_CREATE = 'form_data_create',
  FORM_DATA_UPDATE = 'form_data_update',
  WORKFLOW_UPDATE = 'workflow_update',
  WORKFLOW_CREATE = 'workflow_create',
  WORKFLOW_DELETE = 'workflow_delete',
}

@Entity('workflow_history')
export class WorkflowHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'workflow_id' })
  workflowId: number;

  @ManyToOne(() => Workflow)
  @JoinColumn({ name: 'workflow_id' })
  workflow: Workflow;

  @Column({
    type: 'enum',
    enum: ChangeType,
    default: ChangeType.WORKFLOW_UPDATE,
  })
  @Column({ name: 'change_type' })
  ChangeType: ChangeType;

  @Column({ length: 100 })
  action: string;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ name: 'old_status', length: 50, nullable: true })
  oldStatus: string;

  @Column({ name: 'new_status', length: 50, nullable: true })
  newStatus: string;

  // 存储字段级别的变更详情
  @Column({ name: 'field_changes', type: 'jsonb', nullable: true })
  fieldChanges: {
    field: string;
    oldValue: any;
    newValue: any;
    fieldLabel?: string;
  }[];

  // 存储完整的旧数据（用于表单数据）
  @Column({ name: 'old_data', type: 'jsonb', nullable: true })
  oldData: Record<string, any>;

  // 存储完整的新数据（用于表单数据）
  @Column({ name: 'new_data', type: 'jsonb', nullable: true })
  newData: Record<string, any>;

  @Column({ name: 'performed_by' })
  performedBy: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
