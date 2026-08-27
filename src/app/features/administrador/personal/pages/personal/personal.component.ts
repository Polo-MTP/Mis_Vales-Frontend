import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrearGerenteGeneralComponent } from '../../../../gerente/personal/pages/crear-gerente-general/crear-gerente-general.component';
import { CrearGerenteSucursalComponent } from '../../../../gerente/personal/pages/crear-gerente-sucursal/crear-gerente-sucursal.component';
import { CrearPersonalSucursalComponent } from '../../../../gerente/personal/pages/crear-personal-sucursal/crear-personal-sucursal.component';
import { SucursalMatrizComponent } from '../../components/sucursal-matriz/sucursal-matriz.component';
import { UsuarioService } from '../../../../gerente/personal/services/usuario.service';

/**
 * Solo Administrador llega aquí: administra la sucursal matriz (solo puede haber una, se
 * provisiona por seeder), da de alta al Gerente General (que se asigna automáticamente a esa
 * matriz) y, además, puede dar de alta Gerente de Sucursal y personal operativo (Coordinador/
 * Verificador/Cajera) -- mismos formularios que usa Gerente General en /gerente/personal, el
 * backend ya acepta a Administrador en esos mismos endpoints. Solo puede haber UN Gerente
 * General en todo el sistema -- el backend ya lo bloquea, pero aquí además se oculta el
 * formulario en cuanto uno existe, para no ofrecer una acción que va a fallar seguro. No hay
 * ningún flujo para dar de alta cuentas de Administrador -- se provisionan fuera de la app.
 */
@Component({
  selector: 'app-administrador-personal',
  standalone: true,
  imports: [
    CommonModule,
    SucursalMatrizComponent,
    CrearGerenteGeneralComponent,
    CrearGerenteSucursalComponent,
    CrearPersonalSucursalComponent
  ],
  templateUrl: './personal.component.html'
})
export class AdministradorPersonalComponent implements OnInit {
  private usuarioService = inject(UsuarioService);

  cargandoGerenteGeneral = signal(true);
  yaExisteGerenteGeneral = signal(false);

  ngOnInit(): void {
    this.usuarioService.listar('Gerente General').subscribe({
      next: (res) => {
        this.yaExisteGerenteGeneral.set((res.data ?? []).length > 0);
        this.cargandoGerenteGeneral.set(false);
      },
      error: () => {
        this.cargandoGerenteGeneral.set(false);
      }
    });
  }
}
