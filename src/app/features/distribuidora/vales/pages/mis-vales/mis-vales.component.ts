import { DineroPipe } from '../../../../../shared/pipes/dinero.pipe';
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { RouterModule } from '@angular/router';
import { ValeService } from '../../services/vale.service';
import { Vale } from '../../../../../core/models/vale.model';
import { PaginatedResponse } from '../../../../../core/models/user.model';
import { estadoValeLabel } from '../../../../../shared/utils/labels';

@Component({
  selector: 'app-mis-vales',
  standalone: true,
  imports: [CommonModule, RouterModule, PaginationComponent, DineroPipe],
  templateUrl: './mis-vales.component.html',
  styleUrl: './mis-vales.component.css'
})
export class MisValesComponent implements OnInit {
  private valeService = inject(ValeService);

  vales = signal<Vale[]>([]);
  paginacion = signal<PaginatedResponse<Vale> | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);
  pagina = signal(1);

  actualizandoEstado = signal<number | null>(null);
  errorEstado = signal<string | null>(null);

  readonly estadoValeLabel = estadoValeLabel;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.valeService.listar(this.pagina()).subscribe({
      next: (res) => {
        this.paginacion.set(res.data ?? null);
        this.vales.set(res.data?.data ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar tus vales.');
        this.cargando.set(false);
      }
    });
  }

    cambiarPagina(nuevaPagina: number): void {
    const p = this.paginacion();
    if (!p) return;
    if (nuevaPagina < 1 || nuevaPagina > p.last_page) return;
    this.pagina.set(nuevaPagina);
    this.cargar();
  }

  toggleActivo(vale: Vale): void {
    this.actualizandoEstado.set(vale.id);
    this.errorEstado.set(null);

    const accion = vale.activo ? this.valeService.desactivar(vale.id) : this.valeService.activar(vale.id);

    accion.subscribe({
      next: () => {
        this.actualizandoEstado.set(null);
        this.cargar();
      },
      error: (err) => {
        this.actualizandoEstado.set(null);
        this.errorEstado.set(err.error?.message || 'Ocurrió un error al actualizar el vale.');
      }
    });
  }
}
