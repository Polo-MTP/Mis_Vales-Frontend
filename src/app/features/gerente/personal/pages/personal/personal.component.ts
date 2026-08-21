import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrearGerenteSucursalComponent } from '../crear-gerente-sucursal/crear-gerente-sucursal.component';
import { SucursalesComponent } from '../sucursales/sucursales.component';
import { AuthService } from '../../../../auth/services/auth.service';

@Component({
  selector: 'app-personal',
  standalone: true,
  imports: [CommonModule, CrearGerenteSucursalComponent, SucursalesComponent],
  templateUrl: './personal.component.html'
})
export class PersonalComponent {
  private authService = inject(AuthService);

  /** El backend solo deja dar de alta Gerentes de Sucursal a Gerente General. */
  esGerenteGeneral = computed(() => this.authService.userRole() === 'Gerente General');
}
