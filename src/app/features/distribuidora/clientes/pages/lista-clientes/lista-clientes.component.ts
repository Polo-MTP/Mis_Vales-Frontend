import { EstadoBadgeComponent } from '../../../../../shared/components/estado-badge/estado-badge.component';
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ClienteService } from '../../services/cliente.service';
import { Cliente } from '../../../../../core/models/cliente.model';
import { PaginatedResponse } from '../../../../../core/models/user.model';

@Component({
  selector: 'app-lista-clientes',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, PaginationComponent, EstadoBadgeComponent],
  templateUrl: './lista-clientes.component.html',
  styleUrl: './lista-clientes.component.css'
})
export class ListaClientesComponent implements OnInit {
  private clienteService = inject(ClienteService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  clientes = signal<Cliente[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  errorAccion = signal<string | null>(null);
  paginacion = signal<PaginatedResponse<Cliente> | null>(null);

  pagina = signal(1);
  filtroEstado = signal<'todos' | 'activos' | 'inactivos'>('todos');

  buscarControl = this.fb.control('');

  ngOnInit(): void {
    this.cargarClientes();

    this.buscarControl.valueChanges.pipe(debounceTime(400), distinctUntilChanged()).subscribe(() => {
      this.pagina.set(1);
      this.cargarClientes();
    });
  }

  cargarClientes(): void {
    this.cargando.set(true);
    this.error.set(null);

    const estado = this.filtroEstado() === 'todos' ? undefined : this.filtroEstado() === 'activos';
    const search = this.buscarControl.value?.trim() || undefined;

    this.clienteService.listar(this.pagina(), search, estado).subscribe({
      next: (res) => {
        this.paginacion.set(res.data ?? null);
        this.clientes.set(res.data?.data ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar tus clientes.');
        this.cargando.set(false);
      }
    });
  }

  cambiarFiltro(estado: 'todos' | 'activos' | 'inactivos'): void {
    if (this.filtroEstado() !== estado) {
      this.filtroEstado.set(estado);
      this.pagina.set(1);
      this.cargarClientes();
    }
  }

    cambiarPagina(nuevaPagina: number): void {
    const p = this.paginacion();
    if (!p) return;
    if (nuevaPagina < 1 || nuevaPagina > p.last_page) return;
    this.pagina.set(nuevaPagina);
    this.cargarClientes();
  }

  toggleEstado(cliente: Cliente, event: MouseEvent): void {
    event.stopPropagation();
    this.errorAccion.set(null);

    this.clienteService.cambiarEstado(cliente.id, !cliente.estado).subscribe({
      next: () => this.cargarClientes(),
      error: (err) => this.errorAccion.set(err.error?.message || 'No se pudo cambiar el estado del cliente.')
    });
  }

  irADetalle(id: number): void {
    this.router.navigate(['/distribuidora/clientes', id]);
  }
}
