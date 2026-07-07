"use client";

import { Marker } from "@vis.gl/react-google-maps";
import type { PlaceValue, WaypointStop } from "@/features/quotes/types";
import { getPlaceLatLng } from "@/lib/google-maps/placeLocation";
import {
  ROUTE_DESTINATION_ICON,
  ROUTE_ORIGIN_ICON,
  ROUTE_WAYPOINT_ICON,
} from "@/lib/google-maps/markerIcons";

interface PlaceMarkersProps {
  origin: PlaceValue | null;
  destination: PlaceValue | null;
  waypoints: WaypointStop[];
}

export function PlaceMarkers({
  origin,
  destination,
  waypoints,
}: PlaceMarkersProps) {
  const originCoords = getPlaceLatLng(origin);
  const destinationCoords = getPlaceLatLng(destination);

  return (
    <>
      {originCoords ? (
        <Marker
          position={originCoords}
          icon={ROUTE_ORIGIN_ICON}
          zIndex={10}
          title={origin?.label}
        />
      ) : null}

      {waypoints.map((stop, index) => {
        const coords = getPlaceLatLng(stop.place);
        if (!coords) return null;

        return (
          <Marker
            key={stop.id}
            position={coords}
            icon={ROUTE_WAYPOINT_ICON}
            zIndex={9}
            title={stop.place?.label ?? `Parada ${index + 1}`}
          />
        );
      })}

      {destinationCoords ? (
        <Marker
          position={destinationCoords}
          icon={ROUTE_DESTINATION_ICON}
          zIndex={11}
          title={destination?.label}
        />
      ) : null}
    </>
  );
}
