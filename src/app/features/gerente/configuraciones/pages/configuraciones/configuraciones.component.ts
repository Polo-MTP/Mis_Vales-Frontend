import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListaConfiguracionesComponent } from '../lista-configuraciones/lista-configuraciones.component';
import { ConfiguracionesFechasComponent } from '../configuraciones-fechas/configuraciones-fechas.component';
import { CategoriasDistribuidoraComponent } from '../categorias-distribuidora/categorias-distribuidora.component';
import { SegurosTablaComponent } from '../seguros-tabla/seguros-tabla.component';

@Component({
  selector: 'app-configuraciones',
  standalone: true,
  imports: [
    CommonModule,
    ListaConfiguracionesComponent,
    ConfiguracionesFechasComponent,
    CategoriasDistribuidoraComponent,
    SegurosTablaComponent
  ],
  templateUrl: './configuraciones.component.html',
  styleUrl: './configuraciones.component.css'
})
export class ConfiguracionesComponent {}
