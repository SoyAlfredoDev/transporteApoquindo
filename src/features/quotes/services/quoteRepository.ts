import { ensureQuotesSchema } from "@/lib/db/schema";
import { getSql, isDatabaseConfigured } from "@/lib/db/neon";
import type {
  SaveQuoteInput,
  SaveQuoteResult,
  SavedQuoteRecord,
} from "@/features/quotes/types/quoteRecord";

export async function insertQuote(input: SaveQuoteInput): Promise<SaveQuoteResult> {
  if (!isDatabaseConfigured()) {
    throw new Error("Base de datos no configurada.");
  }

  await ensureQuotesSchema();
  const sql = getSql();

  const rows = await sql`
    INSERT INTO quotes (
      origin_label,
      destination_label,
      waypoint_labels,
      vehicle_type,
      service_time,
      distance_text,
      duration_text,
      distance_meters,
      duration_seconds,
      distance_subtotal_clp,
      time_subtotal_clp,
      base_total_clp,
      minimum_fare_applied,
      tag_subtotal_clp,
      tag_porticos,
      total_estimate_clp,
      route_request_id,
      origin_coords,
      destination_coords,
      route_path
    )
    VALUES (
      ${input.originLabel},
      ${input.destinationLabel},
      ${input.waypointLabels},
      ${input.vehicleType},
      ${input.serviceTime},
      ${input.distanceText},
      ${input.durationText},
      ${input.distanceMeters},
      ${input.durationSeconds},
      ${input.distanceSubtotalClp},
      ${input.timeSubtotalClp},
      ${input.baseTotalClp},
      ${input.minimumFareApplied},
      ${input.tagSubtotalClp},
      ${input.tagPorticos},
      ${input.totalEstimateClp},
      ${input.routeRequestId ?? null},
      ${input.originCoords ?? null},
      ${input.destinationCoords ?? null},
      ${input.routePath ?? null}
    )
    RETURNING id, created_at
  `;

  const row = rows[0];
  if (!row) {
    throw new Error("No se pudo guardar la cotización.");
  }

  return {
    id: String(row.id),
    createdAt: new Date(row.created_at as string).toISOString(),
  };
}

export async function listRecentQuotes(limit = 50): Promise<SavedQuoteRecord[]> {
  if (!isDatabaseConfigured()) {
    throw new Error("Base de datos no configurada.");
  }

  await ensureQuotesSchema();
  const sql = getSql();

  const rows = await sql`
    SELECT
      id,
      created_at,
      origin_label,
      destination_label,
      waypoint_labels,
      vehicle_type,
      service_time,
      distance_text,
      duration_text,
      distance_meters,
      duration_seconds,
      distance_subtotal_clp,
      time_subtotal_clp,
      base_total_clp,
      minimum_fare_applied,
      tag_subtotal_clp,
      tag_porticos,
      total_estimate_clp,
      route_request_id,
      origin_coords,
      destination_coords,
      route_path
    FROM quotes
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;

  return rows.map((row) => ({
    id: String(row.id),
    createdAt: new Date(row.created_at as string).toISOString(),
    originLabel: String(row.origin_label),
    destinationLabel: String(row.destination_label),
    waypointLabels: row.waypoint_labels as string[],
    vehicleType: row.vehicle_type as SavedQuoteRecord["vehicleType"],
    serviceTime: String(row.service_time),
    distanceText: String(row.distance_text),
    durationText: String(row.duration_text),
    distanceMeters: Number(row.distance_meters),
    durationSeconds: Number(row.duration_seconds),
    distanceSubtotalClp: Number(row.distance_subtotal_clp),
    timeSubtotalClp: Number(row.time_subtotal_clp),
    baseTotalClp: Number(row.base_total_clp),
    minimumFareApplied: Boolean(row.minimum_fare_applied),
    tagSubtotalClp: Number(row.tag_subtotal_clp),
    tagPorticos: row.tag_porticos as SavedQuoteRecord["tagPorticos"],
    totalEstimateClp: Number(row.total_estimate_clp),
    routeRequestId: row.route_request_id ? Number(row.route_request_id) : null,
    originCoords: row.origin_coords as SavedQuoteRecord["originCoords"],
    destinationCoords: row.destination_coords as SavedQuoteRecord["destinationCoords"],
    routePath: row.route_path as SavedQuoteRecord["routePath"],
  }));
}
