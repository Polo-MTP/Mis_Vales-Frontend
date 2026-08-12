import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PuntoCanjeService } from '../../services/punto-canje.service';
import { PuntoMovimiento } from '../../../../../core/models/punto-movimiento.model';

@Component({
  selector: 'app-canjear-puntos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './canjear-puntos.component.html',
  styleUrl: './canjear-puntos.component.css'
})
export class CanjearPuntosComponent {
  private fb = inject(FormBuilder);
  private puntoCanjeService = inject(PuntoCanjeService);

  form = this.fb.group({
    distribuidora_id: ['', [Validators.required]],
    cantidad: ['', [Validators.required, Validators.min(1)]],
    motivo: ['', [Validators.required, Validators.maxLength(255)]]
  });

  enviando = signal(false);
  error = signal<string | null>(null);
  ultimoMovimiento = signal<PuntoMovimiento | null>(null);

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.value;

    this.enviando.set(true);
    this.error.set(null);
    this.ultimoMovimiento.set(null);

    this.puntoCanjeService.canjear(Number(val.distribuidora_id), Number(val.cantidad), val.motivo!).subscribe({
      next: (res) => {
        this.enviando.set(false);
        this.ultimoMovimiento.set(res.data ?? null);
        this.form.reset();
      },
      error: (err) => {
        this.enviando.set(false);
        this.error.set(err.error?.message || 'Ocurrió un error al canjear los puntos.');
      }
    });
  }
}
