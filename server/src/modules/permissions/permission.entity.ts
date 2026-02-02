import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Role } from '../roles/role.entity';
import { Menu } from '../menus/menu.entity';

export enum PermissionType {
  MENU = 'menu',
  ACTION = 'action',
  API = 'api',
}

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  code: string;

  @Column({ length: 200 })
  name: string;

  @Column({
    type: 'enum',
    enum: PermissionType,
    enumName: 'permission_type',
    default: PermissionType.ACTION,
  })
  type: PermissionType;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 200, nullable: true })
  resource: string;

  @Column({ length: 50, nullable: true })
  action: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];

  @ManyToMany(() => Menu, (menu) => menu.permissions)
  @JoinTable({
    name: 'menu_permissions',
    joinColumn: { name: 'permission_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'menu_id', referencedColumnName: 'id' },
  })
  menus: Menu[];
}
