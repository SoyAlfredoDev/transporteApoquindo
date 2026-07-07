import type { TagPortico } from "@/features/quotes/data/tagTariffs";
import { VALIDATED_PORTICO_COORDINATES } from "@/features/quotes/data/validatedPorticoCoordinates";

/**
 * Aplica coordenadas geocodificadas y validadas (Google Roads Snap).
 * Autopista Central mantiene coords manuales sobre el eje Ruta 5 / G. Velásquez.
 */
export function applyValidatedPorticoCoordinates(portico: TagPortico): TagPortico {
  const validated = VALIDATED_PORTICO_COORDINATES[portico.id];
  if (!validated) return portico;

  return {
    ...portico,
    coordinates: { lat: validated.lat, lng: validated.lng },
  };
}

export function applyValidatedPorticoCoordinatesAll(
  porticos: TagPortico[],
): TagPortico[] {
  return porticos.map(applyValidatedPorticoCoordinates);
}
