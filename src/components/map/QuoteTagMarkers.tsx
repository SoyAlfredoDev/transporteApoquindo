"use client";

import { useMemo, useState } from "react";
import { InfoWindow, Marker } from "@vis.gl/react-google-maps";
import type { TagPorticoCharge } from "@/features/quotes/services/quoteCalculator";
import { formatClp } from "@/features/quotes/services/quoteCalculator";
import {
  QUOTE_TAG_MARKER_ICON,
  QUOTE_TAG_MARKER_ICON_AMB,
  QUOTE_TAG_MARKER_ICON_AMB_SELECTED,
  QUOTE_TAG_MARKER_ICON_SELECTED,
} from "@/lib/google-maps/markerIcons";

interface QuoteTagMarkersProps {
  tagPorticos: TagPorticoCharge[];
}

function markerIcon(
  portico: TagPorticoCharge,
  selected: boolean,
): google.maps.Icon {
  if (portico.isAmbToll) {
    return selected
      ? QUOTE_TAG_MARKER_ICON_AMB_SELECTED
      : QUOTE_TAG_MARKER_ICON_AMB;
  }
  return selected ? QUOTE_TAG_MARKER_ICON_SELECTED : QUOTE_TAG_MARKER_ICON;
}

export function QuoteTagMarkers({ tagPorticos }: QuoteTagMarkersProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const visiblePorticos = useMemo(
    () => tagPorticos.filter((portico) => portico.coordinates),
    [tagPorticos],
  );

  const selectedPortico = visiblePorticos.find(
    (portico) => portico.porticoId === selectedId,
  );

  if (visiblePorticos.length === 0) return null;

  return (
    <>
      {visiblePorticos.map((portico) => (
        <Marker
          key={portico.porticoId}
          position={portico.coordinates}
          zIndex={20}
          title={`${portico.name} — ${formatClp(portico.amountClp)}`}
          icon={markerIcon(portico, selectedId === portico.porticoId)}
          onClick={() =>
            setSelectedId((current) =>
              current === portico.porticoId ? null : portico.porticoId,
            )
          }
        />
      ))}

      {selectedPortico ? (
        <InfoWindow
          position={selectedPortico.coordinates}
          onCloseClick={() => setSelectedId(null)}
        >
          <div className="min-w-[180px] p-1">
            <p className="text-xs font-semibold text-slate-800">
              {selectedPortico.isAmbToll ? "Peaje AMB" : "Pórtico TAG"}
            </p>
            <p className="mt-0.5 text-sm font-medium text-slate-800">
              {selectedPortico.name}
            </p>
            <p className="text-xs text-slate-500">
              {selectedPortico.highwayName}
            </p>
            <p className="mt-1 text-sm font-semibold text-[#1A6FE8]">
              {formatClp(selectedPortico.amountClp)}
            </p>
          </div>
        </InfoWindow>
      ) : null}
    </>
  );
}
