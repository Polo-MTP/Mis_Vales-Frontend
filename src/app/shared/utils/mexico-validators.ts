import { Validators } from '@angular/forms';

/** RFC persona física: 4 letras + 6 dígitos (fecha) + 3 caracteres homoclave. */
export const RFC_PATTERN = /^[A-ZÑ&]{4}\d{6}[A-Z0-9]{3}$/i;

/** CURP: 4 letras + 6 dígitos (fecha) + sexo (H/M) + 5 letras + 2 alfanuméricos. */
export const CURP_PATTERN = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]{2}$/i;

/** Código postal mexicano: exactamente 5 dígitos. */
export const CODIGO_POSTAL_PATTERN = /^\d{5}$/;

/** Número exterior/interior: letras, números, espacios y separadores comunes (ej. "S/N", "123-A"). */
export const NUMERO_PATTERN = /^[A-Za-z0-9\s\-\/#.]+$/;

export const rfcValidators = [Validators.required, Validators.pattern(RFC_PATTERN)];
export const curpValidators = [Validators.required, Validators.pattern(CURP_PATTERN)];
export const codigoPostalValidators = [Validators.required, Validators.pattern(CODIGO_POSTAL_PATTERN)];
export const numeroExtValidators = [Validators.required, Validators.pattern(NUMERO_PATTERN), Validators.maxLength(50)];
export const numeroIntValidators = [Validators.pattern(NUMERO_PATTERN), Validators.maxLength(50)];

/** Mensajes de error legibles para mostrar bajo cada campo cuando el patrón no coincide. */
export const MENSAJES_PATRON: Record<string, string> = {
  rfc: 'El RFC debe tener 13 caracteres (4 letras, 6 dígitos de fecha, 3 de homoclave).',
  curp: 'La CURP debe tener 18 caracteres en formato válido.',
  codigo_postal: 'El código postal debe tener exactamente 5 dígitos.',
  numero_ext: 'Usa solo letras, números y separadores como - / #.',
  numero_int: 'Usa solo letras, números y separadores como - / #.'
};
