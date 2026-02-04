import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { FormField } from './form-field.entity';

@Entity('dynamic_form_configs')
export class DynamicFormConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => FormField, (field) => field.formConfig, { cascade: true })
  fields: FormField[];

  @Column({ default: 'vertical' })
  layout: string;

  @Column({ name: 'label_width', nullable: true })
  labelWidth: string;

  @Column({ name: 'label_align', default: 'right' })
  labelAlign: string;

  @Column({ default: 1 })
  version: number;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
