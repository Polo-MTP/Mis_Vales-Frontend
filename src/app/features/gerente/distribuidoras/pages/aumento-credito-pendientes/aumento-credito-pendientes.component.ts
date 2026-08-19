import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SolicitudAumentoCreditoService } from '../../services/solicitud-aumento-credito.service';
import { SolicitudAumentoCredito } from '../../../../../core/models/solicitud-aumento-credito.model';

@Component({
  selector: 'app-aumento-credito-pendientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './aumento-credito-pendientes.component.html',
  styleUrl: './aumento-credito-pendientes.component.css'
})
export class AumentoCreditoPendientesComponent implements OnInit {
  private solicitudAumentoCreditoService = inject(SolicitudAumentoCreditoService);

  solicitudes = signal<SolicitudAumentoCredito[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  montosOtorgados: Record<number, number | null> = {};

  decidiendo = signal<number | null>(null);
  errorDecidir = signal<string | null>(null);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.solicitudAumentoCreditoService.pendientes().subscribe({
      next: (res) => {
        const solicitudes = res.data?.data ?? [];
        this.solicitudes.set(solicitudes);
        solicitudes.forEach((s) => (this.montosOtorgados[s.id] = s.monto_solicitado));
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las solicitudes de aumento de crédito.');
        this.cargando.set(false);
      }
    });
  }

  aprobar(solicitud: SolicitudAumentoCredito): void {
    const monto = this.montosOtorgados[solicitud.id];
    if (!monto || monto <= 0) {
      this.errorDecidir.set('Captura el monto a otorgar.');
      return;
    }
    this.decidir(solicitud, 'aprobada', monto);
  }

  rechazar(solicitud: SolicitudAumentoCredito): void {
    const comentario = prompt('Motivo del rechazo (opcional):') || undefined;
    this.decidir(solicitud, 'rechazada', undefined, comentario);
  }

  private decidir(solicitud: SolicitudAumentoCredito, decision: 'aprobada' | 'rechazada', montoOtorgado?: number, comentario?: string): void {
    this.decidiendo.set(solicitud.id);
    this.errorDecidir.set(null);

    this.solicitudAumentoCreditoService.decidir(solicitud.id, decision, montoOtorgado, comentario).subscribe({
      next: () => {
        this.decidiendo.set(null);
        this.cargar();
      },
      error: (err) => {
        this.decidiendo.set(null);
        this.errorDecidir.set(err.error?.message || 'Ocurrió un error al registrar la decisión.');
      }
    });
  }
}
