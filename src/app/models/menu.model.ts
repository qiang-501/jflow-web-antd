// menu.model.ts
export interface MenuItem {
  id: string;
  title: string;
  icon?: string;
  link?: string;
  selected?: boolean;
  disabled?: boolean;
  level: number;
  children?: MenuItem[];
}

export interface MenuNode {
  id: number;
  parentId?: number;
  name: string;
  title: string;
  path?: string;
  icon?: string;
  type?: string;
  status?: string;
  sortOrder?: number;
  isVisible?: boolean;
}
export const MENU: Array<MenuNode> = [
  {
    id: 1,
    name: 'dashboard',
    title: 'Dashboard',
    icon: 'dashboard',
    type: 'menu',
    status: 'active',
    sortOrder: 1,
  },
  {
    id: 2,
    name: 'main',
    title: 'Main',
    icon: 'user',
    path: 'main',
    parentId: 1,
    type: 'menu',
    status: 'active',
    sortOrder: 1,
  },
  {
    id: 3,
    name: 'user-management',
    title: 'User Management',
    icon: 'team',
    type: 'menu',
    status: 'active',
    sortOrder: 2,
  },
  {
    id: 4,
    name: 'settings',
    title: 'Settings',
    icon: 'setting',
    path: 'main/settings',
    parentId: 3,
    type: 'menu',
    status: 'active',
    sortOrder: 1,
  },
  {
    id: 5,
    name: 'workflows',
    title: 'WorkFlows',
    icon: 'apartment',
    path: 'main/workflow',
    parentId: 3,
    type: 'menu',
    status: 'active',
    sortOrder: 2,
  },
  {
    id: 6,
    name: 'access-control',
    title: 'Access Control',
    icon: 'safety',
    type: 'menu',
    status: 'active',
    sortOrder: 3,
  },
  {
    id: 7,
    name: 'users',
    title: 'Users',
    icon: 'user',
    path: 'main/users',
    parentId: 6,
    type: 'menu',
    status: 'active',
    sortOrder: 1,
  },
  {
    id: 8,
    name: 'roles',
    title: 'Roles',
    icon: 'idcard',
    path: 'main/roles',
    parentId: 6,
    type: 'menu',
    status: 'active',
    sortOrder: 2,
  },
  {
    id: 9,
    name: 'permissions',
    title: 'Permissions',
    icon: 'lock',
    path: 'main/permissions',
    parentId: 6,
    type: 'menu',
    status: 'active',
    sortOrder: 3,
  },
];
