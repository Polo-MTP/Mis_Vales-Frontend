export type EstadoAbonoConciliacion = 'conciliado' | 'sin_coincidencia' | 'conciliado_manual';

export interface AbonoConciliacion {
  id: number;
  relacion_id: number | null;
  referencia_leida: string;
  monto: number;
  folio_pago: string | null;
  fecha_pago: string;
  hora_pago: string | null;
  tipo_pago: string;
  estado: EstadoAbonoConciliacion;
  convenio_bancario: string | null;
  autorizado_por: string | null;
  motivo_manual: string | null;
  created_at: string;
}

export interface ResumenImportacionConciliacion {
  procesadas: number;
  conciliadas: number;
  sin_coincidencia: number;
  errores: string[];
}
