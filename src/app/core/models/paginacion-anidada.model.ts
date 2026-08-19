/**
 * Algunos endpoints (transferencias, aumento-credito, relaciones) regresan un
 * LengthAwarePaginator envuelto por ResourceCollection::response()->getData(true), que anida
 * la paginación en `meta`/`links` en vez del formato plano que usa el resto de la API
 * (PaginatedResponse en user.model.ts). Verificado contra la respuesta real del backend.
 */
export interface PaginacionAnidada<T> {
  data: T[];
  links: { first: string | null; last: string | null; prev: string | null; next: string | null };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    path: string;
    per_page: number;
    to: number | null;
    total: number;
  };
}
