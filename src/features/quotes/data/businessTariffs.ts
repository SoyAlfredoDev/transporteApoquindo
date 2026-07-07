/**
 * Parámetros comerciales corporativos — Transportes Apoquindo.
 * Valores oficiales del sistema del cliente (categoría Auto).
 */

export type CurrencyCode = "CLP";

export interface BusinessTariffs {
  currency: CurrencyCode;
  /** Bajada de bandera estándar */
  baseFare: number;
  /** Bajada de bandera VIP */
  baseFareVip: number;
  /** Valor por kilómetro estándar */
  pricePerKm: number;
  /** Valor por kilómetro VIP */
  pricePerKmVip: number;
  /** Recargo por cada 200 metros */
  pricePer200Meters: number;
  /** Valor por minuto de espera / tránsito estándar */
  pricePerWaitingMinute: number;
  /** Valor por minuto de espera VIP */
  pricePerWaitingMinuteVip: number;
  /** Recargo TAG fijo por pórtico urbano detectado */
  defaultTagValue: number;
  /** Tarifa mínima del viaje (base distancia + tiempo) */
  minimumFare: number;
  /** Incluye bajada de bandera en el cálculo por distancia */
  chargeBaseFare: boolean;
}

export const DEFAULT_BUSINESS_TARIFFS: BusinessTariffs = {
  currency: "CLP",
  baseFare: 2200,
  baseFareVip: 2200,
  pricePerKm: 900,
  pricePerKmVip: 900,
  pricePer200Meters: 180,
  pricePerWaitingMinute: 180,
  pricePerWaitingMinuteVip: 180,
  defaultTagValue: 873,
  minimumFare: 2200,
  chargeBaseFare: true,
};

export const BUSINESS_TARIFFS_STORAGE_KEY =
  "transporte-apoquindo-business-tariffs";

export function parseBusinessTariffs(raw: unknown): BusinessTariffs {
  if (!raw || typeof raw !== "object") {
    return DEFAULT_BUSINESS_TARIFFS;
  }

  const data = raw as Partial<BusinessTariffs>;

  return {
    currency: "CLP",
    baseFare: numberOrDefault(data.baseFare, DEFAULT_BUSINESS_TARIFFS.baseFare),
    baseFareVip: numberOrDefault(
      data.baseFareVip,
      DEFAULT_BUSINESS_TARIFFS.baseFareVip,
    ),
    pricePerKm: numberOrDefault(
      data.pricePerKm,
      DEFAULT_BUSINESS_TARIFFS.pricePerKm,
    ),
    pricePerKmVip: numberOrDefault(
      data.pricePerKmVip,
      DEFAULT_BUSINESS_TARIFFS.pricePerKmVip,
    ),
    pricePer200Meters: numberOrDefault(
      data.pricePer200Meters,
      DEFAULT_BUSINESS_TARIFFS.pricePer200Meters,
    ),
    pricePerWaitingMinute: numberOrDefault(
      data.pricePerWaitingMinute,
      DEFAULT_BUSINESS_TARIFFS.pricePerWaitingMinute,
    ),
    pricePerWaitingMinuteVip: numberOrDefault(
      data.pricePerWaitingMinuteVip,
      DEFAULT_BUSINESS_TARIFFS.pricePerWaitingMinuteVip,
    ),
    defaultTagValue: numberOrDefault(
      data.defaultTagValue,
      DEFAULT_BUSINESS_TARIFFS.defaultTagValue,
    ),
    minimumFare: numberOrDefault(
      data.minimumFare,
      DEFAULT_BUSINESS_TARIFFS.minimumFare,
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
