import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserStatus } from '../../modules/users/user.entity';
import { Role } from '../../modules/roles/role.entity';
import {
  Permission,
  PermissionType,
} from '../../modules/permissions/permission.entity';
import {
  Workflow,
  WorkflowStatus,
  WorkflowPriority,
} from '../../modules/workflows/workflow.entity';
import { DynamicFormConfig } from '../../modules/forms/form-config.entity';
import { WorkflowHistory } from '../../modules/workflows/workflow-history.entity';
import { Menu, MenuType, MenuStatus } from '../../modules/menus/menu.entity';

async function runSeed() {
  // Create database connection
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || '10.86.131.84',
    port: parseInt(process.env.DB_PORT, 10) || 80,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'jflow',
    entities: [
      User,
      Role,
      Permission,
      Workflow,
      DynamicFormConfig,
      WorkflowHistory,
      Menu,
    ],
    synchronize: false, // We'll handle schema creation manually
    logging: false,
  });

  await dataSource.initialize();
  console.log('Database connected');

  // Create database schema
  console.log('Creating database schema...');

  // Drop existing types if they exist (for clean re-creation)
  await dataSource.query('DROP TYPE IF EXISTS user_status CASCADE');
  await dataSource.query('DROP TYPE IF EXISTS permission_type CASCADE');
  await dataSource.query('DROP TYPE IF EXISTS workflow_status CASCADE');
  await dataSource.query('DROP TYPE IF EXISTS workflow_priority CASCADE');
  await dataSource.query('DROP TYPE IF EXISTS menu_type CASCADE');
  await dataSource.query('DROP TYPE IF EXISTS menu_status CASCADE');

  // Create ENUM types
  console.log('Creating ENUM types...');
  await dataSource.query(`CREATE TYPE user_status AS ENUM ('active', 'inactive', 'locked')`);
  await dataSource.query(`CREATE TYPE permission_type AS ENUM ('menu', 'action', 'api')`);
  await dataSource.query(`CREATE TYPE workflow_status AS ENUM ('draft', 'pending', 'in_progress', 'completed', 'rejected', 'cancelled')`);
  await dataSource.query(`CREATE TYPE workflow_priority AS ENUM ('low', 'medium', 'high', 'urgent')`);
  await dataSource.query(`CREATE TYPE menu_type AS ENUM ('menu', 'button', 'link')`);
  await dataSource.query(`CREATE TYPE menu_status AS ENUM ('active', 'inactive')`);

  // Synchronize schema (create tables based on entities)
  console.log('Synchronizing database schema...');
  await dataSource.synchronize(true); // true = drop existing schema first

  // Create indexes
  console.log('Creating indexes...');
  await dataSource.query('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)');
  await dataSource.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
  await dataSource.query('CREATE INDEX IF NOT EXISTS idx_users_status ON users(status)');

  await dataSource.query('CREATE INDEX IF NOT EXISTS idx_roles_code ON roles(code)');
  await dataSource.query('CREATE INDEX IF NOT EXISTS idx_roles_parent_id ON roles(parent_id)');

  await dataSource.query('CREATE INDEX IF NOT EXISTS idx_permissions_code ON permissions(code)');
  await dataSource.query('CREATE INDEX IF NOT EXISTS idx_permissions_type ON permissions(type)');
  await dataSource.query('CREATE INDEX IF NOT EXISTS idx_permissions_resource ON permissions(resource)');

  await dataSource.query('CREATE INDEX IF NOT EXISTS idx_form_configs_name ON dynamic_form_configs(name)');
  await dataSource.query('CREATE INDEX IF NOT EXISTS idx_form_configs_active ON dynamic_form_configs(active)');

  await dataSource.query('CREATE INDEX IF NOT EXISTS idx_workflows_d_workflow_id ON workflows(d_workflow_id)');
  await dataSource.query('CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status)');
  await dataSource.query('CREATE INDEX IF NOT EXISTS idx_workflows_priority ON workflows(priority)');
  await dataSource.query('CREATE INDEX IF NOT EXISTS idx_workflows_created_by ON workflows(created_by)');
  await dataSource.query('CREATE INDEX IF NOT EXISTS idx_workflows_assigned_to ON workflows(assigned_to)');

  await dataSource.query('CREATE INDEX IF NOT EXISTS idx_workflow_history_workflow_id ON workflow_history(workflow_id)');
  await dataSource.query('CREATE INDEX IF NOT EXISTS idx_workflow_history_created_at ON workflow_history(created_at)');

  await dataSource.query('CREATE INDEX IF NOT EXISTS idx_menus_name ON menus(name)');
  await dataSource.query('CREATE INDEX IF NOT EXISTS idx_menus_parent_id ON menus(parent_id)');
  await dataSource.query('CREATE INDEX IF NOT EXISTS idx_menus_type ON menus(type)');
  await dataSource.query('CREATE INDEX IF NOT EXISTS idx_menus_status ON menus(status)');
  await dataSource.query('CREATE INDEX IF NOT EXISTS idx_menus_sort_order ON menus(sort_order)');

  // Create function and triggers for updated_at
  console.log('Creating triggers...');
  await dataSource.query(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ language 'plpgsql'
  `);

  await dataSource.query('DROP TRIGGER IF EXISTS update_users_updated_at ON users');
  await dataSource.query('CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()');

  await dataSource.query('DROP TRIGGER IF EXISTS update_roles_updated_at ON roles');
  await dataSource.query('CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()');

  await dataSource.query('DROP TRIGGER IF EXISTS update_permissions_updated_at ON permissions');
  await dataSource.query('CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()');

  await dataSource.query('DROP TRIGGER IF EXISTS update_form_configs_updated_at ON dynamic_form_configs');
  await dataSource.query('CREATE TRIGGER update_form_configs_updated_at BEFORE UPDATE ON dynamic_form_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()');

  await dataSource.query('DROP TRIGGER IF EXISTS update_workflows_updated_at ON workflows');
  await dataSource.query('CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()');

  await dataSource.query('DROP TRIGGER IF EXISTS update_menus_updated_at ON menus');
  await dataSource.query('CREATE TRIGGER update_menus_updated_at BEFORE UPDATE ON menus FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()');

  console.log('Database schema created successfully!');

  const permissionRepo = dataSource.getRepository(Permission);
  const roleRepo = dataSource.getRepository(Role);
  const userRepo = dataSource.getRepository(User);
  const formRepo = dataSource.getRepository(DynamicFormConfig);
  const workflowRepo = dataSource.getRepository(Workflow);
  const menuRepo = dataSource.getRepository(Menu);

  // Seed Permissions
  console.log('Seeding permissions...');
  const permissions = await permissionRepo.save([
    {
      code: 'user:create',
      name: '用户创建',
      type: PermissionType.ACTION,
      resource: 'users',
      action: 'create',
    },
    {
      code: 'user:edit',
      name: '用户编辑',
      type: PermissionType.ACTION,
      resource: 'users',
      action: 'edit',
    },
    {
      code: 'user:delete',
      name: '用户删除',
      type: PermissionType.ACTION,
      resource: 'users',
      action: 'delete',
    },
    {
      code: 'user:view',
      name: '用户查看',
      type: PermissionType.ACTION,
      resource: 'users',
      action: 'view',
    },
    {
      code: 'role:manage',
      name: '角色管理',
      type: PermissionType.ACTION,
      resource: 'roles',
      action: 'manage',
    },
    {
      code: 'permission:manage',
      name: '权限管理',
      type: PermissionType.ACTION,
      resource: 'permissions',
      action: 'manage',
    },
    {
      code: 'workflow:create',
      name: '工作流创建',
      type: PermissionType.ACTION,
      resource: 'workflows',
      action: 'create',
    },
    {
      code: 'workflow:edit',
      name: '工作流编辑',
      type: PermissionType.ACTION,
      resource: 'workflows',
      action: 'edit',
    },
    {
      code: 'workflow:delete',
      name: '工作流删除',
      type: PermissionType.ACTION,
      resource: 'workflows',
      action: 'delete',
    },
    {
      code: 'workflow:view',
      name: '工作流查看',
      type: PermissionType.ACTION,
      resource: 'workflows',
      action: 'view',
    },
    {
      code: 'form:manage',
      name: '表单管理',
      type: PermissionType.ACTION,
      resource: 'forms',
      action: 'manage',
    },
    {
      code: 'menu:read',
      name: '菜单查看',
      type: PermissionType.ACTION,
      resource: 'menus',
      action: 'read',
    },
    {
      code: 'menu:create',
      name: '菜单创建',
      type: PermissionType.ACTION,
      resource: 'menus',
      action: 'create',
    },
    {
      code: 'menu:update',
      name: '菜单更新',
      type: PermissionType.ACTION,
      resource: 'menus',
      action: 'update',
    },
    {
      code: 'menu:delete',
      name: '菜单删除',
      type: PermissionType.ACTION,
      resource: 'menus',
      action: 'delete',
    },
  ]);

  // Seed Roles
  console.log('Seeding roles...');
  const adminRole = await roleRepo.save({
    name: '超级管理员',
    code: 'super_admin',
    description: '拥有所有权限',
    level: 1,
    permissions,
  });

  const userRole = await roleRepo.save({
    name: '普通用户',
    code: 'user',
    description: '基础权限',
    level: 2,
    parentId: adminRole.id,
    permissions: permissions.filter((p) =>
      ['user:view', 'workflow:view', 'workflow:create'].includes(p.code),
    ),
  });

  // Seed Users
  console.log('Seeding users...');
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const adminUser = await userRepo.save({
    username: 'admin',
    password: hashedPassword,
    email: 'admin@example.com',
    fullName: '系统管理员',
    status: UserStatus.ACTIVE,
  });

  // Assign admin role to admin user
  await dataSource
    .createQueryBuilder()
    .relation(User, 'roles')
    .of(adminUser)
    .add(adminRole);

  const normalUser = await userRepo.save({
    username: 'user1',
    password: await bcrypt.hash('user123', 10),
    email: 'user1@example.com',
    fullName: '普通用户',
    status: UserStatus.ACTIVE,
  });

  await dataSource
    .createQueryBuilder()
    .relation(User, 'roles')
    .of(normalUser)
    .add(userRole);

  // Seed Form Configs
  console.log('Seeding form configs...');
  const formConfig1 = await formRepo.save({
    name: '请假申请表',
    description: '员工请假申请表单',
    layout: 'vertical',
    labelAlign: 'right',
    version: 1,
    active: true,
    fields: [
      {
        name: 'applicant',
        label: '申请人',
        type: 'text',
        required: true,
        order: 1,
      },
      {
        name: 'leaveType',
        label: '请假类型',
        type: 'select',
        required: true,
        order: 2,
        options: [
          { label: '病假', value: 'sick' },
          { label: '事假', value: 'personal' },
          { label: '年假', value: 'annual' },
        ],
      },
      {
        name: 'startDate',
        label: '开始日期',
        type: 'date',
        required: true,
        order: 3,
      },
      {
        name: 'endDate',
        label: '结束日期',
        type: 'date',
        required: true,
        order: 4,
      },
      {
        name: 'reason',
        label: '请假原因',
        type: 'textarea',
        required: true,
        order: 5,
      },
    ],
  });

  const formConfig2 = await formRepo.save({
    name: '采购申请表',
    description: '物品采购申请表单',
    layout: 'vertical',
    labelAlign: 'right',
    version: 1,
    active: true,
    fields: [
      {
        name: 'itemName',
        label: '物品名称',
        type: 'text',
        required: true,
        order: 1,
      },
      {
        name: 'quantity',
        label: '数量',
        type: 'number',
        required: true,
        order: 2,
      },
      {
        name: 'estimatedPrice',
        label: '预估价格',
        type: 'number',
        required: true,
        order: 3,
      },
      {
        name: 'urgency',
        label: '紧急程度',
        type: 'radio',
        required: true,
        order: 4,
        options: [
          { label: '一般', value: 'normal' },
          { label: '紧急', value: 'urgent' },
          { label: '特急', value: 'critical' },
        ],
      },
      {
        name: 'description',
        label: '详细说明',
        type: 'textarea',
        required: false,
        order: 5,
      },
    ],
  });

  // Seed Menus
  console.log('Seeding menus...');
  const dashboardMenu = await menuRepo.save({
    name: 'dashboard',
    title: '仪表盘',
    path: '/dashboard',
    icon: 'dashboard',
    component: 'DashboardComponent',
    type: MenuType.MENU,
    status: MenuStatus.ACTIVE,
    sortOrder: 1,
    isVisible: true,
  });

  const systemMenu = await menuRepo.save({
    name: 'system',
    title: '系统管理',
    icon: 'setting',
    type: MenuType.MENU,
    status: MenuStatus.ACTIVE,
    sortOrder: 2,
    isVisible: true,
  });

  await menuRepo.save([
    {
      name: 'user-management',
      title: '用户管理',
      path: '/system/users',
      icon: 'user',
      component: 'UserManagementComponent',
      type: MenuType.MENU,
      status: MenuStatus.ACTIVE,
      parentId: systemMenu.id,
      sortOrder: 1,
      isVisible: true,
    },
    {
      name: 'role-management',
      title: '角色管理',
      path: '/system/roles',
      icon: 'team',
      component: 'RoleManagementComponent',
      type: MenuType.MENU,
      status: MenuStatus.ACTIVE,
      parentId: systemMenu.id,
      sortOrder: 2,
      isVisible: true,
    },
    {
      name: 'permission-management',
      title: '权限管理',
      path: '/system/permissions',
      icon: 'lock',
      component: 'PermissionManagementComponent',
      type: MenuType.MENU,
      status: MenuStatus.ACTIVE,
      parentId: systemMenu.id,
      sortOrder: 3,
      isVisible: true,
    },
    {
      name: 'menu-management',
      title: '菜单管理',
      path: '/system/menus',
      icon: 'menu',
      component: 'MenuManagementComponent',
      type: MenuType.MENU,
      status: MenuStatus.ACTIVE,
      parentId: systemMenu.id,
      sortOrder: 4,
      isVisible: true,
    },
  ]);

  const workflowMenu = await menuRepo.save({
    name: 'workflow',
    title: '工作流',
    path: '/workflow',
    icon: 'apartment',
    component: 'WorkflowComponent',
    type: MenuType.MENU,
    status: MenuStatus.ACTIVE,
    sortOrder: 3,
    isVisible: true,
  });

  // Seed Workflows
  console.log('Seeding workflows...');
  await workflowRepo.save([
    {
      dWorkflowId: 'WF-2024-001',
      name: '张三请假申请',
      description: '年假3天',
      status: WorkflowStatus.PENDING,
      priority: WorkflowPriority.MEDIUM,
      formConfigId: formConfig1.id,
      createdBy: adminUser.id,
      assignedTo: adminUser.id,
      dueDate: new Date('2024-12-31'),
    },
    {
      dWorkflowId: 'WF-2024-002',
      name: '办公用品采购',
      description: '采购笔记本电脑',
      status: WorkflowStatus.IN_PROGRESS,
      priority: WorkflowPriority.HIGH,
      formConfigId: formConfig2.id,
      createdBy: adminUser.id,
      assignedTo: normalUser.id,
      dueDate: new Date('2024-12-25'),
    },
    {
      dWorkflowId: 'WF-2024-003',
      name: '李四病假申请',
      description: '病假2天',
      status: WorkflowStatus.COMPLETED,
      priority: WorkflowPriority.LOW,
      formConfigId: formConfig1.id,
      createdBy: normalUser.id,
      assignedTo: adminUser.id,
    },
  ]);

  console.log('Seeding completed successfully!');
  console.log('\nDefault credentials:');
  console.log('Admin - username: admin, password: admin123');
  console.log('User - username: user1, password: user123');

  await dataSource.destroy();
}

runSeed()
  .then(() => {
    console.log('\n✅ Database seeded successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  });
