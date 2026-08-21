export type EstadoVale = 'solicitado' | 'validado' | 'autorizado' | 'pagado' | 'vencido' | 'incidencia' | 'parcial';
export type TipoVale = 'pre-vale' | 'vale-digital';

/** Cuota de este vale que ya se incluyó en un corte (Relación) -- para saber "de qué corte es". */
export interface CorteDeVale {
  relacion_id: number;
  referencia_pago: string | null;
  fecha_corte: string | null;
  cuota: string;
  estado_cuota: string;
  total: string;
}

/** Estimado del pago quincenal mientras el vale no tiene ninguna cuota facturada en un corte. */
export interface EstimacionPagoVale {
  capital: number;
  comision: number;
  interes: number;
  seguro: number;
  categoria: number;
  pago_quincenal: number;
  total_estimado_plazo: number;
  nota: string;
}

export interface Vale {
  id: number;
  distribuidora_id: number;
  distribuidora: { id: number; razon_social: string | null; numero_distribuidora: string | null } | null;
  cliente: { id: number; nombre: string; curp: string | null; direccion: string | null } | null;
  producto: { id: number; monto: string; descripcion: string | null } | null;
  monto: string;
  quincenas: number | null;
  tipo: TipoVale;
  estado: EstadoVale;
  activo: boolean;
  fecha_solicitud: string | null;
  validado_por: number | null;
  fecha_validacion: string | null;
  ine_verificada: boolean | null;
  comprobante_domicilio_verificado: boolean | null;
  fecha_autorizacion: string | null;
  numero_transferencia: string | null;
  created_at: string;
  cortes: CorteDeVale[];
  estimacion: EstimacionPagoVale | null;
}

export interface SolicitarValePayload {
  cliente_id: number;
  producto_id: number;
  tipo?: TipoVale;
}
