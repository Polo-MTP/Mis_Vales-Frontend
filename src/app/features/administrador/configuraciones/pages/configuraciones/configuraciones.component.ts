import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListaConfiguracionesComponent } from '../lista-configuraciones/lista-configuraciones.component';
import { ConfiguracionesFechasComponent } from '../configuraciones-fechas/configuraciones-fechas.component';

@Component({
  selector: 'app-configuraciones',
  standalone: true,
  imports: [CommonModule, ListaConfiguracionesComponent, ConfiguracionesFechasComponent],
  templateUrl: './configuraciones.component.html',
  styleUrl: './configuraciones.component.css'
})
export class ConfiguracionesComponent {}
