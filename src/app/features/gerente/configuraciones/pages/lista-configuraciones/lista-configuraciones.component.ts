import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfiguracionService } from '../../services/configuracion.service';
import { Configuracion } from '../../../../../core/models/configuracion.model';
import { configuracionClaveLabel } from '../../../../../shared/utils/labels';
import { AuthService } from '../../../../auth/services/auth.service';

@Component({
  selector: 'app-lista-configuraciones',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './lista-configuraciones.component.html',
  styleUrl: './lista-configuraciones.component.css'
})
export class ListaConfiguracionesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private configuracionService = inject(ConfiguracionService);
  private authService = inject(AuthService);

  /** El backend solo deja escribir a Gerente General -- Gerente de Sucursal comparte esta
   *  misma pantalla, pero solo para consulta. */
  puedeEditar = computed(() => this.authService.userRole() === 'Gerente General');

  configuraciones = signal<Configuracion[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  editando = signal<string | null>(null);
  guardando = signal(false);
  errorEdicion = signal<string | null>(null);

  historialAbierto = signal<string | null>(null);
  historial = signal<Configuracion[]>([]);
  cargandoHistorial = signal(false);

  readonly configuracionClaveLabel = configuracionClaveLabel;

  editForm = this.fb.group({
    valor: ['', [Validators.required, Validators.maxLength(255)]]
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.configuracionService.listar().subscribe({
      next: (res) => {
        this.configuraciones.set(res.data ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las configuraciones.');
        this.cargando.set(false);
      }
    });
  }

  iniciarEdicion(config: Configuracion): void {
    this.editando.set(config.clave);
    this.errorEdicion.set(null);
    this.editForm.setValue({ valor: config.valor });
  }

  cancelarEdicion(): void {
    this.editando.set(null);
  }

  guardar(config: Configuracion): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.errorEdicion.set(null);

    this.configuracionService
      .cambiarValor({
        clave: config.clave,
        valor: this.editForm.value.valor!,
        tipo_dato: config.tipo_dato
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

  toggleHistorial(clave: string): void {
    if (this.historialAbierto() === clave) {
      this.historialAbierto.set(null);
      return;
    }

    this.historialAbierto.set(clave);
    this.cargandoHistorial.set(true);
    this.historial.set([]);

    this.configuracionService.historial(clave).subscribe({
      next: (res) => {
        this.historial.set(res.data ?? []);
        this.cargandoHistorial.set(false);
      },
      error: () => this.cargandoHistorial.set(false)
    });
  }
}
