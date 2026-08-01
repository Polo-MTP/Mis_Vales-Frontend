import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AlertComponent],
  template: `
    <div class="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <div class="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 space-y-6">
        
        <div class="text-center space-y-2">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mb-1">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 class="text-2xl font-black text-slate-800 tracking-tight">Crear Cuenta</h2>
          <p class="text-xs text-slate-500 font-medium">Ingresa tus datos para registrarte</p>
        </div>

        <app-alert [message]="errorMessage()" type="error"></app-alert>
        <app-alert [message]="successMessage()" type="success"></app-alert>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">Nombre Completo</label>
            <input type="text" formControlName="name" placeholder="Juan Pérez"
                   class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">Correo Electrónico</label>
            <input type="email" formControlName="email" placeholder="tu@correo.com"
                   class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">Contraseña</label>
            <input type="password" formControlName="password" (input)="evaluatePassword()" placeholder="••••••••"
                   class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
            
            <div class="mt-3 p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2 text-xs">
              <span class="font-bold text-slate-700 block">Requisitos de contraseña:</span>
              <ul class="space-y-1">
                <li [ngClass]="rules().length ? 'text-emerald-600 font-medium' : 'text-slate-400'" class="flex items-center space-x-1.5">
                  <span>{{ rules().length ? '✓' : '✕' }}</span> <span>Mínimo 8 caracteres</span>
                </li>
                <li [ngClass]="rules().lowercase ? 'text-emerald-600 font-medium' : 'text-slate-400'" class="flex items-center space-x-1.5">
                  <span>{{ rules().lowercase ? '✓' : '✕' }}</span> <span>Al menos una letra minúscula</span>
                </li>
                <li [ngClass]="rules().uppercase ? 'text-emerald-600 font-medium' : 'text-slate-400'" class="flex items-center space-x-1.5">
                  <span>{{ rules().uppercase ? '✓' : '✕' }}</span> <span>Al menos una letra mayúscula</span>
                </li>
                <li [ngClass]="rules().number ? 'text-emerald-600 font-medium' : 'text-slate-400'" class="flex items-center space-x-1.5">
                  <span>{{ rules().number ? '✓' : '✕' }}</span> <span>Al menos un número</span>
                </li>
                <li [ngClass]="rules().special ? 'text-emerald-600 font-medium' : 'text-slate-400'" class="flex items-center space-x-1.5">
                  <span>{{ rules().special ? '✓' : '✕' }}</span> <span>Al menos un carácter especial</span>
                </li>
              </ul>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">Confirmar Contraseña</label>
            <input type="password" formControlName="password_confirmation" placeholder="••••••••"
                   class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
          </div>

          <button type="submit" [disabled]="registerForm.invalid || isLoading()"
                  class="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center">
            <span *ngIf="!isLoading()">Crear Cuenta</span>
            <span *ngIf="isLoading()">Registrando...</span>
          </button>

          <div class="text-center pt-2">
            <a routerLink="/auth/login" class="text-xs font-semibold text-blue-600 hover:text-blue-700">
              ¿Ya tienes cuenta? Inicia Sesión
            </a>
          </div>
        </form>

      </div>
    </div>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  rules = signal({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    special: false
  });

  registerForm = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', [Validators.required]]
  });

  evaluatePassword(): void {
    const val = this.registerForm.value.password || '';
    this.rules.set({
      length: val.length >= 8,
      lowercase: /[a-z]/.test(val),
      uppercase: /[A-Z]/.test(val),
      number: /[0-9]/.test(val),
      special: /[!@#$%^&*()\-_=+]/.test(val)
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    if (this.registerForm.value.password !== this.registerForm.value.password_confirmation) {
      this.errorMessage.set('Las contraseñas no coinciden.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const form = this.registerForm.value;
    this.authService.register({
      name: form.name!,
      email: form.email!,
      password: form.password!,
      password_confirmation: form.password_confirmation!,
      recaptcha: 'bypass-recaptcha'
    }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success) {
          this.successMessage.set(res.message);
          setTimeout(() => this.router.navigate(['/dashboard']), 1000);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Error al registrar la cuenta.');
      }
    });
  }
}
