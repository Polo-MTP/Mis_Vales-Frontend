import { EstadoBadgeComponent } from '../../../../../shared/components/estado-badge/estado-badge.component';
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DistribuidoraService } from '../../services/distribuidora.service';
import { CategoriaDistribuidoraService } from '../../services/categoria-distribuidora.service';
import { ActualizarDistribuidoraPayload, CategoriaDistribuidora, DistribuidoraResumen, EstadoDistribuidora, HistorialEstadoDistribuidora } from '../../../../../core/models/distribuidora.model';
import { PuntoMovimiento } from '../../../../../core/models/punto-movimiento.model';
import { UsuarioService } from '../../../../../core/services/usuario.service';
import { User } from '../../../../../core/models/user.model';
import { DineroPipe } from '../../../../../shared/pipes/dinero.pipe';
import { RelacionService } from '../../../relaciones/services/relacion.service';
import { ReporteService } from '../../../reportes/services/reporte.service';
import { Relacion } from '../../../../../core/models/relacion.model';

@Component({
  selector: 'app-detalle-distribuidora',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule, DineroPipe, EstadoBadgeComponent],
  templateUrl: './detalle-distribuidora.component.html',
  styleUrl: './detalle-distribuidora.component.css'
})
export class DetalleDistribuidoraComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private distribuidoraService = inject(DistribuidoraService);
  private categoriaService = inject(CategoriaDistribuidoraService);
  private usuarioService = inject(UsuarioService);
  private relacionService = inject(RelacionService);
  private reporteService = inject(ReporteService);

  distribuidora = signal<DistribuidoraResumen | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);

  cambiandoEstado = signal(false);
  errorEstado = signal<string | null>(null);

  categorias = signal<CategoriaDistribuidora[]>([]);
  guardandoCredito = signal(false);
  errorCredito = signal<string | null>(null);
  successCredito = signal<string | null>(null);

  estadosDisponibles: EstadoDistribuidora[] = ['ACTIVO', 'MOROSO', 'RECHAZADO'];

  historialPuntos = signal<PuntoMovimiento[]>([]);
  cargandoHistorialPuntos = signal(false);
  mostrarHistorialPuntos = signal(false);

  archivoContrato = signal<File | null>(null);
  subiendoContrato = signal(false);
  errorContrato = signal<string | null>(null);

  historialEstado = signal<HistorialEstadoDistribuidora[]>([]);
  cargandoHistorialEstado = signal(false);
  mostrarHistorialEstado = signal(false);

  coordinadores = signal<User[]>([]);
  editandoInfo = signal(false);
  guardandoInfo = signal(false);
  errorInfo = signal<string | null>(null);

  // Reporte de pagos por quincena (Excel) -- "hasta qué corte" lo elige el gerente de entre
  // los cortes más recientes de esta distribuidora.
  cortesDisponibles = signal<Relacion[]>([]);
  cargandoCortes = signal(false);
  hastaRelacionId = signal<number | null>(null);
  descargandoReporte = signal(false);
  errorReporte = signal<string | null>(null);

  creditoForm = this.fb.group({
    limite_credito: ['', [Validators.required, Validators.min(0)]],
    categoria_id: ['', [Validators.required]]
  });

  /**
   * rfc solo exige required+maxLength (no el size:13 exacto del backend): hay distribuidoras
   * sembradas con RFC de 12 caracteres, y forzar el formato aquí bloquearía guardar cualquier
   * OTRO cambio (ej. coordinador) mientras no "arreglen" ese dato viejo. Igual que en
   * detalle-verificacion.component.ts, solo se manda al backend lo que realmente cambió
   * (ver soloCambios en guardarInfo), así que un rfc heredado e inválido que nadie tocó nunca
   * se reenvía y nunca dispara el error del backend.
   *
   * Los datos personales (nombre, apellidos, fecha/lugar de nacimiento) NO se editan desde
   * aquí -- esta pantalla es de gerencia, no del flujo de verificación de identidad; editarlos
   * fuera de ese flujo no queda auditado contra una identificación real.
   */
  infoForm = this.fb.group({
    rfc: ['', [Validators.required, Validators.maxLength(13)]],
    coordinador_id: ['', [Validators.required]],
    comentarios_verificador: ['']
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarDistribuidora(id);

    this.categoriaService.listar().subscribe({
      next: (res) => this.categorias.set(res.data ?? []),
      error: () => this.categorias.set([])
    });

    this.usuarioService.listar('Coordinador').subscribe({
      next: (res) => this.coordinadores.set(res.data ?? []),
      error: () => this.coordinadores.set([])
    });
  }

  cargarDistribuidora(id: number): void {
    this.cargando.set(true);
    this.error.set(null);

    this.distribuidoraService.detalle(id).subscribe({
      next: (data) => {
        this.distribuidora.set(data);
        this.cargando.set(false);

        this.creditoForm.patchValue({
          limite_credito: String(data.limite_credito ?? ''),
          categoria_id: data.categoria ? String(data.categoria.id) : ''
        });

        this.infoForm.patchValue({
          rfc: data.rfc ?? '',
          coordinador_id: data.coordinador?.id ? String(data.coordinador.id) : '',
          comentarios_verificador: data.comentarios_verificador ?? ''
        });

        this.cargarCortesDisponibles(id);
      },
      error: () => {
        this.error.set('No se pudo cargar la distribuidora.');
        this.cargando.set(false);
      }
    });
  }

  private cargarCortesDisponibles(distribuidoraId: number): void {
    this.cargandoCortes.set(true);
    this.relacionService.listar(1, undefined, distribuidoraId).subscribe({
      next: (res) => {
        const cortes = res.data?.data ?? [];
        this.cortesDisponibles.set(cortes);
        // Por defecto, "hasta el corte más reciente" -- lo más común al pedir el reporte.
        this.hastaRelacionId.set(cortes[0]?.id ?? null);
        this.cargandoCortes.set(false);
      },
      error: () => this.cargandoCortes.set(false)
    });
  }

  descargarReportePagos(): void {
    const d = this.distribuidora();
    if (!d) return;

    this.descargandoReporte.set(true);
    this.errorReporte.set(null);

    this.reporteService.pagosQuincena(d.id, this.hastaRelacionId() ?? undefined).subscribe({
      next: (blob) => {
        this.descargandoReporte.set(false);
        const url = URL.createObjectURL(blob);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = `pagos-${d.numero_distribuidora ?? d.id}.xlsx`;
        enlace.click();
        URL.revokeObjectURL(url);
      },
      error: () => {
        this.descargandoReporte.set(false);
        this.errorReporte.set('No se pudo generar el reporte. Intenta de nuevo.');
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

  onSubmitCredito(): void {
    const d = this.distribuidora();
    if (!d || this.creditoForm.invalid) {
      this.creditoForm.markAllAsTouched();
      return;
    }

    this.guardandoCredito.set(true);
    this.errorCredito.set(null);
    this.successCredito.set(null);

    const val = this.creditoForm.value;

    this.distribuidoraService.asignarCredito(d.id, Number(val.limite_credito), Number(val.categoria_id)).subscribe({
      next: (res) => {
        this.guardandoCredito.set(false);
        this.distribuidora.set(res.data);
        this.successCredito.set('Crédito asignado exitosamente.');
      },
      error: (err) => {
        this.guardandoCredito.set(false);
        this.errorCredito.set(
          err.status === 403
            ? 'No tienes permiso para asignar crédito a esta distribuidora.'
            : err.error?.message || 'Ocurrió un error al asignar el crédito.'
        );
      }
    });
  }

  toggleEditarInfo(): void {
    this.editandoInfo.update((v) => !v);
    this.errorInfo.set(null);
  }

  guardarInfo(): void {
    const d = this.distribuidora();
    if (!d || this.infoForm.invalid) {
      this.infoForm.markAllAsTouched();
      return;
    }

    this.guardandoInfo.set(true);
    this.errorInfo.set(null);

    const val = this.infoForm.value;

    const payload: ActualizarDistribuidoraPayload = {};
    if (val.rfc !== d.rfc) payload.rfc = val.rfc!;
    if (Number(val.coordinador_id) !== d.coordinador?.id) payload.coordinador_id = Number(val.coordinador_id);
    if ((val.comentarios_verificador || null) !== (d.comentarios_verificador || null)) {
      payload.comentarios_verificador = val.comentarios_verificador || null;
    }

    if (Object.keys(payload).length === 0) {
      this.guardandoInfo.set(false);
      this.editandoInfo.set(false);
      return;
    }

    this.distribuidoraService
      .actualizar(d.id, payload)
      .subscribe({
        next: (data) => {
          this.guardandoInfo.set(false);
          this.distribuidora.set(data);
          this.editandoInfo.set(false);
        },
        error: (err) => {
          this.guardandoInfo.set(false);
          if (err.status === 403) {
            this.errorInfo.set('No tienes permiso para editar esta distribuidora.');
            return;
          }
          const primerError = Object.values(err.error?.errors ?? {})[0] as string[] | undefined;
          this.errorInfo.set(primerError?.[0] || err.error?.message || 'Ocurrió un error al guardar los cambios.');
        }
      });
  }

  toggleHistorialPuntos(): void {
    const mostrar = !this.mostrarHistorialPuntos();
    this.mostrarHistorialPuntos.set(mostrar);

    const d = this.distribuidora();
    if (mostrar && d && this.historialPuntos().length === 0) {
      this.cargandoHistorialPuntos.set(true);
      this.distribuidoraService.historialPuntos(d.id).subscribe({
        next: (res) => {
          this.historialPuntos.set(res.data?.data ?? []);
          this.cargandoHistorialPuntos.set(false);
        },
        error: () => this.cargandoHistorialPuntos.set(false)
      });
    }
  }

  toggleHistorialEstado(): void {
    const mostrar = !this.mostrarHistorialEstado();
    this.mostrarHistorialEstado.set(mostrar);

    const d = this.distribuidora();
    if (mostrar && d && this.historialEstado().length === 0) {
      this.cargandoHistorialEstado.set(true);
      this.distribuidoraService.historialEstado(d.id).subscribe({
        next: (res) => {
          this.historialEstado.set(res.data ?? []);
          this.cargandoHistorialEstado.set(false);
        },
        error: () => this.cargandoHistorialEstado.set(false)
      });
    }
  }

  onArchivoContratoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.archivoContrato.set(input.files?.[0] ?? null);
  }

  subirContrato(): void {
    const d = this.distribuidora();
    const archivo = this.archivoContrato();
    if (!d || !archivo) return;

    this.subiendoContrato.set(true);
    this.errorContrato.set(null);

    this.distribuidoraService.subirContrato(d.id, archivo).subscribe({
      next: (res) => {
        this.subiendoContrato.set(false);
        this.distribuidora.set(res.data);
        this.archivoContrato.set(null);
      },
      error: (err) => {
        this.subiendoContrato.set(false);
        this.errorContrato.set(err.error?.message || 'Ocurrió un error al subir el contrato.');
      }
    });
  }

  volver(): void {
    this.router.navigate(['/gerente/distribuidoras']);
  }
}
