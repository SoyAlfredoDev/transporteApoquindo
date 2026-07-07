import type { PlaceLocation, PlaceValue } from "@/features/quotes/types";

export function isLatLngLiteral(
  location: PlaceLocation,
): location is google.maps.LatLngLiteral {
  return (
    typeof location === "object" &&
    location !== null &&
    typeof location.lat === "number" &&
    typeof location.lng === "number"
  );
}

export function getPlaceLatLng(
  place: PlaceValue | null | undefined,
): google.maps.LatLngLiteral | null {
  if (!place || !isLatLngLiteral(place.location)) return null;
  return place.location;
}

export function coordsKey(
  coords: google.maps.LatLngLiteral | null,
): string | null {
  if (!coords) return null;
  return `${coords.lat.toFixed(6)},${coords.lng.toFixed(6)}`;
}
