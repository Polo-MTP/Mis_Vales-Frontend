import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CrearGerenteSucursalComponent } from '../crear-gerente-sucursal/crear-gerente-sucursal.component';
import { CrearAdministradorComponent } from '../crear-administrador/crear-administrador.component';
import { CrearPersonalSucursalComponent } from '../crear-personal-sucursal/crear-personal-sucursal.component';
import { SucursalesComponent } from '../sucursales/sucursales.component';
import { AuthService } from '../../../../auth/services/auth.service';

@Component({
  selector: 'app-personal',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CrearGerenteSucursalComponent,
    CrearAdministradorComponent,
    CrearPersonalSucursalComponent,
    SucursalesComponent
  ],
  templateUrl: './personal.component.html'
})
export class PersonalComponent {
  private authService = inject(AuthService);

  /** El backend solo deja dar de alta Gerentes de Sucursal y administrar sucursales a Gerente General. */
  esGerenteGeneral = computed(() => this.authService.userRole() === 'Gerente General');

  /** Solo Gerente General puede dar de alta Administradores (además de VPN, lo valida el
   *  backend) -- un Administrador ve todo el sistema sin acotar por sucursal, así que dejar
   *  que un Gerente de Sucursal lo creara sería escalar su propio alcance. */
  puedeCrearAdministrador = computed(() => this.authService.userRole() === 'Gerente General');
}
