"use client";

import { useEffect } from "react";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import type { RouteInfo, RouteRequest } from "@/features/quotes/types";
import { formatDistanceKm, formatDuration } from "@/lib/google-maps/formatters";

interface DirectionsRouteProps {
  request: RouteRequest | null;
  onRouteCalculated: (info: RouteInfo) => void;
  onRouteError: (message: string) => void;
}

export function DirectionsRoute({
  request,
  onRouteCalculated,
  onRouteError,
}: DirectionsRouteProps) {
  const map = useMap();
  const routesLibrary = useMapsLibrary("routes");

  useEffect(() => {
    if (!routesLibrary || !map || !request) return;

    const directionsService = new routesLibrary.DirectionsService();
    const directionsRenderer = new routesLibrary.DirectionsRenderer({ map });

    let cancelled = false;

    directionsService
      .route({
        origin: request.origin,
        destination: request.destination,
        travelMode: google.maps.TravelMode.DRIVING,
        region: "cl",
      })
      .then((response) => {
        if (cancelled) return;

        directionsRenderer.setDirections(response);

        const route = response.routes[0];
        const leg = route?.legs[0];
        if (!leg?.distance?.value || !leg?.duration?.value || !route?.overview_path) {
          onRouteError("No se pudo obtener la información de la ruta.");
          return;
        }

        onRouteCalculated({
          distanceText: formatDistanceKm(leg.distance.value),
          durationText: formatDuration(leg.duration.value),
          distanceMeters: leg.distance.value,
          durationSeconds: leg.duration.value,
          overviewPath: route.overview_path,
          serviceTime: request.serviceTime,
          vehicleType: request.vehicleType,
        });
      })
      .catch(() => {
        if (!cancelled) {
          onRouteError(
            "No se pudo calcular la ruta. Verifica origen y destino.",
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
