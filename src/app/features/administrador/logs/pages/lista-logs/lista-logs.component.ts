import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditLogService } from '../../services/audit-log.service';
import { AuditLog } from '../../../../../core/models/audit-log.model';
import { PaginatedResponse } from '../../../../../core/models/user.model';

@Component({
  selector: 'app-lista-logs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-logs.component.html',
  styleUrl: './lista-logs.component.css'
})
export class ListaLogsComponent implements OnInit {
  private auditLogService = inject(AuditLogService);

  logs = signal<AuditLog[]>([]);
  paginacion = signal<PaginatedResponse<AuditLog> | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);
  pagina = signal(1);
  filtroAccion = signal('');

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.auditLogService.listar(this.pagina(), this.filtroAccion() || undefined).subscribe({
      next: (res) => {
        this.paginacion.set(res.data ?? null);
        this.logs.set(res.data?.data ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el log de auditoría.');
        this.cargando.set(false);
      }
    });
  }

  buscar(termino: string): void {
    this.filtroAccion.set(termino.trim());
    this.pagina.set(1);
    this.cargar();
  }

  cambiarPagina(delta: number): void {
    const p = this.paginacion();
    if (!p) return;
    const nuevaPagina = this.pagina() + delta;
    if (nuevaPagina < 1 || nuevaPagina > p.last_page) return;
    this.pagina.set(nuevaPagina);
    this.cargar();
  }
}
