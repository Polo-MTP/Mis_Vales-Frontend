import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from '../../services/auth.service';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';
import { MfaSetupData } from '../../../../core/models/auth-response.model';
import { RecaptchaService } from '../../../../core/services/recaptcha.service';

@Component({
  selector: 'app-mfa-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AlertComponent],
  templateUrl: './mfa-setup.component.html',
  styleUrl: './mfa-setup.component.css'
})
export class MfaSetupComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private sanitizer = inject(DomSanitizer);
  private recaptchaService = inject(RecaptchaService);

  setupData = signal<MfaSetupData | null>(null);
  safeQrSvg = signal<SafeHtml>('');
  isLoadingData = signal<boolean>(true);
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // 'confirm' = vincular el dispositivo (código de la app); 'email_otp' = tercer factor,
  // solo para roles con factor_count 3 (Administrador, Gerente General, Gerente de Sucursal).
  step = signal<'confirm' | 'email_otp'>('confirm');
  private otpToken: string | null = null;

  confirmForm = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
  });

  otpMailForm = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
  });

  ngOnInit(): void {
    const setupUrl = this.route.snapshot.queryParams['setupUrl'];
    if (!setupUrl) {
      this.errorMessage.set('El enlace de configuración es inválido o incompleto. Vuelve a iniciar sesión.');
      this.isLoadingData.set(false);
      return;
    }

    this.authService.getMfaSetup(setupUrl).subscribe({
      next: (res) => {
        this.isLoadingData.set(false);
        if (res.success && res.data) {
          this.setupData.set(res.data);
          this.safeQrSvg.set(this.sanitizer.bypassSecurityTrustHtml(res.data.qrSvg));
        }
      },
      error: (err) => {
        this.isLoadingData.set(false);
        this.errorMessage.set(err.error?.message || 'Error al obtener datos de configuración MFA.');
      }
    });
  }

  async onConfirmSubmit(): Promise<void> {
    const setup = this.setupData();
    if (this.confirmForm.invalid || !setup) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    let recaptchaToken: string;
    try {
      recaptchaToken = await this.recaptchaService.execute('mfa_setup_confirm');
    } catch {
      this.isSubmitting.set(false);
      this.errorMessage.set('No se pudo verificar el reCAPTCHA. Intenta de nuevo.');
      return;
    }

    // /mfa/verify (no /mfa/setup/confirm) — además de vincular el dispositivo, continúa la
    // misma cadena de login que usa un TOTP normal: pide el tercer factor si el rol lo
    // requiere, o autentica de una vez si no. /mfa/setup/confirm solo marca el
    // dispositivo como verificado y no sabe nada de lo que sigue después.
    this.authService.verifyMfa(setup.mfa_method_id, this.confirmForm.value.code!, recaptchaToken).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);

        if (res.data?.requires_email_otp && res.data?.otp_token) {
          this.otpToken = res.data.otp_token;
          this.step.set('email_otp');
          return;
        }

        if (res.success && res.data?.user) {
          this.successMessage.set('Dispositivo vinculado con éxito. Entrando...');
          this.authService.redirectUserByRole();
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || 'Código de confirmación incorrecto.');
      }
    });
  }

  async onOtpMailSubmit(): Promise<void> {
    if (this.otpMailForm.invalid || !this.otpToken) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    let recaptchaToken: string;
    try {
      recaptchaToken = await this.recaptchaService.execute('mfa_email_verify');
    } catch {
      this.isSubmitting.set(false);
      this.errorMessage.set('No se pudo verificar el reCAPTCHA. Intenta de nuevo.');
      return;
    }

    this.authService.verifyEmailOtp(this.otpToken, this.otpMailForm.value.code!, recaptchaToken).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.success && res.data?.user) {
          this.successMessage.set('Dispositivo vinculado con éxito. Entrando...');
          this.authService.redirectUserByRole();
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || 'Código OTP incorrecto.');
      }
    });
  }
}
