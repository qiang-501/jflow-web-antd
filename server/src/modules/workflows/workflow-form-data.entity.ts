import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Workflow } from './workflow.entity';
import { DynamicFormConfig } from '../forms/form-config.entity';
import { User } from '../users/user.entity';

@Entity('workflow_form_data')
export class WorkflowFormData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'workflow_id', unique: true })
  workflowId: number;

  @ManyToOne(() => Workflow)
  @JoinColumn({ name: 'workflow_id' })
  workflow: Workflow;

  @Column({ name: 'form_config_id' })
  formConfigId: number;

  @ManyToOne(() => DynamicFormConfig)
  @JoinColumn({ name: 'form_config_id' })
  formConfig: DynamicFormConfig;

  @Column({ type: 'jsonb' })
  formData: Record<string, any>;

  @Column({ name: 'submitted_by', nullable: true })
  submittedBy: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'submitted_by' })
  submittedByUser: User;

  @CreateDateColumn({ name: 'submitted_at' })
  submittedAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
