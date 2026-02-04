import {
  HttpEvent,
  HttpRequest,
  HttpResponse,
  HttpHandlerFn,
  HttpEventType,
} from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { delay, mergeMap, materialize, dematerialize } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import * as MENU from '../../../assets/data/menuResult.json';
import * as MENUACTION from '../../../assets/data/menuActions.json';
import * as USERS_DATA from '../../../assets/data/mockUsers.json';
import * as ROLES_DATA from '../../../assets/data/mockRoles.json';
import * as PERMISSIONS_DATA from '../../../assets/data/mockPermissions.json';
import * as MENU_PERMISSIONS_DATA from '../../../assets/data/mockMenuPermissions.json';
import * as WORKFLOWS_DATA from '../../../assets/data/mockWorkflows.json';
import * as WORKFLOW_HISTORY_DATA from '../../../assets/data/mockWorkflowHistory.json';
import * as FORM_CONFIGS_DATA from '../../../assets/data/mockFormConfigs.json';
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

// 从JSON文件加载Mock数据并转换日期字符串为Date对象
let mockUsers: User[] = ((USERS_DATA as any).default as any[]).map((user) => ({
  ...user,
  status: user.status as UserStatus,
  createdAt: new Date(user.createdAt),
  updatedAt: new Date(user.updatedAt),
  lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : undefined,
}));

let mockRoles: Role[] = ((ROLES_DATA as any).default as any[]).map((role) => ({
  ...role,
  createdAt: new Date(role.createdAt),
  updatedAt: new Date(role.updatedAt),
}));

let mockPermissions: Permission[] = (
  (PERMISSIONS_DATA as any).default as any[]
).map((permission) => ({
  ...permission,
  type: permission.type as PermissionType,
  createdAt: new Date(permission.createdAt),
  updatedAt: new Date(permission.updatedAt),
}));

let mockMenuPermissions: MenuPermission[] = (MENU_PERMISSIONS_DATA as any)
  .default;

let mockWorkflows: WorkFlow[] = ((WORKFLOWS_DATA as any).default as any[]).map(
  (workflow) => ({
    ...workflow,
    status: workflow.status as WorkflowStatus,
    priority: workflow.priority as WorkflowPriority,
  }),
);

let mockWorkflowHistory: WorkflowStatusHistory[] = (
  (WORKFLOW_HISTORY_DATA as any).default as any[]
).map((history) => ({
  ...history,
  from_status: history.from_status as WorkflowStatus,
  to_status: history.to_status as WorkflowStatus,
}));

let mockFormConfigs: DynamicFormConfig[] = (
  (FORM_CONFIGS_DATA as any).default as any[]
).map((config) => ({
  ...config,
  fields: config.fields.map((field: any) => ({
    ...field,
    type: field.type as FieldType,
  })),
}));

export function FakeBackendInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  // 检查是否使用Mock数据
  if (!environment.useMockData) {
    // 使用真实API，直接传递请求
    return next(req);
  }

  const { url, method, body } = req;

  return of(null)
    .pipe(mergeMap(handleRoute))
    .pipe(materialize())
    .pipe(delay(500))
    .pipe(dematerialize());

  function handleRoute() {
    // 菜单API - 返回带children的树形结构
    if (url.endsWith('api/menus') && method === 'GET') {
      return of(
        new HttpResponse({
          status: 200,
          body: { data: menuList, total: menuList.length },
        }),
      );
    }

    if (url.endsWith('api/menus/actions') && method === 'GET') {
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
      const id = Number(url.split('/').pop());
      const workflow = mockWorkflows.find((w) => w.id === id);
      return of(new HttpResponse({ status: 200, body: workflow }));
    }

    if (url.endsWith('api/workflows') && method === 'POST') {
      const newWorkflow = body as any;
      const workflow: WorkFlow = {
        id: mockWorkflows.length + 1,
        dWorkflowId:
          newWorkflow.dWorkflowId ||
          `WF-${String(mockWorkflows.length + 1).padStart(3, '0')}`,
        ...newWorkflow,
        status: newWorkflow.status || WorkflowStatus.DRAFT,
        priority: newWorkflow.priority || WorkflowPriority.MEDIUM,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockWorkflows.push(workflow);
      return of(new HttpResponse({ status: 201, body: workflow }));
    }

    if (url.match(/api\/workflows\/\w+$/) && method === 'PUT') {
      const id = Number(url.split('/').pop());
      const updateData = body as any;
      const index = mockWorkflows.findIndex((w) => w.id === id);
      if (index !== -1) {
        mockWorkflows[index] = {
          ...mockWorkflows[index],
          ...updateData,
          updatedAt: new Date().toISOString(),
        };
        return of(
          new HttpResponse({ status: 200, body: mockWorkflows[index] }),
        );
      }
      return of(new HttpResponse({ status: 404 }));
    }

    if (url.match(/api\/workflows\/\w+$/) && method === 'DELETE') {
      const id = Number(url.split('/').pop());
      mockWorkflows = mockWorkflows.filter((w) => w.id !== id);
      return of(new HttpResponse({ status: 204 }));
    }

    if (url.match(/api\/workflows\/\w+\/status$/) && method === 'PATCH') {
      const id = Number(url.split('/')[url.split('/').length - 2]);
      const { status, comment } = body as any;
      const index = mockWorkflows.findIndex((w) => w.id === id);
      if (index !== -1) {
        const oldStatus = mockWorkflows[index].status;
        mockWorkflows[index].status = status;
        mockWorkflows[index].updatedAt = new Date().toISOString();

        // 添加历史记录
        const history: WorkflowStatusHistory = {
          id: String(mockWorkflowHistory.length + 1),
          workflow_id: String(id),
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
      const id = Number(url.split('/')[url.split('/').length - 2]);
      const { assignee } = body as any;
      const index = mockWorkflows.findIndex((w) => w.id === id);
      if (index !== -1) {
        mockWorkflows[index].assignedTo = assignee;
        mockWorkflows[index].updatedAt = new Date().toISOString();
        return of(
          new HttpResponse({ status: 200, body: mockWorkflows[index] }),
        );
      }
      return of(new HttpResponse({ status: 404 }));
    }

    if (url.endsWith('api/workflows/my-workflows') && method === 'GET') {
      const myWorkflows = mockWorkflows.filter((w) => w.assignedTo === 1);
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
    if (url.endsWith('api/forms') && method === 'GET') {
      return of(new HttpResponse({ status: 200, body: mockFormConfigs }));
    }

    if (url.match(/api\/forms\/[\w-]+$/) && method === 'GET') {
      const id = parseInt(url.split('/').pop() || '0', 10);
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

    if (url.endsWith('api/forms') && method === 'POST') {
      const newConfig = body as any;
      const formConfig: DynamicFormConfig = {
        id:
          mockFormConfigs.length > 0
            ? Math.max(...mockFormConfigs.map((f) => f.id)) + 1
            : 1,
        ...newConfig,
        created_by: 'admin',
        created_on: new Date().toISOString(),
      };
      mockFormConfigs.push(formConfig);
      return of(new HttpResponse({ status: 201, body: formConfig }));
    }

    if (url.match(/api\/forms\/[\w-]+$/) && method === 'PUT') {
      const id = parseInt(url.split('/').pop() || '0', 10);
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

    if (url.match(/api\/forms\/[\w-]+$/) && method === 'DELETE') {
      const id = parseInt(url.split('/').pop() || '0', 10);
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
