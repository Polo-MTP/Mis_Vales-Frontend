import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DistribuidoraService } from '../../services/distribuidora.service';
import { DistribuidoraResumen, EstadoDistribuidora } from '../../../../../core/models/distribuidora.model';
import { DineroPipe } from '../../../../../shared/pipes/dinero.pipe';

@Component({
  selector: 'app-lista-distribuidoras',
  standalone: true,
  imports: [CommonModule, RouterModule, DineroPipe],
  templateUrl: './lista-distribuidoras.component.html',
  styleUrl: './lista-distribuidoras.component.css'
})
export class ListaDistribuidorasComponent implements OnInit {
  private distribuidoraService = inject(DistribuidoraService);
  private router = inject(Router);

  todas = signal<DistribuidoraResumen[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  filtroEstado = signal<EstadoDistribuidora | 'todos'>('todos');

  distribuidoras = computed(() => {
    const filtro = this.filtroEstado();
    return filtro === 'todos' ? this.todas() : this.todas().filter((d) => d.estado === filtro);
  });

  ngOnInit(): void {
    this.cargarDistribuidoras();
  }

  cargarDistribuidoras(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.distribuidoraService.listar().subscribe({
      next: (data) => {
        this.todas.set(data ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las distribuidoras.');
        this.cargando.set(false);
      }
    });
  }

  cambiarFiltro(estado: EstadoDistribuidora | 'todos'): void {
    this.filtroEstado.set(estado);
  }

  irADetalle(id: number): void {
    this.router.navigate(['/gerente/distribuidoras', id]);
  }
}
