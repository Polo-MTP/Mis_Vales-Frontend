import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Botón para copiar un valor de texto tal cual (ej. referencia_pago) sin que la distribuidora
 * tenga que transcribirlo a mano -- un solo dígito mal copiado en una referencia de 18
 * caracteres significa que su pago nunca concilia. Nunca pasa el valor por Number()/parseInt(),
 * solo Clipboard API sobre el string.
 */
@Component({
  selector: 'app-copy-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button type="button" (click)="copiar()" class="text-xs text-blue-400 hover:text-blue-300 font-medium shrink-0">
      {{ copiado() ? '✓ Copiado' : 'Copiar' }}
    </button>
  `
})
export class CopyButtonComponent {
  @Input({ required: true }) valor!: string;

  readonly copiado = signal(false);

  copiar(): void {
    navigator.clipboard.writeText(this.valor).then(() => {
      this.copiado.set(true);
      setTimeout(() => this.copiado.set(false), 2000);
    });
  }
}
