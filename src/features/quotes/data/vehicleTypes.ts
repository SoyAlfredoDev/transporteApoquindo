/**
 * Tipos de vehículo soportados en el cotizador.
 * Los factores TAG se aplican sobre la tarifa base Auto/SUV.
 */
export type VehicleType = "auto_suv" | "camioneta" | "van_ejecutiva";

export interface VehicleOption {
  value: VehicleType;
  label: string;
}

export const VEHICLE_OPTIONS: VehicleOption[] = [
  { value: "auto_suv", label: "Auto/SUV" },
  { value: "camioneta", label: "Camioneta" },
  { value: "van_ejecutiva", label: "Van Ejecutiva" },
];

/** Factores de conversión TAG respecto a tarifa Auto/SUV */
export const VEHICLE_TAG_FACTORS: Record<VehicleType, number> = {
  auto_suv: 1,
  camioneta: 1.15,
  van_ejecutiva: 1.25,
};

export function getVehicleLabel(type: VehicleType): string {
  return VEHICLE_OPTIONS.find((option) => option.value === type)?.label ?? type;
}
