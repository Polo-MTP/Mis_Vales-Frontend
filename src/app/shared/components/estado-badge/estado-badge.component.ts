import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DefinicionEstado, TipoEstado, TonoEstado, definicionEstado } from '../../utils/estados';

/**
 * Badge de estado único para toda la app. Recibe la familia (tipo) y el valor crudo que devuelve
 * el backend, y resuelve etiqueta + color contra el catálogo central (ver utils/estados.ts).
 *
 * Sustituye las cadenas de [class.bg-...] que se repetían en cada plantilla y que hacían que el
 * mismo estado se viera distinto según la vista.
 */
@Component({
  selector: 'app-estado-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span *ngIf="definicion() as d" class="status-badge" [ngClass]="clases(d.tono)">{{ d.label }}</span>
  `
})
export class EstadoBadgeComponent {
  private readonly tipoSig = signal<TipoEstado>('activacion');
  private readonly estadoSig = signal<string | number | boolean | null | undefined>(null);

  @Input({ required: true })
  set tipo(valor: TipoEstado) {
    this.tipoSig.set(valor);
  }

  @Input({ required: true })
  set estado(valor: string | number | boolean | null | undefined) {
    this.estadoSig.set(valor);
  }

  readonly definicion = computed<DefinicionEstado | null>(() => definicionEstado(this.tipoSig(), this.estadoSig()));

  /** Único lugar donde un tono se convierte en color. */
  clases(tono: TonoEstado): string {
    switch (tono) {
      case 'exito': return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'advertencia': return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'peligro': return 'bg-red-500/15 text-red-300 border-red-500/30';
      case 'info': return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'progreso': return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      default: return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
    }
  }
}
