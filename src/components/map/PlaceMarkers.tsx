"use client";

import { Marker } from "@vis.gl/react-google-maps";
import type { PlaceValue, WaypointStop } from "@/features/quotes/types";
import { getPlaceLatLng } from "@/lib/google-maps/placeLocation";

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
            zIndex={9}
            title={stop.place?.label ?? `Parada ${index + 1}`}
          />
        );
      })}

      {destinationCoords ? (
        <Marker
          position={destinationCoords}
          zIndex={11}
          title={destination?.label}
        />
      ) : null}
    </>
  );
}
