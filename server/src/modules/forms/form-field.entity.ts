import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DynamicFormConfig } from './form-config.entity';

@Entity('form_fields')
export class FormField {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'form_config_id' })
  formConfigId: number;

  @ManyToOne(() => DynamicFormConfig, (config) => config.fields, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'form_config_id' })
  formConfig: DynamicFormConfig;

  @Column({ name: 'field_key', length: 100 })
  fieldKey: string;

  @Column({ name: 'field_type', length: 50 })
  fieldType: string;

  @Column({ length: 200 })
  label: string;

  @Column({ type: 'text', nullable: true })
  placeholder: string;

  @Column({ name: 'default_value', type: 'text', nullable: true })
  defaultValue: string;

  @Column({ default: false })
  required: boolean;

  @Column({ default: false })
  disabled: boolean;

  @Column({ default: false })
  readonly: boolean;

  @Column({ name: 'order_index', default: 0 })
  orderIndex: number;

  @Column({ default: 24 })
  span: number;

  @Column({ type: 'json', nullable: true })
  options: any;

  @Column({ type: 'json', nullable: true })
  validators: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
