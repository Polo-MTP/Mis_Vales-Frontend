import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';

@Component({
  selector: 'app-tablet-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './tablet-navigation.component.html'
})
export class TabletNavigationComponent {
  readonly authService = inject(AuthService);
}