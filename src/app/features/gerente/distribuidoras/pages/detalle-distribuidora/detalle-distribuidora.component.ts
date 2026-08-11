import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DistribuidoraService } from '../../services/distribuidora.service';
import { DistribuidoraResumen, EstadoDistribuidora } from '../../../../../core/models/distribuidora.model';

@Component({
  selector: 'app-detalle-distribuidora',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './detalle-distribuidora.component.html',
  styleUrl: './detalle-distribuidora.component.css'
})
export class DetalleDistribuidoraComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private distribuidoraService = inject(DistribuidoraService);

  distribuidora = signal<DistribuidoraResumen | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);

  cambiandoEstado = signal(false);
  errorEstado = signal<string | null>(null);

  estadosDisponibles: EstadoDistribuidora[] = ['ACTIVO', 'MOROSO', 'RECHAZADO'];

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarDistribuidora(id);
  }

  cargarDistribuidora(id: number): void {
    this.cargando.set(true);
    this.error.set(null);

    this.distribuidoraService.detalle(id).subscribe({
      next: (data) => {
        this.distribuidora.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la distribuidora.');
        this.cargando.set(false);
      }
    });
  }

  cambiarEstado(nuevoEstado: EstadoDistribuidora): void {
    const d = this.distribuidora();
    if (!d || d.estado === nuevoEstado) return;

    const motivo = prompt(`Motivo del cambio a "${nuevoEstado}" (opcional):`) || undefined;

    this.cambiandoEstado.set(true);
    this.errorEstado.set(null);

    this.distribuidoraService.cambiarEstado(d.id, nuevoEstado, motivo).subscribe({
      next: (res) => {
        this.cambiandoEstado.set(false);
        this.distribuidora.set(res.data);
      },
      error: (err) => {
        this.cambiandoEstado.set(false);
        this.errorEstado.set(
          err.status === 403
            ? 'No tienes permiso para hacer este cambio de estado.'
            : err.error?.message || 'Ocurrió un error al cambiar el estado.'
        );
      }
    });
  }

  volver(): void {
    this.router.navigate(['/gerente/distribuidoras']);
  }
}
