import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: []
})
export class HeaderComponent {
  authService = inject(AuthService);

  get homeRoute(): string {
    switch (this.authService.userRole()) {
      case 'Administrador': return '/administrador';
      case 'Gerente General':
      case 'Gerente de Sucursal': return '/gerente';
      case 'Coordinador': return '/coordinador';
      case 'Verificador': return '/verificador';
      case 'Distribuidora': return '/distribuidora';
      default: return '/auth/login';
    }
  }

  logout(): void {
    this.authService.logout();
  }

  getRoleBadgeClass(): string {
    switch (this.authService.userRole()) {
      case 'Administrador': return 'badge-admin';
      case 'Usuario': return 'badge-user';
      default: return 'badge-default';
    }
  }
}