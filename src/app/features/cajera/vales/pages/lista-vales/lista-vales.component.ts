import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ValeService } from '../../services/vale.service';
import { Vale, EstadoVale } from '../../../../../core/models/vale.model';
import { PaginatedResponse } from '../../../../../core/models/user.model';
import { estadoValeLabel } from '../../../../../shared/utils/labels';
import { AlertComponent } from '../../../../../shared/components/alert/alert.component';

@Component({
  selector: 'app-lista-vales',
  standalone: true,
  imports: [CommonModule, RouterModule, AlertComponent],
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
  autorizandoId = signal<number | null>(null);
  errorAutorizar = signal<string | null>(null);

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
