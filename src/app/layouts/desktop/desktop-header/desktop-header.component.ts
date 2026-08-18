import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';

@Component({
  selector: 'app-desktop-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './desktop-header.component.html',
  styleUrl: './desktop-header.component.css'
})
export class DesktopHeaderComponent {
  readonly authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }

  get homeRoute(): string {
    switch (this.authService.userRole()) {
      case 'Administrador':
        return '/administrador';

      case 'Gerente General':
      case 'Gerente de Sucursal':
        return '/gerente';

      case 'Cajera':
        return '/cajera';

      default:
        return '/auth/login';
    }
  }
}