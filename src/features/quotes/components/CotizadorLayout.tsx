"use client";

import { useEffect, useState } from "react";
import { ModuleCard } from "@/components/ui/ModuleCard";
import { ClientOnly } from "@/components/ui/ClientOnly";
import { MapContainer } from "@/components/map/MapContainer";
import { QuoteForm, QUOTE_FORM_ID } from "@/features/quotes/components/QuoteForm";
import { QuoteFormSubmitButton } from "@/features/quotes/components/QuoteFormSubmitButton";
import { QuoteFormSkeleton } from "@/features/quotes/components/QuoteFormSkeleton";
import { QuoteResults } from "@/features/quotes/components/QuoteResults";
import type { RouteMapSnapshot } from "@/features/quotes/services/quoteExport";
import type { VehicleType } from "@/features/quotes/data/vehicleTypes";
import type {
  PlaceValue,
  QuoteBreakdown,
  QuoteFormData,
  RouteInfo,
  RouteRequest,
  WaypointStop,
} from "@/features/quotes/types";

type MobileView = "form" | "map";

function MissingApiKeyBanner() {
  return (
    <div className="flex h-full min-h-[240px] items-center justify-center p-6">
      <div className="max-w-sm rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">
        Configura <code className="font-mono">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>{" "}
        en <code className="font-mono">.env.local</code> para activar el mapa.
      </div>
    </div>
  );
}

function MobileTabBar({
  active,
  onChange,
}: {
  active: MobileView;
  onChange: (view: MobileView) => void;
}) {
  const tabs: { id: MobileView; label: string }[] = [
    { id: "form", label: "Cotización" },
    { id: "map", label: "Mapa" },
  ];

  return (
    <div
      className="flex shrink-0 gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm lg:hidden"
      role="tablist"
      aria-label="Vista del cotizador"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            active === tab.id
              ? "bg-[#1A6FE8] text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

interface CotizadorLayoutProps {
  hasApiKey: boolean;
  origin: PlaceValue | null;
  destination: PlaceValue | null;
  waypoints: WaypointStop[];
  originText: string;
  destinationText: string;
  serviceTime: string;
  vehicleType: VehicleType;
  onOriginTextChange: (value: string) => void;
  onDestinationTextChange: (value: string) => void;
  onOriginChange: (place: PlaceValue | null) => void;
  onDestinationChange: (place: PlaceValue | null) => void;
  onWaypointTextChange: (id: string, text: string) => void;
  onWaypointChange: (id: string, place: PlaceValue | null) => void;
  onAddWaypoint: () => void;
  onRemoveWaypoint: (id: string) => void;
  onOptimizeRoute: () => void;
  canOptimize: boolean;
  onServiceTimeChange: (value: string) => void;
  onVehicleTypeChange: (value: VehicleType) => void;
  routeRequest: RouteRequest | null;
  onRouteCalculated: (info: RouteInfo) => void;
  onRouteError: (message: string) => void;
  onCalculate: (data: QuoteFormData) => void;
  isCalculating: boolean;
  error: string | null;
  quote: QuoteBreakdown | null;
  routeLabels: { origin: string; destination: string } | null;
  routeMapSnapshot: RouteMapSnapshot | null;
  optimizationNotice: string | null;
}

export function CotizadorLayout(props: CotizadorLayoutProps) {
  const [mobileView, setMobileView] = useState<MobileView>("form");

  useEffect(() => {
    if (mobileView !== "map") return;
    const id = window.setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 120);
    return () => window.clearTimeout(id);
  }, [mobileView]);

  const canSubmit = Boolean(props.originText.trim() && props.destinationText.trim());

  const formContent = (
    <ClientOnly fallback={<QuoteFormSkeleton />}>
      <QuoteForm
        originText={props.originText}
        destinationText={props.destinationText}
        origin={props.origin}
        destination={props.destination}
        waypoints={props.waypoints}
        serviceTime={props.serviceTime}
        vehicleType={props.vehicleType}
        onOriginTextChange={props.onOriginTextChange}
        onDestinationTextChange={props.onDestinationTextChange}
        onOriginChange={props.onOriginChange}
        onDestinationChange={props.onDestinationChange}
        onWaypointTextChange={props.onWaypointTextChange}
        onWaypointChange={props.onWaypointChange}
        onAddWaypoint={props.onAddWaypoint}
        onRemoveWaypoint={props.onRemoveWaypoint}
        onOptimizeRoute={props.onOptimizeRoute}
        canOptimize={props.canOptimize}
        onServiceTimeChange={props.onServiceTimeChange}
        onVehicleTypeChange={props.onVehicleTypeChange}
        onCalculate={props.onCalculate}
        isCalculating={props.isCalculating}
        error={
          props.error ??
          (!props.hasApiKey ? "La API Key de Google Maps no está configurada." : null)
        }
        optimizationNotice={props.optimizationNotice}
      />
      {props.quote && props.routeLabels ? (
        <QuoteResults
          quote={props.quote}
          originLabel={props.routeLabels.origin}
          destinationLabel={props.routeLabels.destination}
          routeMap={props.routeMapSnapshot}
        />
      ) : null}
    </ClientOnly>
  );

  const formCard = (
    <ModuleCard
      title="Cotizador de Rutas"
      description="Origen, paradas y destino — el mapa se actualiza al instante."
      className="h-full min-h-0"
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          data-quote-panel
          className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain p-5 [-webkit-overflow-scrolling:touch]"
        >
          {formContent}
        </div>
        <div className="shrink-0 border-t border-slate-100 bg-white px-5 py-4">
          <QuoteFormSubmitButton
            formId={QUOTE_FORM_ID}
            isCalculating={props.isCalculating}
            canSubmit={canSubmit}
          />
        </div>
      </div>
    </ModuleCard>
  );

  const mapContent = props.hasApiKey ? (
    <MapContainer
      origin={props.origin}
      destination={props.destination}
      waypoints={props.waypoints}
      routeRequest={props.routeRequest}
      tagPorticos={props.quote?.tagPorticos}
      onRouteCalculated={props.onRouteCalculated}
      onRouteError={props.onRouteError}
    />
  ) : (
    <MissingApiKeyBanner />
  );

  const mapCard = (
    <ModuleCard
      title="Mapa de ruta"
      description="Visualización en tiempo real del trayecto"
      className="h-full min-h-0"
    >
      <div
        data-map-card
        className="relative min-h-0 flex-1 overflow-hidden"
      >
        {mapContent}
      </div>
    </ModuleCard>
  );

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden overscroll-none bg-[#F1F5F9]">
      {/* Móvil: pestañas */}
      <div className="shrink-0 px-4 pt-4 lg:hidden">
        <MobileTabBar active={mobileView} onChange={setMobileView} />
      </div>

      {/* Móvil: una tarjeta a la vez */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4 lg:hidden">
        <div
          className={`min-h-0 flex-1 ${mobileView === "form" ? "flex" : "hidden"}`}
          role="tabpanel"
        >
          {formCard}
        </div>
        <div
          className={`min-h-0 flex-1 ${mobileView === "map" ? "flex" : "hidden"}`}
          role="tabpanel"
        >
          {mapCard}
        </div>
      </div>

      {/* Escritorio / tablet: dos columnas */}
      <div className="hidden h-full min-h-0 grid-cols-12 gap-6 overflow-hidden p-6 lg:grid">
        <div className="col-span-5 flex min-h-0 flex-col">{formCard}</div>
        <div className="col-span-7 flex min-h-0 flex-col">{mapCard}</div>
      </div>
    </div>
  );
}
