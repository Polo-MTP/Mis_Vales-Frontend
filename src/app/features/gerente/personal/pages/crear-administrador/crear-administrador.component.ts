import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-crear-administrador',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-administrador.component.html'
})
export class CrearAdministradorComponent {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);

  enviando = signal(false);
  errorMessage = signal<string | null>(null);
  exito = signal<string | null>(null);
  fieldErrors = signal<Record<string, string[]>>({});

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    email: ['', [Validators.required, Validators.email]]
  });

  errorFor(campo: string): string | null {
    return this.fieldErrors()[campo]?.[0] ?? null;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.errorMessage.set(null);
    this.exito.set(null);
    this.fieldErrors.set({});

    const v = this.form.value;

    this.usuarioService
      .crearAdministrador({
        name: v.name!,
        email: v.email!
      })
      .subscribe({
        next: (res) => {
          this.enviando.set(false);
          this.exito.set(`Administrador "${res.data?.name}" creado correctamente. Se le envió su contraseña por correo.`);
          this.form.reset({ name: '', email: '' });
        },
        error: (err) => {
          this.enviando.set(false);
          // 403 por VPN llega con el mismo shape que cualquier otro error -- el backend ya
          // manda un message claro ("Esta acción solo está disponible desde la red
          // autorizada."), no hace falta un caso especial aquí.
          this.errorMessage.set(err.error?.message || 'Ocurrió un error al crear el usuario.');
          this.fieldErrors.set(err.error?.errors || {});
        }
      });
  }
}
