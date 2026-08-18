export interface DireccionGoogle {
  calle: string;
  numero_ext: string;
  colonia: string;
  codigo_postal: string;
  estado: string;
  ciudad: string;
  lat: number | null;
  lng: number | null;
}

/**
 * Convierte los address_components de un PlaceResult de Google Places en los campos
 * que usan los formularios de dirección de la app. Google no siempre manda todos los
 * componentes (ej. colonia puede faltar en zonas rurales), así que cualquier campo que
 * no venga se deja como string vacío para no pisar lo que el usuario ya escribió.
 */
export function parsearDireccionGoogle(place: any): DireccionGoogle {
  const partes: Record<string, string> = {};

  for (const comp of place?.address_components ?? []) {
    for (const tipo of comp.types) {
      partes[tipo] = comp.long_name;
    }
  }

  return {
    calle: partes['route'] ?? '',
    numero_ext: partes['street_number'] ?? '',
    colonia: partes['sublocality_level_1'] ?? partes['sublocality'] ?? partes['neighborhood'] ?? '',
    codigo_postal: partes['postal_code'] ?? '',
    estado: partes['administrative_area_level_1'] ?? '',
    ciudad: partes['locality'] ?? partes['administrative_area_level_2'] ?? '',
    lat: place?.geometry?.location?.lat ? place.geometry.location.lat() : null,
    lng: place?.geometry?.location?.lng ? place.geometry.location.lng() : null
  };
}
