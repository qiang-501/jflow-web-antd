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
    icon: 'user',
    level: 1,
    parent_id: '',
  },
  {
    id: '4',
    title: 'Settings',
    icon: 'user',
    level: 2,
    parent_id: '3',
    link: 'main/settings',
  },
  {
    id: '5',
    title: 'WorkFlows',
    icon: 'user',
    level: 2,
    parent_id: '3',
    link: 'main/workflow',
  },
];
