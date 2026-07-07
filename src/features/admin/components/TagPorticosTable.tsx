"use client";

import { useMemo, useState } from "react";
import {
  getPorticoRatesByVehicle,
  TAG_PORTICOS,
  type TagPortico,
} from "@/features/quotes/data/tagTariffs";
import { VEHICLE_OPTIONS } from "@/features/quotes/data/vehicleTypes";
import { formatClp } from "@/features/quotes/services/quoteCalculator";
import { DataSourceBadge } from "@/features/admin/components/DataSourceBadge";

type AxisFilter = "all" | TagPortico["axis"];

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
  return "—";
}

export function TagPorticosTable() {
  const [axisFilter, setAxisFilter] = useState<AxisFilter>("all");

  const filteredPorticos = useMemo(() => {
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
    <div className="flex h-full flex-col overflow-hidden bg-[#F8FAFC]">
      <div className="shrink-0 border-b border-slate-200 px-4 py-4">
        <h2 className="text-base font-semibold text-slate-800">
          Autopista Central — Pórticos TAG
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {filteredPorticos.length} pórticos · Tarifa Oficial 2026
        </p>
        <select
          value={axisFilter}
          onChange={(e) => setAxisFilter(e.target.value as AxisFilter)}
          className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#1A6FE8] focus:ring-2 focus:ring-[#1A6FE8]/20"
        >
          <option value="all">Todos los ejes ({TAG_PORTICOS.length})</option>
          <option value="eje_norte_sur">
            Eje Norte-Sur ({norteSurCount})
          </option>
          <option value="eje_general_velasquez">
            Eje G. Velásquez ({velasquezCount})
          </option>
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
