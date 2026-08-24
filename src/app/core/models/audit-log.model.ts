export interface AuditLog {
  id: string;
  user_id: number | null;
  sucursal_id: number | null;
  session_id: string | null;
  action: string;
  modulo: string;
  nivel: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  descripcion: string | null;
  resource: string | null;
  ip_address: string | null;
  user_agent: string | null;
  datos_adicionales: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role?: {
      id: number;
      name: string;
    };
  } | null;
  sucursal?: {
    id: number;
    nombre: string;
    ciudad?: string;
  } | null;
}

