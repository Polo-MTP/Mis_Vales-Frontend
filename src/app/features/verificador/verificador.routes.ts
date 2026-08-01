import { Routes } from '@angular/router';
import { VerificadorDashboardComponent } from './pages/dashboard/verificador-dashboard.component';
import { authGuard } from '../auth/guards/auth.guard';

export const VERIFICADOR_ROUTES: Routes = [
  { path: '', component: VerificadorDashboardComponent, canActivate: [authGuard] }
];
