import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { GooglePlacesAutocompleteDirective } from '../../directives/google-places-autocomplete.directive';
import { parsearDireccionGoogle } from '../../utils/google-address.util';
import { SoloNumerosDirective } from '../../directives/solo-numeros.directive';
import { MayusculasDirective } from '../../directives/mayusculas.directive';
import { MENSAJES_PATRON } from '../../utils/mexico-validators';
import { SelectorFechaComponent } from '../selector-fecha/selector-fecha.component';

/**
 * Datos Personales + Dirección + Referencia Laboral -- el mismo bloque que ya usa la alta de
 * distribuidora (ver nueva-solicitud.component.html), factorizado para que cualquier alta de
 * personal interno lo use tal cual, en vez de una copia. El padre crea el FormGroup con
 * crearGrupoDatosPersonales() y lo pasa aquí; este componente solo lo renderiza.
 */
@Component({
  selector: 'app-datos-personales-fields',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GooglePlacesAutocompleteDirective, SoloNumerosDirective, MayusculasDirective, SelectorFechaComponent],
  templateUrl: './datos-personales-fields.component.html'
})
export class DatosPersonalesFieldsComponent {
  @Input({ required: true }) group!: FormGroup;
  @Input() fieldErrors: Record<string, string[]> = {};

  sesgoDireccion = signal<{ lat: number; lng: number } | null>(null);

  readonly mensajesPatron = MENSAJES_PATRON;

  /** No se puede escribir la fecha a mano (readonly), solo elegirla en el calendario, y no permite menores de edad. */
  readonly fechaMaximaNacimiento = this.calcularFechaMaxima18Anios();

  private calcularFechaMaxima18Anios(): string {
    const hoy = new Date();
    const hace18 = new Date(hoy.getFullYear() - 18, hoy.getMonth(), hoy.getDate());
    return hace18.toISOString().slice(0, 10);
  }

  errorFor(campo: string): string | null {
    const control = this.group.get(campo);
    if (control?.invalid && (control.touched || control.dirty)) {
      if (control.errors?.['required']) return 'Este campo es obligatorio.';
      if (control.errors?.['pattern']) return this.mensajesPatron[campo] ?? 'Formato inválido.';
    }
    return this.fieldErrors[campo]?.[0] ?? null;
  }

  /** El usuario eligió un CP de las sugerencias: lo usamos para sesgar el autocompletado de Calle. */
  onCodigoPostalSeleccionado(place: any): void {
    const direccion = parsearDireccionGoogle(place);

    this.group.patchValue({
      codigo_postal: direccion.codigo_postal || this.group.value.codigo_postal,
      estado: direccion.estado || this.group.value.estado,
      ciudad: direccion.ciudad || this.group.value.ciudad
    });

    if (direccion.lat && direccion.lng) {
      this.sesgoDireccion.set({ lat: direccion.lat, lng: direccion.lng });
    }
  }

  /**
   * El usuario eligió una calle de las sugerencias: llenamos calle/colonia. Estado y Ciudad son
   * autoridad exclusiva del Código Postal (ver onCodigoPostalSeleccionado) -- Google a veces
   * nombra la misma zona distinto a nivel calle que a nivel CP, así que si la calle los tocara
   * podría contradecir al CP ya elegido. Solo los llenamos aquí si el CP todavía no los estableció.
   */
  onCalleSeleccionada(place: any): void {
    const direccion = parsearDireccionGoogle(place);

    this.group.patchValue({
      calle: direccion.calle || this.group.value.calle,
      numero_ext: direccion.numero_ext || this.group.value.numero_ext,
      colonia: direccion.colonia || this.group.value.colonia,
      estado: this.group.value.estado || direccion.estado || '',
      ciudad: this.group.value.ciudad || direccion.ciudad || ''
    });
  }
}
