"use client";

import { useEffect, useRef } from "react";
import type { RouteMapSnapshot } from "@/features/quotes/services/quoteExport";
import { saveQuoteToDatabase } from "@/features/quotes/services/saveQuoteClient";
import type { QuoteBreakdown, WaypointStop } from "@/features/quotes/types";

interface PersistQuoteParams {
  quote: QuoteBreakdown | null;
  originLabel: string | null;
  destinationLabel: string | null;
  waypoints: WaypointStop[];
  routeRequestId: number | null;
  routeMap: RouteMapSnapshot | null;
}

function buildPersistKey(params: PersistQuoteParams): string | null {
  const { quote, originLabel, destinationLabel, routeRequestId } = params;
  if (!quote || !originLabel || !destinationLabel || !routeRequestId) return null;

  return [
    routeRequestId,
    quote.vehicleType,
    quote.serviceTime,
    quote.totalEstimateClp,
    originLabel,
    destinationLabel,
  ].join("|");
}

export function usePersistQuote(params: PersistQuoteParams): void {
  const lastPersistedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const key = buildPersistKey(params);
    if (!key || !params.quote || !params.originLabel || !params.destinationLabel) {
      return;
    }

    if (lastPersistedKeyRef.current === key) return;
    lastPersistedKeyRef.current = key;

    const waypointLabels = params.waypoints
      .map((stop) => stop.place?.label ?? stop.text.trim())
      .filter(Boolean);

    void saveQuoteToDatabase({
      originLabel: params.originLabel,
      destinationLabel: params.destinationLabel,
      waypointLabels,
      vehicleType: params.quote.vehicleType,
      serviceTime: params.quote.serviceTime,
      distanceText: params.quote.distanceText,
      durationText: params.quote.durationText,
      distanceMeters: params.quote.distanceMeters,
      durationSeconds: params.quote.durationSeconds,
      distanceSubtotalClp: params.quote.distanceSubtotalClp,
      timeSubtotalClp: params.quote.timeSubtotalClp,
      baseTotalClp: params.quote.baseTotalClp,
      minimumFareApplied: params.quote.minimumFareApplied,
      tagSubtotalClp: params.quote.tagSubtotalClp,
      tagPorticos: params.quote.tagPorticos,
      totalEstimateClp: params.quote.totalEstimateClp,
      routeRequestId: params.routeRequestId,
      originCoords: params.routeMap?.origin ?? null,
      destinationCoords: params.routeMap?.destination ?? null,
      routePath: params.routeMap?.path ?? null,
    }).catch((error) => {
      console.warn("[quotes] No se pudo persistir la cotización:", error);
      lastPersistedKeyRef.current = null;
    });
  }, [
    params.quote,
    params.originLabel,
    params.destinationLabel,
    params.waypoints,
    params.routeRequestId,
    params.routeMap,
  ]);
}
