import type { BusinessTariffs } from "@/features/quotes/data/businessTariffs";
import { TAG_PORTICOS, type TagPortico } from "@/features/quotes/data/tagTariffs";
import type { VehicleType } from "@/features/quotes/data/vehicleTypes";

/** Distancia máxima (metros) entre la ruta y un pórtico para considerarlo cruzado */
export const PORTICO_PROXIMITY_THRESHOLD_METERS = 150;

const EARTH_RADIUS_METERS = 6_371_000;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function toLatLngLiteral(
  point: google.maps.LatLng | google.maps.LatLngLiteral,
): google.maps.LatLngLiteral {
  if (typeof (point as google.maps.LatLng).lat === "function") {
    const latLng = point as google.maps.LatLng;
    return { lat: latLng.lat(), lng: latLng.lng() };
  }
  return point as google.maps.LatLngLiteral;
}

/** Distancia Haversine entre dos puntos en metros */
export function haversineDistanceMeters(
  a: google.maps.LatLngLiteral,
  b: google.maps.LatLngLiteral,
): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(h));
}

function distancePointToSegmentMeters(
  point: google.maps.LatLngLiteral,
  segStart: google.maps.LatLngLiteral,
  segEnd: google.maps.LatLngLiteral,
): number {
  const directToStart = haversineDistanceMeters(point, segStart);
  const directToEnd = haversineDistanceMeters(point, segEnd);
  const segmentLength = haversineDistanceMeters(segStart, segEnd);

  if (segmentLength === 0) return directToStart;

  const dx = segEnd.lng - segStart.lng;
  const dy = segEnd.lat - segStart.lat;
  const px = point.lng - segStart.lng;
  const py = point.lat - segStart.lat;
  const t = Math.max(0, Math.min(1, (px * dx + py * dy) / (dx * dx + dy * dy)));

  const projected: google.maps.LatLngLiteral = {
    lat: segStart.lat + t * dy,
    lng: segStart.lng + t * dx,
  };

  return Math.min(
    directToStart,
    directToEnd,
    haversineDistanceMeters(point, projected),
  );
}

function isPorticoCrossed(
  routePath: google.maps.LatLng[],
  portico: TagPortico,
  thresholdMeters: number = PORTICO_PROXIMITY_THRESHOLD_METERS,
): boolean {
  if (routePath.length === 0) return false;

  const porticoPoint = portico.coordinates;

  if (routePath.length === 1) {
    const point = toLatLngLiteral(routePath[0]!);
    return haversineDistanceMeters(point, porticoPoint) <= thresholdMeters;
  }

  for (let i = 0; i < routePath.length - 1; i++) {
    const start = toLatLngLiteral(routePath[i]!);
    const end = toLatLngLiteral(routePath[i + 1]!);
    const distance = distancePointToSegmentMeters(porticoPoint, start, end);

    if (distance <= thresholdMeters) {
      return true;
    }
  }

  return false;
}

export interface TagPorticoCharge {
  porticoId: string;
  highwayName: string;
  name: string;
  amountClp: number;
}

export interface CorporateQuoteResult {
  distanceSubtotalClp: number;
  timeSubtotalClp: number;
  baseTotalClp: number;
  minimumFareApplied: boolean;
  tagSubtotalClp: number;
  tagPorticos: TagPorticoCharge[];
  totalEstimateClp: number;
}

export interface CorporateQuoteInput {
  distanceMeters: number;
  durationSeconds: number;
  routeOverviewPath: google.maps.LatLng[];
  vehicleType: VehicleType;
  tariffs: BusinessTariffs;
}

function resolveTariffRates(
  vehicleType: VehicleType,
  tariffs: BusinessTariffs,
): {
  baseFare: number;
  pricePerKm: number;
  pricePerWaitingMinute: number;
} {
  const isVip = vehicleType === "van_ejecutiva";

  return {
    baseFare: isVip ? tariffs.baseFareVip : tariffs.baseFare,
    pricePerKm: isVip ? tariffs.pricePerKmVip : tariffs.pricePerKm,
    pricePerWaitingMinute: isVip
      ? tariffs.pricePerWaitingMinuteVip
      : tariffs.pricePerWaitingMinute,
  };
}

/**
 * Motor financiero corporativo Transportes Apoquindo:
 * 1. Distancia = bajada de bandera (opcional) + km × valor km
 * 2. Tiempo = minutos estimados × valor minuto de espera
 * 3. Base = max(distancia + tiempo, tarifa mínima)
 * 4. TAG = pórticos detectados × valor tag corporativo fijo
 * 5. Total = base + TAG
 */
export function calculateCorporateQuote(
  input: CorporateQuoteInput,
): CorporateQuoteResult {
  const { distanceMeters, durationSeconds, routeOverviewPath, vehicleType, tariffs } =
    input;

  const rates = resolveTariffRates(vehicleType, tariffs);
  const distanceKm = distanceMeters / 1000;
  const durationMinutes = durationSeconds / 60;

  const flagDrop = tariffs.chargeBaseFare ? rates.baseFare : 0;
  const distanceSubtotalClp = Math.round(flagDrop + distanceKm * rates.pricePerKm);
  const timeSubtotalClp = Math.round(
    durationMinutes * rates.pricePerWaitingMinute,
  );

  const rawBaseTotal = distanceSubtotalClp + timeSubtotalClp;
  const minimumFareApplied = rawBaseTotal < tariffs.minimumFare;
  const baseTotalClp = minimumFareApplied
    ? tariffs.minimumFare
    : rawBaseTotal;

  const tagPorticos: TagPorticoCharge[] = [];

  for (const portico of TAG_PORTICOS) {
    if (!isPorticoCrossed(routeOverviewPath, portico)) continue;

    tagPorticos.push({
      porticoId: portico.id,
      highwayName: portico.highwayName,
      name: portico.porticoCode
        ? `${portico.porticoCode} — ${portico.name}`
        : portico.name,
      amountClp: tariffs.defaultTagValue,
    });
  }

  const tagSubtotalClp = tagPorticos.length * tariffs.defaultTagValue;
  const totalEstimateClp = baseTotalClp + tagSubtotalClp;

  return {
    distanceSubtotalClp,
    timeSubtotalClp,
    baseTotalClp,
    minimumFareApplied,
    tagSubtotalClp,
    tagPorticos,
    totalEstimateClp,
  };
}

export function formatClp(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}
