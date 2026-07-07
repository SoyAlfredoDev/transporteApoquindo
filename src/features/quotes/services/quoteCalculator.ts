import {
  getPorticoRate,
  TAG_PORTICOS,
  type DayType,
  type TagPortico,
  type TariffBlock,
} from "@/features/quotes/data/tagTariffs";
import type { VehicleType } from "@/features/quotes/data/vehicleTypes";

/** Distancia máxima (metros) entre la ruta y un pórtico para considerarlo cruzado */
export const PORTICO_PROXIMITY_THRESHOLD_METERS = 150;

/** Tarifa base por kilómetro (CLP) — fase MVP */
export const BASE_RATE_PER_KM_CLP = 1000;

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

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

export function getDayType(date: Date = new Date()): DayType {
  const day = date.getDay();
  if (day === 0) return "sunday_holiday";
  if (day === 6) return "saturday";
  return "weekday";
}

export function resolveTariffBlock(
  portico: TagPortico,
  serviceTime: string,
  dayType: DayType,
): TariffBlock {
  const schedule =
    portico.schedules.find((item) => item.dayType === dayType) ??
    portico.schedules.find((item) => item.dayType === "weekday");

  if (!schedule) return "TB";

  const currentMinutes = timeToMinutes(serviceTime);

  for (const block of schedule.blocks) {
    const start = timeToMinutes(block.start);
    const end = timeToMinutes(block.end);

    if (currentMinutes >= start && currentMinutes < end) {
      return block.tariff;
    }
  }

  return "TB";
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
  tariffBlock: TariffBlock;
  amountClp: number;
}

export interface TagCalculationResult {
  totalClp: number;
  porticos: TagPorticoCharge[];
}

export interface TagCalculationOptions {
  serviceTime: string;
  vehicleType: VehicleType;
  serviceDate?: Date;
}

export function calculateRouteTag(
  routeOverviewPath: google.maps.LatLng[],
  serviceTime: string,
  vehicleType: VehicleType,
  serviceDate: Date = new Date(),
): number {
  return calculateRouteTagDetailed(routeOverviewPath, {
    serviceTime,
    vehicleType,
    serviceDate,
  }).totalClp;
}

export function calculateRouteTagDetailed(
  routeOverviewPath: google.maps.LatLng[],
  options: TagCalculationOptions,
): TagCalculationResult {
  const { serviceTime, vehicleType, serviceDate = new Date() } = options;
  const dayType = getDayType(serviceDate);
  const porticos: TagPorticoCharge[] = [];

  for (const portico of TAG_PORTICOS) {
    if (!isPorticoCrossed(routeOverviewPath, portico)) continue;

    const tariffBlock = resolveTariffBlock(portico, serviceTime, dayType);
    const amountClp = getPorticoRate(portico, tariffBlock, vehicleType);

    porticos.push({
      porticoId: portico.id,
      highwayName: portico.highwayName,
      name: portico.name,
      tariffBlock,
      amountClp,
    });
  }

  const totalClp = porticos.reduce((sum, item) => sum + item.amountClp, 0);

  return { totalClp, porticos };
}

export function calculateBaseFareClp(distanceMeters: number): number {
  const distanceKm = distanceMeters / 1000;
  return Math.round(distanceKm * BASE_RATE_PER_KM_CLP);
}

export function calculateTotalEstimateClp(
  distanceMeters: number,
  tagTotalClp: number,
): number {
  return calculateBaseFareClp(distanceMeters) + tagTotalClp;
}

export function formatClp(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}
