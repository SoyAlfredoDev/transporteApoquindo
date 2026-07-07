"use client";

import { Map } from "@vis.gl/react-google-maps";
import { DirectionsRoute } from "@/components/map/DirectionsRoute";
import type { RouteInfo, RouteRequest } from "@/features/quotes/types";
import {
  DEFAULT_MAP_ZOOM,
  SANTIAGO_CENTER,
} from "@/lib/google-maps/config";

interface MapContainerProps {
  routeRequest: RouteRequest | null;
  onRouteCalculated: (info: RouteInfo) => void;
  onRouteError: (message: string) => void;
}

export function MapContainer({
  routeRequest,
  onRouteCalculated,
  onRouteError,
}: MapContainerProps) {
  return (
    <div className="absolute inset-0 z-0 h-full w-full">
      <Map
        defaultCenter={SANTIAGO_CENTER}
        defaultZoom={DEFAULT_MAP_ZOOM}
        gestureHandling="greedy"
        fullscreenControl={false}
        mapTypeControl={false}
        streetViewControl={false}
        className="h-full w-full"
      >
        <DirectionsRoute
          request={routeRequest}
          onRouteCalculated={onRouteCalculated}
          onRouteError={onRouteError}
        />
      </Map>
    </div>
  );
}
