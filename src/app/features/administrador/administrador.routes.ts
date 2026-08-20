import { Routes } from '@angular/router';
import { AdministradorDashboardComponent } from './pages/dashboard/administrador-dashboard.component';
import { ListaNotificacionesComponent } from './notificaciones/pages/lista-notificaciones/lista-notificaciones.component';
import { ListaAuditoriaComponent } from './auditoria/pages/lista-auditoria/lista-auditoria.component';

export const ADMINISTRADOR_ROUTES: Routes = [
  { path: '', component: AdministradorDashboardComponent },
  { path: 'logs', component: ListaAuditoriaComponent },
  { path: 'notificaciones', component: ListaNotificacionesComponent }
];
