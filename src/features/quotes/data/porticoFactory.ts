/**
 * Utilidades compartidas para construir pórticos TAG oficiales MOP 2026.
 */

import { ALL_DAY_TB } from "./scheduleBuilder";
import type { DaySchedule, TagPortico, TariffRates } from "./tagTariffs";

export interface PorticoSeed {
  porticoCode: string;
  segmentName: string;
  highwayId: string;
  highwayName: string;
  direction?: "sur_norte" | "norte_sur" | "oriente_poniente" | "poniente_oriente";
  axis?: string;
  lengthKm?: number;
  coordinates: google.maps.LatLngLiteral;
  rates: TariffRates;
  schedules?: DaySchedule[];
}

export function buildOfficialPortico(seed: PorticoSeed): TagPortico {
  const slug = `${seed.highwayId}-${seed.porticoCode}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return {
    id: slug,
    highwayId: seed.highwayId,
    highwayName: seed.highwayName,
    name: `Pórtico ${seed.porticoCode}`,
    porticoCode: seed.porticoCode,
    segmentName: seed.segmentName,
    axis: seed.axis as TagPortico["axis"],
    direction: seed.direction as TagPortico["direction"],
    lengthKm: seed.lengthKm,
    coordinates: seed.coordinates,
    tollSystem: "urban_free_flow",
    region: "rm_urbana",
    rates: seed.rates,
    schedules: seed.schedules ?? ALL_DAY_TB,
    isMock: false,
    dataSource: "mop_2026",
  };
}

export function rates(tb: number, ta: number, ts: number): TariffRates {
  return { TB: tb, TA: ta, TS: ts };
}

/** Interpola coordenadas entre dos puntos (t: 0–1) */
export function lerpCoord(
  a: google.maps.LatLngLiteral,
  b: google.maps.LatLngLiteral,
  t: number,
): google.maps.LatLngLiteral {
  return {
    lat: a.lat + (b.lat - a.lat) * t,
    lng: a.lng + (b.lng - a.lng) * t,
  };
}

/** Genera coordenadas equiespaciadas sobre un corredor */
export function corridorCoords(
  start: google.maps.LatLngLiteral,
  end: google.maps.LatLngLiteral,
  count: number,
): google.maps.LatLngLiteral[] {
  if (count <= 1) return [start];
  return Array.from({ length: count }, (_, i) =>
    lerpCoord(start, end, i / (count - 1)),
  );
}
