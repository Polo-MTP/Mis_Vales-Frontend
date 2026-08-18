import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';

@Component({
  selector: 'app-mobile-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mobile-navigation.component.html'
})
export class MobileNavigationComponent {
  readonly authService = inject(AuthService);
}