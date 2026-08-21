import { Validators } from '@angular/forms';

/**
 * Espeja la regla del backend (`Password::min(8)->mixedCase()->numbers()` en
 * AppServiceProvider): mínimo 8 caracteres, al menos una mayúscula, una minúscula y un
 * número. Sin esto el gerente solo se entera de que la contraseña es débil hasta que el
 * backend rechaza el aprobar-solicitud con un 422.
 */
export const PASSWORD_SEGURA_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const passwordSeguraValidators = [Validators.required, Validators.pattern(PASSWORD_SEGURA_PATTERN)];

export const MENSAJE_PASSWORD_SEGURA = 'Mínimo 8 caracteres, con al menos una mayúscula, una minúscula y un número.';

const CHARS_MAYUSCULAS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const CHARS_MINUSCULAS = 'abcdefghjkmnpqrstuvwxyz';
const CHARS_NUMEROS = '23456789';
const CHARS_ESPECIALES = '!@#$%*?';

/** Genera una contraseña aleatoria que siempre cumple passwordSeguraValidators. */
export function generarPasswordSegura(longitud = 12): string {
  const obligatorios = [
    pick(CHARS_MAYUSCULAS),
    pick(CHARS_MINUSCULAS),
    pick(CHARS_NUMEROS),
    pick(CHARS_ESPECIALES)
  ];

  const todos = CHARS_MAYUSCULAS + CHARS_MINUSCULAS + CHARS_NUMEROS + CHARS_ESPECIALES;
  const resto = Array.from({ length: Math.max(longitud - obligatorios.length, 0) }, () => pick(todos));

  return mezclar([...obligatorios, ...resto]).join('');
}

function pick(chars: string): string {
  return chars[Math.floor(Math.random() * chars.length)];
}

function mezclar<T>(arr: T[]): T[] {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}
