import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { FormsModule } from '@angular/forms';
import { AuditService } from '../../services/audit.service';
import { AuditLog } from '../../../../../core/models/audit-log.model';
import { PaginatedResponse, User } from '../../../../../core/models/user.model';
import { UsuarioService } from '../../../../../core/services/usuario.service';
import { ModalDetalleAuditoriaComponent, DetalleAuditoriaItem } from '../modal-detalle-auditoria/modal-detalle-auditoria.component';

@Component({
  selector: 'app-bitacora-actividad',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, ModalDetalleAuditoriaComponent],
  templateUrl: './bitacora-actividad.component.html'
})
export class BitacoraActividadComponent implements OnInit {
  private auditService = inject(AuditService);
  private usuarioService = inject(UsuarioService);

  paginacion = signal<PaginatedResponse<AuditLog> | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);
  pagina = signal(1);

  usuarios = signal<User[]>([]);
  filtroUsuarioId = signal<string>('');
  filtroModulo = signal<string>('');
  filtroNivel = signal<string>('');
  filtroAccion = signal<string>('');
  filtroBusqueda = signal<string>('');

  modalVisible = signal<boolean>(false);
  itemSeleccionado = signal<DetalleAuditoriaItem | null>(null);

  modulosDisponibles = [
    'Vales',
    'Distribuidoras',
    'Clientes',
    'Conciliaciones',
    'Relaciones',
    'Puntos y Lealtad',
    'Alta Proveedores',
    'Configuración',
    'General'
  ];

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

    const filters = {
      user_id: this.filtroUsuarioId() ? Number(this.filtroUsuarioId()) : undefined,
      modulo: this.filtroModulo() || undefined,
      nivel: this.filtroNivel() || undefined,
      action: this.filtroAccion().trim() || undefined,
      search: this.filtroBusqueda().trim() || undefined,
    };

    this.auditService
      .listarBitacora(this.pagina(), filters)
      .subscribe({
        next: (res) => {
          this.paginacion.set(res.data ?? null);
          this.cargando.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar la bitácora de actividad.');
          this.cargando.set(false);
        }
      });
  }

  abrirDetalle(item: AuditLog): void {
    const fechaObj = new Date(item.created_at);
    const fechaStr = isNaN(fechaObj.getTime())
      ? item.created_at
      : `${fechaObj.toLocaleDateString()} ${fechaObj.toLocaleTimeString()}`;

    const detalle: DetalleAuditoriaItem = {
      fecha: fechaStr,
      modulo: item.modulo || 'General',
      evento: item.action,
      nivel: (item.nivel || 'INFO') as 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL',
      usuarioEmail: item.user?.email || 'Sistema / Automatizado',
      usuarioNombre: item.user?.name,
      usuarioRol: item.user?.role?.name,
      sucursal: item.sucursal?.nombre || 'Global',
      ip: item.ip_address || '—',
      descripcion: item.descripcion || `Acción ${item.action} registrada sobre ${item.resource || 'el sistema'}.`,
      userAgent: item.user_agent || 'Mozilla/5.0 (Sistema Interno)',
      datosAdicionales: item.datos_adicionales || {
        recurso: item.resource,
        accion: item.action,
        usuario_id: item.user_id,
        sucursal_id: item.sucursal_id,
      },
    };

    this.itemSeleccionado.set(detalle);
    this.modalVisible.set(true);
  }

  aplicarFiltros(): void {
    this.pagina.set(1);
    this.cargar();
  }

  limpiarFiltros(): void {
    this.filtroUsuarioId.set('');
    this.filtroModulo.set('');
    this.filtroNivel.set('');
    this.filtroAccion.set('');
    this.filtroBusqueda.set('');
    this.pagina.set(1);
    this.cargar();
  }

  cambiarPagina(nuevaPagina: number): void {
    const p = this.paginacion();
    if (!p) return;
    if (nuevaPagina < 1 || nuevaPagina > p.last_page) return;
    this.pagina.set(nuevaPagina);
    this.cargar();
  }

  getNivelClass(nivel: string): string {
    switch (nivel?.toUpperCase()) {
      case 'INFO':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'WARNING':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'ERROR':
      case 'CRITICAL':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
    }
  }
}