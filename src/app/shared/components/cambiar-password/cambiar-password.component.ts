import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../features/auth/services/auth.service';

@Component({
  selector: 'app-cambiar-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cambiar-password.component.html'
})
export class CambiarPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  enviando = signal(false);
  errorMessage = signal<string | null>(null);
  exito = signal(false);
  fieldErrors = signal<Record<string, string[]>>({});

  form = this.fb.group({
    current_password: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', [Validators.required]]
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
    this.exito.set(false);
    this.fieldErrors.set({});

    const v = this.form.value;

    this.authService.changePassword(v.current_password!, v.password!, v.password_confirmation!).subscribe({
      next: () => {
        this.enviando.set(false);
        this.exito.set(true);
        this.form.reset({ current_password: '', password: '', password_confirmation: '' });
      },
      error: (err) => {
        this.enviando.set(false);
        this.errorMessage.set(err.error?.message || 'Ocurrió un error al cambiar tu contraseña.');
        this.fieldErrors.set(err.error?.errors || {});
      }
    });
  }
}
