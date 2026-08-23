import { EstadoBadgeComponent } from '../../../../../shared/components/estado-badge/estado-badge.component';
import { DineroPipe } from '../../../../../shared/pipes/dinero.pipe';
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { ValeService } from '../../../../cajera/vales/services/vale.service';
import { Vale, EstadoVale } from '../../../../../core/models/vale.model';
import { PaginatedResponse } from '../../../../../core/models/user.model';

/**
 * Solo lectura -- Coordinador y Gerente (General/Sucursal) ya tenían acceso de backend a
 * GET /vales (mismos roles que Cajera), pero no había ninguna pantalla que lo consumiera.
 * Sin validar()/autorizar() a propósito: esas acciones son exclusivas de Cajera en el backend.
 */
@Component({
  selector: 'app-consultar-vales',
  standalone: true,
  imports: [CommonModule, PaginationComponent, DineroPipe, EstadoBadgeComponent],
  templateUrl: './consultar-vales.component.html'
})
export class ConsultarValesComponent implements OnInit {
  private valeService = inject(ValeService);

  vales = signal<Vale[]>([]);
  paginacion = signal<PaginatedResponse<Vale> | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);
  pagina = signal(1);
  filtroEstado = signal<EstadoVale | 'todos'>('todos');


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

  cambiarPagina(nuevaPagina: number): void {
    const p = this.paginacion();
    if (!p) return;
    if (nuevaPagina < 1 || nuevaPagina > p.last_page) return;
    this.pagina.set(nuevaPagina);
    this.cargar();
  }
}
