import { Routes } from '@angular/router';

export const MAIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./workflow/workflow.component').then((m) => m.WorkflowComponent),
  },
  {
    path: 'workflow',
    loadComponent: () =>
      import('./workflow/workflow.component').then((m) => m.WorkflowComponent),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./system/system.settings.component').then(
        (m) => m.SystemSettingsComponent,
      ),
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./user-management/user-management.component').then(
        (m) => m.UserManagementComponent,
      ),
  },
  {
    path: 'roles',
    loadComponent: () =>
      import('./role-management/role-management.component').then(
        (m) => m.RoleManagementComponent,
      ),
  },
  {
    path: 'permissions',
    loadComponent: () =>
      import('./permission-management/permission-management.component').then(
        (m) => m.PermissionManagementComponent,
      ),
  },
];
