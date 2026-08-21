import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditService } from '../../services/audit.service';
import { AuditLog } from '../../../../../core/models/audit-log.model';
import { PaginatedResponse } from '../../../../../core/models/user.model';

@Component({
  selector: 'app-bitacora-actividad',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bitacora-actividad.component.html'
})
export class BitacoraActividadComponent implements OnInit {
  private auditService = inject(AuditService);

  paginacion = signal<PaginatedResponse<AuditLog> | null>(null);
  cargando = signal(true);
  pagina = signal(1);

  filtroUsuarioId = signal<string>('');
  filtroAccion = signal<string>('');

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);

    const userId = this.filtroUsuarioId() ? Number(this.filtroUsuarioId()) : undefined;
    const accion = this.filtroAccion().trim() || undefined;

    this.auditService.listarBitacora(this.pagina(), userId, accion).subscribe({
      next: (res) => {
        this.paginacion.set(res.data ?? null);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }

  aplicarFiltros(): void {
    this.pagina.set(1);
    this.cargar();
  }

  limpiarFiltros(): void {
    this.filtroUsuarioId.set('');
    this.filtroAccion.set('');
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
