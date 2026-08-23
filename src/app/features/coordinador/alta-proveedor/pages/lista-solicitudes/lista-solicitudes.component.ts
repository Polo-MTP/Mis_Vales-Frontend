import { EstadoBadgeComponent } from '../../../../../shared/components/estado-badge/estado-badge.component';
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SolicitudService } from '../../services/solicitud.service';
import { EstadoSolicitud, SolicitudProveedor } from '../../../../../core/models/solicitud-proveedor.model';
import { AuthService } from '../../../../auth/services/auth.service';

// Debe coincidir con el tamaño de página por defecto de Laravel (Model::$perPage) en el backend.
const PER_PAGE = 15;

type FiltroEstado = 'en_proceso' | 'aprobado' | 'rechazado';

@Component({
  selector: 'app-lista-solicitudes',
  standalone: true,
  imports: [CommonModule, EstadoBadgeComponent],
  templateUrl: './lista-solicitudes.component.html',
  styleUrl: './lista-solicitudes.component.css'
})
export class ListaSolicitudesComponent implements OnInit {
  private solicitudService = inject(SolicitudService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private readonly ESTADOS_EN_PROCESO: EstadoSolicitud[] = ['pendiente_verificacion', 'en_verificacion', 'verificado'];

  solicitudes = signal<SolicitudProveedor[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  filtro = signal<FiltroEstado>('en_proceso');

  pagina = signal(1);
  hayPaginaSiguiente = signal(false);

  ngOnInit(): void {
    const filtroInicial = this.route.snapshot.queryParamMap.get('filtro') as FiltroEstado | null;
    if (filtroInicial === 'en_proceso' || filtroInicial === 'aprobado' || filtroInicial === 'rechazado') {
      this.filtro.set(filtroInicial);
    }
    this.cargar();
  }

  cargar(): void {
    const coordinadorId = this.authService.currentUser()?.id;
    if (!coordinadorId) return;

    this.cargando.set(true);
    this.error.set(null);

    // "En proceso" agrupa 3 estados del backend; como el endpoint solo filtra por un
    // valor exacto a la vez, se pide sin filtro de estado y se filtra aquí para ese caso.
    const estadoFiltro = this.filtro() === 'en_proceso' ? undefined : this.filtro();

    this.solicitudService.listar(coordinadorId, estadoFiltro, this.pagina()).subscribe({
      next: (res) => {
        let items = res.data ?? [];
        if (this.filtro() === 'en_proceso') {
          items = items.filter((s) => this.ESTADOS_EN_PROCESO.includes(s.estado));
        }
        this.solicitudes.set(items);
        this.hayPaginaSiguiente.set((res.data ?? []).length === PER_PAGE);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar tus solicitudes.');
        this.cargando.set(false);
      }
    });
  }

  cambiarFiltro(filtro: FiltroEstado): void {
    if (this.filtro() !== filtro) {
      this.filtro.set(filtro);
      this.pagina.set(1);
      this.cargar();
    }
  }

  paginaSiguiente(): void {
    if (!this.hayPaginaSiguiente()) return;
    this.pagina.set(this.pagina() + 1);
    this.cargar();
  }

  paginaAnterior(): void {
    if (this.pagina() <= 1) return;
    this.pagina.set(this.pagina() - 1);
    this.cargar();
  }

  irADetalle(id: number): void {
    this.router.navigate(['/coordinador/solicitudes', id]);
  }
}
