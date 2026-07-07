"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";
import { AppShell } from "@/components/layout/AppShell";
import { CotizadorLayout } from "@/features/quotes/components/CotizadorLayout";
import { useBusinessTariffs } from "@/features/quotes/context/BusinessTariffsProvider";
import type { VehicleType } from "@/features/quotes/data/vehicleTypes";
import { calculateCorporateQuote } from "@/features/quotes/services/quoteCalculator";
import type {
  PlaceValue,
  QuoteBreakdown,
  QuoteFormData,
  RouteInfo,
  RouteRequest,
  WaypointStop,
} from "@/features/quotes/types";
import {
  createWaypointStop,
  getResolvedWaypoints,
  reorderWaypointsByOrder,
  waypointsCoordsKey,
} from "@/features/quotes/utils/waypoints";
import { GOOGLE_MAPS_API_KEY } from "@/lib/google-maps/config";
import { coordsKey, getPlaceLatLng } from "@/lib/google-maps/placeLocation";
import { WorkspaceLayoutProvider } from "@/lib/layout/WorkspaceLayoutProvider";

function getCurrentTimeString(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function CotizadorView() {
  const { tariffs } = useBusinessTariffs();
  const [originText, setOriginText] = useState("");
  const [destinationText, setDestinationText] = useState("");
  const [origin, setOrigin] = useState<PlaceValue | null>(null);
  const [destination, setDestination] = useState<PlaceValue | null>(null);
  const [waypoints, setWaypoints] = useState<WaypointStop[]>([]);
  const [serviceTime, setServiceTime] = useState("09:00");
  const [vehicleType, setVehicleType] = useState<VehicleType>("auto_suv");
  const [routeRequest, setRouteRequest] = useState<RouteRequest | null>(null);
  const [lastRouteInfo, setLastRouteInfo] = useState<RouteInfo | null>(null);
  const [quote, setQuote] = useState<QuoteBreakdown | null>(null);
  const [routeLabels, setRouteLabels] = useState<{
    origin: string;
    destination: string;
  } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optimizationNotice, setOptimizationNotice] = useState<string | null>(null);

  const hasApiKey = Boolean(GOOGLE_MAPS_API_KEY);

  const originCoordsKey = coordsKey(getPlaceLatLng(origin));
  const destinationCoordsKey = coordsKey(getPlaceLatLng(destination));
  const stopsCoordsKey = waypointsCoordsKey(waypoints);
  const resolvedWaypointCount = getResolvedWaypoints(waypoints).length;
  const canOptimize = resolvedWaypointCount >= 1;

  const serviceTimeRef = useRef(serviceTime);
  const vehicleTypeRef = useRef(vehicleType);
  const skipNextAutoRouteRef = useRef(false);

  useEffect(() => {
    setServiceTime(getCurrentTimeString());
  }, []);

  useEffect(() => {
    serviceTimeRef.current = serviceTime;
  }, [serviceTime]);

  useEffect(() => {
    vehicleTypeRef.current = vehicleType;
  }, [vehicleType]);

  const buildQuoteBreakdown = useCallback(
    (routeInfo: RouteInfo): QuoteBreakdown => {
      const result = calculateCorporateQuote({
        distanceMeters: routeInfo.distanceMeters,
        durationSeconds: routeInfo.durationSeconds,
        routeOverviewPath: routeInfo.overviewPath,
        vehicleType,
        tariffs,
      });

      return {
        distanceText: routeInfo.distanceText,
        durationText: routeInfo.durationText,
        distanceMeters: routeInfo.distanceMeters,
        durationSeconds: routeInfo.durationSeconds,
        serviceTime,
        vehicleType,
        distanceSubtotalClp: result.distanceSubtotalClp,
        timeSubtotalClp: result.timeSubtotalClp,
        baseTotalClp: result.baseTotalClp,
        minimumFareApplied: result.minimumFareApplied,
        tagSubtotalClp: result.tagSubtotalClp,
        tagPorticos: result.tagPorticos,
        totalEstimateClp: result.totalEstimateClp,
      };
    },
    [tariffs, vehicleType, serviceTime],
  );

  const requestRoute = useCallback(
    (
      nextOrigin: PlaceValue,
      nextDestination: PlaceValue,
      nextWaypoints: WaypointStop[],
      options?: { resetQuote?: boolean; optimizeWaypoints?: boolean },
    ) => {
      if (!hasApiKey) {
        setError("La API Key de Google Maps no está configurada.");
        return;
      }

      setIsCalculating(true);
      setError(null);

      if (!options?.optimizeWaypoints) {
        setOptimizationNotice(null);
      }

      if (options?.resetQuote !== false) {
        setQuote(null);
        setLastRouteInfo(null);
      }

      const waypointLocations = getResolvedWaypoints(nextWaypoints).map(
        (place) => place.location,
      );

      setRouteLabels({
        origin: nextOrigin.label,
        destination: nextDestination.label,
      });

      setRouteRequest((current) => ({
        id: (current?.id ?? 0) + 1,
        origin: nextOrigin.location,
        destination: nextDestination.location,
        waypoints: waypointLocations,
        optimizeWaypoints: options?.optimizeWaypoints ?? false,
        serviceTime: serviceTimeRef.current,
        vehicleType: vehicleTypeRef.current,
      }));
    },
    [hasApiKey],
  );

  useEffect(() => {
    if (!hasApiKey || !originCoordsKey || !destinationCoordsKey || !origin || !destination) {
      if (!originCoordsKey || !destinationCoordsKey) {
        setRouteRequest(null);
      }
      return;
    }

    if (skipNextAutoRouteRef.current) {
      skipNextAutoRouteRef.current = false;
      return;
    }

    requestRoute(origin, destination, waypoints);
  }, [
    hasApiKey,
    originCoordsKey,
    destinationCoordsKey,
    stopsCoordsKey,
    origin,
    destination,
    requestRoute,
  ]);

  useEffect(() => {
    if (!lastRouteInfo) return;
    setQuote(buildQuoteBreakdown(lastRouteInfo));
  }, [lastRouteInfo, buildQuoteBreakdown]);

  const handleCalculate = useCallback(
    (data: QuoteFormData) => {
      setOrigin(data.origin);
      setDestination(data.destination);
      setWaypoints(data.waypoints);
      setOriginText(data.origin.label);
      setDestinationText(data.destination.label);
      requestRoute(data.origin, data.destination, data.waypoints);
    },
    [requestRoute],
  );

  const handleRouteCalculated = useCallback(
    (routeInfo: RouteInfo) => {
      if (routeInfo.waypointOrder?.length) {
        skipNextAutoRouteRef.current = true;
        setWaypoints((current) => {
          const reordered = reorderWaypointsByOrder(current, routeInfo.waypointOrder!);
          return reordered;
        });
        setOptimizationNotice(
          "Ruta optimizada — las paradas fueron reordenadas para el trayecto más eficiente.",
        );
      }

      setLastRouteInfo(routeInfo);
      setQuote(buildQuoteBreakdown(routeInfo));
      setIsCalculating(false);
      setError(null);
    },
    [buildQuoteBreakdown],
  );

  const handleRouteError = useCallback((message: string) => {
    setError(message);
    setIsCalculating(false);
  }, []);

  const clearRouteState = useCallback(() => {
    setRouteRequest(null);
    setQuote(null);
    setLastRouteInfo(null);
    setOptimizationNotice(null);
  }, []);

  const handleOriginChange = useCallback(
    (place: PlaceValue | null) => {
      setOrigin(place);
      if (!place) clearRouteState();
    },
    [clearRouteState],
  );

  const handleDestinationChange = useCallback(
    (place: PlaceValue | null) => {
      setDestination(place);
      if (!place) clearRouteState();
    },
    [clearRouteState],
  );

  const handleWaypointTextChange = useCallback((id: string, text: string) => {
    setWaypoints((current) =>
      current.map((stop) => (stop.id === id ? { ...stop, text } : stop)),
    );
  }, []);

  const handleWaypointChange = useCallback(
    (id: string, place: PlaceValue | null) => {
      setWaypoints((current) =>
        current.map((stop) => (stop.id === id ? { ...stop, place } : stop)),
      );
      if (!place) {
        setOptimizationNotice(null);
      }
    },
    [],
  );

  const handleAddWaypoint = useCallback(() => {
    setWaypoints((current) => [...current, createWaypointStop()]);
  }, []);

  const handleRemoveWaypoint = useCallback((id: string) => {
    setWaypoints((current) => current.filter((stop) => stop.id !== id));
    setOptimizationNotice(null);
  }, []);

  const handleOptimizeRoute = useCallback(() => {
    if (!origin || !destination || !canOptimize) return;
    requestRoute(origin, destination, waypoints, { optimizeWaypoints: true });
  }, [origin, destination, waypoints, canOptimize, requestRoute]);

  const layoutProps = {
    hasApiKey,
    origin,
    destination,
    waypoints,
    originText,
    destinationText,
    serviceTime,
    vehicleType,
    onOriginTextChange: setOriginText,
    onDestinationTextChange: setDestinationText,
    onOriginChange: handleOriginChange,
    onDestinationChange: handleDestinationChange,
    onWaypointTextChange: handleWaypointTextChange,
    onWaypointChange: handleWaypointChange,
    onAddWaypoint: handleAddWaypoint,
    onRemoveWaypoint: handleRemoveWaypoint,
    onOptimizeRoute: handleOptimizeRoute,
    canOptimize,
    onServiceTimeChange: setServiceTime,
    onVehicleTypeChange: setVehicleType,
    routeRequest,
    onRouteCalculated: handleRouteCalculated,
    onRouteError: handleRouteError,
    onCalculate: handleCalculate,
    isCalculating,
    error,
    quote,
    routeLabels,
    optimizationNotice,
  };

  return (
    <AppShell
      activeNav="cotizador"
      footerOnline={hasApiKey}
      footerStatusLabel={hasApiKey ? "GPS Online" : "Maps no configurado"}
    >
      <WorkspaceLayoutProvider>
        {hasApiKey ? (
          <APIProvider apiKey={GOOGLE_MAPS_API_KEY} language="es" region="CL">
            <CotizadorLayout {...layoutProps} />
          </APIProvider>
        ) : (
          <CotizadorLayout {...layoutProps} />
        )}
      </WorkspaceLayoutProvider>
    </AppShell>
  );
}
