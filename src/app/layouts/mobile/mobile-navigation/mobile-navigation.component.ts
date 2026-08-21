import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationStart, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';

@Component({
  selector: 'app-mobile-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mobile-navigation.component.html'
})
export class MobileNavigationComponent {
  readonly authService = inject(AuthService);

  masAbierto = signal(false);

  constructor(private router: Router) {
    // Cierra la hoja "Más" sola al navegar, para que no se quede abierta tapando la página.
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.masAbierto.set(false);
      }
    });
  }

  toggleMas(): void {
    this.masAbierto.update((abierto) => !abierto);
  }
}