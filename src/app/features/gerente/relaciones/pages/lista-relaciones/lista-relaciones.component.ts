import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { RelacionService } from '../../services/relacion.service';
import { EstadoRelacion, Relacion } from '../../../../../core/models/relacion.model';
import { PaginatedResponse } from '../../../../../core/models/user.model';

@Component({
  selector: 'app-lista-relaciones',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './lista-relaciones.component.html',
  styleUrl: './lista-relaciones.component.css'
})
export class ListaRelacionesComponent implements OnInit {
  private relacionService = inject(RelacionService);
  private router = inject(Router);

  relaciones = signal<Relacion[]>([]);
  paginacion = signal<PaginatedResponse<Relacion> | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);
  pagina = signal(1);
  filtroEstado = signal<EstadoRelacion | 'todas'>('todas');

  generando = signal(false);
  errorGenerar = signal<string | null>(null);
  successGenerar = signal<string | null>(null);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    const estado = this.filtroEstado() === 'todas' ? undefined : this.filtroEstado();

    this.relacionService.listar(this.pagina(), estado).subscribe({
      next: (res) => {
        this.paginacion.set(res.data ?? null);
        this.relaciones.set(res.data?.data ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las relaciones.');
        this.cargando.set(false);
      }
    });
  }

  cambiarFiltro(estado: EstadoRelacion | 'todas'): void {
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

  generarCortesDelDia(): void {
    this.generando.set(true);
    this.errorGenerar.set(null);
    this.successGenerar.set(null);

    this.relacionService.generar().subscribe({
      next: (res) => {
        this.generando.set(false);
        this.successGenerar.set(res.message || 'Cortes generados.');
        this.cargar();
      },
      error: (err) => {
        this.generando.set(false);
        this.errorGenerar.set(err.error?.message || 'Ocurrió un error al generar los cortes.');
      }
    });
  }

  irADetalle(id: number): void {
    this.router.navigate(['/gerente/relaciones', id]);
  }
}
