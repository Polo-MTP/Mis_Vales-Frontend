import { DineroPipe } from '../../../../../shared/pipes/dinero.pipe';
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { Router, RouterModule } from '@angular/router';
import { RelacionService } from '../../services/relacion.service';
import { EstadoRelacion, Relacion } from '../../../../../core/models/relacion.model';
import { PaginacionAnidada } from '../../../../../core/models/paginacion-anidada.model';

@Component({
  selector: 'app-lista-relaciones',
  standalone: true,
  imports: [CommonModule, RouterModule, PaginationComponent, DineroPipe],
  templateUrl: './lista-relaciones.component.html',
  styleUrl: './lista-relaciones.component.css'
})
export class ListaRelacionesComponent implements OnInit {
  private relacionService = inject(RelacionService);
  private router = inject(Router);

  relaciones = signal<Relacion[]>([]);
  paginacion = signal<PaginacionAnidada<Relacion>['meta'] | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);
  pagina = signal(1);
  filtroEstado = signal<EstadoRelacion | 'todas'>('todas');

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    const filtro = this.filtroEstado();
    const estado = filtro === 'todas' ? undefined : filtro;

    this.relacionService.listar(this.pagina(), estado).subscribe({
      next: (res) => {
        this.paginacion.set(res.data?.meta ?? null);
        this.relaciones.set(res.data?.data ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar tus cortes.');
        this.cargando.set(false);
      }
    });
  }

  cambiarFiltro(estado: EstadoRelacion | 'todas'): void {
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

  irADetalle(id: number): void {
    this.router.navigate(['/distribuidora/relaciones', id]);
  }
}
