import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditTableComponent } from '../../components/audit-table/audit-table.component';

@Component({
  selector: 'app-lista-auditoria',
  standalone: true,
  imports: [
    CommonModule,
    AuditTableComponent
  ],
  templateUrl: './lista-auditoria.component.html'
})
export class ListaAuditoriaComponent {}