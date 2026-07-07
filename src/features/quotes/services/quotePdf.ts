import { jsPDF } from "jspdf";
import { getVehicleLabel } from "@/features/quotes/data/vehicleTypes";
import { formatClp } from "@/features/quotes/services/quoteCalculator";
import {
  quoteFilename,
  type QuoteExportData,
} from "@/features/quotes/services/quoteExport";
import { fetchStaticMapDataUrl } from "@/lib/google-maps/staticMapUrl";

const BRAND_BLUE = { r: 26, g: 111, b: 232 } as const;
const SLATE_800 = { r: 30, g: 41, b: 59 } as const;
const SLATE_600 = { r: 71, g: 85, b: 105 } as const;
const SLATE_400 = { r: 148, g: 163, b: 184 } as const;

function formatExportDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Santiago",
  }).format(date);
}

function writeLabelValue(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(SLATE_600.r, SLATE_600.g, SLATE_600.b);
  doc.text(label, x, y);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(SLATE_800.r, SLATE_800.g, SLATE_800.b);
  const valueLines = doc.splitTextToSize(value, width * 0.62);
  doc.text(valueLines, x + width, y, { align: "right" });

  return y + Math.max(5, valueLines.length * 4.5);
}

function writeBreakdownRow(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(SLATE_600.r, SLATE_600.g, SLATE_600.b);
  doc.text(label, x, y);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(SLATE_800.r, SLATE_800.g, SLATE_800.b);
  doc.text(value, x + width, y, { align: "right" });

  return y + 6;
}

export async function downloadQuoteAsPdf(data: QuoteExportData): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const margin = 14;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(SLATE_400.r, SLATE_400.g, SLATE_400.b);
  doc.text("TRANSPORTES APOQUINDO", margin, y);
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(SLATE_800.r, SLATE_800.g, SLATE_800.b);
  doc.text("Cotización de Ruta", margin, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(SLATE_400.r, SLATE_400.g, SLATE_400.b);
  doc.text(formatExportDate(), margin, y);
  y += 8;

  doc.setDrawColor(BRAND_BLUE.r, BRAND_BLUE.g, BRAND_BLUE.b);
  doc.setLineWidth(0.8);
  doc.line(margin, y, margin + contentWidth, y);
  y += 10;

  if (data.routeMap?.path?.length) {
    const mapDataUrl = await fetchStaticMapDataUrl(data.routeMap);

    if (mapDataUrl) {
      const mapHeight = (contentWidth * 360) / 640;
      doc.addImage(mapDataUrl, "PNG", margin, y, contentWidth, mapHeight);
      y += mapHeight + 8;
    } else {
      doc.setFontSize(9);
      doc.setTextColor(SLATE_400.r, SLATE_400.g, SLATE_400.b);
      doc.text("No se pudo generar la imagen del mapa.", margin, y);
      y += 8;
    }
  }

  y = writeLabelValue(doc, "Origen", data.originLabel, margin, y, contentWidth);
  y = writeLabelValue(doc, "Destino", data.destinationLabel, margin, y, contentWidth);
  y = writeLabelValue(
    doc,
    "Vehículo",
    getVehicleLabel(data.vehicleType),
    margin,
    y,
    contentWidth,
  );
  y = writeLabelValue(doc, "Hora servicio", data.serviceTime, margin, y, contentWidth);
  y = writeLabelValue(doc, "Distancia", data.distanceText, margin, y, contentWidth);
  y = writeLabelValue(doc, "Tiempo estimado", data.durationText, margin, y, contentWidth);
  y += 4;

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.line(margin, y, margin + contentWidth, y);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(SLATE_800.r, SLATE_800.g, SLATE_800.b);
  doc.text("Desglose", margin, y);
  y += 8;

  y = writeBreakdownRow(
    doc,
    "Subtotal distancia",
    formatClp(data.distanceSubtotalClp),
    margin,
    y,
    contentWidth,
  );
  y = writeBreakdownRow(
    doc,
    "Subtotal tiempo",
    formatClp(data.timeSubtotalClp),
    margin,
    y,
    contentWidth,
  );
  y = writeBreakdownRow(
    doc,
    `Base viaje${data.minimumFareApplied ? " (tarifa mínima)" : ""}`,
    formatClp(data.baseTotalClp),
    margin,
    y,
    contentWidth,
  );
  y = writeBreakdownRow(
    doc,
    "Subtotal TAG",
    formatClp(data.tagSubtotalClp),
    margin,
    y,
    contentWidth,
  );

  if (data.tagPorticos.length > 0) {
    y += 2;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(SLATE_400.r, SLATE_400.g, SLATE_400.b);
    doc.text("Pórticos detectados:", margin, y);
    y += 5;

    for (const portico of data.tagPorticos) {
      doc.text(`· ${portico.name}`, margin + 2, y);
      doc.text(formatClp(portico.amountClp), margin + contentWidth, y, {
        align: "right",
      });
      y += 5;
    }
  }

  y += 4;
  doc.setFillColor(BRAND_BLUE.r, BRAND_BLUE.g, BRAND_BLUE.b);
  doc.roundedRect(margin, y, contentWidth, 14, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text("Total estimado", margin + 4, y + 9);
  doc.setFontSize(14);
  doc.text(formatClp(data.totalEstimateClp), margin + contentWidth - 4, y + 9, {
    align: "right",
  });

  y += 22;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(SLATE_400.r, SLATE_400.g, SLATE_400.b);
  doc.text(
    "Cotización referencial sujeta a condiciones de tránsito. Transportes Apoquindo — Santiago, Chile.",
    margin,
    y,
    { maxWidth: contentWidth, align: "center" },
  );

  doc.save(quoteFilename("pdf"));
}
