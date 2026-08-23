import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SucursalService } from '../../services/sucursal.service';
import { UsuarioService } from '../../services/usuario.service';
import { Sucursal } from '../../../../../core/models/sucursal.model';

@Component({
  selector: 'app-crear-gerente-sucursal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-gerente-sucursal.component.html'
})
export class CrearGerenteSucursalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private sucursalService = inject(SucursalService);
  private usuarioService = inject(UsuarioService);

  sucursales = signal<Sucursal[]>([]);
  cargandoSucursales = signal(true);

  enviando = signal(false);
  errorMessage = signal<string | null>(null);
  exito = signal<string | null>(null);
  fieldErrors = signal<Record<string, string[]>>({});

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    email: ['', [Validators.required, Validators.email]],
    sucursal_id: ['', [Validators.required]]
  });

  ngOnInit(): void {
    this.sucursalService.listar(true).subscribe({
      next: (res) => {
        this.sucursales.set(res.data ?? []);
        this.cargandoSucursales.set(false);
      },
      error: () => this.cargandoSucursales.set(false)
    });
  }

  errorFor(campo: string): string | null {
    return this.fieldErrors()[campo]?.[0] ?? null;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.errorMessage.set(null);
    this.exito.set(null);
    this.fieldErrors.set({});

    const v = this.form.value;

    this.usuarioService
      .crearGerenteSucursal({
        name: v.name!,
        email: v.email!,
        sucursal_id: Number(v.sucursal_id)
      })
      .subscribe({
        next: (res) => {
          this.enviando.set(false);
          this.exito.set(`Gerente de Sucursal "${res.data?.name}" creado correctamente. Se le envió su contraseña por correo.`);
          this.form.reset({ name: '', email: '', sucursal_id: '' });
        },
        error: (err) => {
          this.enviando.set(false);
          this.errorMessage.set(err.error?.message || 'Ocurrió un error al crear el usuario.');
          this.fieldErrors.set(err.error?.errors || {});
        }
      });
  }
}
