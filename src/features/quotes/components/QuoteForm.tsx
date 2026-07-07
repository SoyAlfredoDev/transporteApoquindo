"use client";

import { useCallback, useState } from "react";
import { PlaceAutocompleteInput } from "@/components/ui/PlaceAutocompleteInput";
import type { PlaceValue } from "@/features/quotes/types";

interface QuoteFormProps {
  onCalculate: (data: { origin: PlaceValue; destination: PlaceValue }) => void;
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
          Ingresa origen y destino en Chile para calcular distancia y tiempo.
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
