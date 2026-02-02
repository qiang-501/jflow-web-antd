import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/system' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'main',
    loadComponent: () =>
      import('./layout/shell/shell.component').then((m) => m.ShellComponent),
  },

  {
    path: 'system',
    loadComponent: () =>
      import('./layout/shell/shell.component').then((m) => m.ShellComponent),
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/main.routes').then((m) => m.MAIN_ROUTES),
      },
    ],
  },
];
