import { Routes } from '@angular/router';
import { UsersListComponent } from './pages/users-list/users-list.component';
import { authGuard } from '../../core/guards/auth.guard';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    component: UsersListComponent,
    canActivate: [authGuard]
  }
];
