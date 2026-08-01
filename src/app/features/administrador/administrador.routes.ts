import { Routes } from '@angular/router';
import { AdministradorDashboardComponent } from './pages/dashboard/administrador-dashboard.component';
import { authGuard } from '../auth/guards/auth.guard';

export const ADMINISTRADOR_ROUTES: Routes = [
  { path: '', component: AdministradorDashboardComponent, canActivate: [authGuard] }
];
