import { EditarClientePayload } from './cliente.model';

export type EstadoSolicitudEdicionCliente = 'pendiente' | 'aprobada' | 'rechazada' | 'aplicada';

export interface SolicitudEdicionCliente {
  id: number;
  cliente_id: number;
  cliente_nombre: string | null;
  solicitado_por: number;
  solicitante: string | null;
  sucursal_id: number | null;
  campos_propuestos: EditarClientePayload;
  motivo: string;
  estado: EstadoSolicitudEdicionCliente;
  autorizado_por: number | null;
  autorizador: string | null;
  comentario_autorizacion: string | null;
  fecha_decision: string | null;
  created_at: string;
}
