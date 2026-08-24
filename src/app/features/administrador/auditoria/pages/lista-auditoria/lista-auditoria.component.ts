import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditTableComponent } from '../../components/audit-table/audit-table.component';
import { BitacoraActividadComponent } from '../../components/bitacora-actividad/bitacora-actividad.component';

@Component({
  selector: 'app-lista-auditoria',
  standalone: true,
  imports: [
    CommonModule,
    AuditTableComponent,
    BitacoraActividadComponent
  ],
  templateUrl: './lista-auditoria.component.html'
})
export class ListaAuditoriaComponent {
  tabActiva = signal<'actividad' | 'accesos'>('actividad');

  seleccionarTab(tab: 'actividad' | 'accesos'): void {
    this.tabActiva.set(tab);
  }
}