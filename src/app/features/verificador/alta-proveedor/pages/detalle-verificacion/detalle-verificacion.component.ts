import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { VerificacionService } from '../../services/verificacion.service';
import { SolicitudProveedor, VerificarSolicitudPayload } from '../../../../../core/models/solicitud-proveedor.model';
import { AlertComponent } from '../../../../../shared/components/alert/alert.component';

@Component({
  selector: 'app-detalle-verificacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AlertComponent],
  templateUrl: './detalle-verificacion.component.html',
  styleUrl: './detalle-verificacion.component.css'
})
export class DetalleVerificacionComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private verificacionService = inject(VerificacionService);

  solicitud = signal<SolicitudProveedor | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);

  enviando = signal(false);
  errorDictamen = signal<string | null>(null);
  fieldErrors = signal<Record<string, string[]>>({});

  tiposDocumento = ['foto_fachada', 'foto_interior', 'foto_ine_titular', 'otro'];

  datosForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(255)]],
    apellido_paterno: ['', [Validators.required, Validators.maxLength(255)]],
    apellido_materno: ['', [Validators.maxLength(255)]],
    curp: ['', [Validators.required, Validators.minLength(18), Validators.maxLength(18)]],
    calle: ['', [Validators.required, Validators.maxLength(255)]],
    colonia: ['', [Validators.required, Validators.maxLength(255)]],
    numero_ext: ['', [Validators.required, Validators.maxLength(50)]],
    numero_int: ['', [Validators.maxLength(50)]],
    codigo_postal: ['', [Validators.required, Validators.maxLength(10)]],
    estado: ['', [Validators.required, Validators.maxLength(255)]],
    ciudad: ['', [Validators.required, Validators.maxLength(255)]]
  });

  dictamenForm = this.fb.group({
    cumple: ['', [Validators.required]],
    comentario_verificador: ['', [Validators.required]],
    motivo_edicion: [''],
    evidencias: this.fb.array([])
  });

  get evidencias(): FormArray {
    return this.dictamenForm.get('evidencias') as FormArray;
  }

  yaDictaminada(s: SolicitudProveedor | null = this.solicitud()): boolean {
    return s?.estado === 'verificado' || s?.estado === 'rechazado';
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarSolicitud(id);
  }

  cargarSolicitud(id: number): void {
    this.cargando.set(true);
    this.error.set(null);

    this.verificacionService.obtenerDetalle(id).subscribe({
      next: (res) => {
        const s = res.data ?? null;
        this.solicitud.set(s);
        this.cargando.set(false);

        if (s && this.yaDictaminada(s)) {
          this.datosForm.disable();
        }

        if (s) {
          this.datosForm.patchValue({
            nombre: s.datos_personales.nombre ?? '',
            apellido_paterno: s.datos_personales.apellido_paterno ?? '',
            apellido_materno: s.datos_personales.apellido_materno ?? '',
            curp: s.datos_personales.curp ?? '',
            calle: s.datos_personales.direccion.calle ?? '',
            colonia: s.datos_personales.direccion.colonia ?? '',
            numero_ext: s.datos_personales.direccion.numero_ext ?? '',
            numero_int: s.datos_personales.direccion.numero_int ?? '',
            codigo_postal: s.datos_personales.direccion.codigo_postal ?? '',
            estado: s.datos_personales.direccion.estado ?? '',
            ciudad: s.datos_personales.direccion.ciudad ?? ''
          });
        }
      },
      error: () => {
        this.error.set('No se pudo cargar la solicitud.');
        this.cargando.set(false);
      }
    });
  }

  agregarEvidencia(): void {
    this.evidencias.push(
      this.fb.group({
        tipo_documento: ['foto_fachada', [Validators.required]],
        url_archivo: ['', [Validators.required, Validators.maxLength(500)]]
      })
    );
  }

  quitarEvidencia(index: number): void {
    this.evidencias.removeAt(index);
  }

  errorFor(campo: string): string | null {
    return this.fieldErrors()[campo]?.[0] ?? null;
  }

  private soloCambios(
    original: Record<string, string | null | undefined>,
    actual: Record<string, string | null | undefined>
  ): Record<string, string> {
    const cambios: Record<string, string> = {};

    for (const campo of Object.keys(actual)) {
      const valorOriginal = original[campo] ?? '';
      const valorActual = actual[campo] ?? '';
      if (valorActual !== valorOriginal) {
        cambios[campo] = valorActual;
      }
    }

    return cambios;
  }

  onSubmit(): void {
    const s = this.solicitud();
    if (!s || this.dictamenForm.invalid || this.datosForm.invalid) {
      this.dictamenForm.markAllAsTouched();
      this.datosForm.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.errorDictamen.set(null);
    this.fieldErrors.set({});

    const val = this.datosForm.value;

    const datosPersonalesCambios = this.soloCambios(
      {
        nombre: s.datos_personales.nombre,
        apellido_paterno: s.datos_personales.apellido_paterno,
        apellido_materno: s.datos_personales.apellido_materno,
        curp: s.datos_personales.curp
      },
      {
        nombre: val.nombre!,
        apellido_paterno: val.apellido_paterno!,
        apellido_materno: val.apellido_materno!,
        curp: val.curp!
      }
    );

    const direccionCambios = this.soloCambios(
      {
        calle: s.datos_personales.direccion.calle,
        colonia: s.datos_personales.direccion.colonia,
        numero_ext: s.datos_personales.direccion.numero_ext,
        numero_int: s.datos_personales.direccion.numero_int,
        codigo_postal: s.datos_personales.direccion.codigo_postal,
        estado: s.datos_personales.direccion.estado,
        ciudad: s.datos_personales.direccion.ciudad
      },
      {
        calle: val.calle!,
        colonia: val.colonia!,
        numero_ext: val.numero_ext!,
        numero_int: val.numero_int!,
        codigo_postal: val.codigo_postal!,
        estado: val.estado!,
        ciudad: val.ciudad!
      }
    );

    const huboCambios = Object.keys(datosPersonalesCambios).length > 0 || Object.keys(direccionCambios).length > 0;

    const dictamenVal = this.dictamenForm.value;
    const payload: VerificarSolicitudPayload = {
      cumple: dictamenVal.cumple === 'true',
      comentario_verificador: dictamenVal.comentario_verificador!,
      dispositivo: navigator.userAgent,
      motivo_edicion: huboCambios ? (dictamenVal.motivo_edicion || 'Corrección realizada durante visita física.') : undefined,
      datos_personales: Object.keys(datosPersonalesCambios).length > 0 ? datosPersonalesCambios : undefined,
      direccion: Object.keys(direccionCambios).length > 0 ? direccionCambios : undefined,
      evidencias: this.evidencias.length > 0 ? this.evidencias.value : undefined
    };

    this.verificacionService.guardarDictamen(s.id, payload).subscribe({
      next: () => {
        this.enviando.set(false);
        this.router.navigate(['/verificador/alta-proveedor/pendientes']);
      },
      error: (err) => {
        this.enviando.set(false);
        this.errorDictamen.set(err.error?.message || 'Ocurrió un error al guardar el dictamen.');
        this.fieldErrors.set(err.error?.errors || {});
      }
    });
  }

  volver(): void {
    this.router.navigate(['/verificador/alta-proveedor/pendientes']);
  }
}
