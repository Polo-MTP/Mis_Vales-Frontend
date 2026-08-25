import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SolicitudService } from '../../services/solicitud.service';
import { CrearSolicitudProveedorPayload, Evidencia, SolicitudProveedor } from '../../../../../core/models/solicitud-proveedor.model';
import { AlertComponent } from '../../../../../shared/components/alert/alert.component';
import { UsuarioService } from '../../../../../core/services/usuario.service';
import { User } from '../../../../../core/models/user.model';
import { EvidenciaService } from '../../../../../core/services/evidencia.service';
import { DatosPersonalesFieldsComponent } from '../../../../../shared/components/datos-personales-fields/datos-personales-fields.component';
import { crearGrupoDatosPersonales, datosPersonalesPayload } from '../../../../../shared/utils/datos-personales-form.util';

@Component({
  selector: 'app-nueva-solicitud',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, AlertComponent, DatosPersonalesFieldsComponent],
  templateUrl: './nueva-solicitud.component.html',
  styleUrl: './nueva-solicitud.component.css'
})
export class NuevaSolicitudComponent implements OnInit {
  private fb = inject(FormBuilder);
  private solicitudService = inject(SolicitudService);
  private evidenciaService = inject(EvidenciaService);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  fieldErrors = signal<Record<string, string[]>>({});

  verificadores = signal<User[]>([]);

  /** Solicitud ya creada (paso 2: subir evidencias). Null mientras seguimos en el paso 1. */
  solicitudCreada = signal<SolicitudProveedor | null>(null);
  evidenciasSubidas = signal<Evidencia[]>([]);
  subiendoEvidencia = signal(false);
  errorEvidencia = signal<string | null>(null);

  tiposDocumento = ['ine_frente', 'ine_reverso', 'comprobante_domicilio'];
  tipoDocumentoSeleccionado = 'ine_frente';

  /** Datos Personales + Dirección + Referencia Laboral -- mismo formulario que usa el alta de
   *  personal interno (ver DatosPersonalesFieldsComponent). Aquí solo se le agrega el
   *  verificador (propio de una distribuidora, no aplica a personal interno). */
  datosPersonales = crearGrupoDatosPersonales(this.fb);
  verificadorId = this.fb.control<string>('');

  ngOnInit(): void {
    this.usuarioService.listar('Verificador').subscribe({
      next: (res) => this.verificadores.set(res.data ?? []),
      error: () => this.verificadores.set([])
    });
  }

  onSubmit(): void {
    if (this.isLoading()) {
      return;
    }

    if (this.datosPersonales.invalid) {
      this.datosPersonales.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.fieldErrors.set({});

    const payload: CrearSolicitudProveedorPayload = {
      ...datosPersonalesPayload(this.datosPersonales),
      verificador_id: this.verificadorId.value ? Number(this.verificadorId.value) : undefined
    };

    this.solicitudService.crear(payload).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.data) {
          this.solicitudCreada.set(res.data);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Ocurrió un error al capturar la solicitud.');
        this.fieldErrors.set(err.error?.errors || {});
      }
    });
  }

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    const solicitud = this.solicitudCreada();

    if (!archivo || !solicitud) {
      return;
    }

    this.subiendoEvidencia.set(true);
    this.errorEvidencia.set(null);

    this.evidenciaService.subir(solicitud.id, archivo, this.tipoDocumentoSeleccionado).subscribe({
      next: (res) => {
        this.subiendoEvidencia.set(false);
        if (res.data) {
          this.evidenciasSubidas.update((lista) => [...lista, res.data as Evidencia]);
        }
        input.value = '';
      },
      error: (err) => {
        this.subiendoEvidencia.set(false);
        this.errorEvidencia.set(err.error?.message || 'No se pudo subir el archivo. Verifica que sea jpg, png o pdf y pese menos de 5MB.');
        input.value = '';
      }
    });
  }

  finalizar(): void {
    this.router.navigate(['/coordinador']);
  }

  cancelar(): void {
    this.router.navigate(['/coordinador']);
  }
}
