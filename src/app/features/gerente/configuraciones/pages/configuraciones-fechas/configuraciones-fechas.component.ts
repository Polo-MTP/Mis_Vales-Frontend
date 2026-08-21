import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfiguracionService } from '../../services/configuracion.service';
import { ConfiguracionFechas } from '../../../../../core/models/configuracion.model';
import { AuthService } from '../../../../auth/services/auth.service';

@Component({
  selector: 'app-configuraciones-fechas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './configuraciones-fechas.component.html',
  styleUrl: './configuraciones-fechas.component.css'
})
export class ConfiguracionesFechasComponent implements OnInit {
  private fb = inject(FormBuilder);
  private configuracionService = inject(ConfiguracionService);
  private authService = inject(AuthService);

  /** El backend solo deja escribir a Gerente General -- Gerente de Sucursal comparte esta
   *  misma pantalla, pero solo para consulta. */
  puedeEditar = computed(() => this.authService.userRole() === 'Gerente General');

  fechas = signal<ConfiguracionFechas[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  editando = signal<number | null>(null);
  guardando = signal(false);
  errorEdicion = signal<string | null>(null);

  editForm = this.fb.group({
    dia_corte: ['', [Validators.required, Validators.min(1), Validators.max(31)]],
    dia_limite_pago: ['', [Validators.required, Validators.min(1), Validators.max(31)]],
    dias_pago_anticipado: ['', [Validators.required, Validators.min(0), Validators.max(30)]]
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.configuracionService.listarFechas().subscribe({
      next: (res) => {
        this.fechas.set(res.data ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las configuraciones de fechas.');
        this.cargando.set(false);
      }
    });
  }

  iniciarEdicion(f: ConfiguracionFechas): void {
    this.editando.set(f.id);
    this.errorEdicion.set(null);
    this.editForm.setValue({
      dia_corte: String(f.dia_corte),
      dia_limite_pago: String(f.dia_limite_pago),
      dias_pago_anticipado: String(f.dias_pago_anticipado)
    });
  }

  cancelarEdicion(): void {
    this.editando.set(null);
  }

  guardar(f: ConfiguracionFechas): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.errorEdicion.set(null);

    const val = this.editForm.value;

    this.configuracionService
      .cambiarFechas({
        sucursal_id: f.sucursal_id,
        dia_corte: Number(val.dia_corte),
        dia_limite_pago: Number(val.dia_limite_pago),
        dias_pago_anticipado: Number(val.dias_pago_anticipado)
      })
      .subscribe({
        next: () => {
          this.guardando.set(false);
          this.editando.set(null);
          this.cargar();
        },
        error: (err) => {
          this.guardando.set(false);
          this.errorEdicion.set(err.error?.message || 'Ocurrió un error al guardar el cambio.');
        }
      });
  }
}
