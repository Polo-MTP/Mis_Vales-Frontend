import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';

@Component({
  selector: 'app-mobile-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mobile-header.component.html'
})
export class MobileHeaderComponent {
  readonly authService = inject(AuthService);

  get homeRoute(): string {
    return '/distribuidora';
  }

  logout(): void {
    this.authService.logout();
  }
}