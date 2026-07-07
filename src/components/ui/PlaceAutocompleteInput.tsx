"use client";

import { useEffect, useRef } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { Input } from "@/components/ui/Input";
import type { PlaceValue } from "@/features/quotes/types";

interface PlaceAutocompleteInputProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (place: PlaceValue) => void;
}

export function PlaceAutocompleteInput({
  id,
  label,
  placeholder,
  value,
  onChange,
  onPlaceSelect,
}: PlaceAutocompleteInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const placesLibrary = useMapsLibrary("places");
  const onPlaceSelectRef = useRef(onPlaceSelect);
  const onChangeRef = useRef(onChange);

  onPlaceSelectRef.current = onPlaceSelect;
  onChangeRef.current = onChange;

  // Sincroniza valor externo (p. ej. tras optimizar ruta) sin romper Autocomplete
  useEffect(() => {
    if (!inputRef.current || inputRef.current.value === value) return;
    inputRef.current.value = value;
  }, [value]);

  useEffect(() => {
    if (!placesLibrary || !inputRef.current) return;

    const input = inputRef.current;

    try {
      if (!google.maps.places?.Autocomplete) {
        return;
      }

      const autocomplete = new placesLibrary.Autocomplete(input, {
        componentRestrictions: { country: "cl" },
        fields: ["formatted_address", "geometry", "name"],
      });

      const listener = autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        const labelText = place.formatted_address ?? place.name ?? "";
        const location = place.geometry?.location
          ? {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            }
          : labelText;

        if (labelText) {
          onChangeRef.current(labelText);
          onPlaceSelectRef.current({ label: labelText, location });
        }
      });

      return () => {
        google.maps.event.removeListener(listener);
        google.maps.event.clearInstanceListeners(autocomplete);
      };
    } catch {
      // API key nueva sin Autocomplete legacy — el input manual sigue funcionando
      return undefined;
    }
  }, [placesLibrary]);

  return (
    <Input
      ref={inputRef}
      id={id}
      label={label}
      placeholder={placeholder}
      defaultValue={value}
      onChange={(event) => onChangeRef.current(event.target.value)}
      autoComplete="off"
    />
  );
}
