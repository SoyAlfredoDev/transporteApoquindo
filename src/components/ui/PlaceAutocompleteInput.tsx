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

  useEffect(() => {
    if (!placesLibrary || !inputRef.current) return;

    const autocomplete = new placesLibrary.Autocomplete(inputRef.current, {
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
        onPlaceSelect({ label: labelText, location });
      }
    });

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [placesLibrary, onPlaceSelect]);

  return (
    <Input
      ref={inputRef}
      id={id}
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      autoComplete="off"
    />
  );
}
