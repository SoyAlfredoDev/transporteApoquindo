"use client";

import { useCallback, useEffect, useState } from "react";
import { getVehicleLabel } from "@/features/quotes/data/vehicleTypes";
import { fetchSavedQuotes } from "@/features/quotes/services/fetchQuotesClient";
import { formatClp } from "@/features/quotes/services/quoteCalculator";
import type { SavedQuoteRecord } from "@/features/quotes/types/quoteRecord";

function formatQuoteDate(iso: string): string {
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Santiago",
  }).format(new Date(iso));
}

function QuoteHistoryCard({ quote }: { quote: SavedQuoteRecord }) {
  const [expanded, setExpanded] = useState(false);
  const hasWaypoints = quote.waypointLabels.length > 0;
  const hasTagCharges = quote.tagSubtotalClp > 0;

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50"
      >
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-800">
            {quote.originLabel} → {quote.destinationLabel}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {formatQuoteDate(quote.createdAt)} · {getVehicleLabel(quote.vehicleType)} ·{" "}
            {quote.distanceText} · {quote.durationText}
          </p>
          {hasWaypoints ? (
            <p className="mt-1 truncate text-xs text-slate-400">
              Paradas: {quote.waypointLabels.join(" · ")}
            </p>
          ) : null}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-base font-bold text-[#1A6FE8]">
            {formatClp(quote.totalEstimateClp)}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">
            {expanded ? "Ocultar" : "Ver detalle"}
          </p>
        </div>
      </button>

      {expanded ? (
        <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-3">
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <div className="flex justify-between gap-2">
              <span className="text-slate-600">Subtotal distancia</span>
              <span className="font-medium text-slate-800">
                {formatClp(quote.distanceSubtotalClp)}
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-slate-600">Subtotal tiempo</span>
              <span className="font-medium text-slate-800">
                {formatClp(quote.timeSubtotalClp)}
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-slate-600">
                Base viaje
                {quote.minimumFareApplied ? (
                  <span className="ml-1 text-xs text-amber-600">(mínima)</span>
                ) : null}
              </span>
              <span className="font-medium text-slate-800">
                {formatClp(quote.baseTotalClp)}
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-slate-600">Subtotal TAG</span>
              <span className="font-medium text-slate-800">
                {formatClp(quote.tagSubtotalClp)}
              </span>
            </div>
          </div>

          {hasTagCharges ? (
            <ul className="mt-3 space-y-1 border-t border-slate-200 pt-3">
              {quote.tagPorticos.map((portico) => (
                <li
                  key={`${quote.id}-${portico.porticoId}`}
                  className="flex justify-between gap-2 text-xs text-slate-500"
                >
                  <span>
                    {portico.highwayName} — {portico.name}
                  </span>
                  <span>{formatClp(portico.amountClp)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 border-t border-slate-200 pt-3 text-xs text-slate-400">
              Sin pórticos TAG detectados en la ruta.
            </p>
          )}

          <p className="mt-3 text-xs text-slate-400">
            Hora servicio: {quote.serviceTime} · ID: {quote.id.slice(0, 8)}…
          </p>
        </div>
      ) : null}
    </article>
  );
}

function HistorySkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-20 animate-pulse rounded-xl border border-slate-200 bg-white"
        />
      ))}
    </div>
  );
}

export function QuotesHistoryPanel() {
  const [quotes, setQuotes] = useState<SavedQuoteRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadQuotes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchSavedQuotes();
      setQuotes(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar cotizaciones.",
      );
      setQuotes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadQuotes();
  }, [loadQuotes]);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#F8FAFC]">
      <div className="shrink-0 border-b border-slate-200 px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              Historial de cotizaciones
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {isLoading
                ? "Cargando registros…"
                : `${quotes.length} cotización${quotes.length === 1 ? "" : "es"} guardada${quotes.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadQuotes()}
            disabled={isLoading}
            className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Actualizar
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
        {isLoading ? <HistorySkeleton /> : null}

        {!isLoading && error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <p className="font-medium">No se pudo cargar el historial</p>
            <p className="mt-1 text-red-600">{error}</p>
            {error.includes("DATABASE_URL") ? (
              <p className="mt-2 text-xs text-red-500">
                Configura <code className="font-mono">DATABASE_URL</code> en{" "}
                <code className="font-mono">.env.local</code> y reinicia el servidor.
              </p>
            ) : null}
          </div>
        ) : null}

        {!isLoading && !error && quotes.length === 0 ? (
          <div className="flex h-full min-h-[200px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center">
            <div>
              <p className="text-sm font-medium text-slate-700">
                Aún no hay cotizaciones guardadas
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Cada cotización generada en el cotizador se registrará aquí
                automáticamente.
              </p>
            </div>
          </div>
        ) : null}

        {!isLoading && !error && quotes.length > 0 ? (
          <div className="space-y-3">
            {quotes.map((quote) => (
              <QuoteHistoryCard key={quote.id} quote={quote} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
