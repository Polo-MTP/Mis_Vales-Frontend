import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SucursalService } from '../../services/sucursal.service';
import { UsuarioService, RolPersonalSucursal } from '../../services/usuario.service';
import { UsuarioService as UsuariosPorRolService } from '../../../../../core/services/usuario.service';
import { Sucursal } from '../../../../../core/models/sucursal.model';
import { User } from '../../../../../core/models/user.model';
import { AuthService } from '../../../../auth/services/auth.service';
import { DatosPersonalesFieldsComponent } from '../../../../../shared/components/datos-personales-fields/datos-personales-fields.component';
import { crearGrupoDatosPersonales, datosPersonalesPayload } from '../../../../../shared/utils/datos-personales-form.util';

@Component({
  selector: 'app-crear-personal-sucursal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatosPersonalesFieldsComponent],
  templateUrl: './crear-personal-sucursal.component.html'
})
export class CrearPersonalSucursalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private sucursalService = inject(SucursalService);
  private usuarioService = inject(UsuarioService);
  private usuariosPorRolService = inject(UsuariosPorRolService);
  private authService = inject(AuthService);

  readonly roles: RolPersonalSucursal[] = ['Coordinador', 'Verificador', 'Cajera'];

  esGerenteGeneral = computed(() => this.authService.userRole() === 'Gerente General');

  sucursales = signal<Sucursal[]>([]);
  gerentesDeSucursal = signal<User[]>([]);
  cargandoOpciones = signal(true);

  enviando = signal(false);
  errorMessage = signal<string | null>(null);
  exito = signal<string | null>(null);
  fieldErrors = signal<Record<string, string[]>>({});

  /** Mismo formulario que el alta de una distribuidora -- ver DatosPersonalesFieldsComponent. */
  datosPersonales = crearGrupoDatosPersonales(this.fb);

  form = this.fb.group({
    rol: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    sucursal_id: [''],
    gerente_id: ['']
  });

  /** Espejo en señal del valor del select de sucursal. Un FormControl NO es una señal, así que
   *  un computed() que leyera form.get('sucursal_id').value directo se calcularía una sola vez y
   *  jamás volvería a recalcularse al elegir sucursal -- el select de gerente se quedaba vacío
   *  para siempre y el alta era imposible de enviar. Se actualiza desde valueChanges en ngOnInit. */
  private sucursalSeleccionada = signal<number>(0);

  /** Solo se le muestran al Gerente General los gerentes que pertenecen a la sucursal elegida. */
  gerentesDeLaSucursalElegida = computed(() => {
    const sucursalId = this.sucursalSeleccionada();
    if (!sucursalId) {
      return [];
    }

    return this.gerentesDeSucursal().filter((g) => g.sucursal_id === sucursalId);
  });

  ngOnInit(): void {
    if (!this.esGerenteGeneral()) {
      this.cargandoOpciones.set(false);
      return;
    }

    this.form.get('sucursal_id')?.setValidators([Validators.required]);
    this.form.get('gerente_id')?.setValidators([Validators.required]);

    this.form.get('sucursal_id')?.valueChanges.subscribe((valor) => {
      this.sucursalSeleccionada.set(Number(valor || 0));
      this.form.get('gerente_id')?.setValue('');
    });

    this.sucursalService.listar(true).subscribe({
      next: (res) => {
        this.sucursales.set(res.data ?? []);
        this.cargandoOpciones.set(false);
      },
      error: () => this.cargandoOpciones.set(false)
    });

    this.usuariosPorRolService.listar('Gerente de Sucursal').subscribe({
      next: (res) => this.gerentesDeSucursal.set(res.data ?? [])
    });
  }

  errorFor(campo: string): string | null {
    return this.fieldErrors()[campo]?.[0] ?? null;
  }

  onSubmit(): void {
    if (this.datosPersonales.invalid || this.form.invalid) {
      this.datosPersonales.markAllAsTouched();
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.errorMessage.set(null);
    this.exito.set(null);
    this.fieldErrors.set({});

    const v = this.form.value;

    this.usuarioService
      .crearPersonalSucursal({
        ...datosPersonalesPayload(this.datosPersonales),
        rol: v.rol as RolPersonalSucursal,
        email: v.email!,
        ...(this.esGerenteGeneral()
          ? { sucursal_id: Number(v.sucursal_id), gerente_id: Number(v.gerente_id) }
          : {})
      })
      .subscribe({
        next: (res) => {
          this.enviando.set(false);
          this.exito.set(`${res.data?.role?.name} "${res.data?.name}" creado correctamente. Se le envió su contraseña por correo.`);
          this.datosPersonales.reset();
          this.form.reset({
            rol: '', email: '',
            sucursal_id: '', gerente_id: ''
          });
        },
        error: (err) => {
          this.enviando.set(false);
          this.errorMessage.set(err.error?.message || 'Ocurrió un error al crear el usuario.');
          this.fieldErrors.set(err.error?.errors || {});
        }
      });
  }
}
