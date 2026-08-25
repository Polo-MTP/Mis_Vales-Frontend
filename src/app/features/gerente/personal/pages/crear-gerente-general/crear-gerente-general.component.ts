import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { DatosPersonalesFieldsComponent } from '../../../../../shared/components/datos-personales-fields/datos-personales-fields.component';
import { crearGrupoDatosPersonales, datosPersonalesPayload } from '../../../../../shared/utils/datos-personales-form.util';

/**
 * Da de alta un Gerente General -- el backend solo deja llegar aquí a Administrador (arranca o
 * repone la cadena de mando; Gerente General no puede crear otro Gerente General, para que la
 * cadena no se auto-perpetúe sin que Administrador se entere). Mismo formulario que el resto de
 * altas de personal. Componente reutilizado desde la pantalla de Administrador (no vive bajo
 * gerente/, es agnóstico de rol).
 */
@Component({
  selector: 'app-crear-gerente-general',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatosPersonalesFieldsComponent],
  templateUrl: './crear-gerente-general.component.html'
})
export class CrearGerenteGeneralComponent {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);

  enviando = signal(false);
  errorMessage = signal<string | null>(null);
  exito = signal<string | null>(null);
  fieldErrors = signal<Record<string, string[]>>({});

  datosPersonales = crearGrupoDatosPersonales(this.fb);
  email = this.fb.control('', [Validators.required, Validators.email, Validators.maxLength(255)]);

  errorForEmail(): string | null {
    if (this.email.invalid && (this.email.touched || this.email.dirty)) {
      return 'Ingresa un correo válido.';
    }
    return this.fieldErrors()['email']?.[0] ?? null;
  }

  onSubmit(): void {
    if (this.datosPersonales.invalid || this.email.invalid) {
      this.datosPersonales.markAllAsTouched();
      this.email.markAsTouched();
      return;
    }

    this.enviando.set(true);
    this.errorMessage.set(null);
    this.exito.set(null);
    this.fieldErrors.set({});

    this.usuarioService
      .crearGerenteGeneral({
        ...datosPersonalesPayload(this.datosPersonales),
        email: this.email.value!
      })
      .subscribe({
        next: (res) => {
          this.enviando.set(false);
          this.exito.set(`Gerente General "${res.data?.name}" creado correctamente. Se le envió su contraseña por correo.`);
          this.datosPersonales.reset();
          this.email.reset('');
        },
        error: (err) => {
          this.enviando.set(false);
          this.errorMessage.set(err.error?.message || 'Ocurrió un error al crear el usuario.');
          this.fieldErrors.set(err.error?.errors || {});
        }
      });
  }
}
