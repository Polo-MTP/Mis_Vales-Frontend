export interface Notificacion {
  id: number;
  accion: string;
  recurso: string | null;
  sucursal: { id: number; nombre: string } | null;
  usuario: { id: number; name: string } | null;
  destinatario_id: number | null;
  leido_at: string | null;
  leida: boolean;
  created_at: string;
}
