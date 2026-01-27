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

    return next(req).pipe(
      tap((event) => {
        if (event.type === HttpEventType.Response) {
          console.log(req.url, 'returned a response with status', event.status);
        }
      }),
    );
  }
}
