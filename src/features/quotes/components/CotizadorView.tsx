"use client";

import { useCallback, useEffect, useState } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";
import { AppHeader } from "@/components/layout/AppHeader";
import { MapContainer } from "@/components/map/MapContainer";
import { QuoteForm } from "@/features/quotes/components/QuoteForm";
import { QuotePanel } from "@/features/quotes/components/QuotePanel";
import { QuoteResults } from "@/features/quotes/components/QuoteResults";
import { useBusinessTariffs } from "@/features/quotes/context/BusinessTariffsProvider";
import { calculateCorporateQuote } from "@/features/quotes/services/quoteCalculator";
import type {
  QuoteBreakdown,
  QuoteFormData,
  RouteInfo,
  RouteRequest,
} from "@/features/quotes/types";
import { GOOGLE_MAPS_API_KEY } from "@/lib/google-maps/config";

function MissingApiKeyBanner() {
  return (
    <div className="absolute inset-x-4 top-24 z-40 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-sm">
      Configura <code className="font-mono">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>{" "}
      en tu archivo <code className="font-mono">.env.local</code> para activar el
      mapa y la cotización.
    </div>
  );
}

export function CotizadorView() {
  const { tariffs } = useBusinessTariffs();
  const [routeRequest, setRouteRequest] = useState<RouteRequest | null>(null);
  const [lastRouteInfo, setLastRouteInfo] = useState<RouteInfo | null>(null);
  const [quote, setQuote] = useState<QuoteBreakdown | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasApiKey = Boolean(GOOGLE_MAPS_API_KEY);

  const buildQuoteBreakdown = useCallback(
    (routeInfo: RouteInfo): QuoteBreakdown => {
      const result = calculateCorporateQuote({
        distanceMeters: routeInfo.distanceMeters,
        durationSeconds: routeInfo.durationSeconds,
        routeOverviewPath: routeInfo.overviewPath,
        vehicleType: routeInfo.vehicleType,
        tariffs,
      });

      return {
        distanceText: routeInfo.distanceText,
        durationText: routeInfo.durationText,
        distanceMeters: routeInfo.distanceMeters,
        durationSeconds: routeInfo.durationSeconds,
        serviceTime: routeInfo.serviceTime,
        vehicleType: routeInfo.vehicleType,
        distanceSubtotalClp: result.distanceSubtotalClp,
        timeSubtotalClp: result.timeSubtotalClp,
        baseTotalClp: result.baseTotalClp,
        minimumFareApplied: result.minimumFareApplied,
        tagSubtotalClp: result.tagSubtotalClp,
        tagPorticos: result.tagPorticos,
        totalEstimateClp: result.totalEstimateClp,
      };
    },
    [tariffs],
  );

  useEffect(() => {
    if (!lastRouteInfo) return;
    setQuote(buildQuoteBreakdown(lastRouteInfo));
  }, [lastRouteInfo, buildQuoteBreakdown]);

  const handleCalculate = useCallback(
    (data: QuoteFormData) => {
      if (!hasApiKey) {
        setError("La API Key de Google Maps no está configurada.");
        return;
      }

      setIsCalculating(true);
      setError(null);
      setQuote(null);
      setLastRouteInfo(null);
      setRouteRequest((current) => ({
        id: (current?.id ?? 0) + 1,
        origin: data.origin.location,
        destination: data.destination.location,
        serviceTime: data.serviceTime,
        vehicleType: data.vehicleType,
      }));
    },
    [hasApiKey],
  );

  const handleRouteCalculated = useCallback(
    (routeInfo: RouteInfo) => {
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

  return (
    <div className="relative h-full w-full overflow-hidden">
      {hasApiKey ? (
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY} language="es" region="CL">
          <MapContainer
            routeRequest={routeRequest}
            onRouteCalculated={handleRouteCalculated}
            onRouteError={handleRouteError}
          />
          <AppHeader />
          <QuotePanel>
            <QuoteForm
              onCalculate={handleCalculate}
              isCalculating={isCalculating}
              error={error}
            />
            {quote ? <QuoteResults quote={quote} /> : null}
          </QuotePanel>
        </APIProvider>
      ) : (
        <>
          <div className="absolute inset-0 z-0 bg-slate-200" />
          <MissingApiKeyBanner />
          <AppHeader />
          <QuotePanel>
            <QuoteForm
              onCalculate={handleCalculate}
              isCalculating={isCalculating}
              error={error ?? "La API Key de Google Maps no está configurada."}
            />
          </QuotePanel>
        </>
      )}
    </div>
  );
}
