import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SolicitudService } from '../../services/solicitud.service';
import { EstadoSolicitud, SolicitudProveedor } from '../../../../../core/models/solicitud-proveedor.model';

@Component({
  selector: 'app-lista-solicitudes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-solicitudes.component.html',
  styleUrl: './lista-solicitudes.component.css'
})
export class ListaSolicitudesComponent implements OnInit {
  private solicitudService = inject(SolicitudService);
  private router = inject(Router);

  solicitudes = signal<SolicitudProveedor[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  filtroEstado = signal<EstadoSolicitud>('verificado');

  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  cargarSolicitudes(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.solicitudService.listar(this.filtroEstado()).subscribe({
      next: (res) => {
        this.solicitudes.set(res.data ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las solicitudes.');
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
    this.router.navigate(['/gerente/solicitudes', id]);
  }
}
