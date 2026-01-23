const files = [
  {
    path: ['Dashboard', 'main'],
    permission: 'View',
  },
  {
    path: ['User Management', 'Settings'],
    permission: 'add,edit,delete',
  },
  {
    path: ['User Management', 'WorkFlows'],
    permission: 'add,edit,delete',
  },
];
const actionsTree = [
  {
    id: '1',
    title: 'Dashboard',
    icon: 'dashboard',
    level: 1,
    parent_id: '',
    permission: 'view',
  },
  {
    id: '2',
    title: 'Main',
    icon: 'user',
    level: 2,
    parent_id: '1',
    link: 'main',
    permission: 'view',
  },
  {
    id: '3',
    title: 'User Management',
    icon: 'user',
    level: 1,
    parent_id: '',
    permission: 'view',
  },
  {
    id: '4',
    title: 'Settings',
    icon: 'user',
    level: 2,
    parent_id: '3',
    link: 'main/settings',
    permission: 'view',
  },
  {
    id: '5',
    title: 'WorkFlows',
    icon: 'user',
    level: 2,
    parent_id: '3',
    link: 'main/workflow',
    permission: 'view',
  },
];

export function getData() {
  return files;
}
