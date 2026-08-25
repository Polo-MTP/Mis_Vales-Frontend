import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrearGerenteGeneralComponent } from '../../../../gerente/personal/pages/crear-gerente-general/crear-gerente-general.component';
import { SucursalMatrizComponent } from '../../components/sucursal-matriz/sucursal-matriz.component';

/**
 * Solo Administrador llega aquí: administra la sucursal matriz (solo puede haber una) y da de
 * alta Gerentes Generales, que se asignan automáticamente a esa matriz. No hay ningún flujo
 * para dar de alta cuentas de Administrador -- se provisionan fuera de la app.
 */
@Component({
  selector: 'app-administrador-personal',
  standalone: true,
  imports: [CommonModule, SucursalMatrizComponent, CrearGerenteGeneralComponent],
  templateUrl: './personal.component.html'
})
export class AdministradorPersonalComponent {}
