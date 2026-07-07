"use client";

import { useCallback } from "react";
import { PlaceAutocompleteInput } from "@/components/ui/PlaceAutocompleteInput";
import { Select } from "@/components/ui/Select";
import { WaypointStopList } from "@/features/quotes/components/WaypointStopList";
import {
  VEHICLE_OPTIONS,
  type VehicleType,
} from "@/features/quotes/data/vehicleTypes";
import type { QuoteFormData, PlaceValue, WaypointStop } from "@/features/quotes/types";

export const QUOTE_FORM_ID = "quote-form";

interface QuoteFormProps {
  originText: string;
  destinationText: string;
  origin: PlaceValue | null;
  destination: PlaceValue | null;
  waypoints: WaypointStop[];
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
  onCalculate: (data: QuoteFormData) => void;
  isCalculating?: boolean;
  error?: string | null;
  optimizationNotice?: string | null;
}

export function QuoteForm({
  originText,
  destinationText,
  origin,
  destination,
  waypoints,
  serviceTime,
  vehicleType,
  onOriginTextChange,
  onDestinationTextChange,
  onOriginChange,
  onDestinationChange,
  onWaypointTextChange,
  onWaypointChange,
  onAddWaypoint,
  onRemoveWaypoint,
  onOptimizeRoute,
  canOptimize,
  onServiceTimeChange,
  onVehicleTypeChange,
  onCalculate,
  isCalculating = false,
  error,
  optimizationNotice,
}: QuoteFormProps) {
  const handleOriginSelect = useCallback(
    (place: PlaceValue) => {
      onOriginChange(place);
      onOriginTextChange(place.label);
    },
    [onOriginChange, onOriginTextChange],
  );

  const handleDestinationSelect = useCallback(
    (place: PlaceValue) => {
      onDestinationChange(place);
      onDestinationTextChange(place.label);
    },
    [onDestinationChange, onDestinationTextChange],
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const resolvedOrigin: PlaceValue = origin ?? {
      label: originText.trim(),
      location: originText.trim(),
    };

    const resolvedDestination: PlaceValue = destination ?? {
      label: destinationText.trim(),
      location: destinationText.trim(),
    };

    if (!resolvedOrigin.label || !resolvedDestination.label) {
      return;
    }

    onCalculate({
      origin: resolvedOrigin,
      destination: resolvedDestination,
      waypoints,
      serviceTime,
      vehicleType,
    });
  };

  return (
    <form id={QUOTE_FORM_ID} onSubmit={handleSubmit} className="flex flex-col gap-4">
      <PlaceAutocompleteInput
        id="origin"
        label="Origen"
        placeholder="Ej: Av. Apoquindo 3000, Las Condes"
        value={originText}
        onChange={(value) => {
          onOriginTextChange(value);
          onOriginChange(null);
        }}
        onPlaceSelect={handleOriginSelect}
      />

      <WaypointStopList
        waypoints={waypoints}
        onWaypointTextChange={onWaypointTextChange}
        onWaypointChange={onWaypointChange}
        onRemoveWaypoint={onRemoveWaypoint}
        onOptimizeRoute={onOptimizeRoute}
        canOptimize={canOptimize}
        isCalculating={isCalculating}
        optimizationNotice={optimizationNotice}
      />

      <PlaceAutocompleteInput
        id="destination"
        label="Destino"
        placeholder="Ej: Aeropuerto Arturo Merino Benítez"
        value={destinationText}
        onChange={(value) => {
          onDestinationTextChange(value);
          onDestinationChange(null);
        }}
        onPlaceSelect={handleDestinationSelect}
      />

      <button
        type="button"
        onClick={onAddWaypoint}
        className="inline-flex w-fit items-center gap-1 text-sm font-medium text-[#1A6FE8] transition-colors hover:text-[#1557c0]"
      >
        <span className="text-base leading-none">+</span>
        Añadir parada
      </button>

      <Select
        id="vehicle-type"
        label="Tipo de Vehículo"
        value={vehicleType}
        onChange={(value) => onVehicleTypeChange(value as VehicleType)}
        options={VEHICLE_OPTIONS.map((option) => ({
          value: option.value,
          label: option.label,
        }))}
      />

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="service-time"
          className="text-sm font-medium text-slate-700"
        >
          Hora del Servicio
          <span className="ml-1 font-normal text-slate-400">(opcional)</span>
        </label>
        <input
          id="service-time"
          type="time"
          value={serviceTime}
          onChange={(event) => onServiceTimeChange(event.target.value)}
          suppressHydrationWarning
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition-colors focus:border-[#1A6FE8] focus:ring-2 focus:ring-[#1A6FE8]/20"
        />
        <p className="text-xs text-slate-400">
          El TAG varía según bloque horario. Por defecto usa la hora actual.
        </p>
      </div>

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </form>
  );
}
