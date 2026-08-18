import { Component, inject, signal } from '@angular/core';
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

  // Estado reactivo para el menú hamburguesa (Tablet / Móvil)
  menuAbierto = signal<boolean>(false);

  // Alternar apertura/cierre del menú hamburguesa
  toggleMenu(): void {
    this.menuAbierto.update(estado => !estado);
  }

  // Cerrar el menú al navegar
  cerrarMenu(): void {
    this.menuAbierto.set(false);
  }

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
    this.cerrarMenu();
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