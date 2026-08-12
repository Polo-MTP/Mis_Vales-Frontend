export type TipoPuntoMovimiento = 'generado' | 'penalizado' | 'redimido' | 'ajuste_manual';

export interface PuntoMovimiento {
  id: number;
  distribuidora_id: number;
  relacion_id: number | null;
  tipo: TipoPuntoMovimiento;
  cantidad: number;
  valor_punto_snapshot: string | null;
  motivo: string | null;
  registrado_por: number | null;
  registrado_por_nombre: string | null;
  created_at: string;
}
