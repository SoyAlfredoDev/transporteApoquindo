"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { useNotification } from "@/components/ui/notifications/NotificationProvider";
import { formatClp } from "@/features/quotes/services/quoteCalculator";
import {
  downloadQuoteAsHtml,
  type QuoteExportData,
} from "@/features/quotes/services/quoteExport";
import { isValidEmail, sendQuoteEmailMock } from "@/features/quotes/services/quoteEmail";
import { getVehicleLabel } from "@/features/quotes/data/vehicleTypes";
import type { QuoteBreakdown } from "@/features/quotes/types";

interface QuoteResultsProps {
  quote: QuoteBreakdown;
  originLabel: string;
  destinationLabel: string;
}

export function QuoteResults({
  quote,
  originLabel,
  destinationLabel,
}: QuoteResultsProps) {
  const { success, error, info } = useNotification();
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const hasTagCharges = quote.tagSubtotalClp > 0;

  const exportData: QuoteExportData = {
    ...quote,
    originLabel,
    destinationLabel,
  };

  const handleDownload = () => {
    downloadQuoteAsHtml(exportData);
    success(
      "Cotización descargada",
      "El archivo HTML se guardó en tu dispositivo.",
    );
  };

  const handleSendEmail = async () => {
    const trimmed = email.trim();

    if (!trimmed) {
      error("Correo requerido", "Ingresa un correo electrónico para enviar la cotización.");
      return;
    }

    if (!isValidEmail(trimmed)) {
      error("Correo inválido", "Revisa el formato del correo electrónico.");
      return;
    }

    setIsSending(true);
    info("Enviando cotización…", `Preparando envío a ${trimmed}`);

    try {
      await sendQuoteEmailMock(trimmed, exportData);
      success(
        "Correo enviado correctamente",
        `La cotización fue enviada a ${trimmed}. (Modo prueba — Resend pendiente)`,
      );
    } catch (err) {
      error(
        "No se pudo enviar",
        err instanceof Error ? err.message : "Intenta nuevamente.",
      );
    } finally {
      setIsSending(false);
    }
  };

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
        {originLabel} → {destinationLabel}
      </p>
      <p className="mt-1 text-xs text-slate-400">
        Vehículo: {getVehicleLabel(quote.vehicleType)} · Hora: {quote.serviceTime}
      </p>

      <div className="mt-3 space-y-2 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Subtotal Distancia</span>
          <span className="font-semibold text-slate-800">
            {formatClp(quote.distanceSubtotalClp)}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Subtotal Tiempo (tránsito)</span>
          <span className="font-semibold text-slate-800">
            {formatClp(quote.timeSubtotalClp)}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-sm">
          <span className="text-slate-600">
            Base viaje
            {quote.minimumFareApplied ? (
              <span className="ml-1 text-xs text-amber-600">(tarifa mínima)</span>
            ) : null}
          </span>
          <span className="font-semibold text-slate-800">
            {formatClp(quote.baseTotalClp)}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Subtotal TAG (pórticos)</span>
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
                <span>{portico.name}</span>
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

      <div className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-medium text-slate-800">Compartir cotización</p>

        <Input
          id="quote-email"
          label="Correo electrónico"
          type="email"
          placeholder="cliente@empresa.cl"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleDownload}
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Descargar
          </button>
          <button
            type="button"
            onClick={handleSendEmail}
            disabled={isSending}
            className="rounded-xl bg-[#1A6FE8] px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1558c0] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSending ? "Enviando…" : "Enviar correo"}
          </button>
        </div>
      </div>
    </div>
  );
}
