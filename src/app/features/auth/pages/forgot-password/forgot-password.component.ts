import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';
import { RecaptchaService } from '../../../../core/services/recaptcha.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AlertComponent],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private recaptchaService = inject(RecaptchaService);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    let recaptchaToken: string;
    try {
      recaptchaToken = await this.recaptchaService.execute('forgot_password');
    } catch {
      this.isLoading.set(false);
      this.errorMessage.set('No se pudo verificar el reCAPTCHA. Intenta de nuevo.');
      return;
    }

    this.authService.forgotPassword(this.form.value.email!, recaptchaToken).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.successMessage.set(res.message || 'Enlace de restablecimiento enviado a tu correo electrónico.');
        this.form.reset();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'No se pudo enviar el enlace de restablecimiento.');
      }
    });
  }
}
