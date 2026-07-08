"use client";

import { Map } from "@vis.gl/react-google-maps";
import { DirectionsRoute } from "@/components/map/DirectionsRoute";
import { MapCameraController } from "@/components/map/MapCameraController";
import { PlaceMarkers } from "@/components/map/PlaceMarkers";
import { QuoteTagMapLegend } from "@/components/map/QuoteTagMapLegend";
import { QuoteTagMarkers } from "@/components/map/QuoteTagMarkers";
import type { TagPorticoCharge } from "@/features/quotes/services/quoteCalculator";
import type { PlaceValue, RouteInfo, RouteRequest, WaypointStop } from "@/features/quotes/types";
import {
  DEFAULT_MAP_ZOOM,
  SANTIAGO_CENTER,
} from "@/lib/google-maps/config";

interface MapContainerProps {
  origin: PlaceValue | null;
  destination: PlaceValue | null;
  waypoints: WaypointStop[];
  routeRequest: RouteRequest | null;
  tagPorticos?: TagPorticoCharge[];
  onRouteCalculated: (info: RouteInfo) => void;
  onRouteError: (message: string) => void;
}

export function MapContainer({
  origin,
  destination,
  waypoints,
  routeRequest,
  tagPorticos = [],
  onRouteCalculated,
  onRouteError,
}: MapContainerProps) {
  const ambCount = tagPorticos.filter((portico) => portico.isAmbToll).length;

  return (
    <div className="relative h-full min-h-[240px] w-full">
      <Map
        defaultCenter={SANTIAGO_CENTER}
        defaultZoom={DEFAULT_MAP_ZOOM}
        gestureHandling="greedy"
        fullscreenControl={false}
        mapTypeControl={false}
        streetViewControl={false}
        className="h-full w-full rounded-b-2xl"
      >
        <PlaceMarkers
          origin={origin}
          destination={destination}
          waypoints={waypoints}
        />
        <MapCameraController
          origin={origin}
          destination={destination}
          waypoints={waypoints}
        />
        <DirectionsRoute
          request={routeRequest}
          onRouteCalculated={onRouteCalculated}
          onRouteError={onRouteError}
        />
        <QuoteTagMarkers tagPorticos={tagPorticos} />
      </Map>
      <QuoteTagMapLegend tagCount={tagPorticos.length} ambCount={ambCount} />
    </div>
  );
}
