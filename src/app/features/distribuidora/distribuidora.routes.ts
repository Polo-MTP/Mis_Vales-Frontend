import { Routes } from '@angular/router';
import { DistribuidoraDashboardComponent } from './pages/dashboard/distribuidora-dashboard.component';
import { authGuard } from '../auth/guards/auth.guard';

export const DISTRIBUIDORA_ROUTES: Routes = [
  { path: '', component: DistribuidoraDashboardComponent, canActivate: [authGuard] }
];
