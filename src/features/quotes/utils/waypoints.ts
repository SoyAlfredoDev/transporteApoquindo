import type { PlaceValue, WaypointStop } from "@/features/quotes/types";
import { coordsKey, getPlaceLatLng, isLatLngLiteral } from "@/lib/google-maps/placeLocation";

export function createWaypointStop(): WaypointStop {
  return {
    id: crypto.randomUUID(),
    text: "",
    place: null,
  };
}

export function getResolvedWaypoints(
  waypoints: WaypointStop[],
): PlaceValue[] {
  return waypoints
    .map((stop) => stop.place)
    .filter((place): place is PlaceValue => {
      if (!place) return false;
      return isLatLngLiteral(place.location);
    });
}

export function waypointsCoordsKey(waypoints: WaypointStop[]): string {
  return waypoints
    .map((stop) => coordsKey(getPlaceLatLng(stop.place)))
    .join("|");
}

export function reorderWaypointsByOrder(
  waypoints: WaypointStop[],
  waypointOrder: number[],
): WaypointStop[] {
  const resolved = waypoints.filter((stop) => getPlaceLatLng(stop.place));
  const unresolved = waypoints.filter((stop) => !getPlaceLatLng(stop.place));

  if (resolved.length === 0 || waypointOrder.length === 0) {
    return waypoints;
  }

  const reorderedResolved = waypointOrder
    .map((index) => resolved[index])
    .filter((stop): stop is WaypointStop => Boolean(stop));

  return [...reorderedResolved, ...unresolved];
}
