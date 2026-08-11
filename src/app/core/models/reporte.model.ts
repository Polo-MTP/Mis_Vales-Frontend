export interface DistribuidoraMorosa {
  distribuidora_id: number;
  numero_distribuidora: string;
  sucursal: string | null;
  estado_distribuidora: string;
  saldo_pendiente_total: number;
  relaciones_vencidas: number;
  relaciones_en_perdida: number;
}
