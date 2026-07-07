import type { QuoteBreakdown } from "@/features/quotes/types";
import { formatClp } from "@/features/quotes/services/quoteCalculator";
import { getVehicleLabel } from "@/features/quotes/data/vehicleTypes";

interface QuoteResultsProps {
  quote: QuoteBreakdown;
}

export function QuoteResults({ quote }: QuoteResultsProps) {
  const hasTagCharges = quote.tagSubtotalClp > 0;

  return (
    <div className="mt-5 border-t border-slate-200 pt-5">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Resultado de la cotización
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Distancia
          </p>
          <p className="mt-1 text-xl font-semibold text-slate-800">
            {quote.distanceText}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Tiempo
          </p>
          <p className="mt-1 text-xl font-semibold text-slate-800">
            {quote.durationText}
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        Vehículo: {getVehicleLabel(quote.vehicleType)} · Hora: {quote.serviceTime}
      </p>

      <div className="mt-3 space-y-2 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Subtotal Kilómetros</span>
          <span className="font-semibold text-slate-800">
            {formatClp(quote.kilometersSubtotalClp)}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Subtotal TAG (Autopistas Urbanas)</span>
          <span
            className={`font-semibold ${hasTagCharges ? "text-slate-800" : "text-slate-400"}`}
          >
            {formatClp(quote.tagSubtotalClp)}
          </span>
        </div>

        {hasTagCharges ? (
          <ul className="space-y-1 border-t border-slate-100 pt-2">
            {quote.tagPorticos.map((portico) => (
              <li
                key={portico.porticoId}
                className="flex items-center justify-between text-xs text-slate-500"
              >
                <span>
                  {portico.name}{" "}
                  <span className="text-slate-400">({portico.tariffBlock})</span>
                </span>
                <span>{formatClp(portico.amountClp)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="border-t border-slate-100 pt-2 text-xs text-slate-400">
            La ruta no cruza pórticos TAG registrados en la RM.
          </p>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between rounded-xl border border-[#1A6FE8]/20 bg-[#1A6FE8]/5 px-4 py-3">
        <span className="text-sm font-semibold text-slate-800">Total Final</span>
        <span className="text-lg font-bold text-[#1A6FE8]">
          {formatClp(quote.totalEstimateClp)}
        </span>
      </div>
    </div>
  );
}
