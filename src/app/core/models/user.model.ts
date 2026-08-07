export interface Role {
  id: number;
  name: 'Invitado' | 'Usuario' | 'Administrador' | string;
  factor_count: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string | null;
  role_id?: number;
  role?: Role;
  sucursal_id?: number | null;
  sucursal?: { id: number; nombre: string; codigo: string; es_matriz: boolean } | null;
  is_active?: boolean;
  is_locked?: boolean;
  failed_attempts?: number;
  locked_until?: string | null;
  created_at?: string;
}

export interface LoginAttempt {
  id: string;
  user_id?: number | null;
  email_attempted: string;
  ip_address: string;
  user_agent?: string | null;
  status: string;
  factor_step: number;
  failure_reason?: string | null;
  created_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}
