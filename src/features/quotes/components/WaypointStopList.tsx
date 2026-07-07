"use client";

import { PlaceAutocompleteInput } from "@/components/ui/PlaceAutocompleteInput";
import type { PlaceValue, WaypointStop } from "@/features/quotes/types";

interface WaypointStopListProps {
  waypoints: WaypointStop[];
  onWaypointTextChange: (id: string, text: string) => void;
  onWaypointChange: (id: string, place: PlaceValue | null) => void;
  onRemoveWaypoint: (id: string) => void;
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
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-4 w-4"
        aria-hidden
      >
        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
      </svg>
    </button>
  );
}

export function WaypointStopList({
  waypoints,
  onWaypointTextChange,
  onWaypointChange,
  onRemoveWaypoint,
  onOptimizeRoute,
  canOptimize,
  isCalculating = false,
  optimizationNotice,
}: WaypointStopListProps) {
  if (waypoints.length === 0) return null;

  return (
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

      {canOptimize ? (
        <button
          type="button"
          onClick={onOptimizeRoute}
          disabled={isCalculating}
          className="inline-flex items-center gap-1.5 rounded-lg px-1 py-1 text-sm font-medium text-[#1A6FE8] transition-colors hover:text-[#1557c0] disabled:cursor-not-allowed disabled:opacity-60"
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

      {optimizationNotice ? (
        <p className="rounded-lg bg-[#1A6FE8]/10 px-3 py-2 text-xs font-medium text-[#1558c0]">
          {optimizationNotice}
        </p>
      ) : null}
    </div>
  );
}
