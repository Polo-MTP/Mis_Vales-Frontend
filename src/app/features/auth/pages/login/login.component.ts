import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AlertComponent],
  template: `
    <div class="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <div class="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 space-y-6">
        
        <!-- Header Title -->
        <div class="text-center space-y-2">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mb-1">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 class="text-2xl font-black text-slate-800 tracking-tight">Iniciar Sesión</h2>
          <p class="text-xs text-slate-500 font-medium">Ingresa a tu cuenta</p>
        </div>

        <app-alert [message]="errorMessage()" type="error"></app-alert>
        <app-alert [message]="successMessage()" type="success"></app-alert>

        <!-- PASO 1: Formulario de Login -->
        <form *ngIf="step() === 1" [formGroup]="loginForm" (ngSubmit)="onLoginSubmit()" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">Correo Electrónico</label>
            <input type="email" formControlName="email" placeholder="tu@correo.com"
                   class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">Contraseña</label>
            <input type="password" formControlName="password" placeholder="••••••••"
                   class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
          </div>

          <button type="submit" [disabled]="loginForm.invalid || isLoading()"
                  class="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 flex items-center justify-center">
            <span *ngIf="!isLoading()">Continuar</span>
            <span *ngIf="isLoading()">Verificando credenciales...</span>
          </button>
        </form>

        <!-- PASO 2: Verificación TOTP -->
        <form *ngIf="step() === 2" [formGroup]="totpForm" (ngSubmit)="onTotpSubmit()" class="space-y-4">
          <div class="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-center space-y-2">
            <span class="inline-flex px-2.5 py-1 bg-blue-100 text-blue-700 font-bold text-[11px] rounded-lg">Segundo Factor (2FA)</span>
            <p class="text-xs text-slate-600">Ingresa el código de 6 dígitos de Google Authenticator.</p>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5 text-center">Código de Autenticación</label>
            <input type="text" formControlName="code" maxlength="6" placeholder="123456"
                   class="w-full py-3 text-center text-2xl tracking-[0.5em] font-mono font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>

          <button type="submit" [disabled]="totpForm.invalid || isLoading()"
                  class="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all">
            <span *ngIf="!isLoading()">Verificar TOTP</span>
            <span *ngIf="isLoading()">Validando...</span>
          </button>
        </form>

        <!-- PASO 3: Verificación OTP por Correo -->
        <form *ngIf="step() === 3" [formGroup]="otpMailForm" (ngSubmit)="onOtpMailSubmit()" class="space-y-4">
          <div class="p-4 bg-purple-50 border border-purple-200/80 rounded-2xl text-center space-y-2">
            <span class="inline-flex px-2.5 py-1 bg-purple-100 text-purple-700 font-bold text-[11px] rounded-lg">Tercer Factor (3FA)</span>
            <p class="text-xs text-slate-600">Ingresa el código de 6 dígitos enviado a tu correo.</p>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5 text-center">Código del Correo</label>
            <input type="text" formControlName="code" maxlength="6" placeholder="123456"
                   class="w-full py-3 text-center text-2xl tracking-[0.5em] font-mono font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500">
          </div>

          <button type="submit" [disabled]="otpMailForm.invalid || isLoading()"
                  class="w-full py-3.5 px-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-500/25 transition-all">
            <span *ngIf="!isLoading()">Finalizar Autenticación</span>
            <span *ngIf="isLoading()">Validando código...</span>
          </button>
        </form>

      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  step = signal<number>(1);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

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

  onLoginSubmit(): void {
    if (this.loginForm.invalid) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const val = this.loginForm.value;
    this.authService.login({
      email: val.email!,
      password: val.password!,
      recaptcha: 'bypass-recaptcha'
    }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.data?.requires_setup && res.data?.setup_url) {
          this.router.navigate(['/auth/mfa-setup'], { queryParams: { email: val.email } });
          return;
        }

        if (res.data?.requires_mfa && res.data?.mfa_method_id) {
          this.mfaMethodId = res.data.mfa_method_id;
          this.step.set(2);
          return;
        }

        if (res.success && res.data?.token) {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Error al iniciar sesión.');
      }
    });
  }

  onTotpSubmit(): void {
    if (this.totpForm.invalid || !this.mfaMethodId) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.verifyMfa(this.mfaMethodId, this.totpForm.value.code!).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.data?.requires_email_otp && res.data?.user_id) {
          this.userId = res.data.user_id;
          this.step.set(3);
          return;
        }

        if (res.success && res.data?.token) {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Código TOTP incorrecto.');
      }
    });
  }

  onOtpMailSubmit(): void {
    if (this.otpMailForm.invalid || !this.userId) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.verifyEmailOtp(this.userId, this.otpMailForm.value.code!).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data?.token) {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Código OTP incorrecto.');
      }
    });
  }
}
