import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/main' },
  {
    path: 'main',
    loadChildren: () =>
      import('./pages/main/main.routes').then((m) => m.MAIN_ROUTES),
  },
];
