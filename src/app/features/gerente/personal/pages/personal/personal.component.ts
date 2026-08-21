import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrearGerenteSucursalComponent } from '../crear-gerente-sucursal/crear-gerente-sucursal.component';
import { SucursalesComponent } from '../sucursales/sucursales.component';

@Component({
  selector: 'app-personal',
  standalone: true,
  imports: [CommonModule, CrearGerenteSucursalComponent, SucursalesComponent],
  templateUrl: './personal.component.html'
})
export class PersonalComponent {}
