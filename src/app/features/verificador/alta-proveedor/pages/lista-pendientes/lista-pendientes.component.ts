import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { VerificacionService } from '../../services/verificacion.service';
import { SolicitudProveedor, EstadoSolicitud } from '../../../../../core/models/solicitud-proveedor.model';

@Component({
  selector: 'app-lista-pendientes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-pendientes.component.html',
  styleUrl: './lista-pendientes.component.css'
})
export class ListaPendientesComponent implements OnInit {
  private verificacionService = inject(VerificacionService);
  private router = inject(Router);

  // Estado con Signals (Angular 19)
  solicitudes = signal<SolicitudProveedor[]>([]);
  cargando = signal<boolean>(true);
  error = signal<string | null>(null);
  filtroEstado = signal<EstadoSolicitud>('pendiente_verificacion');

  ngOnInit(): void {
    this.cargarSolicitudes();
  }

cargarSolicitudes(): void {
  this.cargando.set(true);
  this.error.set(null);

  this.verificacionService.obtenerSolicitudesPendientes(this.filtroEstado()).subscribe({
    next: (res: any) => {
      // Extrae la lista sea un array directo o una respuesta paginada de Laravel
      const items = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
      this.solicitudes.set(items);
      this.cargando.set(false);
    },
    error: (err) => {
      console.error('Error al obtener solicitudes:', err);
      this.error.set('No se pudieron cargar las solicitudes de inspección.');
      this.cargando.set(false);
    }
  });
}
  cambiarFiltro(estado: EstadoSolicitud): void {
    if (this.filtroEstado() !== estado) {
      this.filtroEstado.set(estado);
      this.cargarSolicitudes();
    }
  }

  irADetalle(id: number): void {
    this.router.navigate(['/verificador/alta-proveedor/verificar', id]);
  }
}