import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Workflow } from '../workflows/workflow.entity';

@Entity('workflow_history')
export class WorkflowHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'workflow_id' })
  workflowId: number;

  @ManyToOne(() => Workflow)
  @JoinColumn({ name: 'workflow_id' })
  workflow: Workflow;

  @Column({ length: 100 })
  action: string;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ name: 'old_status', length: 50, nullable: true })
  oldStatus: string;

  @Column({ name: 'new_status', length: 50, nullable: true })
  newStatus: string;

  @Column({ name: 'performed_by' })
  performedBy: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
