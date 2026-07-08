import type { TagPorticoCharge } from "@/features/quotes/services/quoteCalculator";
import type { VehicleType } from "@/features/quotes/data/vehicleTypes";

export interface SaveQuoteInput {
  originLabel: string;
  destinationLabel: string;
  waypointLabels: string[];
  vehicleType: VehicleType;
  serviceTime: string;
  distanceText: string;
  durationText: string;
  distanceMeters: number;
  durationSeconds: number;
  distanceSubtotalClp: number;
  timeSubtotalClp: number;
  baseTotalClp: number;
  minimumFareApplied: boolean;
  tagSubtotalClp: number;
  tagPorticos: TagPorticoCharge[];
  totalEstimateClp: number;
  routeRequestId?: number | null;
  originCoords?: { lat: number; lng: number } | null;
  destinationCoords?: { lat: number; lng: number } | null;
  routePath?: { lat: number; lng: number }[] | null;
}

export interface SavedQuoteRecord extends SaveQuoteInput {
  id: string;
  createdAt: string;
}

export interface SaveQuoteResult {
  id: string;
  createdAt: string;
}
