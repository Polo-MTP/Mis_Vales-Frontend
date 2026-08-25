import { DineroPipe } from '../../../../../shared/pipes/dinero.pipe';
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SolicitudReembolsoExcedenteService } from '../../services/solicitud-reembolso-excedente.service';
import { SolicitudReembolsoExcedente } from '../../../../../core/models/solicitud-reembolso-excedente.model';

@Component({
  selector: 'app-reembolso-excedente-pendientes',
  standalone: true,
  imports: [CommonModule, FormsModule, DineroPipe],
  templateUrl: './reembolso-excedente-pendientes.component.html',
  styleUrl: './reembolso-excedente-pendientes.component.css'
})
export class ReembolsoExcedentePendientesComponent implements OnInit {
  private solicitudReembolsoExcedenteService = inject(SolicitudReembolsoExcedenteService);

  solicitudes = signal<SolicitudReembolsoExcedente[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  decidiendo = signal<number | null>(null);
  errorDecidir = signal<string | null>(null);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.solicitudReembolsoExcedenteService.pendientes().subscribe({
      next: (res) => {
        this.solicitudes.set(res.data?.data ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las solicitudes de reembolso de excedente.');
        this.cargando.set(false);
      }
    });
  }

  aprobar(solicitud: SolicitudReembolsoExcedente): void {
    this.decidir(solicitud, 'aprobada');
  }

  rechazar(solicitud: SolicitudReembolsoExcedente): void {
    const comentario = prompt('Motivo del rechazo (opcional):') || undefined;
    this.decidir(solicitud, 'rechazada', comentario);
  }

  private decidir(solicitud: SolicitudReembolsoExcedente, decision: 'aprobada' | 'rechazada', comentario?: string): void {
    this.decidiendo.set(solicitud.id);
    this.errorDecidir.set(null);

    this.solicitudReembolsoExcedenteService.decidir(solicitud.id, decision, comentario).subscribe({
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
