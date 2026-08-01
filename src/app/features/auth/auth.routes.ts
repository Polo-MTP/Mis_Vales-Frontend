import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { MfaSetupComponent } from './pages/mfa-setup/mfa-setup.component';
import { guestGuard } from './guards/guest.guard';

export const AUTH_ROUTES: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'mfa-setup', component: MfaSetupComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
