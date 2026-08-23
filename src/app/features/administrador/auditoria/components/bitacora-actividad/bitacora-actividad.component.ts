import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { FormsModule } from '@angular/forms';
import { AuditService } from '../../services/audit.service';
import { AuditLog } from '../../../../../core/models/audit-log.model';
import { PaginatedResponse, User } from '../../../../../core/models/user.model';
import { UsuarioService } from '../../../../../core/services/usuario.service';

@Component({
  selector: 'app-bitacora-actividad',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './bitacora-actividad.component.html'
})
export class BitacoraActividadComponent implements OnInit {

  private auditService = inject(AuditService);
  private usuarioService = inject(UsuarioService);

  paginacion = signal<PaginatedResponse<AuditLog> | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);
  pagina = signal(1);

  // Antes se pedía escribir el ID del usuario a mano -- nadie se sabe el ID de nadie. Se elige
  // de una lista con nombre y correo real, igual que cualquier otro selector de la app.
  usuarios = signal<User[]>([]);
  filtroUsuarioId = signal<string>('');
  filtroAccion = signal<string>('');

  ngOnInit(): void {
    this.usuarioService.listar().subscribe({
      next: (res) => this.usuarios.set((res.data ?? []).sort((a, b) => a.name.localeCompare(b.name))),
      error: () => this.usuarios.set([])
    });

    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    const userId = this.filtroUsuarioId()
      ? Number(this.filtroUsuarioId())
      : undefined;

    const accion = this.filtroAccion().trim() || undefined;

    this.auditService
      .listarBitacora(this.pagina(), userId, accion)
      .subscribe({
        next: (res) => {
          this.paginacion.set(res.data ?? null);
          this.cargando.set(false);
        },

        error: () => {
          this.error.set(
            'No se pudo cargar la bitácora de actividad.'
          );

          this.cargando.set(false);
        }
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

  cambiarPagina(nuevaPagina: number): void {
    const p = this.paginacion();

    if (!p) return;

    if (nuevaPagina < 1 || nuevaPagina > p.last_page) {
      return;
    }

    this.pagina.set(nuevaPagina);
    this.cargar();
  }
}