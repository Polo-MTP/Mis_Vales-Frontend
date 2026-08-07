import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SolicitudService } from '../../services/solicitud.service';
import { CrearSolicitudProveedorPayload } from '../../../../../core/models/solicitud-proveedor.model';
import { AlertComponent } from '../../../../../shared/components/alert/alert.component';

@Component({
  selector: 'app-nueva-solicitud',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AlertComponent],
  templateUrl: './nueva-solicitud.component.html',
  styleUrl: './nueva-solicitud.component.css'
})
export class NuevaSolicitudComponent {
  private fb = inject(FormBuilder);
  private solicitudService = inject(SolicitudService);
  private router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  fieldErrors = signal<Record<string, string[]>>({});

  tiposDocumento = ['ine_frente', 'ine_reverso', 'comprobante_domicilio'];

  form = this.fb.group({
    razon_social: ['', [Validators.required, Validators.maxLength(255)]],
    rfc: ['', [Validators.required, Validators.minLength(13), Validators.maxLength(13)]],
    nombre: ['', [Validators.required, Validators.maxLength(255)]],
    apellido_paterno: ['', [Validators.required, Validators.maxLength(255)]],
    apellido_materno: ['', [Validators.maxLength(255)]],
    curp: ['', [Validators.required, Validators.minLength(18), Validators.maxLength(18)]],
    fecha_nacimiento: [''],
    lugar_nacimiento: ['', [Validators.maxLength(255)]],
    calle: ['', [Validators.required, Validators.maxLength(255)]],
    colonia: ['', [Validators.required, Validators.maxLength(255)]],
    numero_ext: ['', [Validators.required, Validators.maxLength(50)]],
    numero_int: ['', [Validators.maxLength(50)]],
    codigo_postal: ['', [Validators.required, Validators.maxLength(10)]],
    estado: ['', [Validators.required, Validators.maxLength(255)]],
    ciudad: ['', [Validators.required, Validators.maxLength(255)]],
    referencia_laboral: ['', [Validators.maxLength(255)]],
    verificador_id: [''],
    evidencias: this.fb.array([])
  });

  get evidencias(): FormArray {
    return this.form.get('evidencias') as FormArray;
  }

  agregarEvidencia(): void {
    this.evidencias.push(
      this.fb.group({
        tipo_documento: ['ine_frente', [Validators.required]],
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

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
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
      verificador_id: val.verificador_id ? Number(val.verificador_id) : undefined,
      evidencias: this.evidencias.length > 0 ? this.evidencias.value : undefined
    };

    this.solicitudService.crear(payload).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.successMessage.set(res.message || 'Solicitud capturada exitosamente.');
        this.form.reset();
        this.evidencias.clear();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Ocurrió un error al capturar la solicitud.');
        this.fieldErrors.set(err.error?.errors || {});
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/coordinador']);
  }
}
