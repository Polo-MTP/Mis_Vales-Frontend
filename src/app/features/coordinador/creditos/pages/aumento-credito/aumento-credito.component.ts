import { DineroPipe } from '../../../../../shared/pipes/dinero.pipe';
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SolicitudAumentoCreditoService } from '../../../../gerente/distribuidoras/services/solicitud-aumento-credito.service';
import { SolicitudAumentoCredito } from '../../../../../core/models/solicitud-aumento-credito.model';

/**
 * Solo lectura -- el Coordinador ya tenía acceso de backend a GET /distribuidoras/aumento-credito
 * (ve las solicitudes de su cartera), pero decidir() sigue siendo exclusivo de Gerente. Sin
 * botones de aprobar/rechazar a propósito.
 */
@Component({
  selector: 'app-coordinador-aumento-credito',
  standalone: true,
  imports: [CommonModule, DineroPipe],
  templateUrl: './aumento-credito.component.html'
})
export class AumentoCreditoComponent implements OnInit {
  private solicitudAumentoCreditoService = inject(SolicitudAumentoCreditoService);

  solicitudes = signal<SolicitudAumentoCredito[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.solicitudAumentoCreditoService.pendientes().subscribe({
      next: (res) => {
        this.solicitudes.set(res.data?.data ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las solicitudes de aumento de crédito.');
        this.cargando.set(false);
      }
    });
  }
}
