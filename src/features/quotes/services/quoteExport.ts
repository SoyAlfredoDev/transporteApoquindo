import { getVehicleLabel } from "@/features/quotes/data/vehicleTypes";
import { formatClp } from "@/features/quotes/services/quoteCalculator";
import type { QuoteBreakdown } from "@/features/quotes/types";

export interface QuoteExportMeta {
  originLabel: string;
  destinationLabel: string;
}

export interface RouteMapSnapshot {
  path: google.maps.LatLngLiteral[];
  origin?: google.maps.LatLngLiteral | null;
  destination?: google.maps.LatLngLiteral | null;
  waypoints?: google.maps.LatLngLiteral[];
}

export interface QuoteExportData extends QuoteBreakdown, QuoteExportMeta {
  routeMap?: RouteMapSnapshot | null;
}

function formatExportDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Santiago",
  }).format(date);
}

function buildQuoteText(data: QuoteExportData): string {
  const lines = [
    "TRANSPORTES APOQUINDO",
    "Cotización de Ruta",
    "═".repeat(40),
    "",
    `Fecha: ${formatExportDate()}`,
    `Origen: ${data.originLabel}`,
    `Destino: ${data.destinationLabel}`,
    `Vehículo: ${getVehicleLabel(data.vehicleType)}`,
    `Hora servicio: ${data.serviceTime}`,
    "",
    `Distancia: ${data.distanceText}`,
    `Tiempo estimado: ${data.durationText}`,
    "",
    "─".repeat(40),
    "DESGLOSE",
    `Subtotal distancia:     ${formatClp(data.distanceSubtotalClp)}`,
    `Subtotal tiempo:        ${formatClp(data.timeSubtotalClp)}`,
    `Base viaje${data.minimumFareApplied ? " (tarifa mínima)" : ""}: ${formatClp(data.baseTotalClp)}`,
    `Subtotal TAG:           ${formatClp(data.tagSubtotalClp)}`,
  ];

  if (data.tagPorticos.length > 0) {
    lines.push("", "Pórticos detectados:");
    for (const portico of data.tagPorticos) {
      lines.push(`  · ${portico.name}: ${formatClp(portico.amountClp)}`);
    }
  }

  lines.push(
    "",
    "═".repeat(40),
    `TOTAL ESTIMADO: ${formatClp(data.totalEstimateClp)}`,
    "",
    "Cotización referencial sujeta a condiciones de tránsito.",
    "Transportes Apoquindo — Santiago, Chile",
  );

  return lines.join("\n");
}

function buildQuoteHtml(data: QuoteExportData): string {
  const porticosRows = data.tagPorticos
    .map(
      (p) =>
        `<tr><td style="padding:6px 0;color:#64748b;font-size:13px">${p.name}</td><td style="padding:6px 0;text-align:right;font-size:13px;color:#334155">${formatClp(p.amountClp)}</td></tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Cotización Transportes Apoquindo</title>
</head>
<body style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;margin:40px auto;padding:24px;color:#0f172a">
  <div style="border-bottom:3px solid #1A6FE8;padding-bottom:16px;margin-bottom:24px">
    <p style="margin:0;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#64748b">Transportes Apoquindo</p>
    <h1 style="margin:8px 0 0;font-size:22px">Cotización de Ruta</h1>
    <p style="margin:6px 0 0;font-size:13px;color:#64748b">${formatExportDate()}</p>
  </div>
  <table style="width:100%;font-size:14px;margin-bottom:20px">
    <tr><td style="color:#64748b;padding:4px 0">Origen</td><td style="text-align:right;font-weight:600">${data.originLabel}</td></tr>
    <tr><td style="color:#64748b;padding:4px 0">Destino</td><td style="text-align:right;font-weight:600">${data.destinationLabel}</td></tr>
    <tr><td style="color:#64748b;padding:4px 0">Vehículo</td><td style="text-align:right">${getVehicleLabel(data.vehicleType)}</td></tr>
    <tr><td style="color:#64748b;padding:4px 0">Hora</td><td style="text-align:right">${data.serviceTime}</td></tr>
    <tr><td style="color:#64748b;padding:4px 0">Distancia</td><td style="text-align:right">${data.distanceText}</td></tr>
    <tr><td style="color:#64748b;padding:4px 0">Tiempo</td><td style="text-align:right">${data.durationText}</td></tr>
  </table>
  <div style="background:#f8fafc;border-radius:12px;padding:16px;margin-bottom:20px">
    <table style="width:100%;font-size:14px">
      <tr><td style="padding:6px 0">Subtotal distancia</td><td style="text-align:right">${formatClp(data.distanceSubtotalClp)}</td></tr>
      <tr><td style="padding:6px 0">Subtotal tiempo</td><td style="text-align:right">${formatClp(data.timeSubtotalClp)}</td></tr>
      <tr><td style="padding:6px 0">Base viaje</td><td style="text-align:right">${formatClp(data.baseTotalClp)}</td></tr>
      <tr><td style="padding:6px 0">Subtotal TAG</td><td style="text-align:right">${formatClp(data.tagSubtotalClp)}</td></tr>
    </table>
    ${porticosRows ? `<table style="width:100%;margin-top:8px;border-top:1px solid #e2e8f0;padding-top:8px">${porticosRows}</table>` : ""}
  </div>
  <div style="background:#1A6FE8;color:white;border-radius:12px;padding:16px;display:flex;justify-content:space-between;align-items:center">
    <span style="font-weight:600">Total estimado</span>
    <span style="font-size:22px;font-weight:700">${formatClp(data.totalEstimateClp)}</span>
  </div>
  <p style="margin-top:24px;font-size:12px;color:#94a3b8;text-align:center">Cotización referencial · Transportes Apoquindo</p>
</body>
</html>`;
}

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function quoteFilename(extension: string): string {
  const stamp = new Intl.DateTimeFormat("es-CL", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
    .format(new Date())
    .replace(/[/,\s:]/g, "-");
  return `cotizacion-apoquindo-${stamp}.${extension}`;
}

export function downloadQuoteAsText(data: QuoteExportData): void {
  downloadBlob(buildQuoteText(data), quoteFilename("txt"), "text/plain;charset=utf-8");
}

export function downloadQuoteAsHtml(data: QuoteExportData): void {
  downloadBlob(buildQuoteHtml(data), quoteFilename("html"), "text/html;charset=utf-8");
}
