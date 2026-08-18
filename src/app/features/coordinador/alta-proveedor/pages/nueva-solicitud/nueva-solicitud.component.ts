import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SolicitudService } from '../../services/solicitud.service';
import { CrearSolicitudProveedorPayload, Evidencia, SolicitudProveedor } from '../../../../../core/models/solicitud-proveedor.model';
import { AlertComponent } from '../../../../../shared/components/alert/alert.component';
import { UsuarioService } from '../../../../../core/services/usuario.service';
import { User } from '../../../../../core/models/user.model';
import { EvidenciaService } from '../../../../../core/services/evidencia.service';
import { GooglePlacesAutocompleteDirective } from '../../../../../shared/directives/google-places-autocomplete.directive';
import { parsearDireccionGoogle } from '../../../../../shared/utils/google-address.util';

@Component({
  selector: 'app-nueva-solicitud',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, AlertComponent, GooglePlacesAutocompleteDirective],
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
  sesgoDireccion = signal<{ lat: number; lng: number } | null>(null);

  /** Solicitud ya creada (paso 2: subir evidencias). Null mientras seguimos en el paso 1. */
  solicitudCreada = signal<SolicitudProveedor | null>(null);
  evidenciasSubidas = signal<Evidencia[]>([]);
  subiendoEvidencia = signal(false);
  errorEvidencia = signal<string | null>(null);

  tiposDocumento = ['ine_frente', 'ine_reverso', 'comprobante_domicilio'];
  tipoDocumentoSeleccionado = 'ine_frente';

  /** No se puede escribir la fecha a mano (readonly), solo elegirla en el calendario, y no permite menores de edad. */
  readonly fechaMaximaNacimiento = this.calcularFechaMaxima18Anios();

  form = this.fb.group({
    razon_social: ['', [Validators.required, Validators.maxLength(255)]],
    rfc: ['', [Validators.required, Validators.minLength(13), Validators.maxLength(13)]],
    nombre: ['', [Validators.required, Validators.maxLength(255)]],
    apellido_paterno: ['', [Validators.required, Validators.maxLength(255)]],
    apellido_materno: ['', [Validators.maxLength(255)]],
    curp: ['', [Validators.required, Validators.minLength(18), Validators.maxLength(18)]],
    fecha_nacimiento: [''],
    lugar_nacimiento: ['', [Validators.maxLength(255)]],
    codigo_postal: ['', [Validators.required, Validators.maxLength(10)]],
    calle: ['', [Validators.required, Validators.maxLength(255)]],
    colonia: ['', [Validators.required, Validators.maxLength(255)]],
    numero_ext: ['', [Validators.required, Validators.maxLength(50)]],
    numero_int: ['', [Validators.maxLength(50)]],
    estado: ['', [Validators.required, Validators.maxLength(255)]],
    ciudad: ['', [Validators.required, Validators.maxLength(255)]],
    referencia_laboral: ['', [Validators.maxLength(255)]],
    verificador_id: ['']
  });

  ngOnInit(): void {
    this.usuarioService.listar('Verificador').subscribe({
      next: (res) => this.verificadores.set(res.data ?? []),
      error: () => this.verificadores.set([])
    });
  }

  private calcularFechaMaxima18Anios(): string {
    const hoy = new Date();
    const hace18 = new Date(hoy.getFullYear() - 18, hoy.getMonth(), hoy.getDate());
    return hace18.toISOString().slice(0, 10);
  }

  errorFor(campo: string): string | null {
    return this.fieldErrors()[campo]?.[0] ?? null;
  }

  /** El usuario eligió un CP de las sugerencias: lo usamos para sesgar el autocompletado de Calle. */
  onCodigoPostalSeleccionado(place: any): void {
    const direccion = parsearDireccionGoogle(place);

    this.form.patchValue({
      codigo_postal: direccion.codigo_postal || this.form.value.codigo_postal,
      estado: direccion.estado || this.form.value.estado,
      ciudad: direccion.ciudad || this.form.value.ciudad
    });

    if (direccion.lat && direccion.lng) {
      this.sesgoDireccion.set({ lat: direccion.lat, lng: direccion.lng });
    }
  }

  /** El usuario eligió una calle de las sugerencias: llenamos el resto de la dirección. */
  onCalleSeleccionada(place: any): void {
    const direccion = parsearDireccionGoogle(place);

    this.form.patchValue({
      calle: direccion.calle || this.form.value.calle,
      numero_ext: direccion.numero_ext || this.form.value.numero_ext,
      colonia: direccion.colonia || this.form.value.colonia,
      codigo_postal: direccion.codigo_postal || this.form.value.codigo_postal,
      estado: direccion.estado || this.form.value.estado,
      ciudad: direccion.ciudad || this.form.value.ciudad
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.fieldErrors.set({});

    const val = this.form.value;
    const payload: CrearSolicitudProveedorPayload = {
      razon_social: val.razon_social!,
      rfc: val.rfc!,
      nombre: val.nombre!,
      apellido_paterno: val.apellido_paterno!,
      apellido_materno: val.apellido_materno || undefined,
      curp: val.curp!,
      fecha_nacimiento: val.fecha_nacimiento || undefined,
      lugar_nacimiento: val.lugar_nacimiento || undefined,
      calle: val.calle!,
      colonia: val.colonia!,
      numero_ext: val.numero_ext!,
      numero_int: val.numero_int || undefined,
      codigo_postal: val.codigo_postal!,
      estado: val.estado!,
      ciudad: val.ciudad!,
      referencia_laboral: val.referencia_laboral || undefined,
      verificador_id: val.verificador_id ? Number(val.verificador_id) : undefined
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
