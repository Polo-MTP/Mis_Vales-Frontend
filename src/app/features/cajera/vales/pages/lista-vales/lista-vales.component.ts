import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ValeService } from '../../services/vale.service';
import { DistribuidoraService } from '../../../../gerente/distribuidoras/services/distribuidora.service';
import { RelacionService } from '../../../../distribuidora/relaciones/services/relacion.service';
import { Vale, EstadoVale } from '../../../../../core/models/vale.model';
import { ProximoPago } from '../../../../../core/models/relacion.model';
import { PaginatedResponse } from '../../../../../core/models/user.model';
import { estadoValeLabel } from '../../../../../shared/utils/labels';
import { AlertComponent } from '../../../../../shared/components/alert/alert.component';
import { SoloNumerosDirective } from '../../../../../shared/directives/solo-numeros.directive';

@Component({
  selector: 'app-lista-vales',
  standalone: true,
  imports: [CommonModule, RouterModule, AlertComponent, FormsModule, SoloNumerosDirective, PaginationComponent],
  templateUrl: './lista-vales.component.html',
  styleUrl: './lista-vales.component.css'
})
export class ListaValesComponent implements OnInit {
  private valeService = inject(ValeService);
  private distribuidoraService = inject(DistribuidoraService);
  private relacionService = inject(RelacionService);

  saldoPorDistribuidora = signal<Record<number, number | 'cargando' | 'error'>>({});
  /** Referencia del próximo corte por distribuidora, para vales ya autorizados que todavía no
   *  tienen un corte real (v.cortes vacío) -- sin esto la cajera no sabe con qué referencia va
   *  a llegar el pago hasta que el corte ya se generó. */
  proximoPagoPorDistribuidora = signal<Record<number, ProximoPago | 'cargando' | 'error'>>({});

  vales = signal<Vale[]>([]);
  paginacion = signal<PaginatedResponse<Vale> | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);
  pagina = signal(1);
  filtroEstado = signal<EstadoVale | 'todos'>('todos');
  validandoId = signal<number | null>(null);
  autorizandoId = signal<number | null>(null);
  errorAutorizar = signal<string | null>(null);

  /** Vale para el que estamos llenando el checklist de validación (INE, comprobante, CLABE). */
  validandoDatosId = signal<number | null>(null);
  ineVerificada = signal(false);
  comprobanteVerificado = signal(false);
  clabeValor = signal('');

  readonly estadoValeLabel = estadoValeLabel;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    const filtro = this.filtroEstado();
    const estado = filtro === 'todos' ? undefined : filtro;

    this.valeService.listar(this.pagina(), estado).subscribe({
      next: (res) => {
        this.paginacion.set(res.data ?? null);
        const vales = res.data?.data ?? [];
        this.vales.set(vales);
        this.cargando.set(false);
        this.cargarProximoPagoDeAutorizadosSinCorte(vales);
      },
      error: () => {
        this.error.set('No se pudieron cargar los vales.');
        this.cargando.set(false);
      }
    });
  }

  /** Un vale ya autorizado (o parcial/vencido) que todavía no tiene ningún corte real: la
   *  cajera necesita saber con qué referencia va a llegar el pago sin tener que esperar a que
   *  el corte se genere. Se carga automáticamente, una vez por distribuidora. */
  private cargarProximoPagoDeAutorizadosSinCorte(vales: Vale[]): void {
    const distribuidoraIds = new Set(
      vales
        .filter((v) => ['autorizado', 'parcial', 'vencido'].includes(v.estado) && v.cortes.length === 0)
        .map((v) => v.distribuidora_id)
    );

    for (const distribuidoraId of distribuidoraIds) {
      if (this.proximoPagoPorDistribuidora()[distribuidoraId] !== undefined) continue;

      this.proximoPagoPorDistribuidora.update((mapa) => ({ ...mapa, [distribuidoraId]: 'cargando' }));

      this.relacionService.proximoPago(distribuidoraId).subscribe({
        next: (res) => this.proximoPagoPorDistribuidora.update((mapa) => ({ ...mapa, [distribuidoraId]: res.data ?? 'error' })),
        error: () => this.proximoPagoPorDistribuidora.update((mapa) => ({ ...mapa, [distribuidoraId]: 'error' }))
      });
    }
  }

  cambiarFiltro(estado: EstadoVale | 'todos'): void {
    this.filtroEstado.set(estado);
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

  /** Abre el checklist de validación (INE, comprobante, CLABE si hace falta) para este vale. */
  iniciarValidacion(vale: Vale): void {
    this.validandoDatosId.set(vale.id);
    this.ineVerificada.set(false);
    this.comprobanteVerificado.set(false);
    this.clabeValor.set('');
    this.errorAutorizar.set(null);
  }

  cancelarValidacion(): void {
    this.validandoDatosId.set(null);
  }

  confirmarValidacion(vale: Vale): void {
    const clabe = this.clabeValor().trim();

    // La CLABE es opcional aquí a propósito: el backend solo la exige si el cliente no tiene
    // una guardada todavía. Si la escribieron, sí debe venir completa (18 dígitos).
    if (clabe.length > 0 && clabe.length !== 18) {
      this.errorAutorizar.set('La CLABE interbancaria debe tener exactamente 18 dígitos.');
      return;
    }

    this.validandoId.set(vale.id);
    this.errorAutorizar.set(null);

    this.valeService.validar(vale.id, this.ineVerificada(), this.comprobanteVerificado(), clabe || undefined).subscribe({
      next: (res) => {
        this.validandoId.set(null);
        this.validandoDatosId.set(null);
        if (res.data) {
          this.vales.update((lista) => lista.map((v) => (v.id === vale.id ? res.data! : v)));
        }
      },
      error: (err) => {
        this.validandoId.set(null);
        this.errorAutorizar.set(err.error?.message || 'No se pudo validar el vale.');
      }
    });
  }

  verSaldoDisponible(distribuidoraId: number): void {
    this.saldoPorDistribuidora.update((mapa) => ({ ...mapa, [distribuidoraId]: 'cargando' }));

    this.distribuidoraService.saldoDisponible(distribuidoraId).subscribe({
      next: (saldo) => this.saldoPorDistribuidora.update((mapa) => ({ ...mapa, [distribuidoraId]: saldo })),
      error: () => this.saldoPorDistribuidora.update((mapa) => ({ ...mapa, [distribuidoraId]: 'error' }))
    });
  }

  autorizar(vale: Vale): void {
    this.autorizandoId.set(vale.id);
    this.errorAutorizar.set(null);

    this.valeService.autorizar(vale.id).subscribe({
      next: (res) => {
        this.autorizandoId.set(null);
        if (res.data) {
          this.vales.update((lista) => lista.map((v) => (v.id === vale.id ? res.data! : v)));
        }
      },
      error: (err) => {
        this.autorizandoId.set(null);
        this.errorAutorizar.set(err.error?.message || 'No se pudo autorizar el vale.');
      }
    });
  }
}
