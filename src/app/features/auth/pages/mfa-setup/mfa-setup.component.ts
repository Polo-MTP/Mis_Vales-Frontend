import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from '../../services/auth.service';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';
import { MfaSetupData } from '../../../../core/models/auth-response.model';

@Component({
  selector: 'app-mfa-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AlertComponent],
  template: `
    <div class="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <div class="w-full max-w-lg bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 space-y-6">
        
        <div class="text-center space-y-2">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mb-1">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457-.39-2.823-1.07-4" />
            </svg>
          </div>
          <h2 class="text-2xl font-black text-slate-800 tracking-tight">Configuración Autenticador</h2>
          <p class="text-xs text-slate-500 font-medium">Vincula Google Authenticator en tu dispositivo</p>
        </div>

        <app-alert [message]="errorMessage()" type="error"></app-alert>
        <app-alert [message]="successMessage()" type="success"></app-alert>

        <div *ngIf="isLoadingData()" class="py-12 text-center text-xs text-slate-500 font-medium">
          Cargando parámetros de seguridad y código QR...
        </div>

        <div *ngIf="!isLoadingData() && setupData()" class="space-y-6">
          <div class="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-4">
            <p class="text-xs text-slate-600 text-center">
              Abre Google Authenticator en tu teléfono y escanea este código QR:
            </p>
            
            <div class="flex justify-center p-4 bg-white rounded-xl border border-slate-200 shadow-sm" [innerHTML]="safeQrSvg()">
            </div>

            <div class="text-center space-y-1">
              <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">O ingresa esta llave manualmente:</span>
              <div class="p-2.5 bg-slate-100 rounded-lg text-sm font-mono font-bold text-slate-800 tracking-wider border border-slate-200">
                {{ setupData()?.secretKey }}
              </div>
            </div>
          </div>

          <form [formGroup]="confirmForm" (ngSubmit)="onConfirmSubmit()" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5 text-center">Ingresa el código de 6 dígitos para verificar</label>
              <input type="text" formControlName="code" maxlength="6" placeholder="123456"
                     class="w-full py-3 text-center text-2xl tracking-[0.5em] font-mono font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            </div>

            <button type="submit" [disabled]="confirmForm.invalid || isSubmitting()"
                    class="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/25 transition-all">
              <span *ngIf="!isSubmitting()">Vincular Dispositivo</span>
              <span *ngIf="isSubmitting()">Verificando llave...</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  `
})
export class MfaSetupComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private sanitizer = inject(DomSanitizer);

  setupData = signal<MfaSetupData | null>(null);
  safeQrSvg = signal<SafeHtml>('');
  isLoadingData = signal<boolean>(true);
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  confirmForm = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
  });

  ngOnInit(): void {
    const email = this.route.snapshot.queryParams['email'];
    if (!email) {
      this.errorMessage.set('Correo no proporcionado en la solicitud.');
      this.isLoadingData.set(false);
      return;
    }

    this.authService.getMfaSetup(email).subscribe({
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

  onConfirmSubmit(): void {
    const setup = this.setupData();
    if (this.confirmForm.invalid || !setup) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.authService.confirmMfaSetup(setup.mfa_method_id, this.confirmForm.value.code!).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.success) {
          this.successMessage.set('Dispositivo vinculado con éxito. Redirigiendo a inicio de sesión...');
          setTimeout(() => this.router.navigate(['/auth/login']), 1500);
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || 'Código de confirmación incorrecto.');
      }
    });
  }
}
