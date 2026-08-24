import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditLog } from '../../../../../core/models/audit-log.model';
import { LoginAttempt } from '../../../../../core/models/user.model';

export type DetalleAuditoriaItem = {
  fecha: string;
  modulo: string;
  evento: string;
  nivel: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  usuarioEmail: string;
  usuarioNombre?: string;
  usuarioRol?: string;
  sucursal: string;
  ip: string;
  descripcion: string;
  userAgent: string;
  datosAdicionales: any;
};

@Component({
  selector: 'app-modal-detalle-auditoria',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-detalle-auditoria.component.html',
  styleUrls: ['./modal-detalle-auditoria.component.css']
})
export class ModalDetalleAuditoriaComponent {
  @Input() visible: boolean = false;
  @Input() data: DetalleAuditoriaItem | null = null;
  @Output() close = new EventEmitter<void>();

  copiado = signal<boolean>(false);

  cerrar(): void {
    this.close.emit();
  }

  copiarJson(): void {
    if (!this.data?.datosAdicionales) return;
    const jsonStr = JSON.stringify(this.data.datosAdicionales, null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
      this.copiado.set(true);
      setTimeout(() => this.copiado.set(false), 2000);
    });
  }

  get jsonFormateado(): string {
    if (!this.data?.datosAdicionales) return '{\n  "info": "Sin datos adicionales registrados"\n}';
    return JSON.stringify(this.data.datosAdicionales, null, 2);
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
