/**
 * Parámetros comerciales corporativos — Transportes Apoquindo.
 * Fuente: storage/price/13. TARIFAS AUTOS Y VAN. JULIO 2026.xlsx
 */

export type CurrencyCode = "CLP";

export interface BusinessTariffs {
  currency: CurrencyCode;
  /** Bajada de bandera — Auto / Camioneta */
  baseFare: number;
  /** Valor km en RM — Auto / Camioneta */
  pricePerKm: number;
  /** Valor km 3er fichero (fuera de RM) — Auto / Camioneta */
  pricePerKmInterurban: number;
  /** Valor cada 200 metros — Auto / Camioneta */
  pricePer200Meters: number;
  /** Valor cada 60 segundos — Auto / Camioneta */
  pricePerWaitingMinute: number;
  /** Valor hora — Auto / Camioneta */
  pricePerHour: number;
  /** Negativo RM — tarifa mínima Auto en RM */
  minimumFareRm: number;
  /** Negativo Aeropuerto — tarifa mínima Auto en zona aeropuerto */
  minimumFareAirport: number;
  /** Tarifa mínima Van */
  vanMinimumFare: number;
  /** Valor km Van */
  vanPricePerKm: number;
  /** Valor km 3er fichero Van */
  vanPricePerKmInterurban: number;
  /** Valor minuto Van */
  vanPricePerWaitingMinute: number;
  /** Valor hora Van */
  vanPricePerHour: number;
  /** Negativo RM Van */
  vanMinimumFareRm: number;
  /** Negativo Aeropuerto Van */
  vanMinimumFareAirport: number;
  /** Tarifa TAG estándar por pórtico */
  defaultTagValue: number;
  /** Tarifa Peaje Acceso Vial AMB */
  ambTollValue: number;
  /** Incluye bajada de bandera en el cálculo por distancia (Auto) */
  chargeBaseFare: boolean;
}

/** Tarifario oficial Julio 2026 — Autos y Van */
export const DEFAULT_BUSINESS_TARIFFS: BusinessTariffs = {
  currency: "CLP",
  baseFare: 2_200,
  pricePerKm: 900,
  pricePerKmInterurban: 950,
  pricePer200Meters: 180,
  pricePerWaitingMinute: 180,
  pricePerHour: 10_800,
  minimumFareRm: 4_800,
  minimumFareAirport: 12_200,
  vanMinimumFare: 37_180,
  vanPricePerKm: 1_430,
  vanPricePerKmInterurban: 1_430,
  vanPricePerWaitingMinute: 286,
  vanPricePerHour: 17_160,
  vanMinimumFareRm: 17_000,
  vanMinimumFareAirport: 17_000,
  defaultTagValue: 873,
  ambTollValue: 889,
  chargeBaseFare: true,
};

export const BUSINESS_TARIFFS_STORAGE_KEY =
  "transporte-apoquindo-business-tariffs";

export function parseBusinessTariffs(raw: unknown): BusinessTariffs {
  if (!raw || typeof raw !== "object") {
    return DEFAULT_BUSINESS_TARIFFS;
  }

  const data = raw as Partial<BusinessTariffs> & {
    baseFareVip?: number;
    pricePerKmVip?: number;
    pricePerWaitingMinuteVip?: number;
    minimumFare?: number;
  };

  return {
    currency: "CLP",
    baseFare: numberOrDefault(data.baseFare, DEFAULT_BUSINESS_TARIFFS.baseFare),
    pricePerKm: numberOrDefault(
      data.pricePerKm,
      DEFAULT_BUSINESS_TARIFFS.pricePerKm,
    ),
    pricePerKmInterurban: numberOrDefault(
      data.pricePerKmInterurban,
      DEFAULT_BUSINESS_TARIFFS.pricePerKmInterurban,
    ),
    pricePer200Meters: numberOrDefault(
      data.pricePer200Meters,
      DEFAULT_BUSINESS_TARIFFS.pricePer200Meters,
    ),
    pricePerWaitingMinute: numberOrDefault(
      data.pricePerWaitingMinute,
      DEFAULT_BUSINESS_TARIFFS.pricePerWaitingMinute,
    ),
    pricePerHour: numberOrDefault(
      data.pricePerHour,
      DEFAULT_BUSINESS_TARIFFS.pricePerHour,
    ),
    minimumFareRm: numberOrDefault(
      data.minimumFareRm ?? data.minimumFare,
      DEFAULT_BUSINESS_TARIFFS.minimumFareRm,
    ),
    minimumFareAirport: numberOrDefault(
      data.minimumFareAirport,
      DEFAULT_BUSINESS_TARIFFS.minimumFareAirport,
    ),
    vanMinimumFare: numberOrDefault(
      data.vanMinimumFare,
      DEFAULT_BUSINESS_TARIFFS.vanMinimumFare,
    ),
    vanPricePerKm: numberOrDefault(
      data.vanPricePerKm ?? data.pricePerKmVip,
      DEFAULT_BUSINESS_TARIFFS.vanPricePerKm,
    ),
    vanPricePerKmInterurban: numberOrDefault(
      data.vanPricePerKmInterurban,
      DEFAULT_BUSINESS_TARIFFS.vanPricePerKmInterurban,
    ),
    vanPricePerWaitingMinute: numberOrDefault(
      data.vanPricePerWaitingMinute ?? data.pricePerWaitingMinuteVip,
      DEFAULT_BUSINESS_TARIFFS.vanPricePerWaitingMinute,
    ),
    vanPricePerHour: numberOrDefault(
      data.vanPricePerHour,
      DEFAULT_BUSINESS_TARIFFS.vanPricePerHour,
    ),
    vanMinimumFareRm: numberOrDefault(
      data.vanMinimumFareRm,
      DEFAULT_BUSINESS_TARIFFS.vanMinimumFareRm,
    ),
    vanMinimumFareAirport: numberOrDefault(
      data.vanMinimumFareAirport,
      DEFAULT_BUSINESS_TARIFFS.vanMinimumFareAirport,
    ),
    defaultTagValue: numberOrDefault(
      data.defaultTagValue,
      DEFAULT_BUSINESS_TARIFFS.defaultTagValue,
    ),
    ambTollValue: numberOrDefault(
      data.ambTollValue,
      DEFAULT_BUSINESS_TARIFFS.ambTollValue,
    ),
    chargeBaseFare:
      typeof data.chargeBaseFare === "boolean"
        ? data.chargeBaseFare
        : DEFAULT_BUSINESS_TARIFFS.chargeBaseFare,
  };
}

function numberOrDefault(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export function loadBusinessTariffsFromStorage(): BusinessTariffs {
  if (typeof window === "undefined") {
    return DEFAULT_BUSINESS_TARIFFS;
  }

  try {
    const stored = window.localStorage.getItem(BUSINESS_TARIFFS_STORAGE_KEY);
    if (!stored) return DEFAULT_BUSINESS_TARIFFS;
    return parseBusinessTariffs(JSON.parse(stored));
  } catch {
    return DEFAULT_BUSINESS_TARIFFS;
  }
}

export function saveBusinessTariffsToStorage(tariffs: BusinessTariffs): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    BUSINESS_TARIFFS_STORAGE_KEY,
    JSON.stringify(tariffs),
  );
}
