import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrearGerenteGeneralComponent } from '../../../../gerente/personal/pages/crear-gerente-general/crear-gerente-general.component';

/**
 * Solo Administrador llega aquí: da de alta un Gerente General para arrancar o reponer la
 * cadena de mando (Gerente General no puede crear otro Gerente General). No hay ningún flujo
 * para dar de alta cuentas de Administrador -- se provisionan fuera de la app.
 */
@Component({
  selector: 'app-administrador-personal',
  standalone: true,
  imports: [CommonModule, CrearGerenteGeneralComponent],
  templateUrl: './personal.component.html'
})
export class AdministradorPersonalComponent {}
