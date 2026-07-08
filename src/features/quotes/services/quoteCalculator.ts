import type { BusinessTariffs } from "@/features/quotes/data/businessTariffs";
import { TAG_PORTICOS, type TagPortico } from "@/features/quotes/data/tagTariffs";
import type { VehicleType } from "@/features/quotes/data/vehicleTypes";

/** Distancia máxima (metros) entre la ruta y un pórtico para considerarlo cruzado */
export const PORTICO_PROXIMITY_THRESHOLD_METERS = 200;

const EARTH_RADIUS_METERS = 6_371_000;
const METERS_PER_BLOCK = 200;
const SECONDS_PER_BLOCK = 60;
const AMB_HIGHWAY_ID = "acceso-vial";

const AIRPORT_LABEL_PATTERN =
  /aeropuerto|arturo merino|nrt|terminal a[eé]rea|amb\b/i;

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
  coordinates: google.maps.LatLngLiteral;
  /** Peaje Acceso Vial AMB — tarifa distinta al TAG estándar */
  isAmbToll?: boolean;
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
  originLabel?: string;
  destinationLabel?: string;
  /** Si true, aplica tarifa km 3er fichero (fuera de RM) */
  isInterurban?: boolean;
}

export function isAirportRoute(
  originLabel?: string,
  destinationLabel?: string,
): boolean {
  const origin = originLabel ?? "";
  const destination = destinationLabel ?? "";
  return (
    AIRPORT_LABEL_PATTERN.test(origin) ||
    AIRPORT_LABEL_PATTERN.test(destination)
  );
}

function ceilBlocks(value: number, blockSize: number): number {
  if (value <= 0) return 0;
  return Math.ceil(value / blockSize);
}

interface ResolvedRates {
  baseFare: number;
  pricePerKm: number;
  pricePer200Meters: number;
  pricePerWaitingMinute: number;
  minimumFare: number;
  useBlockBilling: boolean;
}

function resolveRates(
  vehicleType: VehicleType,
  tariffs: BusinessTariffs,
  isAirport: boolean,
  isInterurban: boolean,
): ResolvedRates {
  const isVan = vehicleType === "van_ejecutiva";

  if (isVan) {
    const minimumFare = Math.max(
      tariffs.vanMinimumFare,
      isAirport ? tariffs.vanMinimumFareAirport : tariffs.vanMinimumFareRm,
    );

    return {
      baseFare: 0,
      pricePerKm: isInterurban
        ? tariffs.vanPricePerKmInterurban
        : tariffs.vanPricePerKm,
      pricePer200Meters: 0,
      pricePerWaitingMinute: tariffs.vanPricePerWaitingMinute,
      minimumFare,
      useBlockBilling: false,
    };
  }

  const minimumFare = isAirport
    ? tariffs.minimumFareAirport
    : tariffs.minimumFareRm;

  return {
    baseFare: tariffs.chargeBaseFare ? tariffs.baseFare : 0,
    pricePerKm: isInterurban
      ? tariffs.pricePerKmInterurban
      : tariffs.pricePerKm,
    pricePer200Meters: tariffs.pricePer200Meters,
    pricePerWaitingMinute: tariffs.pricePerWaitingMinute,
    minimumFare,
    useBlockBilling: true,
  };
}

function calculateDistanceSubtotalClp(
  distanceMeters: number,
  rates: ResolvedRates,
): number {
  if (rates.useBlockBilling) {
    const blocks = ceilBlocks(distanceMeters, METERS_PER_BLOCK);
    return Math.round(rates.baseFare + blocks * rates.pricePer200Meters);
  }

  const distanceKm = distanceMeters / 1000;
  return Math.round(distanceKm * rates.pricePerKm);
}

function calculateTimeSubtotalClp(
  durationSeconds: number,
  pricePerWaitingMinute: number,
  useBlockBilling: boolean,
): number {
  if (useBlockBilling) {
    const blocks = ceilBlocks(durationSeconds, SECONDS_PER_BLOCK);
    return Math.round(blocks * pricePerWaitingMinute);
  }

  const durationMinutes = durationSeconds / 60;
  return Math.round(durationMinutes * pricePerWaitingMinute);
}

function resolvePorticoTagAmount(
  portico: TagPortico,
  tariffs: BusinessTariffs,
): number {
  return portico.highwayId === AMB_HIGHWAY_ID
    ? tariffs.ambTollValue
    : tariffs.defaultTagValue;
}

/**
 * Motor financiero corporativo Transportes Apoquindo (Julio 2026):
 *
 * Auto / Camioneta:
 * 1. Distancia = bajada de bandera + bloques de 200 m × $180
 * 2. Tiempo = bloques de 60 s × $180
 * 3. Base = max(distancia + tiempo, negativo RM o aeropuerto)
 * 4. TAG = pórticos × $873 (AMB × $889)
 *
 * Van:
 * 1. Distancia = km × $1.430
 * 2. Tiempo = minutos × $286
 * 3. Base = max(distancia + tiempo, tarifa mínima $37.180)
 * 4. TAG = pórticos × $873 (AMB × $889)
 */
export function calculateCorporateQuote(
  input: CorporateQuoteInput,
): CorporateQuoteResult {
  const {
    distanceMeters,
    durationSeconds,
    routeOverviewPath,
    vehicleType,
    tariffs,
    originLabel,
    destinationLabel,
    isInterurban = false,
  } = input;

  const isAirport = isAirportRoute(originLabel, destinationLabel);
  const rates = resolveRates(
    vehicleType,
    tariffs,
    isAirport,
    isInterurban,
  );

  const distanceSubtotalClp = calculateDistanceSubtotalClp(
    distanceMeters,
    rates,
  );
  const timeSubtotalClp = calculateTimeSubtotalClp(
    durationSeconds,
    rates.pricePerWaitingMinute,
    rates.useBlockBilling,
  );

  const rawBaseTotal = distanceSubtotalClp + timeSubtotalClp;
  const minimumFareApplied = rawBaseTotal < rates.minimumFare;
  const baseTotalClp = minimumFareApplied
    ? rates.minimumFare
    : rawBaseTotal;

  const tagPorticos: TagPorticoCharge[] = [];

  for (const portico of TAG_PORTICOS) {
    if (!isPorticoCrossed(routeOverviewPath, portico)) continue;

    const amountClp = resolvePorticoTagAmount(portico, tariffs);

    tagPorticos.push({
      porticoId: portico.id,
      highwayName: portico.highwayName,
      name: portico.porticoCode
        ? `${portico.porticoCode} — ${portico.name}`
        : portico.name,
      amountClp,
      coordinates: portico.coordinates,
      isAmbToll: portico.highwayId === AMB_HIGHWAY_ID,
    });
  }

  const tagSubtotalClp = tagPorticos.reduce(
    (sum, portico) => sum + portico.amountClp,
    0,
  );
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
