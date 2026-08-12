export type EstadoSolicitudConciliacion = 'pendiente' | 'aprobada' | 'rechazada' | 'aplicada';

export interface SolicitudConciliacion {
  id: number;
  abono_conciliacion_id: number;
  abono_referencia: string | null;
  abono_monto: string | null;
  relacion_id: number;
  relacion_referencia: string | null;
  solicitado_por: number;
  solicitante: string | null;
  sucursal_id: number | null;
  motivo: string;
  estado: EstadoSolicitudConciliacion;
  autorizado_por: number | null;
  autorizador: string | null;
  comentario_autorizacion: string | null;
  fecha_decision: string | null;
  created_at: string;
}
