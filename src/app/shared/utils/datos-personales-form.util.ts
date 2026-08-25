import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { codigoPostalValidators, curpValidators, numeroExtValidators, numeroIntValidators, rfcValidators } from './mexico-validators';

/**
 * Mismo expediente que ya captura la alta de una distribuidora (Datos Personales + Dirección +
 * RFC + Referencia Laboral, ver nueva-solicitud.component.ts) -- factorizado aquí para que el
 * alta de personal interno (Gerente de Sucursal, Administrador, Coordinador/Verificador/Cajera,
 * Gerente General) use exactamente el mismo formulario, no una copia con sus propias reglas que
 * se puede desincronizar. Usar junto con <app-datos-personales-fields [group]="...">.
 */
export function crearGrupoDatosPersonales(fb: FormBuilder): FormGroup {
  return fb.group({
    rfc: ['', rfcValidators],
    nombre: ['', [Validators.required, Validators.maxLength(255)]],
    apellido_paterno: ['', [Validators.required, Validators.maxLength(255)]],
    apellido_materno: ['', [Validators.maxLength(255)]],
    curp: ['', curpValidators],
    fecha_nacimiento: [''],
    lugar_nacimiento: ['', [Validators.maxLength(255)]],
    codigo_postal: ['', codigoPostalValidators],
    calle: ['', [Validators.required, Validators.maxLength(255)]],
    colonia: ['', [Validators.required, Validators.maxLength(255)]],
    numero_ext: ['', numeroExtValidators],
    numero_int: ['', numeroIntValidators],
    estado: ['', [Validators.required, Validators.maxLength(255)]],
    ciudad: ['', [Validators.required, Validators.maxLength(255)]],
    referencia_laboral: ['', [Validators.maxLength(255)]]
  });
}

/** Forma exacta de crearGrupoDatosPersonales(...).value -- para tipar el payload que cada
 *  formulario de alta de personal manda, junto con sus propios campos (email, rol, sucursal...). */
export interface DatosPersonalesPayload {
  rfc: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string;
  curp: string;
  fecha_nacimiento?: string;
  lugar_nacimiento?: string;
  codigo_postal: string;
  calle: string;
  colonia: string;
  numero_ext: string;
  numero_int?: string;
  estado: string;
  ciudad: string;
  referencia_laboral?: string;
}

/** Limpia el .value crudo del FormGroup (strings vacíos -> undefined) antes de mandarlo al backend. */
export function datosPersonalesPayload(group: FormGroup): DatosPersonalesPayload {
  const val = group.value;
  return {
    rfc: val.rfc!,
    nombre: val.nombre!,
    apellido_paterno: val.apellido_paterno!,
    apellido_materno: val.apellido_materno || undefined,
    curp: val.curp!,
    fecha_nacimiento: val.fecha_nacimiento || undefined,
    lugar_nacimiento: val.lugar_nacimiento || undefined,
    codigo_postal: val.codigo_postal!,
    calle: val.calle!,
    colonia: val.colonia!,
    numero_ext: val.numero_ext!,
    numero_int: val.numero_int || undefined,
    estado: val.estado!,
    ciudad: val.ciudad!,
    referencia_laboral: val.referencia_laboral || undefined
  };
}
