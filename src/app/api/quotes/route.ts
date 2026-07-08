import { NextResponse } from "next/server";
import { insertQuote, listRecentQuotes } from "@/features/quotes/services/quoteRepository";
import { isDatabaseConfigured } from "@/lib/db/neon";
import type { SaveQuoteInput } from "@/features/quotes/types/quoteRecord";
import type { VehicleType } from "@/features/quotes/data/vehicleTypes";

const VEHICLE_TYPES = new Set<VehicleType>(["auto_suv", "camioneta", "van_ejecutiva"]);

function parseSaveQuoteInput(body: unknown): SaveQuoteInput {
  if (!body || typeof body !== "object") {
    throw new Error("Cuerpo de solicitud inválido.");
  }

  const data = body as Record<string, unknown>;

  const requiredStrings = [
    "originLabel",
    "destinationLabel",
    "vehicleType",
    "serviceTime",
    "distanceText",
    "durationText",
  ] as const;

  for (const key of requiredStrings) {
    if (typeof data[key] !== "string" || !String(data[key]).trim()) {
      throw new Error(`Campo requerido inválido: ${key}`);
    }
  }

  if (!VEHICLE_TYPES.has(data.vehicleType as VehicleType)) {
    throw new Error("Tipo de vehículo inválido.");
  }

  const numbers = [
    "distanceMeters",
    "durationSeconds",
    "distanceSubtotalClp",
    "timeSubtotalClp",
    "baseTotalClp",
    "tagSubtotalClp",
    "totalEstimateClp",
  ] as const;

  for (const key of numbers) {
    if (typeof data[key] !== "number" || !Number.isFinite(data[key] as number)) {
      throw new Error(`Campo numérico inválido: ${key}`);
    }
  }

  if (typeof data.minimumFareApplied !== "boolean") {
    throw new Error("Campo minimumFareApplied inválido.");
  }

  if (!Array.isArray(data.waypointLabels)) {
    throw new Error("waypointLabels debe ser un arreglo.");
  }

  if (!Array.isArray(data.tagPorticos)) {
    throw new Error("tagPorticos debe ser un arreglo.");
  }

  return {
    originLabel: String(data.originLabel),
    destinationLabel: String(data.destinationLabel),
    waypointLabels: data.waypointLabels.map(String),
    vehicleType: data.vehicleType as VehicleType,
    serviceTime: String(data.serviceTime),
    distanceText: String(data.distanceText),
    durationText: String(data.durationText),
    distanceMeters: data.distanceMeters as number,
    durationSeconds: data.durationSeconds as number,
    distanceSubtotalClp: data.distanceSubtotalClp as number,
    timeSubtotalClp: data.timeSubtotalClp as number,
    baseTotalClp: data.baseTotalClp as number,
    minimumFareApplied: data.minimumFareApplied,
    tagSubtotalClp: data.tagSubtotalClp as number,
    tagPorticos: data.tagPorticos as SaveQuoteInput["tagPorticos"],
    totalEstimateClp: data.totalEstimateClp as number,
    routeRequestId:
      typeof data.routeRequestId === "number" ? data.routeRequestId : null,
    originCoords: data.originCoords as SaveQuoteInput["originCoords"],
    destinationCoords: data.destinationCoords as SaveQuoteInput["destinationCoords"],
    routePath: data.routePath as SaveQuoteInput["routePath"],
  };
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "DATABASE_URL no está configurada en el servidor." },
      { status: 503 },
    );
  }

  try {
    const body = await request.json();
    const input = parseSaveQuoteInput(body);
    const saved = await insertQuote(input);
    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al guardar cotización.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "DATABASE_URL no está configurada en el servidor." },
      { status: 503 },
    );
  }

  try {
    const quotes = await listRecentQuotes();
    return NextResponse.json({ quotes });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al listar cotizaciones.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
