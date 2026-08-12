import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PuntoCanjeService } from '../../services/punto-canje.service';
import { DistribuidoraService } from '../../../distribuidoras/services/distribuidora.service';
import { PuntoMovimiento } from '../../../../../core/models/punto-movimiento.model';
import { DistribuidoraResumen } from '../../../../../core/models/distribuidora.model';

@Component({
  selector: 'app-canjear-puntos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './canjear-puntos.component.html',
  styleUrl: './canjear-puntos.component.css'
})
export class CanjearPuntosComponent implements OnInit {
  private fb = inject(FormBuilder);
  private puntoCanjeService = inject(PuntoCanjeService);
  private distribuidoraService = inject(DistribuidoraService);

  distribuidoras = signal<DistribuidoraResumen[]>([]);
  cargandoDistribuidoras = signal(true);

  form = this.fb.group({
    distribuidora_id: ['', [Validators.required]],
    cantidad: ['', [Validators.required, Validators.min(1)]],
    motivo: ['', [Validators.required, Validators.maxLength(255)]]
  });

  enviando = signal(false);
  error = signal<string | null>(null);
  ultimoMovimiento = signal<PuntoMovimiento | null>(null);

  historial = signal<PuntoMovimiento[]>([]);
  cargandoHistorial = signal(false);

  ngOnInit(): void {
    this.distribuidoraService.listar().subscribe({
      next: (dists) => {
        this.distribuidoras.set(dists ?? []);
        this.cargandoDistribuidoras.set(false);
      },
      error: () => this.cargandoDistribuidoras.set(false)
    });
  }

  onCambiarDistribuidora(): void {
    const id = Number(this.form.value.distribuidora_id);
    this.historial.set([]);
    if (!id) return;

    this.cargandoHistorial.set(true);
    this.puntoCanjeService.historial(id).subscribe({
      next: (res) => {
        this.historial.set(res.data?.data ?? []);
        this.cargandoHistorial.set(false);
      },
      error: () => this.cargandoHistorial.set(false)
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.value;
    const distribuidoraId = Number(val.distribuidora_id);

    this.enviando.set(true);
    this.error.set(null);
    this.ultimoMovimiento.set(null);

    this.puntoCanjeService.canjear(distribuidoraId, Number(val.cantidad), val.motivo!).subscribe({
      next: (res) => {
        this.enviando.set(false);
        this.ultimoMovimiento.set(res.data ?? null);
        this.form.patchValue({ cantidad: '', motivo: '' });
        this.onCambiarDistribuidora();
      },
      error: (err) => {
        this.enviando.set(false);
        this.error.set(err.error?.message || 'Ocurrió un error al canjear los puntos.');
      }
    });
  }
}
