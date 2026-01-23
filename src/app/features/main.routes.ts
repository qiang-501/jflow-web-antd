import { Routes } from '@angular/router';

export const MAIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
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
];
