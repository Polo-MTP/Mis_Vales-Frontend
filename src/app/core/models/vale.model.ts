export type EstadoVale = 'solicitado' | 'autorizado' | 'pagado' | 'vencido' | 'incidencia' | 'parcial';
export type TipoVale = 'pre-vale' | 'vale-digital';

export interface Vale {
  id: number;
  distribuidora_id: number;
  distribuidora: { id: number; razon_social: string | null; numero_distribuidora: string | null } | null;
  cliente: { id: number; nombre: string } | null;
  producto: { id: number; monto: string; descripcion: string | null } | null;
  monto: string;
  quincenas: number | null;
  tipo: TipoVale;
  estado: EstadoVale;
  activo: boolean;
  fecha_solicitud: string | null;
  fecha_autorizacion: string | null;
  numero_transferencia: string | null;
  created_at: string;
}

export interface SolicitarValePayload {
  cliente_id: number;
  producto_id: number;
  tipo?: TipoVale;
}
