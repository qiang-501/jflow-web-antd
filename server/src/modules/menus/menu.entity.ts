import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
} from 'typeorm';
import { Permission } from '../permissions/permission.entity';

export enum MenuType {
  MENU = 'menu',
  BUTTON = 'button',
  LINK = 'link',
}

export enum MenuStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('menus')
export class Menu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 200, nullable: true })
  title: string;

  @Column({ length: 500, nullable: true })
  description: string;

  @Column({ length: 200, nullable: true })
  path: string;

  @Column({ length: 100, nullable: true })
  icon: string;

  @Column({ length: 200, nullable: true })
  component: string;

  @Column({
    type: 'enum',
    enum: MenuType,
    enumName: 'menu_type',
    default: MenuType.MENU,
  })
  type: MenuType;

  @Column({
    type: 'enum',
    enum: MenuStatus,
    enumName: 'menu_status',
    default: MenuStatus.ACTIVE,
  })
  status: MenuStatus;

  @Column({ name: 'parent_id', nullable: true })
  parentId: number;

  @ManyToOne(() => Menu, (menu) => menu.id, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: Menu;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_visible', default: true })
  isVisible: boolean;

  @Column({ name: 'is_cached', default: false })
  isCached: boolean;

  @Column({ name: 'external_link', default: false })
  externalLink: boolean;

  @Column({ type: 'jsonb', nullable: true })
  meta: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToMany(() => Permission, (permission) => permission.menus)
  permissions: Permission[];
}
