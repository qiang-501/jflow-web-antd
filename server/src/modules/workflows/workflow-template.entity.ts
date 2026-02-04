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
import { Role } from '../roles/role.entity';
import { WorkflowPriority } from './workflow.enums';

@Entity('workflow_templates')
export class WorkflowTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  code: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 100, nullable: true })
  category: string;

  @Column({ name: 'form_config_id', nullable: true })
  formConfigId: number;

  @ManyToOne(() => DynamicFormConfig, { nullable: true })
  @JoinColumn({ name: 'form_config_id' })
  formConfig: DynamicFormConfig;

  @Column({
    type: 'enum',
    enum: WorkflowPriority,
    enumName: 'workflow_priority',
    name: 'default_priority',
    default: WorkflowPriority.MEDIUM,
  })
  defaultPriority: WorkflowPriority;

  @Column({ name: 'default_assignee_role_id', nullable: true })
  defaultAssigneeRoleId: number;

  @ManyToOne(() => Role, { nullable: true })
  @JoinColumn({ name: 'default_assignee_role_id' })
  defaultAssigneeRole: Role;

  @Column({ name: 'estimated_duration', nullable: true })
  estimatedDuration: number;

  @Column({ default: true })
  active: boolean;

  @Column({ name: 'created_by', nullable: true })
  createdBy: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
