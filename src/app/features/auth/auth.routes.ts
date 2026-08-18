import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { MfaSetupComponent } from './pages/mfa-setup/mfa-setup.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { guestGuard } from './guards/guest.guard';

export const AUTH_ROUTES: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'mfa-setup', component: MfaSetupComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent, canActivate: [guestGuard] },
  { path: 'reset-password', component: ResetPasswordComponent, canActivate: [guestGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
