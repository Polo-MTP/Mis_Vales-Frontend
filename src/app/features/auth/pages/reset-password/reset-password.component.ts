import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';
import { RecaptchaService } from '../../../../core/services/recaptcha.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AlertComponent],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private recaptchaService = inject(RecaptchaService);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  private token: string | null = null;
  private email: string | null = null;

  form = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', [Validators.required]]
  });

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'] ?? null;
    this.email = this.route.snapshot.queryParams['email'] ?? null;

    if (!this.token || !this.email) {
      this.errorMessage.set('El enlace de restablecimiento es inválido o incompleto. Solicita uno nuevo.');
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid || !this.token || !this.email) return;

    if (this.form.value.password !== this.form.value.password_confirmation) {
      this.errorMessage.set('Las contraseñas no coinciden.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    let recaptchaToken: string;
    try {
      recaptchaToken = await this.recaptchaService.execute('reset_password');
    } catch {
      this.isLoading.set(false);
      this.errorMessage.set('No se pudo verificar el reCAPTCHA. Intenta de nuevo.');
      return;
    }

    this.authService
      .resetPassword(this.token, this.email, this.form.value.password!, this.form.value.password_confirmation!, recaptchaToken)
      .subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.successMessage.set(res.message || 'Contraseña restablecida exitosamente. Redirigiendo a inicio de sesión...');
          setTimeout(() => this.router.navigate(['/auth/login']), 1500);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.message || 'No se pudo restablecer la contraseña.');
        }
      });
  }
}
