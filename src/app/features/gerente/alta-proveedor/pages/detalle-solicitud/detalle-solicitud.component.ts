import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { SolicitudService } from '../../services/solicitud.service';
import { AprobarSolicitudPayload, LogAuditoria, SolicitudProveedor } from '../../../../../core/models/solicitud-proveedor.model';
import { AlertComponent } from '../../../../../shared/components/alert/alert.component';
import { generarPasswordSegura, MENSAJE_PASSWORD_SEGURA, passwordSeguraValidators } from '../../../../../shared/utils/password.util';

@Component({
  selector: 'app-detalle-solicitud',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AlertComponent],
  templateUrl: './detalle-solicitud.component.html',
  styleUrl: './detalle-solicitud.component.css'
})
export class DetalleSolicitudComponent implements OnInit {
  private static multiploDe(valor: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value === '' || control.value === null) {
        return null;
      }
      return Number(control.value) % valor === 0 ? null : { multiplo: { valor } };
    };
  }

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private solicitudService = inject(SolicitudService);

  solicitud = signal<SolicitudProveedor | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);

  enviando = signal(false);
  errorDecision = signal<string | null>(null);
  fieldErrors = signal<Record<string, string[]>>({});

  decisionForm = this.fb.group({
    decision: ['', [Validators.required]],
    comentario_gerente: [''],
    limite_credito_asignado: ['', [DetalleSolicitudComponent.multiploDe(1000)]],
    email: ['', [Validators.email]],
    password: ['', passwordSeguraValidators]
  });

  mostrarPassword = signal(false);

  readonly mensajePasswordSegura = MENSAJE_PASSWORD_SEGURA;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarSolicitud(id);
  }

  cargarSolicitud(id: number): void {
    this.cargando.set(true);
    this.error.set(null);

    this.solicitudService.detalle(id).subscribe({
      next: (res) => {
        this.solicitud.set(res.data ?? null);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el expediente de la solicitud.');
        this.cargando.set(false);
      }
    });
  }

  logsAntesDespues(): LogAuditoria[] {
    return (this.solicitud()?.logs_auditoria ?? []).filter((log) => log.accion === 'edicion_verificador');
  }

  errorFor(campo: string): string | null {
    const control = this.decisionForm.get(campo);
    if (control?.invalid && (control.touched || control.dirty)) {
      if (control.errors?.['email']) return 'Ingresa un correo válido.';
      if (control.errors?.['pattern'] && campo === 'password') return this.mensajePasswordSegura;
    }
    return this.fieldErrors()[campo]?.[0] ?? null;
  }

  generarPassword(): void {
    const nueva = generarPasswordSegura();
    this.decisionForm.get('password')?.setValue(nueva);
    this.decisionForm.get('password')?.markAsDirty();
    this.mostrarPassword.set(true);
  }

  toggleMostrarPassword(): void {
    this.mostrarPassword.update((v) => !v);
  }

  limiteCreditoInvalido(): boolean {
    const control = this.decisionForm.get('limite_credito_asignado');
    return !!control?.errors?.['multiplo'] && (control.touched || control.dirty);
  }

  onSubmit(): void {
    const s = this.solicitud();
    if (!s || this.decisionForm.invalid) {
      this.decisionForm.markAllAsTouched();
      return;
    }

    const val = this.decisionForm.value;
    const decision = val.decision as 'aprobado' | 'rechazado';

    if (decision === 'aprobado' && (!val.limite_credito_asignado || !val.email || !val.password)) {
      this.errorDecision.set('Para aprobar debes indicar límite de crédito, email y contraseña del distribuidor.');
      return;
    }

    this.enviando.set(true);
    this.errorDecision.set(null);
    this.fieldErrors.set({});

    const payload: AprobarSolicitudPayload = {
      decision,
      comentario_gerente: val.comentario_gerente || undefined,
      limite_credito_asignado: decision === 'aprobado' ? Number(val.limite_credito_asignado) : undefined,
      email: decision === 'aprobado' ? val.email! : undefined,
      password: decision === 'aprobado' ? val.password! : undefined
    };

    this.solicitudService.aprobarORechazar(s.id, payload).subscribe({
      next: (res) => {
        this.enviando.set(false);
        this.solicitud.set(res.data ?? s);
      },
      error: (err) => {
        this.enviando.set(false);
        this.errorDecision.set(err.error?.message || 'Ocurrió un error al procesar la decisión.');
        this.fieldErrors.set(err.error?.errors || {});
      }
    });
  }

  volver(): void {
    this.router.navigate(['/gerente/solicitudes']);
  }
}
