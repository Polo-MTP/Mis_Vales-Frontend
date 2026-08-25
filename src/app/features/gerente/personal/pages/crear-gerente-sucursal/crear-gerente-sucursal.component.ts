import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SucursalService } from '../../services/sucursal.service';
import { UsuarioService } from '../../services/usuario.service';
import { Sucursal } from '../../../../../core/models/sucursal.model';
import { DatosPersonalesFieldsComponent } from '../../../../../shared/components/datos-personales-fields/datos-personales-fields.component';
import { crearGrupoDatosPersonales, datosPersonalesPayload } from '../../../../../shared/utils/datos-personales-form.util';

@Component({
  selector: 'app-crear-gerente-sucursal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatosPersonalesFieldsComponent],
  templateUrl: './crear-gerente-sucursal.component.html'
})
export class CrearGerenteSucursalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private sucursalService = inject(SucursalService);
  private usuarioService = inject(UsuarioService);

  sucursales = signal<Sucursal[]>([]);
  cargandoSucursales = signal(true);

  enviando = signal(false);
  errorMessage = signal<string | null>(null);
  exito = signal<string | null>(null);
  fieldErrors = signal<Record<string, string[]>>({});

  /** Mismo formulario que el alta de una distribuidora -- ver DatosPersonalesFieldsComponent. */
  datosPersonales = crearGrupoDatosPersonales(this.fb);
  email = this.fb.control('', [Validators.required, Validators.email, Validators.maxLength(255)]);
  sucursalId = this.fb.control('', [Validators.required]);

  ngOnInit(): void {
    this.sucursalService.listar(true).subscribe({
      next: (res) => {
        this.sucursales.set(res.data ?? []);
        this.cargandoSucursales.set(false);
      },
      error: () => this.cargandoSucursales.set(false)
    });
  }

  errorForEmail(): string | null {
    if (this.email.invalid && (this.email.touched || this.email.dirty)) {
      return 'Ingresa un correo válido.';
    }
    return this.fieldErrors()['email']?.[0] ?? null;
  }

  errorForSucursal(): string | null {
    return this.fieldErrors()['sucursal_id']?.[0] ?? null;
  }

  onSubmit(): void {
    if (this.enviando()) {
      return;
    }

    if (this.datosPersonales.invalid || this.email.invalid || this.sucursalId.invalid) {
      this.datosPersonales.markAllAsTouched();
      this.email.markAsTouched();
      this.sucursalId.markAsTouched();
      return;
    }

    this.enviando.set(true);
    this.errorMessage.set(null);
    this.exito.set(null);
    this.fieldErrors.set({});

    this.usuarioService
      .crearGerenteSucursal({
        ...datosPersonalesPayload(this.datosPersonales),
        email: this.email.value!,
        sucursal_id: Number(this.sucursalId.value)
      })
      .subscribe({
        next: (res) => {
          this.enviando.set(false);
          this.exito.set(`Gerente de Sucursal "${res.data?.name}" creado correctamente. Se le envió su contraseña por correo.`);
          this.datosPersonales.reset();
          this.email.reset('');
          this.sucursalId.reset('');
        },
        error: (err) => {
          this.enviando.set(false);
          this.errorMessage.set(err.error?.message || 'Ocurrió un error al crear el usuario.');
          this.fieldErrors.set(err.error?.errors || {});
        }
      });
  }
}
