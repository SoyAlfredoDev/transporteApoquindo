import type { TagPorticoCharge } from "@/features/quotes/services/quoteCalculator";
import type { VehicleType } from "@/features/quotes/data/vehicleTypes";

export type { TagPorticoCharge };

export type PlaceLocation = string | google.maps.LatLngLiteral;

export interface PlaceValue {
  label: string;
  location: PlaceLocation;
}

export interface RouteRequest {
  id: number;
  origin: PlaceLocation;
  destination: PlaceLocation;
  serviceTime: string;
  vehicleType: VehicleType;
}

export interface RouteInfo {
  distanceText: string;
  durationText: string;
  distanceMeters: number;
  durationSeconds: number;
  overviewPath: google.maps.LatLng[];
  serviceTime: string;
  vehicleType: VehicleType;
}

export interface QuoteBreakdown {
  distanceText: string;
  durationText: string;
  distanceMeters: number;
  durationSeconds: number;
  serviceTime: string;
  vehicleType: VehicleType;
  distanceSubtotalClp: number;
  timeSubtotalClp: number;
  baseTotalClp: number;
  minimumFareApplied: boolean;
  tagSubtotalClp: number;
  tagPorticos: TagPorticoCharge[];
  totalEstimateClp: number;
}

export interface QuoteFormData {
  origin: PlaceValue;
  destination: PlaceValue;
  serviceTime: string;
  vehicleType: VehicleType;
}
