import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfiguracionService } from '../../services/configuracion.service';
import { ConfiguracionFechas } from '../../../../../core/models/configuracion.model';
import { AuthService } from '../../../../auth/services/auth.service';
import { SucursalService } from '../../../personal/services/sucursal.service';
import { Sucursal } from '../../../../../core/models/sucursal.model';

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
  private sucursalService = inject(SucursalService);

  /** El backend solo deja escribir a Gerente General -- Gerente de Sucursal comparte esta
   *  misma pantalla, pero solo para consulta. */
  puedeEditar = computed(() => this.authService.userRole() === 'Gerente General');

  fechas = signal<ConfiguracionFechas[]>([]);
  sucursales = signal<Sucursal[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  editando = signal<number | null>(null);
  guardando = signal(false);
  errorEdicion = signal<string | null>(null);

  /** Sucursales activas que todavía no tienen su propia regla de fechas -- hoy caen en el
   *  default global sin que el Gerente General tenga forma de darles una regla propia. */
  sucursalesSinRegla = computed(() => {
    const conRegla = new Set(this.fechas().map((f) => f.sucursal_id).filter((id): id is number => id !== null));
    return this.sucursales().filter((s) => s.is_active && !conRegla.has(s.id));
  });

  mostrandoNueva = signal(false);
  guardandoNueva = signal(false);
  errorNueva = signal<string | null>(null);

  editForm = this.fb.group({
    dia_corte: ['', [Validators.required, Validators.min(1), Validators.max(31)]],
    dia_corte_2: ['', [Validators.required, Validators.min(1), Validators.max(31)]],
    dia_limite_pago: ['', [Validators.required, Validators.min(1), Validators.max(31)]],
    dias_pago_anticipado: ['', [Validators.required, Validators.min(0), Validators.max(30)]]
  });

  nuevaForm = this.fb.group({
    sucursal_id: ['', [Validators.required]],
    dia_corte: ['', [Validators.required, Validators.min(1), Validators.max(31)]],
    dia_corte_2: ['', [Validators.required, Validators.min(1), Validators.max(31)]],
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

    // Se necesita el catálogo completo de sucursales para saber cuáles todavía no tienen
    // regla propia -- listarFechas() solo devuelve las que ya la tienen.
    this.sucursalService.listar(true).subscribe({
      next: (res) => this.sucursales.set(res.data ?? [])
    });
  }

  mostrarFormNueva(): void {
    this.mostrandoNueva.set(true);
    this.errorNueva.set(null);
    this.nuevaForm.reset({
      sucursal_id: '',
      dia_corte: '',
      dia_corte_2: '',
      dia_limite_pago: '',
      dias_pago_anticipado: ''
    });
  }

  cancelarNueva(): void {
    this.mostrandoNueva.set(false);
  }

  crearNueva(): void {
    if (this.nuevaForm.invalid) {
      this.nuevaForm.markAllAsTouched();
      return;
    }

    const v = this.nuevaForm.value;

    if (Number(v.dia_corte) === Number(v.dia_corte_2)) {
      this.errorNueva.set('El día de corte de la primera y segunda quincena deben ser distintos.');
      return;
    }

    this.guardandoNueva.set(true);
    this.errorNueva.set(null);

    this.configuracionService
      .cambiarFechas({
        sucursal_id: Number(v.sucursal_id),
        dia_corte: Number(v.dia_corte),
        dia_corte_2: Number(v.dia_corte_2),
        dia_limite_pago: Number(v.dia_limite_pago),
        dias_pago_anticipado: Number(v.dias_pago_anticipado)
      })
      .subscribe({
        next: () => {
          this.guardandoNueva.set(false);
          this.mostrandoNueva.set(false);
          this.cargar();
        },
        error: (err) => {
          this.guardandoNueva.set(false);
          this.errorNueva.set(err.error?.message || 'Ocurrió un error al crear la regla.');
        }
      });
  }

  iniciarEdicion(f: ConfiguracionFechas): void {
    this.editando.set(f.id);
    this.errorEdicion.set(null);
    this.editForm.setValue({
      dia_corte: String(f.dia_corte),
      dia_corte_2: String(f.dia_corte_2),
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

    const val = this.editForm.value;

    // El corte es quincenal: los dos días deben ser distintos, si no el mes solo tendría
    // un corte real (ver UpdateConfiguracionFechasRequest en el backend, 'different').
    if (Number(val.dia_corte) === Number(val.dia_corte_2)) {
      this.errorEdicion.set('El día de corte de la primera y segunda quincena deben ser distintos.');
      return;
    }

    this.guardando.set(true);
    this.errorEdicion.set(null);

    this.configuracionService
      .cambiarFechas({
        sucursal_id: f.sucursal_id,
        dia_corte: Number(val.dia_corte),
        dia_corte_2: Number(val.dia_corte_2),
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
