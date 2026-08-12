export interface AuditLog {
  id: string;
  user_id: number | null;
  session_id: string | null;
  action: string;
  resource: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  } | null;
}
