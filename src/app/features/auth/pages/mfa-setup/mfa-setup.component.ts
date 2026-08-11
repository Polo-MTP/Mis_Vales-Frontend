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
  templateUrl: './mfa-setup.component.html',
  styleUrl: './mfa-setup.component.css'
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
