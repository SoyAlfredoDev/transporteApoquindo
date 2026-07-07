"use client";

import { useMemo, useState } from "react";
import { InfoWindow, Map, Marker } from "@vis.gl/react-google-maps";
import {
  getPorticoRatesByVehicle,
  TAG_PORTICOS,
  type TagPortico,
} from "@/features/quotes/data/tagTariffs";
import { VEHICLE_OPTIONS } from "@/features/quotes/data/vehicleTypes";
import { formatClp } from "@/features/quotes/services/quoteCalculator";
import {
  DEFAULT_MAP_ZOOM,
  SANTIAGO_CENTER,
} from "@/lib/google-maps/config";

type AxisFilter = "all" | TagPortico["axis"];

function PorticoInfoContent({ portico }: { portico: TagPortico }) {
  return (
    <div className="min-w-[220px] p-1">
      <p className="text-sm font-semibold text-slate-800">
        {portico.porticoCode
          ? `${portico.porticoCode} — ${portico.name}`
          : portico.name}
      </p>
      <p className="text-xs text-slate-500">{portico.highwayName}</p>
      {portico.segmentName ? (
        <p className="mt-0.5 text-xs text-slate-400">{portico.segmentName}</p>
      ) : null}
      <p className="mt-1 text-xs font-medium text-emerald-700">
        Tarifa Oficial 2026
      </p>
      <div className="mt-2 space-y-2">
        {VEHICLE_OPTIONS.map((vehicle) => {
          const rates = getPorticoRatesByVehicle(portico, vehicle.value);
          return (
            <div key={vehicle.value}>
              <p className="text-xs font-medium text-slate-600">
                {vehicle.label}
              </p>
              <p className="text-xs text-slate-500">
                TB {formatClp(rates.TB)} · TA {formatClp(rates.TA)} · TS{" "}
                {formatClp(rates.TS)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TagPorticosMap() {
  const [selectedPortico, setSelectedPortico] = useState<TagPortico | null>(
    null,
  );
  const [axisFilter, setAxisFilter] = useState<AxisFilter>("all");

  const visiblePorticos = useMemo(() => {
    if (axisFilter === "all") return TAG_PORTICOS;
    return TAG_PORTICOS.filter((p) => p.axis === axisFilter);
  }, [axisFilter]);

  const norteSurCount = TAG_PORTICOS.filter(
    (p) => p.axis === "eje_norte_sur",
  ).length;
  const velasquezCount = TAG_PORTICOS.filter(
    (p) => p.axis === "eje_general_velasquez",
  ).length;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="absolute inset-x-0 top-0 z-10 flex gap-2 p-3">
        <select
          value={axisFilter}
          onChange={(e) => {
            setAxisFilter(e.target.value as AxisFilter);
            setSelectedPortico(null);
          }}
          className="rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-xs font-medium text-slate-700 shadow-sm backdrop-blur-sm outline-none"
        >
          <option value="all">Todos ({TAG_PORTICOS.length})</option>
          <option value="eje_norte_sur">
            Eje Norte-Sur ({norteSurCount})
          </option>
          <option value="eje_general_velasquez">
            Eje G. Velásquez ({velasquezCount})
          </option>
        </select>
      </div>

      <Map
        defaultCenter={SANTIAGO_CENTER}
        defaultZoom={DEFAULT_MAP_ZOOM - 1}
        gestureHandling="greedy"
        fullscreenControl={false}
        mapTypeControl={false}
        streetViewControl={false}
        className="h-full w-full"
      >
        {visiblePorticos.map((portico) => (
          <Marker
            key={portico.id}
            position={portico.coordinates}
            onClick={() => setSelectedPortico(portico)}
            title={portico.porticoCode ?? portico.name}
          />
        ))}

        {selectedPortico ? (
          <InfoWindow
            position={selectedPortico.coordinates}
            onCloseClick={() => setSelectedPortico(null)}
          >
            <PorticoInfoContent portico={selectedPortico} />
          </InfoWindow>
        ) : null}
      </Map>
    </div>
  );
}
