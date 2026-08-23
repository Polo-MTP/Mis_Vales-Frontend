import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';
import { RecaptchaService } from '../../../../core/services/recaptcha.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AlertComponent],
  templateUrl: './login.component.html',
  styleUrls: []
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private recaptchaService = inject(RecaptchaService);
  private http = inject(HttpClient);

  step = signal<number>(1);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  serverNumber = signal<string | null>(null);

  mfaMethodId: string | null = null;
  userId: number | null = null;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  totpForm = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
  });

  otpMailForm = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
  });

  ngOnInit(): void {
    this.http.get<{ server: string }>(`${environment.apiUrl}/status`).subscribe({
      next: (res) => this.serverNumber.set(res.server),
      error: () => this.serverNumber.set(null),
    });

    const sessionMessage = this.route.snapshot.queryParams['sessionMessage'];
    if (sessionMessage) {
      this.errorMessage.set(sessionMessage);
    }
  }

  async onLoginSubmit(): Promise<void> {
    if (this.loginForm.invalid) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);

    let recaptchaToken: string;
    try {
      recaptchaToken = await this.recaptchaService.execute('login');
    } catch {
      this.isLoading.set(false);
      this.errorMessage.set('No se pudo verificar el reCAPTCHA. Intenta de nuevo.');
      return;
    }

    const val = this.loginForm.value;
    this.authService.login({
      email: val.email!,
      password: val.password!,
      recaptcha: recaptchaToken
    }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.data?.requires_setup && res.data?.setup_url) {
          this.router.navigate(['/auth/mfa-setup'], { queryParams: { setupUrl: res.data.setup_url } });
          return;
        }

        if (res.data?.requires_mfa && res.data?.mfa_method_id) {
          this.mfaMethodId = res.data.mfa_method_id;
          this.step.set(2);
          return;
        }

        if (res.success && res.data?.user) {
          this.authService.redirectUserByRole();
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Error al iniciar sesión.');
      }
    });
  }


  async onTotpSubmit(): Promise<void> {
    if (this.totpForm.invalid || !this.mfaMethodId) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);

    let recaptchaToken: string;
    try {
      recaptchaToken = await this.recaptchaService.execute('mfa_verify');
    } catch {
      this.isLoading.set(false);
      this.errorMessage.set('No se pudo verificar el reCAPTCHA. Intenta de nuevo.');
      return;
    }

    this.authService.verifyMfa(this.mfaMethodId, this.totpForm.value.code!, recaptchaToken).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.data?.requires_email_otp && res.data?.user_id) {
          this.userId = res.data.user_id;
          this.step.set(3);
          return;
        }

        if (res.success && res.data?.user) {
          this.authService.redirectUserByRole();
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Código TOTP incorrecto.');
      }
    });
  }

  async onOtpMailSubmit(): Promise<void> {
    if (this.otpMailForm.invalid || !this.userId) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);

    let recaptchaToken: string;
    try {
      recaptchaToken = await this.recaptchaService.execute('mfa_email_verify');
    } catch {
      this.isLoading.set(false);
      this.errorMessage.set('No se pudo verificar el reCAPTCHA. Intenta de nuevo.');
      return;
    }

    this.authService.verifyEmailOtp(this.userId, this.otpMailForm.value.code!, recaptchaToken).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data?.user) {
          this.authService.redirectUserByRole();
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Código OTP incorrecto.');
      }
    });
  }
}