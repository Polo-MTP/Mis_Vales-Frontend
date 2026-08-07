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
  selector: 'app-coordinador-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './coordinador-dashboard.component.html',
  styleUrl: './coordinador-dashboard.component.css'
})
export class CoordinadorDashboardComponent implements OnInit {
  authService = inject(AuthService);
  private solicitudService = inject(SolicitudService);

  cargandoStats = signal(true);
  enProceso = signal<Estadistica>({ total: 0, hayMas: false });
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
    const coordinadorId = this.authService.currentUser()?.id;

    if (!coordinadorId) {
      this.cargandoStats.set(false);
      return;
    }

    forkJoin({
      pendientes: this.solicitudService.contarPorEstado('pendiente_verificacion', coordinadorId),
      enVerificacion: this.solicitudService.contarPorEstado('en_verificacion', coordinadorId),
      aprobado: this.solicitudService.contarPorEstado('aprobado', coordinadorId),
      rechazado: this.solicitudService.contarPorEstado('rechazado', coordinadorId)
    }).subscribe({
      next: ({ pendientes, enVerificacion, aprobado, rechazado }) => {
        const pend = pendientes.data ?? [];
        const enVer = enVerificacion.data ?? [];
        const apr = aprobado.data ?? [];
        const rech = rechazado.data ?? [];

        this.enProceso.set({
          total: pend.length + enVer.length,
          hayMas: pend.length === PER_PAGE || enVer.length === PER_PAGE
        });
        this.aprobadas.set({ total: apr.length, hayMas: apr.length === PER_PAGE });
        this.rechazadas.set({ total: rech.length, hayMas: rech.length === PER_PAGE });
        this.cargandoStats.set(false);
      },
      error: () => this.cargandoStats.set(false)
    });
  }
}
