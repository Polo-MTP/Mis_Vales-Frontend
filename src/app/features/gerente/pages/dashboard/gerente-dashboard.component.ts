import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../auth/services/auth.service';
import { SolicitudService } from '../../alta-proveedor/services/solicitud.service';

// Debe coincidir con el tamaño de página por defecto del backend (Model::$perPage).
const PER_PAGE = 15;

interface Estadistica {
  total: number;
  hayMas: boolean;
}

@Component({
  selector: 'app-gerente-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './gerente-dashboard.component.html',
  styleUrl: './gerente-dashboard.component.css'
})
export class GerenteDashboardComponent implements OnInit {
  authService = inject(AuthService);
  private solicitudService = inject(SolicitudService);

  cargandoStats = signal(true);
  porAprobar = signal<Estadistica>({ total: 0, hayMas: false });
  aprobadas = signal<Estadistica>({ total: 0, hayMas: false });
  rechazadas = signal<Estadistica>({ total: 0, hayMas: false });

  ngOnInit(): void {
    this.authService.fetchCurrentUser().subscribe({
      next: () => this.cargarEstadisticas(),
      error: () => this.cargarEstadisticas()
    });
  }

  formato(e: Estadistica): string {
    return `${e.total}${e.hayMas ? '+' : ''}`;
  }

  private cargarEstadisticas(): void {
    forkJoin({
      verificado: this.solicitudService.listar('verificado'),
      aprobado: this.solicitudService.listar('aprobado'),
      rechazado: this.solicitudService.listar('rechazado')
    }).subscribe({
      next: ({ verificado, aprobado, rechazado }) => {
        const ver = verificado.data ?? [];
        const apr = aprobado.data ?? [];
        const rech = rechazado.data ?? [];

        this.porAprobar.set({ total: ver.length, hayMas: ver.length === PER_PAGE });
        this.aprobadas.set({ total: apr.length, hayMas: apr.length === PER_PAGE });
        this.rechazadas.set({ total: rech.length, hayMas: rech.length === PER_PAGE });
        this.cargandoStats.set(false);
      },
      error: () => this.cargandoStats.set(false)
    });
  }
}
