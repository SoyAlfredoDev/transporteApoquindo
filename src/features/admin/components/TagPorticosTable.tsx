"use client";

import { useMemo, useState } from "react";
import {
  getPorticoRatesByVehicle,
  HIGHWAYS,
  TAG_PORTICOS,
  type TagPortico,
} from "@/features/quotes/data/tagTariffs";
import { VEHICLE_OPTIONS } from "@/features/quotes/data/vehicleTypes";
import { formatClp } from "@/features/quotes/services/quoteCalculator";
import { DataSourceBadge } from "@/features/admin/components/DataSourceBadge";

type HighwayFilter = "all" | string;

function RateCell({ amount }: { amount: number }) {
  return <span className="text-xs text-slate-600">{formatClp(amount)}</span>;
}

function PorticoRatesRow({ portico }: { portico: TagPortico }) {
  return (
    <>
      {VEHICLE_OPTIONS.map((vehicle) => {
        const rates = getPorticoRatesByVehicle(portico, vehicle.value);
        return (
          <tr key={`${portico.id}-${vehicle.value}`} className="border-t border-slate-100">
            <td className="px-3 py-2 text-xs text-slate-400">{vehicle.label}</td>
            <td className="px-3 py-2">
              <RateCell amount={rates.TB} />
            </td>
            <td className="px-3 py-2">
              <RateCell amount={rates.TA} />
            </td>
            <td className="px-3 py-2">
              <RateCell amount={rates.TS} />
            </td>
          </tr>
        );
      })}
    </>
  );
}

function formatAxis(axis?: TagPortico["axis"]): string {
  if (axis === "eje_norte_sur") return "Eje Norte-Sur";
  if (axis === "eje_general_velasquez") return "Eje G. Velásquez";
  return "—";
}

function formatDirection(direction?: TagPortico["direction"]): string {
  if (direction === "sur_norte") return "Sur → Norte";
  if (direction === "norte_sur") return "Norte → Sur";
  if (direction === "oriente_poniente") return "Oriente → Poniente";
  if (direction === "poniente_oriente") return "Poniente → Oriente";
  return "—";
}

export function TagPorticosTable() {
  const [highwayFilter, setHighwayFilter] = useState<HighwayFilter>("all");

  const filteredPorticos = useMemo(() => {
    if (highwayFilter === "all") return TAG_PORTICOS;
    return TAG_PORTICOS.filter((p) => p.highwayId === highwayFilter);
  }, [highwayFilter]);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#F8FAFC]">
      <div className="shrink-0 border-b border-slate-200 px-4 py-4">
        <h2 className="text-base font-semibold text-slate-800">
          Pórticos TAG — Región Metropolitana
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {filteredPorticos.length} de {TAG_PORTICOS.length} pórticos · Tarifa Oficial 2026
        </p>
        <select
          value={highwayFilter}
          onChange={(e) => setHighwayFilter(e.target.value)}
          className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#1A6FE8] focus:ring-2 focus:ring-[#1A6FE8]/20"
        >
          <option value="all">Todas las concesiones ({TAG_PORTICOS.length})</option>
          {HIGHWAYS.map((h) => {
            const count = TAG_PORTICOS.filter((p) => p.highwayId === h.id).length;
            return (
              <option key={h.id} value={h.id}>
                {h.name} ({count})
              </option>
            );
          })}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain p-4">
        <div className="space-y-4">
          {filteredPorticos.map((portico) => (
            <div
              key={portico.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="border-b border-slate-100 px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-800">
                    {portico.porticoCode
                      ? `${portico.porticoCode} — ${portico.name}`
                      : portico.name}
                  </h3>
                  <DataSourceBadge />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {portico.highwayName}
                  {portico.segmentName ? ` · ${portico.segmentName}` : ""}
                </p>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-400">
                  <span>
                    {portico.coordinates.lat.toFixed(4)},{" "}
                    {portico.coordinates.lng.toFixed(4)}
                  </span>
                  {portico.lengthKm ? (
                    <span>{portico.lengthKm} km</span>
                  ) : null}
                  {portico.axis ? <span>{formatAxis(portico.axis)}</span> : null}
                  {portico.direction ? (
                    <span>{formatDirection(portico.direction)}</span>
                  ) : null}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[320px] text-left">
                  <thead>
                    <tr className="bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
                      <th className="px-3 py-2">Vehículo</th>
                      <th className="px-3 py-2">TB</th>
                      <th className="px-3 py-2">TA</th>
                      <th className="px-3 py-2">TS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <PorticoRatesRow portico={portico} />
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
