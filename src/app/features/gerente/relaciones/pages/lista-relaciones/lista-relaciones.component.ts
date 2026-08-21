import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { RelacionService } from '../../services/relacion.service';
import { EstadoRelacion, Relacion } from '../../../../../core/models/relacion.model';
import { PaginacionAnidada } from '../../../../../core/models/paginacion-anidada.model';
import { AuthService } from '../../../../auth/services/auth.service';

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
  private authService = inject(AuthService);

  /** POST /relaciones/generar solo lo permite el backend a Gerente General; Gerente de
   * Sucursal comparte este mismo módulo /gerente pero no debe ver el botón, o le sale un
   * 403 sin explicación al pulsarlo. */
  puedeGenerarCortes = computed(() => this.authService.userRole() === 'Gerente General');

  relaciones = signal<Relacion[]>([]);
  paginacion = signal<PaginacionAnidada<Relacion>['meta'] | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);
  pagina = signal(1);
  filtroEstado = signal<EstadoRelacion | 'todas'>('todas');

  generando = signal(false);
  errorGenerar = signal<string | null>(null);
  successGenerar = signal<string | null>(null);
  erroresGenerar = signal<string[]>([]);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    const estado = this.filtroEstado() === 'todas' ? undefined : this.filtroEstado();

    this.relacionService.listar(this.pagina(), estado).subscribe({
      next: (res) => {
        this.paginacion.set(res.data?.meta ?? null);
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
    this.erroresGenerar.set([]);

    this.relacionService.generar().subscribe({
      next: (res) => {
        this.generando.set(false);
        this.successGenerar.set(res.message || 'Cortes generados.');
        this.erroresGenerar.set(res.data?.errores ?? []);
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
