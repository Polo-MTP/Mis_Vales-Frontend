/**
 * Catálogo único de estados de todo el sistema: etiqueta legible + tono de color.
 *
 * Antes cada pantalla resolvía el estado por su cuenta: unas pintaban el valor crudo de la base
 * ("ACTIVO", "liquidada", "aprobado"), otras usaban una función de etiqueta, y los colores se
 * repetían a mano en cada plantilla con cadenas larguísimas de [class.bg-...]. Resultado: la misma
 * entidad se veía distinta según la vista, y agregar un estado nuevo obligaba a tocar N plantillas.
 *
 * Aquí vive la única definición. Las vistas solo usan <app-estado-badge [tipo] [estado]>.
 */

/** Familia de estado. Cada entidad tiene su propio vocabulario aunque compartan palabras. */
export type TipoEstado =
  | 'vale'
  | 'relacion'
  | 'distribuidora'
  | 'solicitud-proveedor'
  | 'abono'
  | 'autorizacion'
  | 'transferencia'
  | 'activacion';

/** Significado del estado, no su color literal: el color lo decide el badge en un solo lugar. */
export type TonoEstado = 'exito' | 'advertencia' | 'peligro' | 'info' | 'progreso' | 'neutro';

export interface DefinicionEstado {
  label: string;
  tono: TonoEstado;
}

const CATALOGO: Record<TipoEstado, Record<string, DefinicionEstado>> = {
  vale: {
    solicitado: { label: 'Solicitado', tono: 'advertencia' },
    validado: { label: 'Validado', tono: 'progreso' },
    autorizado: { label: 'Autorizado', tono: 'info' },
    pagado: { label: 'Pagado', tono: 'exito' },
    parcial: { label: 'Pago parcial', tono: 'advertencia' },
    vencido: { label: 'Vencido', tono: 'peligro' },
    incidencia: { label: 'Con incidencia', tono: 'peligro' }
  },

  relacion: {
    pendiente: { label: 'Pendiente', tono: 'advertencia' },
    parcial: { label: 'Pago parcial', tono: 'advertencia' },
    vencida: { label: 'Vencida', tono: 'peligro' },
    en_perdida: { label: 'En pérdida', tono: 'peligro' },
    perdonada: { label: 'Perdonada', tono: 'info' },
    liquidada: { label: 'Liquidada', tono: 'exito' }
  },

  // En la base viven en MAYÚSCULAS; el badge normaliza antes de buscar.
  distribuidora: {
    en_captura: { label: 'En captura', tono: 'neutro' },
    en_verificacion: { label: 'En verificación', tono: 'progreso' },
    pendiente_aprobacion: { label: 'Pendiente de aprobación', tono: 'advertencia' },
    activo: { label: 'Activo', tono: 'exito' },
    rechazado: { label: 'Rechazado', tono: 'peligro' },
    moroso: { label: 'Moroso', tono: 'advertencia' },
    inactivo: { label: 'Inactivo', tono: 'neutro' }
  },

  'solicitud-proveedor': {
    pendiente_verificacion: { label: 'Pendiente de verificación', tono: 'advertencia' },
    en_verificacion: { label: 'En verificación', tono: 'progreso' },
    verificado: { label: 'Verificado', tono: 'info' },
    aprobado: { label: 'Aprobada', tono: 'exito' },
    rechazado: { label: 'Rechazada', tono: 'peligro' }
  },

  abono: {
    conciliado: { label: 'Conciliado', tono: 'exito' },
    conciliado_manual: { label: 'Conciliado manual', tono: 'info' },
    sin_coincidencia: { label: 'Sin coincidencia', tono: 'advertencia' }
  },

  // Solicitudes que alguien debe autorizar: conciliación manual, edición de cliente,
  // aumento de crédito. Comparten el mismo vocabulario.
  autorizacion: {
    pendiente: { label: 'Pendiente', tono: 'advertencia' },
    aprobada: { label: 'Aprobada', tono: 'exito' },
    rechazada: { label: 'Rechazada', tono: 'peligro' },
    aplicada: { label: 'Aplicada', tono: 'info' }
  },

  // La transferencia de cliente entre distribuidoras tiene su propio vocabulario.
  transferencia: {
    pendiente_autorizacion: { label: 'Pendiente de autorización', tono: 'advertencia' },
    autorizada: { label: 'Autorizada', tono: 'info' },
    aceptada: { label: 'Aceptada', tono: 'exito' },
    rechazada: { label: 'Rechazada', tono: 'peligro' }
  },

  // Para banderas booleanas (cliente activo, vale activo, sucursal activa).
  activacion: {
    true: { label: 'Activo', tono: 'exito' },
    false: { label: 'Inactivo', tono: 'neutro' }
  }
};

/** "EN_VERIFICACION", "En Verificación" y "en_verificacion" son el mismo estado. */
function normalizar(estado: string | number | boolean): string {
  return String(estado).trim().toLowerCase().replace(/[\s-]+/g, '_');
}

/**
 * Estado desconocido (uno nuevo en el backend que aún no está en el catálogo): en vez de romper
 * o dejar la etiqueta vacía, se muestra humanizado y en tono neutro, para que la pantalla siga
 * siendo legible y el hueco se note.
 */
export function definicionEstado(tipo: TipoEstado, estado: string | number | boolean | null | undefined): DefinicionEstado | null {
  if (estado === null || estado === undefined || estado === '') {
    return null;
  }

  const clave = normalizar(estado);
  const definicion = CATALOGO[tipo]?.[clave];

  if (definicion) {
    return definicion;
  }

  return {
    label: clave.charAt(0).toUpperCase() + clave.slice(1).replace(/_/g, ' '),
    tono: 'neutro'
  };
}

/** Etiqueta legible de un estado, para textos fuera de un badge. */
export function estadoLabel(tipo: TipoEstado, estado: string | number | boolean | null | undefined): string {
  return definicionEstado(tipo, estado)?.label ?? '';
}
