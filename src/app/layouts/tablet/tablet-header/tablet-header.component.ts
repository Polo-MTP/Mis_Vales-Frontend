import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';

@Component({
  selector: 'app-tablet-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './tablet-header.component.html'
})
export class TabletHeaderComponent {
  readonly authService = inject(AuthService);

  menuAbierto = signal(false);

  toggleMenu(): void {
    this.menuAbierto.update(abierto => !abierto);
  }

  cerrarMenu(): void {
    this.menuAbierto.set(false);
  }

  get homeRoute(): string {
    switch (this.authService.userRole()) {
      case 'Coordinador':
        return '/coordinador';

      case 'Verificador':
        return '/verificador';

      default:
        return '/auth/login';
    }
  }

  logout(): void {
    this.cerrarMenu();
    this.authService.logout();
  }
}