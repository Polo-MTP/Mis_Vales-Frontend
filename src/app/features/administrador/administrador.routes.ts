import { Routes } from '@angular/router';
import { AdministradorDashboardComponent } from './pages/dashboard/administrador-dashboard.component';
import { NotificationListComponent } from '../../shared/components/notifications/notification-list/notification-list.component';
import { ListaAuditoriaComponent } from './auditoria/pages/lista-auditoria/lista-auditoria.component';
import { CambiarPasswordComponent } from '../../shared/components/cambiar-password/cambiar-password.component';

export const ADMINISTRADOR_ROUTES: Routes = [
  { path: '', component: AdministradorDashboardComponent },
  { path: 'logs', component: ListaAuditoriaComponent },
  { path: 'notificaciones', component: NotificationListComponent },
  { path: 'cuenta/contrasena', component: CambiarPasswordComponent }
];
