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
  id: string;
  parent_id?: string;
  title: string;
  icon?: string;
  link?: string;
  level: number;
}
export const MENU: Array<MenuNode> = [
  {
    id: '1',
    title: 'Dashboard',
    icon: 'dashboard',
    level: 1,
    parent_id: '',
  },
  {
    id: '2',
    title: 'Main',
    icon: 'user',
    level: 2,
    parent_id: '1',
    link: 'main',
  },
  {
    id: '3',
    title: 'User Management',
    icon: 'team',
    level: 1,
    parent_id: '',
  },
  {
    id: '4',
    title: 'Settings',
    icon: 'setting',
    level: 2,
    parent_id: '3',
    link: 'main/settings',
  },
  {
    id: '5',
    title: 'WorkFlows',
    icon: 'apartment',
    level: 2,
    parent_id: '3',
    link: 'main/workflow',
  },
  {
    id: '6',
    title: 'Access Control',
    icon: 'safety',
    level: 1,
    parent_id: '',
  },
  {
    id: '7',
    title: 'Users',
    icon: 'user',
    level: 2,
    parent_id: '6',
    link: 'main/users',
  },
  {
    id: '8',
    title: 'Roles',
    icon: 'idcard',
    level: 2,
    parent_id: '6',
    link: 'main/roles',
  },
  {
    id: '9',
    title: 'Permissions',
    icon: 'lock',
    level: 2,
    parent_id: '6',
    link: 'main/permissions',
  },
];
