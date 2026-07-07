/**
 * Base de conocimiento manual de pórticos TAG — Región Metropolitana.
 *
 * DOMINIO — Peaje vs Pórtico vs TAG (Chile):
 * - PEaje: el cargo en CLP por usar la vía (el monto que sumamos en la cotización).
 * - PÓRTICO: infraestructura free flow que registra el paso (lo geolocalizamos en la ruta).
 * - TAG: medio de pago electrónico, NO es un peaje ni un pórtico.
 *
 * En autopistas urbanas (RM), cada cruce de pórtico genera un peaje según tramo,
 * horario (TB/TA/TS) y tipo de vehículo. Ver `tollDomain.ts` para el glosario completo.
 *
 * Fuente oficial de tarifas: https://concesiones.mop.gob.cl/peajes-y-porticos/
 *
 * Datos cargados desde tarifarios MOP (PDF). Próxima fase: Neon DB con
 * actualización periódica desde fuentes oficiales de concesionarias.
 *
 * Tarifas base (`rates`) corresponden a Auto/SUV. Camioneta y Van Ejecutiva
 * aplican factores definidos en `vehicleTypes.ts`.
 */

import type {
  TollRegion,
  TollSystemType,
} from "@/features/quotes/data/tollDomain";
import { ALL_MOP_2026_PORTICOS } from "@/features/quotes/data/allPorticos2026";
import { applyValidatedPorticoCoordinatesAll } from "@/features/quotes/data/applyPorticoCoordinates";
import type { VehicleType } from "@/features/quotes/data/vehicleTypes";
import { VEHICLE_TAG_FACTORS } from "@/features/quotes/data/vehicleTypes";

export type { TollPlaza, TollSystemType } from "@/features/quotes/data/tollDomain";
export {
  DOMAIN_UI_LABELS,
  HIGHWAY_TOLL_PROFILES,
  MOP_TOLLS_SOURCE_URL,
  TARIFF_BLOCK_LABELS,
  TOLL_DOMAIN_RULES,
} from "@/features/quotes/data/tollDomain";

export type TariffBlock = "TB" | "TA" | "TS";

export type DayType = "weekday" | "saturday" | "sunday_holiday";

export interface TariffRates {
  /** Tarifa Base */
  TB: number;
  /** Tarifa Alta */
  TA: number;
  /** Tarifa Saturada */
  TS: number;
}

export interface TimeBlock {
  start: string;
  end: string;
  tariff: TariffBlock;
}

export interface DaySchedule {
  dayType: DayType;
  blocks: TimeBlock[];
}

export interface TagPortico {
  id: string;
  highwayId: string;
  highwayName: string;
  name: string;
  /** Código oficial del pórtico (ej: PA2) */
  porticoCode?: string;
  /** Tramo entre pórticos — referencia del tarifario MOP */
  segmentName?: string;
  /** Eje de la autopista */
  axis?: "eje_norte_sur" | "eje_general_velasquez";
  /** Sentido de circulación del tramo tarificado */
  direction?:
    | "sur_norte"
    | "norte_sur"
    | "oriente_poniente"
    | "poniente_oriente";
  /** Longitud del tramo en km (tarifario oficial) */
  lengthKm?: number;
  coordinates: google.maps.LatLngLiteral;
  /** Siempre `urban_free_flow` — pórtico TAG sin barrera */
  tollSystem: TollSystemType;
  region: TollRegion;
  /** Tarifas base (peaje por tramo) para Auto/SUV por bloque horario */
  rates: TariffRates;
  schedules: DaySchedule[];
  /** `false` = tarifa oficial MOP */
  isMock: false;
  /** Origen del dato tarifario */
  dataSource: "mop_2026";
}

export interface Highway {
  id: string;
  name: string;
  tollSystem: TollSystemType;
  region: TollRegion;
}

export const HIGHWAYS: Highway[] = [
  { id: "autopista-central", name: "Autopista Central", tollSystem: "urban_free_flow", region: "rm_urbana" },
  { id: "costanera-norte", name: "Costanera Norte", tollSystem: "urban_free_flow", region: "rm_urbana" },
  { id: "vespucio-norte", name: "Vespucio Norte", tollSystem: "urban_free_flow", region: "rm_urbana" },
  { id: "vespucio-sur", name: "Vespucio Sur", tollSystem: "urban_free_flow", region: "rm_urbana" },
  { id: "tunel-san-cristobal", name: "Túnel San Cristóbal", tollSystem: "urban_free_flow", region: "rm_urbana" },
  { id: "avo-i", name: "Américo Vespucio Oriente I", tollSystem: "urban_free_flow", region: "rm_urbana" },
  { id: "acceso-nororiente", name: "Acceso Nororiente", tollSystem: "urban_free_flow", region: "rm_urbana" },
  { id: "acceso-vial", name: "Acceso Vial AMB", tollSystem: "urban_free_flow", region: "rm_urbana" },
  { id: "puente-industrial", name: "Puente Industrial", tollSystem: "urban_free_flow", region: "rm_urbana" },
];

export function getPorticoRate(
  portico: TagPortico,
  tariffBlock: TariffBlock,
  vehicleType: VehicleType,
): number {
  const baseRate = portico.rates[tariffBlock];
  return Math.round(baseRate * VEHICLE_TAG_FACTORS[vehicleType]);
}

export function getPorticoRatesByVehicle(
  portico: TagPortico,
  vehicleType: VehicleType,
): TariffRates {
  return {
    TB: getPorticoRate(portico, "TB", vehicleType),
    TA: getPorticoRate(portico, "TA", vehicleType),
    TS: getPorticoRate(portico, "TS", vehicleType),
  };
}

/** Pórticos TAG oficiales — todos los PDF en /storage */
export const TAG_PORTICOS: TagPortico[] = applyValidatedPorticoCoordinatesAll(
  ALL_MOP_2026_PORTICOS,
);
