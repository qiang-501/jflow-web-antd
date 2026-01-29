import {
  HttpEvent,
  HttpRequest,
  HttpResponse,
  HttpHandlerFn,
  HttpEventType,
} from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { delay, mergeMap, materialize, dematerialize } from 'rxjs/operators';
import * as MENU from '../../../assets/data/menuResult.json';
import * as MENUACTION from '../../../assets/data/menuActions.json';
import { User, UserStatus } from '../../models/user.model';
import { Role } from '../../models/role.model';
import {
  Permission,
  MenuPermission,
  PermissionType,
} from '../../models/permission.model';
import {
  WorkFlow,
  WorkflowStatus,
  WorkflowPriority,
  WorkflowStatusHistory,
} from '../../models/work-flow';
import { DynamicFormConfig, FieldType } from '../../models/dynamic-form.model';

const menuList: any = (MENU as any).default;
const menuActionList: any = (MENUACTION as any).default;

// Mock数据
let mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    fullName: '系统管理员',
    status: UserStatus.Active,
    roleIds: ['1'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    lastLoginAt: new Date(),
  },
  {
    id: '2',
    username: 'user1',
    email: 'user1@example.com',
    fullName: '普通用户',
    status: UserStatus.Active,
    roleIds: ['2'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
];

let mockRoles: Role[] = [
  {
    id: '1',
    name: '超级管理员',
    code: 'super_admin',
    description: '拥有所有权限',
    permissionIds: ['1', '2', '3', '4', '5', '6'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    level: 1,
  },
  {
    id: '2',
    name: '普通用户',
    code: 'user',
    description: '基础权限',
    parentId: '1',
    permissionIds: ['4', '5'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    level: 2,
  },
];

let mockPermissions: Permission[] = [
  {
    id: '1',
    name: '用户创建',
    code: 'user:create',
    type: PermissionType.Action,
    menuId: 'users',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: '用户编辑',
    code: 'user:edit',
    type: PermissionType.Action,
    menuId: 'users',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '3',
    name: '用户删除',
    code: 'user:delete',
    type: PermissionType.Action,
    menuId: 'users',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '4',
    name: '角色查看',
    code: 'role:view',
    type: PermissionType.Menu,
    menuId: 'roles',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '5',
    name: '角色管理',
    code: 'role:manage',
    type: PermissionType.Action,
    menuId: 'roles',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '6',
    name: '权限管理',
    code: 'permission:manage',
    type: PermissionType.Menu,
    menuId: 'permissions',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

let mockMenuPermissions: MenuPermission[] = [
  {
    id: 'mp1',
    menuId: 'users',
    menuName: '用户管理',
    path: '/main/users',
    icon: 'user',
    orderNum: 1,
    visible: true,
    actions: [
      { id: 'a1', name: '新增', code: 'add', menuId: 'users' },
      { id: 'a2', name: '编辑', code: 'edit', menuId: 'users' },
      { id: 'a3', name: '删除', code: 'delete', menuId: 'users' },
      { id: 'a4', name: '重置密码', code: 'reset_password', menuId: 'users' },
    ],
  },
  {
    id: 'mp2',
    menuId: 'roles',
    menuName: '角色管理',
    path: '/main/roles',
    icon: 'team',
    orderNum: 2,
    visible: true,
    actions: [
      { id: 'a5', name: '新增', code: 'add', menuId: 'roles' },
      { id: 'a6', name: '编辑', code: 'edit', menuId: 'roles' },
      { id: 'a7', name: '删除', code: 'delete', menuId: 'roles' },
      {
        id: 'a8',
        name: '分配权限',
        code: 'assign_permissions',
        menuId: 'roles',
      },
    ],
  },
  {
    id: 'mp3',
    menuId: 'permissions',
    menuName: '权限管理',
    path: '/main/permissions',
    icon: 'safety',
    orderNum: 3,
    visible: true,
    actions: [
      { id: 'a9', name: '新增操作', code: 'add_action', menuId: 'permissions' },
      {
        id: 'a10',
        name: '编辑操作',
        code: 'edit_action',
        menuId: 'permissions',
      },
      {
        id: 'a11',
        name: '删除操作',
        code: 'delete_action',
        menuId: 'permissions',
      },
    ],
  },
];

let mockWorkflows: WorkFlow[] = [
  {
    id: '1',
    d_workflow_id: 'WF-001',
    name: '系统升级申请',
    description: '升级核心系统到最新版本',
    status: WorkflowStatus.IN_PROGRESS,
    important: 'yes',
    process_id: 'P001',
    due_date: '2026-02-15',
    created_by: 'admin',
    created_on: '2026-01-15 10:00:00',
    assignee: 'user1',
    priority: WorkflowPriority.HIGH,
    form_config_id: 'form-1', // 关联动态表单
  },
  {
    id: '2',
    d_workflow_id: 'WF-002',
    name: '新功能开发',
    description: '开发新的用户管理功能',
    status: WorkflowStatus.REVIEW,
    important: 'no',
    process_id: 'P002',
    due_date: '2026-02-20',
    created_by: 'manager',
    created_on: '2026-01-20 14:30:00',
    assignee: 'developer1',
    priority: WorkflowPriority.MEDIUM,
  },
  {
    id: '3',
    d_workflow_id: 'WF-003',
    name: 'Bug修复',
    description: '修复登录页面的显示问题',
    status: WorkflowStatus.COMPLETED,
    important: 'no',
    process_id: 'P003',
    due_date: '2026-01-25',
    created_by: 'developer1',
    created_on: '2026-01-18 09:00:00',
    assignee: 'developer2',
    priority: WorkflowPriority.LOW,
  },
];

let mockWorkflowHistory: WorkflowStatusHistory[] = [
  {
    id: '1',
    workflow_id: '1',
    from_status: WorkflowStatus.DRAFT,
    to_status: WorkflowStatus.PENDING,
    changed_by: 'admin',
    changed_on: '2026-01-15 10:30:00',
    comment: '提交审批',
  },
  {
    id: '2',
    workflow_id: '1',
    from_status: WorkflowStatus.PENDING,
    to_status: WorkflowStatus.IN_PROGRESS,
    changed_by: 'manager',
    changed_on: '2026-01-16 09:00:00',
    comment: '开始处理',
  },
  {
    id: '3',
    workflow_id: '2',
    from_status: WorkflowStatus.DRAFT,
    to_status: WorkflowStatus.IN_PROGRESS,
    changed_by: 'manager',
    changed_on: '2026-01-20 15:00:00',
    comment: '直接开始开发',
  },
  {
    id: '4',
    workflow_id: '2',
    from_status: WorkflowStatus.IN_PROGRESS,
    to_status: WorkflowStatus.REVIEW,
    changed_by: 'developer1',
    changed_on: '2026-01-28 16:00:00',
    comment: '提交代码审查',
  },
];

// 动态表单配置数据
let mockFormConfigs: DynamicFormConfig[] = [
  {
    id: 'form-1',
    name: '系统升级申请表',
    description: '用于系统升级申请的动态表单',
    layout: 'vertical',
    fields: [
      {
        id: 'field-1',
        name: 'system_name',
        label: '系统名称',
        type: FieldType.TEXT,
        placeholder: '请输入系统名称',
        order: 1,
        width: 24,
        validation: {
          required: true,
          minLength: 2,
          maxLength: 50,
        },
      },
      {
        id: 'field-2',
        name: 'upgrade_reason',
        label: '升级原因',
        type: FieldType.TEXTAREA,
        placeholder: '请详细说明升级原因',
        order: 2,
        width: 24,
        validation: {
          required: true,
          minLength: 10,
        },
      },
      {
        id: 'field-3',
        name: 'upgrade_date',
        label: '计划升级日期',
        type: FieldType.DATE,
        order: 3,
        width: 12,
        validation: {
          required: true,
        },
      },
      {
        id: 'field-4',
        name: 'risk_level',
        label: '风险等级',
        type: FieldType.SELECT,
        order: 4,
        width: 12,
        validation: {
          required: true,
        },
        options: [
          { label: '低', value: 'low' },
          { label: '中', value: 'medium' },
          { label: '高', value: 'high' },
        ],
      },
      {
        id: 'field-5',
        name: 'backup_required',
        label: '是否需要备份',
        type: FieldType.SWITCH,
        order: 5,
        width: 12,
        defaultValue: true,
      },
      {
        id: 'field-6',
        name: 'estimated_time',
        label: '预计耗时（小时）',
        type: FieldType.NUMBER,
        order: 6,
        width: 12,
        validation: {
          required: true,
          min: 1,
          max: 72,
        },
      },
    ],
    created_by: 'admin',
    created_on: '2026-01-10 10:00:00',
  },
];

export function FakeBackendInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const { url, method, body } = req;

  return of(null)
    .pipe(mergeMap(handleRoute))
    .pipe(materialize())
    .pipe(delay(500))
    .pipe(dematerialize());

  function handleRoute() {
    // 菜单API
    if (url.endsWith('api/menu') && method === 'GET') {
      return of(new HttpResponse({ status: 200, body: menuList }));
    }

    if (url.endsWith('api/menu/actions') && method === 'GET') {
      return of(new HttpResponse({ status: 200, body: menuActionList }));
    }

    // 用户管理API
    if (url.endsWith('api/users') && method === 'GET') {
      return of(new HttpResponse({ status: 200, body: mockUsers }));
    }

    if (url.match(/api\/users\/\w+$/) && method === 'GET') {
      const id = url.split('/').pop();
      const user = mockUsers.find((u) => u.id === id);
      return of(new HttpResponse({ status: 200, body: user }));
    }

    if (url.endsWith('api/users') && method === 'POST') {
      const newUser = body as any;
      const user: User = {
        id: String(mockUsers.length + 1),
        ...newUser,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockUsers.push(user);
      return of(new HttpResponse({ status: 201, body: user }));
    }

    if (url.match(/api\/users\/\w+$/) && method === 'PUT') {
      const id = url.split('/').pop();
      const updateData = body as any;
      const index = mockUsers.findIndex((u) => u.id === id);
      if (index !== -1) {
        mockUsers[index] = {
          ...mockUsers[index],
          ...updateData,
          updatedAt: new Date(),
        };
        return of(new HttpResponse({ status: 200, body: mockUsers[index] }));
      }
      return of(new HttpResponse({ status: 404 }));
    }

    if (url.match(/api\/users\/\w+$/) && method === 'DELETE') {
      const id = url.split('/').pop();
      mockUsers = mockUsers.filter((u) => u.id !== id);
      return of(new HttpResponse({ status: 204 }));
    }

    // 角色管理API
    if (url.endsWith('api/roles') && method === 'GET') {
      return of(new HttpResponse({ status: 200, body: mockRoles }));
    }

    if (url.endsWith('api/roles/tree') && method === 'GET') {
      const buildTree = (parentId?: string): any[] => {
        return mockRoles
          .filter((r) => r.parentId === parentId)
          .map((r) => ({
            ...r,
            children: buildTree(r.id),
          }));
      };
      const tree = buildTree();
      return of(new HttpResponse({ status: 200, body: tree }));
    }

    if (url.match(/api\/roles\/\w+$/) && method === 'GET') {
      const id = url.split('/').pop();
      const role = mockRoles.find((r) => r.id === id);
      return of(new HttpResponse({ status: 200, body: role }));
    }

    if (url.endsWith('api/roles') && method === 'POST') {
      const newRole = body as any;
      const role: Role = {
        id: String(mockRoles.length + 1),
        ...newRole,
        createdAt: new Date(),
        updatedAt: new Date(),
        level: newRole.parentId ? 2 : 1,
      };
      mockRoles.push(role);
      return of(new HttpResponse({ status: 201, body: role }));
    }

    if (url.match(/api\/roles\/\w+$/) && method === 'PUT') {
      const id = url.split('/').pop();
      const updateData = body as any;
      const index = mockRoles.findIndex((r) => r.id === id);
      if (index !== -1) {
        mockRoles[index] = {
          ...mockRoles[index],
          ...updateData,
          updatedAt: new Date(),
        };
        return of(new HttpResponse({ status: 200, body: mockRoles[index] }));
      }
      return of(new HttpResponse({ status: 404 }));
    }

    if (url.match(/api\/roles\/\w+$/) && method === 'DELETE') {
      const id = url.split('/').pop();
      mockRoles = mockRoles.filter((r) => r.id !== id);
      return of(new HttpResponse({ status: 204 }));
    }

    if (url.match(/api\/roles\/\w+\/permissions$/) && method === 'POST') {
      const id = url.split('/')[url.split('/').length - 2];
      const { permissionIds } = body as any;
      const index = mockRoles.findIndex((r) => r.id === id);
      if (index !== -1) {
        mockRoles[index].permissionIds = permissionIds;
        mockRoles[index].updatedAt = new Date();
        return of(new HttpResponse({ status: 200, body: mockRoles[index] }));
      }
      return of(new HttpResponse({ status: 404 }));
    }

    // 权限管理API
    if (url.endsWith('api/permissions') && method === 'GET') {
      return of(new HttpResponse({ status: 200, body: mockPermissions }));
    }

    if (url.endsWith('api/permissions/menus') && method === 'GET') {
      return of(new HttpResponse({ status: 200, body: mockMenuPermissions }));
    }

    if (url.match(/api\/permissions\/\w+$/) && method === 'GET') {
      const id = url.split('/').pop();
      const permission = mockPermissions.find((p) => p.id === id);
      return of(new HttpResponse({ status: 200, body: permission }));
    }

    if (url.endsWith('api/permissions') && method === 'POST') {
      const newPermission = body as any;
      const permission: Permission = {
        id: String(mockPermissions.length + 1),
        ...newPermission,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPermissions.push(permission);
      return of(new HttpResponse({ status: 201, body: permission }));
    }

    if (
      url.match(/api\/permissions\/menus\/\w+\/actions$/) &&
      method === 'POST'
    ) {
      const menuId = url.split('/')[url.split('/').length - 2];
      const action = body as any;
      const menuPermission = mockMenuPermissions.find(
        (mp) => mp.menuId === menuId,
      );
      if (menuPermission) {
        const newAction = {
          id: 'a' + (menuPermission.actions.length + 1),
          ...action,
          menuId,
        };
        menuPermission.actions.push(newAction);
        return of(new HttpResponse({ status: 201, body: newAction }));
      }
      return of(new HttpResponse({ status: 404 }));
    }

    if (
      url.match(/api\/permissions\/menus\/\w+\/actions\/\w+$/) &&
      method === 'DELETE'
    ) {
      const parts = url.split('/');
      const menuId = parts[parts.length - 3];
      const actionId = parts[parts.length - 1];
      const menuPermission = mockMenuPermissions.find(
        (mp) => mp.menuId === menuId,
      );
      if (menuPermission) {
        menuPermission.actions = menuPermission.actions.filter(
          (a) => a.id !== actionId,
        );
        return of(new HttpResponse({ status: 204 }));
      }
      return of(new HttpResponse({ status: 404 }));
    }

    // 工作流管理API
    if (url.endsWith('api/workflows') && method === 'GET') {
      return of(
        new HttpResponse({
          status: 200,
          body: { data: mockWorkflows, total: mockWorkflows.length },
        }),
      );
    }

    if (url.match(/api\/workflows\/\w+$/) && method === 'GET') {
      const id = url.split('/').pop();
      const workflow = mockWorkflows.find((w) => w.id === id);
      return of(new HttpResponse({ status: 200, body: workflow }));
    }

    if (url.endsWith('api/workflows') && method === 'POST') {
      const newWorkflow = body as any;
      const workflow: WorkFlow = {
        id: String(mockWorkflows.length + 1),
        d_workflow_id: `WF-${String(mockWorkflows.length + 1).padStart(3, '0')}`,
        ...newWorkflow,
        status: WorkflowStatus.DRAFT,
        important: 'no',
        process_id: `P${String(mockWorkflows.length + 1).padStart(3, '0')}`,
        created_by: 'current_user',
        created_on: new Date().toISOString(),
      };
      mockWorkflows.push(workflow);
      return of(new HttpResponse({ status: 201, body: workflow }));
    }

    if (url.match(/api\/workflows\/\w+$/) && method === 'PUT') {
      const id = url.split('/').pop();
      const updateData = body as any;
      const index = mockWorkflows.findIndex((w) => w.id === id);
      if (index !== -1) {
        mockWorkflows[index] = {
          ...mockWorkflows[index],
          ...updateData,
          updated_on: new Date().toISOString(),
          updated_by: 'current_user',
        };
        return of(
          new HttpResponse({ status: 200, body: mockWorkflows[index] }),
        );
      }
      return of(new HttpResponse({ status: 404 }));
    }

    if (url.match(/api\/workflows\/\w+$/) && method === 'DELETE') {
      const id = url.split('/').pop();
      mockWorkflows = mockWorkflows.filter((w) => w.id !== id);
      return of(new HttpResponse({ status: 204 }));
    }

    if (url.match(/api\/workflows\/\w+\/status$/) && method === 'PATCH') {
      const id = url.split('/')[url.split('/').length - 2];
      const { status, comment } = body as any;
      const index = mockWorkflows.findIndex((w) => w.id === id);
      if (index !== -1) {
        const oldStatus = mockWorkflows[index].status;
        mockWorkflows[index].status = status;
        mockWorkflows[index].updated_on = new Date().toISOString();
        mockWorkflows[index].updated_by = 'current_user';

        // 添加历史记录
        const history: WorkflowStatusHistory = {
          id: String(mockWorkflowHistory.length + 1),
          workflow_id: id!,
          from_status: oldStatus,
          to_status: status,
          changed_by: 'current_user',
          changed_on: new Date().toISOString(),
          comment: comment || '',
        };
        mockWorkflowHistory.push(history);

        return of(
          new HttpResponse({ status: 200, body: mockWorkflows[index] }),
        );
      }
      return of(new HttpResponse({ status: 404 }));
    }

    if (url.match(/api\/workflows\/\w+\/history$/) && method === 'GET') {
      const id = url.split('/')[url.split('/').length - 2];
      const history = mockWorkflowHistory.filter((h) => h.workflow_id === id);
      return of(new HttpResponse({ status: 200, body: history }));
    }

    if (url.match(/api\/workflows\/\w+\/assign$/) && method === 'PATCH') {
      const id = url.split('/')[url.split('/').length - 2];
      const { assignee } = body as any;
      const index = mockWorkflows.findIndex((w) => w.id === id);
      if (index !== -1) {
        mockWorkflows[index].assignee = assignee;
        mockWorkflows[index].updated_on = new Date().toISOString();
        mockWorkflows[index].updated_by = 'current_user';
        return of(
          new HttpResponse({ status: 200, body: mockWorkflows[index] }),
        );
      }
      return of(new HttpResponse({ status: 404 }));
    }

    if (url.endsWith('api/workflows/my-workflows') && method === 'GET') {
      const myWorkflows = mockWorkflows.filter(
        (w) => w.assignee === 'current_user',
      );
      return of(
        new HttpResponse({
          status: 200,
          body: { data: myWorkflows, total: myWorkflows.length },
        }),
      );
    }

    if (url.endsWith('api/workflows/pending') && method === 'GET') {
      const pending = mockWorkflows.filter(
        (w) => w.status === WorkflowStatus.PENDING,
      );
      return of(new HttpResponse({ status: 200, body: pending }));
    }

    // 动态表单API
    if (url.endsWith('api/dynamic-forms') && method === 'GET') {
      return of(new HttpResponse({ status: 200, body: mockFormConfigs }));
    }

    if (url.match(/api\/dynamic-forms\/[\w-]+$/) && method === 'GET') {
      const id = url.split('/').pop();
      const formConfig = mockFormConfigs.find((f) => f.id === id);
      if (formConfig) {
        return of(new HttpResponse({ status: 200, body: formConfig }));
      }
      return of(
        new HttpResponse({
          status: 404,
          body: { error: 'Form config not found' },
        }),
      );
    }

    if (url.endsWith('api/dynamic-forms') && method === 'POST') {
      const newConfig = body as any;
      const formConfig: DynamicFormConfig = {
        id: `form-${mockFormConfigs.length + 1}`,
        ...newConfig,
        created_by: 'admin',
        created_on: new Date().toISOString(),
      };
      mockFormConfigs.push(formConfig);
      return of(new HttpResponse({ status: 201, body: formConfig }));
    }

    if (url.match(/api\/dynamic-forms\/[\w-]+$/) && method === 'PUT') {
      const id = url.split('/').pop();
      const index = mockFormConfigs.findIndex((f) => f.id === id);
      if (index !== -1) {
        mockFormConfigs[index] = {
          ...mockFormConfigs[index],
          ...(body as any),
          updated_by: 'admin',
          updated_on: new Date().toISOString(),
        };
        return of(
          new HttpResponse({ status: 200, body: mockFormConfigs[index] }),
        );
      }
      return of(
        new HttpResponse({
          status: 404,
          body: { error: 'Form config not found' },
        }),
      );
    }

    if (url.match(/api\/dynamic-forms\/[\w-]+$/) && method === 'DELETE') {
      const id = url.split('/').pop();
      const index = mockFormConfigs.findIndex((f) => f.id === id);
      if (index !== -1) {
        mockFormConfigs.splice(index, 1);
        return of(new HttpResponse({ status: 204 }));
      }
      return of(
        new HttpResponse({
          status: 404,
          body: { error: 'Form config not found' },
        }),
      );
    }

    // 权限检查API
    if (url.endsWith('api/permissions/check') && method === 'POST') {
      // 开发模式下，所有权限检查都返回true（包括form:manage等管理员权限）
      return of(
        new HttpResponse({
          status: 200,
          body: { hasPermission: true, permissions: [] },
        }),
      );
    }

    if (url.endsWith('api/permissions/check-batch') && method === 'POST') {
      // 开发模式下，批量权限检查都返回true
      return of(
        new HttpResponse({
          status: 200,
          body: { hasPermission: true, permissions: [] },
        }),
      );
    }

    if (url.endsWith('api/permissions/current-user') && method === 'GET') {
      // 开发模式下，默认用户拥有所有管理员权限
      return of(
        new HttpResponse({
          status: 200,
          body: [
            // 用户管理权限
            'user:create',
            'user:edit',
            'user:delete',
            'user:view',
            // 角色管理权限
            'role:create',
            'role:edit',
            'role:delete',
            'role:view',
            'role:manage',
            // 权限管理权限
            'permission:create',
            'permission:edit',
            'permission:delete',
            'permission:view',
            'permission:manage',
            // 工作流管理权限
            'workflow:create',
            'workflow:update',
            'workflow:delete',
            'workflow:view',
            'workflow:change_status',
            // 动态表单管理权限（仅管理员）
            'form:manage',
            'form:create',
            'form:edit',
            'form:delete',
            'form:view',
            // 系统管理权限
            'system:settings',
            'system:manage',
          ],
        }),
      );
    }

    return next(req).pipe(
      tap((event) => {
        if (event.type === HttpEventType.Response) {
          console.log(req.url, 'returned a response with status', event.status);
        }
      }),
    );
  }
}
