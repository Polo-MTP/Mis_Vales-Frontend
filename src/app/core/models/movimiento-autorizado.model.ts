export interface MovimientoAutorizado {
  tipo: string;
  titulo: string;
  fecha: string | null;
  entidad_id: number | null;
  descripcion: string;
  estado: string | null;
}
