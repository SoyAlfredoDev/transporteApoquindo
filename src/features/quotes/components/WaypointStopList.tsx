"use client";

import { PlaceAutocompleteInput } from "@/components/ui/PlaceAutocompleteInput";
import type { PlaceValue, WaypointStop } from "@/features/quotes/types";

interface WaypointStopListProps {
  waypoints: WaypointStop[];
  onWaypointTextChange: (id: string, text: string) => void;
  onWaypointChange: (id: string, place: PlaceValue | null) => void;
  onRemoveWaypoint: (id: string) => void;
  onAddWaypoint: () => void;
  onOptimizeRoute: () => void;
  canOptimize: boolean;
  isCalculating?: boolean;
  optimizationNotice?: string | null;
}

function RemoveStopButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-4 w-4"
        aria-hidden
      >
        <path
          fillRule="evenodd"
          d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 11.142A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-11.142.149.023a.75.75 0 00.23-1.482A41.68 41.68 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.06 1.06L8.94 10l-1.42 1.22a.75.75 0 101.06 1.06L10 11.06l1.42 1.22a.75.75 0 101.06-1.06L11.06 10l1.42-1.22a.75.75 0 00-1.06-1.06L10 8.94 8.58 7.72z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  );
}

export function WaypointStopList({
  waypoints,
  onWaypointTextChange,
  onWaypointChange,
  onRemoveWaypoint,
  onAddWaypoint,
  onOptimizeRoute,
  canOptimize,
  isCalculating = false,
  optimizationNotice,
}: WaypointStopListProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-slate-700">Paradas intermedias</p>
        {waypoints.length > 0 ? (
          <span className="text-xs text-slate-400">
            {waypoints.length} {waypoints.length === 1 ? "parada" : "paradas"}
          </span>
        ) : null}
      </div>

      {waypoints.length > 0 ? (
        <div className="space-y-2.5">
          {waypoints.map((stop, index) => (
            <div key={stop.id} className="flex items-end gap-2">
              <div className="min-w-0 flex-1">
                <PlaceAutocompleteInput
                  id={`waypoint-${stop.id}`}
                  label={`Parada ${index + 1}`}
                  placeholder="Ej: Providencia 1200, Santiago"
                  value={stop.text}
                  onChange={(value) => {
                    onWaypointTextChange(stop.id, value);
                    onWaypointChange(stop.id, null);
                  }}
                  onPlaceSelect={(place) => {
                    onWaypointChange(stop.id, place);
                    onWaypointTextChange(stop.id, place.label);
                  }}
                />
              </div>
              <RemoveStopButton
                label={`Eliminar parada ${index + 1}`}
                onClick={() => onRemoveWaypoint(stop.id)}
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-slate-200 bg-white/60 px-3 py-2.5 text-xs text-slate-400">
          Añade paradas entre origen y destino para rutas con múltiples puntos.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onAddWaypoint}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-[#1A6FE8]/30 hover:bg-[#1A6FE8]/5 hover:text-[#1A6FE8]"
        >
          <span className="text-base leading-none">+</span>
          Añadir parada
        </button>

        {canOptimize ? (
          <button
            type="button"
            onClick={onOptimizeRoute}
            disabled={isCalculating}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#1A6FE8]/25 bg-[#1A6FE8]/10 px-3 py-2 text-sm font-semibold text-[#1A6FE8] transition-colors hover:bg-[#1A6FE8]/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H4.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z"
                clipRule="evenodd"
              />
            </svg>
            Optimizar ruta
          </button>
        ) : null}
      </div>

      {optimizationNotice ? (
        <p className="rounded-lg bg-[#1A6FE8]/10 px-3 py-2 text-xs font-medium text-[#1558c0]">
          {optimizationNotice}
        </p>
      ) : null}
    </div>
  );
}
