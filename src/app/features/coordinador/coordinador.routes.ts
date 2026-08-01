import { Routes } from '@angular/router';
import { CoordinadorDashboardComponent } from './pages/dashboard/coordinador-dashboard.component';
import { authGuard } from '../auth/guards/auth.guard';

export const COORDINADOR_ROUTES: Routes = [
  { path: '', component: CoordinadorDashboardComponent, canActivate: [authGuard] }
];
