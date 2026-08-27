/** Una cuota (RelacionDetalle) sin liquidar de un cliente, sin importar de qué corte venga. */
export interface CuotaEstadoCuenta {
  relacion_detalle_id: number;
  relacion_id: number;
  referencia_pago: string | null;
  /** Concepto de ESTA cuota, para que la distribuidora pueda pagarla por separado. */
  concepto: string;
  vale_id: number;
  producto: string | null;
  cuota: string;
  fecha_corte: string | null;
  total: number;
  pago: number;
  saldo: number;
  estado: string;
}

/** Saldo acumulado de un cliente, sumando todas sus cuotas sin liquidar a través de todos
 *  los cortes en los que aparezca -- no solo el más reciente. */
export interface ClienteEstadoCuenta {
  cliente_id: number;
  nombre: string;
  saldo_pendiente: number;
  cuotas: CuotaEstadoCuenta[];
}

/** Estado de cuenta acumulado de una distribuidora: un cliente por fila, con el total
 *  general de todos combinado. Se actualiza solo en cuanto existe un corte nuevo (automático
 *  o "Generar Corte del Día"), no requiere ninguna acción para "cerrarlo". */
export interface EstadoCuenta {
  clientes: ClienteEstadoCuenta[];
  total_pendiente: number;
}
