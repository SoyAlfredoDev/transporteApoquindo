import { getSql, isDatabaseConfigured } from "@/lib/db/neon";

let schemaReady: Promise<void> | null = null;

export async function ensureQuotesSchema(): Promise<void> {
  if (!isDatabaseConfigured()) return;

  if (!schemaReady) {
    schemaReady = (async () => {
      const sql = getSql();
      await sql`
        CREATE TABLE IF NOT EXISTS quotes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          origin_label TEXT NOT NULL,
          destination_label TEXT NOT NULL,
          waypoint_labels JSONB NOT NULL DEFAULT '[]'::jsonb,
          vehicle_type TEXT NOT NULL,
          service_time TEXT NOT NULL,
          distance_text TEXT NOT NULL,
          duration_text TEXT NOT NULL,
          distance_meters INTEGER NOT NULL,
          duration_seconds INTEGER NOT NULL,
          distance_subtotal_clp INTEGER NOT NULL,
          time_subtotal_clp INTEGER NOT NULL,
          base_total_clp INTEGER NOT NULL,
          minimum_fare_applied BOOLEAN NOT NULL DEFAULT FALSE,
          tag_subtotal_clp INTEGER NOT NULL,
          tag_porticos JSONB NOT NULL DEFAULT '[]'::jsonb,
          total_estimate_clp INTEGER NOT NULL,
          route_request_id INTEGER,
          origin_coords JSONB,
          destination_coords JSONB,
          route_path JSONB
        )
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS quotes_created_at_idx
        ON quotes (created_at DESC)
      `;
    })();
  }

  await schemaReady;
}
