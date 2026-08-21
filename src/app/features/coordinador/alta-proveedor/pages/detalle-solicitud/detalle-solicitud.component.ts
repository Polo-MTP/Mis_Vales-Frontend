import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SolicitudService } from '../../services/solicitud.service';
import { SolicitudProveedor } from '../../../../../core/models/solicitud-proveedor.model';

@Component({
  selector: 'app-detalle-solicitud',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalle-solicitud.component.html',
  styleUrl: './detalle-solicitud.component.css'
})
export class DetalleSolicitudComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private solicitudService = inject(SolicitudService);

  solicitud = signal<SolicitudProveedor | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.cargar(id);
  }

  cargar(id: number): void {
    this.cargando.set(true);
    this.error.set(null);

    this.solicitudService.detalle(id).subscribe({
      next: (res) => {
        this.solicitud.set(res.data ?? null);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(
          err.status === 403
            ? 'No puedes ver esta solicitud.'
            : 'No se pudo cargar el expediente.'
        );
        this.cargando.set(false);
      }
    });
  }

  volver(): void {
    this.router.navigate(['/coordinador/solicitudes']);
  }
}
