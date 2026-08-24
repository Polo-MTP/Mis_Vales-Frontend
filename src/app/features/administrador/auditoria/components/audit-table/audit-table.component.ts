import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditService } from '../../services/audit.service';
import { LoginAttempt, PaginatedResponse } from '../../../../../core/models/user.model';
import { loginStatusLabel } from '../../../../../shared/utils/labels';
import { ModalDetalleAuditoriaComponent, DetalleAuditoriaItem } from '../modal-detalle-auditoria/modal-detalle-auditoria.component';

@Component({
  selector: 'app-audit-table',
  standalone: true,
  imports: [CommonModule, ModalDetalleAuditoriaComponent],
  templateUrl: './audit-table.component.html'
})
export class AuditTableComponent implements OnInit {
  private auditService = inject(AuditService);

  paginationData = signal<PaginatedResponse<LoginAttempt> | null>(null);
  currentPage = signal<number>(1);
  isLoading = signal<boolean>(true);

  modalVisible = signal<boolean>(false);
  itemSeleccionado = signal<DetalleAuditoriaItem | null>(null);

  ngOnInit(): void {
    this.loadLogs(1);
  }

  loadLogs(page: number): void {
    this.isLoading.set(true);
    this.auditService.listar(page).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.paginationData.set(res.data);
          this.currentPage.set(res.data.current_page);
        }
      },
      error: () => this.isLoading.set(false)
    });
  }

  abrirDetalle(item: LoginAttempt): void {
    const fechaObj = new Date(item.created_at);
    const fechaStr = isNaN(fechaObj.getTime())
      ? item.created_at
      : `${fechaObj.toLocaleDateString()} ${fechaObj.toLocaleTimeString()}`;

    const isSuccess = item.status.startsWith('success');
    const isLocked = item.status.includes('locked');
    const nivel = isSuccess ? 'INFO' : (isLocked ? 'CRITICAL' : 'WARNING');

    const detalle: DetalleAuditoriaItem = {
      fecha: fechaStr,
      modulo: 'Auth',
      evento: 'LOGIN',
      nivel: nivel,
      usuarioEmail: item.email_attempted || item.user?.email || 'Desconocido',
      usuarioNombre: item.user?.name,
      usuarioRol: item.user?.role?.name,
      sucursal: item.user?.sucursal?.nombre || 'Global',
      ip: item.ip_address || '—',
      descripcion: item.failure_reason || (isSuccess ? 'Inicio de sesión exitoso.' : `Intento de acceso fallido: ${this.getStatusLabel(item.status)}.`),
      userAgent: item.user_agent || 'Mozilla/5.0 (No registrado)',
      datosAdicionales: {
        user_id: item.user_id,
        email_intentado: item.email_attempted,
        ip_address: item.ip_address,
        estado_resultado: item.status,
        paso_factor: item.factor_step,
        motivo_fallo: item.failure_reason,
        user_agent: item.user_agent,
      },
    };

    this.itemSeleccionado.set(detalle);
    this.modalVisible.set(true);
  }

  changePage(newPage: number): void {
    if (newPage >= 1 && newPage <= (this.paginationData()?.last_page || 1)) {
      this.loadLogs(newPage);
    }
  }

  getStatusLabel(status: string): string {
    return loginStatusLabel(status);
  }

  getStatusClass(status: string): string {
    if (status.startsWith('success')) {
      return 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30';
    }
    if (status.includes('locked')) {
      return 'bg-red-500/15 text-red-300 border border-red-500/30';
    }
    return 'bg-amber-500/15 text-amber-300 border border-amber-500/30';
  }
}