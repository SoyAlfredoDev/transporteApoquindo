import type { RouteInfo } from "@/features/quotes/types";

interface QuoteResultsProps {
  routeInfo: RouteInfo;
}

export function QuoteResults({ routeInfo }: QuoteResultsProps) {
  return (
    <div className="mt-5 border-t border-slate-200 pt-5">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Resultado de la ruta
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Distancia
          </p>
          <p className="mt-1 text-xl font-semibold text-slate-800">
            {routeInfo.distanceText}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Tiempo estimado
          </p>
          <p className="mt-1 text-xl font-semibold text-slate-800">
            {routeInfo.durationText}
          </p>
        </div>
      </div>
    </div>
  );
}
