"use client";

import { useCallback, useState } from "react";
import { PlaceAutocompleteInput } from "@/components/ui/PlaceAutocompleteInput";
import { Select } from "@/components/ui/Select";
import {
  VEHICLE_OPTIONS,
  type VehicleType,
} from "@/features/quotes/data/vehicleTypes";
import type { QuoteFormData, PlaceValue } from "@/features/quotes/types";

function getCurrentTimeString(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

interface QuoteFormProps {
  onCalculate: (data: QuoteFormData) => void;
  isCalculating?: boolean;
  error?: string | null;
}

export function QuoteForm({
  onCalculate,
  isCalculating = false,
  error,
}: QuoteFormProps) {
  const [originText, setOriginText] = useState("");
  const [destinationText, setDestinationText] = useState("");
  const [origin, setOrigin] = useState<PlaceValue | null>(null);
  const [destination, setDestination] = useState<PlaceValue | null>(null);
  const [serviceTime, setServiceTime] = useState(getCurrentTimeString);
  const [vehicleType, setVehicleType] = useState<VehicleType>("auto_suv");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleOriginSelect = useCallback((place: PlaceValue) => {
    setOrigin(place);
    setOriginText(place.label);
  }, []);

  const handleDestinationSelect = useCallback((place: PlaceValue) => {
    setDestination(place);
    setDestinationText(place.label);
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationError(null);

    const resolvedOrigin: PlaceValue = origin ?? {
      label: originText.trim(),
      location: originText.trim(),
    };

    const resolvedDestination: PlaceValue = destination ?? {
      label: destinationText.trim(),
      location: destinationText.trim(),
    };

    if (!resolvedOrigin.label || !resolvedDestination.label) {
      setValidationError("Ingresa origen y destino para calcular la ruta.");
      return;
    }

    onCalculate({
      origin: resolvedOrigin,
      destination: resolvedDestination,
      serviceTime,
      vehicleType,
    });
  };

  const displayError = validationError ?? error;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-800">
          Cotizador de Rutas
        </h2>
        <p className="text-sm text-slate-500">
          Calcula distancia, TAG y tarifa según vehículo y horario.
        </p>
      </div>

      <PlaceAutocompleteInput
        id="origin"
        label="Origen"
        placeholder="Ej: Av. Apoquindo 3000, Las Condes"
        value={originText}
        onChange={(value) => {
          setOriginText(value);
          setOrigin(null);
        }}
        onPlaceSelect={handleOriginSelect}
      />

      <PlaceAutocompleteInput
        id="destination"
        label="Destino"
        placeholder="Ej: Aeropuerto Arturo Merino Benítez"
        value={destinationText}
        onChange={(value) => {
          setDestinationText(value);
          setDestination(null);
        }}
        onPlaceSelect={handleDestinationSelect}
      />

      <Select
        id="vehicle-type"
        label="Tipo de Vehículo"
        value={vehicleType}
        onChange={(value) => setVehicleType(value as VehicleType)}
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
          onChange={(event) => setServiceTime(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition-colors focus:border-[#1A6FE8] focus:ring-2 focus:ring-[#1A6FE8]/20"
        />
        <p className="text-xs text-slate-400">
          El TAG varía según bloque horario. Por defecto usa la hora actual.
        </p>
      </div>

      {displayError ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {displayError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isCalculating}
        className="w-full rounded-xl bg-[#1A6FE8] px-4 py-3.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#1558BA] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isCalculating ? "Calculando ruta..." : "Calcular Ruta"}
      </button>
    </form>
  );
}
