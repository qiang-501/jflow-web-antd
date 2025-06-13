import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { WorkflowComponent } from './workflow/workflow.component';

export const MAIN_ROUTES: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'workflow', component: WorkflowComponent },
];
