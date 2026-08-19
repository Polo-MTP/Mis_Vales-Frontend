import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ValeService } from '../../services/vale.service';
import { Vale, EstadoVale } from '../../../../../core/models/vale.model';
import { PaginatedResponse } from '../../../../../core/models/user.model';
import { estadoValeLabel } from '../../../../../shared/utils/labels';
import { AlertComponent } from '../../../../../shared/components/alert/alert.component';
import { SoloNumerosDirective } from '../../../../../shared/directives/solo-numeros.directive';

@Component({
  selector: 'app-lista-vales',
  standalone: true,
  imports: [CommonModule, RouterModule, AlertComponent, FormsModule, SoloNumerosDirective],
  templateUrl: './lista-vales.component.html',
  styleUrl: './lista-vales.component.css'
})
export class ListaValesComponent implements OnInit {
  private valeService = inject(ValeService);

  vales = signal<Vale[]>([]);
  paginacion = signal<PaginatedResponse<Vale> | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);
  pagina = signal(1);
  filtroEstado = signal<EstadoVale | 'todos'>('todos');
  validandoId = signal<number | null>(null);
  autorizandoId = signal<number | null>(null);
  errorAutorizar = signal<string | null>(null);

  /** Vale para el que estamos pidiendo la CLABE (el backend la exige la primera vez). */
  capturandoTarjetaId = signal<number | null>(null);
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
        this.vales.set(res.data?.data ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los vales.');
        this.cargando.set(false);
      }
    });
  }

  cambiarFiltro(estado: EstadoVale | 'todos'): void {
    this.filtroEstado.set(estado);
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

  validar(vale: Vale): void {
    this.validandoId.set(vale.id);
    this.errorAutorizar.set(null);

    this.valeService.validar(vale.id).subscribe({
      next: (res) => {
        this.validandoId.set(null);
        if (res.data) {
          this.vales.update((lista) => lista.map((v) => (v.id === vale.id ? res.data! : v)));
        }
      },
      error: (err) => {
        this.validandoId.set(null);
        const mensaje: string = err.error?.message || 'No se pudo validar el vale.';

        // El backend pide la CLABE la primera vez que se valida un vale de este cliente (para
        // poder transferirle el pago) — en vez de un error genérico, mostramos el campo para
        // capturarla y reintentar.
        if (mensaje.includes('CLABE')) {
          this.capturandoTarjetaId.set(vale.id);
          this.clabeValor.set('');
          return;
        }

        this.errorAutorizar.set(mensaje);
      }
    });
  }

  cancelarCapturaTarjeta(): void {
    this.capturandoTarjetaId.set(null);
    this.clabeValor.set('');
  }

  confirmarValidarConTarjeta(vale: Vale): void {
    const clabe = this.clabeValor().trim();

    if (clabe.length !== 18) {
      this.errorAutorizar.set('La CLABE interbancaria debe tener exactamente 18 dígitos.');
      return;
    }

    this.validandoId.set(vale.id);
    this.errorAutorizar.set(null);

    this.valeService.validar(vale.id, clabe).subscribe({
      next: (res) => {
        this.validandoId.set(null);
        this.capturandoTarjetaId.set(null);
        this.clabeValor.set('');
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
