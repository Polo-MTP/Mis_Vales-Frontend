import { EstadoBadgeComponent } from '../../../../../shared/components/estado-badge/estado-badge.component';
import { DineroPipe } from '../../../../../shared/pipes/dinero.pipe';
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DistribuidoraService } from '../../../../gerente/distribuidoras/services/distribuidora.service';
import { DistribuidoraResumen } from '../../../../../core/models/distribuidora.model';

/** Solo lectura -- ver "Personal y Sucursales" y "vales" en el resto del código: escritura
 *  (cambiar estado, asignar crédito, subir contrato) sigue siendo exclusiva de Gerente. */
@Component({
  selector: 'app-verificador-detalle-distribuidora',
  standalone: true,
  imports: [CommonModule, RouterModule, DineroPipe, EstadoBadgeComponent],
  templateUrl: './detalle-distribuidora.component.html'
})
export class DetalleDistribuidoraComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private distribuidoraService = inject(DistribuidoraService);

  distribuidora = signal<DistribuidoraResumen | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
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

  volver(): void {
    this.router.navigate(['/verificador/distribuidoras']);
  }
}
