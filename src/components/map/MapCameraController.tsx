"use client";

import { useEffect } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import type { PlaceValue, WaypointStop } from "@/features/quotes/types";
import { waypointsCoordsKey } from "@/features/quotes/utils/waypoints";
import { fitMapToPoints, focusMapOnPoint } from "@/lib/google-maps/focusMap";
import { coordsKey, getPlaceLatLng } from "@/lib/google-maps/placeLocation";
import { useMapViewportPadding } from "@/lib/google-maps/useMapViewportPadding";

interface MapCameraControllerProps {
  origin: PlaceValue | null;
  destination: PlaceValue | null;
  waypoints: WaypointStop[];
}

export function MapCameraController({
  origin,
  destination,
  waypoints,
}: MapCameraControllerProps) {
  const map = useMap();
  const padding = useMapViewportPadding();

  const originCoords = getPlaceLatLng(origin);
  const destinationCoords = getPlaceLatLng(destination);
  const waypointCoords = waypoints
    .map((stop) => getPlaceLatLng(stop.place))
    .filter((coords): coords is google.maps.LatLngLiteral => coords !== null);

  const pointsKey = [
    coordsKey(originCoords),
    waypointsCoordsKey(waypoints),
    coordsKey(destinationCoords),
  ]
    .filter(Boolean)
    .join("::");

  useEffect(() => {
    if (!map || !pointsKey) return;

    const points = [
      ...(originCoords ? [originCoords] : []),
      ...waypointCoords,
      ...(destinationCoords ? [destinationCoords] : []),
    ];

    if (points.length === 1) {
      const [point] = points;
      if (point) focusMapOnPoint(map, point);
      return;
    }

    if (points.length > 1) {
      fitMapToPoints(map, points, padding);
    }
  }, [map, pointsKey, padding, originCoords, destinationCoords, waypointCoords.length]);

  return null;
}
