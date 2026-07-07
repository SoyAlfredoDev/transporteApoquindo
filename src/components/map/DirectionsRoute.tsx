"use client";

import { useEffect, useRef } from "react";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import type { RouteInfo, RouteRequest } from "@/features/quotes/types";
import { formatDistanceKm, formatDuration } from "@/lib/google-maps/formatters";
import { useMapViewportPadding } from "@/lib/google-maps/useMapViewportPadding";

interface DirectionsRouteProps {
  request: RouteRequest | null;
  onRouteCalculated: (info: RouteInfo) => void;
  onRouteError: (message: string) => void;
}

function sumLegValues(
  legs: google.maps.DirectionsLeg[],
  field: "distance" | "duration",
): number {
  return legs.reduce((total, leg) => total + (leg[field]?.value ?? 0), 0);
}

export function DirectionsRoute({
  request,
  onRouteCalculated,
  onRouteError,
}: DirectionsRouteProps) {
  const map = useMap();
  const routesLibrary = useMapsLibrary("routes");
  const padding = useMapViewportPadding();
  const paddingRef = useRef(padding);

  useEffect(() => {
    paddingRef.current = padding;
  }, [padding]);

  useEffect(() => {
    if (!routesLibrary || !map || !request) return;

    const directionsService = new routesLibrary.DirectionsService();
    const directionsRenderer = new routesLibrary.DirectionsRenderer({
      map,
      suppressMarkers: true,
    });

    let cancelled = false;

    const googleWaypoints: google.maps.DirectionsWaypoint[] = request.waypoints.map(
      (location) => ({
        location,
        stopover: true,
      }),
    );

    directionsService
      .route({
        origin: request.origin,
        destination: request.destination,
        waypoints: googleWaypoints.length > 0 ? googleWaypoints : undefined,
        optimizeWaypoints: request.optimizeWaypoints && googleWaypoints.length > 0,
        travelMode: google.maps.TravelMode.DRIVING,
        region: "cl",
      })
      .then((response) => {
        if (cancelled) return;

        directionsRenderer.setDirections(response);

        const route = response.routes[0];
        const legs = route?.legs ?? [];
        const totalDistance = sumLegValues(legs, "distance");
        const totalDuration = sumLegValues(legs, "duration");

        if (!totalDistance || !totalDuration || !route?.overview_path) {
          onRouteError("No se pudo obtener la información de la ruta.");
          return;
        }

        if (route.bounds) {
          map.fitBounds(route.bounds, paddingRef.current);
        }

        onRouteCalculated({
          distanceText: formatDistanceKm(totalDistance),
          durationText: formatDuration(totalDuration),
          distanceMeters: totalDistance,
          durationSeconds: totalDuration,
          overviewPath: route.overview_path,
          serviceTime: request.serviceTime,
          vehicleType: request.vehicleType,
          waypointOrder:
            request.optimizeWaypoints && route.waypoint_order?.length
              ? [...route.waypoint_order]
              : undefined,
        });
      })
      .catch(() => {
        if (!cancelled) {
          onRouteError(
            "No se pudo calcular la ruta. Verifica origen, paradas y destino.",
          );
        }
      });

    return () => {
      cancelled = true;
      directionsRenderer.setMap(null);
    };
  }, [routesLibrary, map, request, onRouteCalculated, onRouteError]);

  return null;
}
