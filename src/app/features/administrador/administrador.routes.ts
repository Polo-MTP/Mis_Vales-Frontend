import { Routes } from '@angular/router';
import { AdministradorDashboardComponent } from './pages/dashboard/administrador-dashboard.component';
import { ListaLogsComponent } from './logs/pages/lista-logs/lista-logs.component';
import { ListaNotificacionesComponent } from './notificaciones/pages/lista-notificaciones/lista-notificaciones.component';

export const ADMINISTRADOR_ROUTES: Routes = [
  { path: '', component: AdministradorDashboardComponent },
  { path: 'logs', component: ListaLogsComponent },
  { path: 'notificaciones', component: ListaNotificacionesComponent }
];
