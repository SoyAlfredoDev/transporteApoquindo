/**
 * Pórticos y peajes oficiales — Autopista Central 2026
 * Fuente: storage/AUTOPISTA-CENTRAL.pdf (MOP / Dirección General de Concesiones)
 * https://concesiones.mop.gob.cl/peajes-y-porticos/
 *
 * TBFP → TB | TBP → TA | TS → TS
 * Tarifas categoría 1-4 (motos, autos y camionetas) — base Auto/SUV.
 */

import {
  ALL_DAY_TB,
  buildPorticoSchedules,
  parseTariffWindows,
  type TariffWindow,
} from "./scheduleBuilder";
import type { DaySchedule, TagPortico, TariffRates } from "./tagTariffs";

/** Redondea tarifas CLP del PDF (decimales) a pesos enteros */
function clp(value: number): number {
  return Math.round(value);
}

interface PorticoSeed {
  porticoCode: string;
  segmentName: string;
  axis: "eje_norte_sur" | "eje_general_velasquez";
  direction: "sur_norte" | "norte_sur";
  lengthKm: number;
  coordinates: google.maps.LatLngLiteral;
  rates: TariffRates;
  schedules: DaySchedule[];
}

function buildPortico(seed: PorticoSeed): TagPortico {
  const slug = seed.porticoCode.toLowerCase().replace(/\s/g, "");
  return {
    id: `ac-${slug}`,
    highwayId: "autopista-central",
    highwayName: "Autopista Central",
    name: `Pórtico ${seed.porticoCode}`,
    porticoCode: seed.porticoCode,
    segmentName: seed.segmentName,
    axis: seed.axis,
    direction: seed.direction,
    lengthKm: seed.lengthKm,
    coordinates: seed.coordinates,
    tollSystem: "urban_free_flow",
    region: "rm_urbana",
    rates: seed.rates,
    schedules: seed.schedules,
    isMock: false,
    dataSource: "mop_2026",
  };
}

function windows(
  ...entries: Array<{ raw: string; tariff: "TA" | "TS" }>
): TariffWindow[] {
  return entries.flatMap(({ raw, tariff }) =>
    parseTariffWindows(raw, tariff),
  );
}

// ── Horarios oficiales por pórtico (tarifario MOP 2026) ─────────────────────

const SCHEDULES = {
  /** PA2 — TS 07:00-07:30 · TBP 06:30-07:00 / 07:30-08:00 */
  PA2: buildPorticoSchedules({
    weekday: windows(
      { raw: "07:00-07:30", tariff: "TS" },
      { raw: "06:30-07:00 / 07:30-08:00", tariff: "TA" },
    ),
    saturday: windows(
      { raw: "07:00-08:30 / 09:30-10:00", tariff: "TA" },
      { raw: "10:00-10:30 / 19:30-20:30", tariff: "TA" },
    ),
  }),

  /** PA5 — TS 07:00-08:00 · TBP 06:30-07:00 / 08:00-09:30 */
  PA5: buildPorticoSchedules({
    weekday: windows(
      { raw: "07:00-08:00", tariff: "TS" },
      { raw: "06:30-07:00 / 08:00-09:30", tariff: "TA" },
    ),
    saturday: windows(
      { raw: "07:00-08:30 / 09:30-10:00", tariff: "TA" },
      { raw: "10:00-10:30 / 19:30-20:30", tariff: "TA" },
    ),
  }),

  /** PA7 — TS 08:30-09:00 · TBP 07:30-09:30 */
  PA7: buildPorticoSchedules({
    weekday: windows(
      { raw: "08:30-09:00", tariff: "TS" },
      { raw: "07:30-09:30", tariff: "TA" },
    ),
    saturday: windows({ raw: "10:00-13:00", tariff: "TA" }),
  }),

  /** PA30 — TBP 07:30-09:30 / 18:30-20:30 */
  PA30: buildPorticoSchedules({
    weekday: windows(
      { raw: "07:30-09:30 / 18:30-20:30", tariff: "TA" },
    ),
    saturday: windows(
      { raw: "10:00-13:00", tariff: "TA" },
      { raw: "18:30-20:30", tariff: "TA" },
    ),
  }),

  /** PA10 — TBP 07:30-09:30 / 18:30-20:30 */
  PA10: buildPorticoSchedules({
    weekday: windows(
      { raw: "07:30-09:30 / 18:30-20:30", tariff: "TA" },
    ),
    saturday: windows(
      { raw: "10:00-13:00", tariff: "TA" },
      { raw: "18:30-20:30", tariff: "TA" },
    ),
  }),

  /** PA31 — TS 08:30-09:00 · TBP 06:30-08:30 / 09:00-14:00 / 17:00-19:00 */
  PA31: buildPorticoSchedules({
    weekday: windows(
      { raw: "08:30-09:00", tariff: "TS" },
      { raw: "06:30-08:30 / 09:00-14:00 / 17:00-19:00", tariff: "TA" },
    ),
    saturday: windows({ raw: "11:00-15:00", tariff: "TA" }),
  }),

  PA13: buildPorticoSchedules({
    weekday: windows(
      { raw: "07:30-09:30 / 18:30-20:30", tariff: "TA" },
    ),
    saturday: windows({ raw: "11:00-15:00", tariff: "TA" }),
  }),

  PA16: buildPorticoSchedules({
    weekday: windows(
      { raw: "17:30-18:00", tariff: "TS" },
      { raw: "17:30-19:30 / 18:30-20:30", tariff: "TA" },
    ),
    saturday: windows({
      raw: "10:00-10:30 / 11:00-11:30 / 15:30-16:00 / 19:30-20:00",
      tariff: "TA",
    }),
  }),

  PA17: buildPorticoSchedules({
    weekday: windows(
      { raw: "17:30-19:30 / 18:30-20:30", tariff: "TA" },
    ),
    saturday: windows({
      raw: "10:00-10:30 / 11:00-11:30 / 15:30-16:00 / 19:30-20:00",
      tariff: "TA",
    }),
  }),

  /** Eje G. Velásquez — PA23 */
  PA23: buildPorticoSchedules({
    weekday: windows({
      raw: "07:00-09:30 / 14:30-15:00 / 19:00-19:30",
      tariff: "TA",
    }),
    saturday: windows({ raw: "07:00-10:00", tariff: "TA" }),
  }),

  /** Eje G. Velásquez — PA25 */
  PA25: buildPorticoSchedules({
    weekday: windows({
      raw: "07:00-07:30 / 08:30-09:30 / 10:00-10:30 / 18:00-19:00",
      tariff: "TA",
    }),
    saturday: windows({ raw: "17:00-20:30", tariff: "TA" }),
  }),

  /** Eje G. Velásquez — PA28 */
  PA28: buildPorticoSchedules({
    weekday: windows(
      { raw: "17:00-20:30", tariff: "TA" },
      { raw: "18:30-20:30", tariff: "TA" },
    ),
    saturday: windows({ raw: "18:30-20:30", tariff: "TA" }),
  }),

  PA19: buildPorticoSchedules({
    weekday: windows(
      { raw: "07:30-08:30", tariff: "TA" },
      { raw: "18:30-19:00", tariff: "TA" },
    ),
    saturday: windows({ raw: "18:00-18:30 / 19:00-20:30", tariff: "TA" }),
  }),

  PA21: buildPorticoSchedules({
    weekday: windows({ raw: "07:00-10:00", tariff: "TA" }),
    saturday: windows({ raw: "18:30-20:30", tariff: "TA" }),
  }),
} as const;

/**
 * Tarifas, tramos y coordenadas sobre el eje de la Ruta 5 / General Velásquez.
 * Coordenadas PA30, PA10 y PA31 validadas en intersecciones de referencia.
 */
const PORTICO_SEEDS: PorticoSeed[] = [
  // ── EJE NORTE-SUR · Sur → Norte ──────────────────────────────────────────
  {
    porticoCode: "PA2",
    segmentName: "Los Guindos - La Capilla",
    axis: "eje_norte_sur",
    direction: "sur_norte",
    lengthKm: 7.68,
    coordinates: { lat: -33.5835, lng: -70.6115 },
    rates: { TB: clp(868.37), TA: clp(1170.18), TS: clp(1755.28) },
    schedules: SCHEDULES.PA2,
  },
  {
    porticoCode: "PA3",
    segmentName: "La Capilla - Colón",
    axis: "eje_norte_sur",
    direction: "sur_norte",
    lengthKm: 5.63,
    coordinates: { lat: -33.5678, lng: -70.6172 },
    rates: { TB: clp(585.09), TA: clp(669.27), TS: clp(1003.9) },
    schedules: ALL_DAY_TB,
  },
  {
    porticoCode: "PA5",
    segmentName: "Colón - Las Acacias",
    axis: "eje_norte_sur",
    direction: "sur_norte",
    lengthKm: 3.22,
    coordinates: { lat: -33.5512, lng: -70.6238 },
    rates: { TB: clp(334.64), TA: clp(904.14), TS: clp(1106.79) },
    schedules: SCHEDULES.PA5,
  },
  {
    porticoCode: "PA7",
    segmentName: "Las Acacias - Américo Vespucio",
    axis: "eje_norte_sur",
    direction: "sur_norte",
    lengthKm: 4.35,
    coordinates: { lat: -33.5275, lng: -70.6315 },
    rates: { TB: clp(452.06), TA: clp(785.66), TS: clp(545.6) },
    schedules: SCHEDULES.PA7,
  },
  {
    porticoCode: "PA30",
    segmentName: "Américo Vespucio - Departamental",
    axis: "eje_norte_sur",
    direction: "sur_norte",
    lengthKm: 3.78,
    coordinates: { lat: -33.511, lng: -70.678 },
    rates: { TB: clp(392.83), TA: clp(571.58), TS: clp(1736.74) },
    schedules: SCHEDULES.PA30,
  },
  {
    porticoCode: "PA10",
    segmentName: "Departamental - Carlos Valdovinos",
    axis: "eje_norte_sur",
    direction: "sur_norte",
    lengthKm: 2.75,
    coordinates: { lat: -33.492, lng: -70.674 },
    rates: { TB: clp(285.79), TA: clp(571.58), TS: clp(1170.18) },
    schedules: SCHEDULES.PA10,
  },
  {
    porticoCode: "PA31",
    segmentName: "Carlos Valdovinos - Alameda",
    axis: "eje_norte_sur",
    direction: "sur_norte",
    lengthKm: 3.55,
    coordinates: { lat: -33.456, lng: -70.665 },
    rates: { TB: clp(368.93), TA: clp(737.86), TS: clp(669.27) },
    schedules: SCHEDULES.PA31,
  },
  {
    porticoCode: "PA13",
    segmentName: "Alameda - Río Mapocho",
    axis: "eje_norte_sur",
    direction: "sur_norte",
    lengthKm: 1.75,
    coordinates: { lat: -33.4438, lng: -70.6618 },
    rates: { TB: clp(181.86), TA: clp(363.73), TS: clp(904.13) },
    schedules: SCHEDULES.PA13,
  },
  {
    porticoCode: "PA16",
    segmentName: "Río Mapocho - 14 de la Fama",
    axis: "eje_norte_sur",
    direction: "sur_norte",
    lengthKm: 4.09,
    coordinates: { lat: -33.4275, lng: -70.6575 },
    rates: { TB: clp(425.04), TA: clp(850.1), TS: clp(785.66) },
    schedules: SCHEDULES.PA16,
  },
  {
    porticoCode: "PA17",
    segmentName: "14 de la Fama - Américo Vespucio Norte",
    axis: "eje_norte_sur",
    direction: "sur_norte",
    lengthKm: 4.45,
    coordinates: { lat: -33.4078, lng: -70.6532 },
    rates: { TB: clp(462.46), TA: clp(924.92), TS: clp(571.58) },
    schedules: SCHEDULES.PA17,
  },

  // ── EJE NORTE-SUR · Norte → Sur ──────────────────────────────────────────
  {
    porticoCode: "PA8",
    segmentName: "Américo Vespucio Norte - 14 de la Fama",
    axis: "eje_norte_sur",
    direction: "norte_sur",
    lengthKm: 4.45,
    coordinates: { lat: -33.4095, lng: -70.6518 },
    rates: { TB: clp(462.46), TA: clp(924.92), TS: clp(1387.38) },
    schedules: ALL_DAY_TB,
  },
  {
    porticoCode: "PA9",
    segmentName: "14 de la Fama - Río Mapocho",
    axis: "eje_norte_sur",
    direction: "norte_sur",
    lengthKm: 4.09,
    coordinates: { lat: -33.4292, lng: -70.6562 },
    rates: { TB: clp(425.04), TA: clp(850.1), TS: clp(1275.14) },
    schedules: ALL_DAY_TB,
  },
  {
    porticoCode: "PA11",
    segmentName: "Río Mapocho - Alameda",
    axis: "eje_norte_sur",
    direction: "norte_sur",
    lengthKm: 1.75,
    coordinates: { lat: -33.4455, lng: -70.6605 },
    rates: { TB: clp(181.86), TA: clp(363.73), TS: clp(545.6) },
    schedules: ALL_DAY_TB,
  },
  {
    porticoCode: "PA12",
    segmentName: "Alameda - Carlos Valdovinos",
    axis: "eje_norte_sur",
    direction: "norte_sur",
    lengthKm: 3.55,
    coordinates: { lat: -33.4582, lng: -70.6638 },
    rates: { TB: clp(368.93), TA: clp(737.86), TS: clp(1106.79) },
    schedules: ALL_DAY_TB,
  },
  {
    porticoCode: "PA14",
    segmentName: "Carlos Valdovinos - Departamental",
    axis: "eje_norte_sur",
    direction: "norte_sur",
    lengthKm: 2.75,
    coordinates: { lat: -33.4942, lng: -70.6725 },
    rates: { TB: clp(285.79), TA: clp(571.58), TS: clp(857.37) },
    schedules: ALL_DAY_TB,
  },
  {
    porticoCode: "PA15",
    segmentName: "Departamental - Américo Vespucio",
    axis: "eje_norte_sur",
    direction: "norte_sur",
    lengthKm: 3.78,
    coordinates: { lat: -33.5132, lng: -70.6765 },
    rates: { TB: clp(392.83), TA: clp(785.66), TS: clp(1178.49) },
    schedules: ALL_DAY_TB,
  },
  {
    porticoCode: "PA18",
    segmentName: "Américo Vespucio - Las Acacias",
    axis: "eje_norte_sur",
    direction: "norte_sur",
    lengthKm: 4.35,
    coordinates: { lat: -33.5295, lng: -70.6298 },
    rates: { TB: clp(452.06), TA: clp(904.14), TS: clp(1356.2) },
    schedules: ALL_DAY_TB,
  },
  {
    porticoCode: "PA6",
    segmentName: "Las Acacias - Lo Blanco",
    axis: "eje_norte_sur",
    direction: "norte_sur",
    lengthKm: 1.7,
    coordinates: { lat: -33.5402, lng: -70.6275 },
    rates: { TB: clp(176.67), TA: clp(353.34), TS: clp(530.01) },
    schedules: ALL_DAY_TB,
  },
  {
    porticoCode: "PA4",
    segmentName: "Lo Blanco - Colón",
    axis: "eje_norte_sur",
    direction: "norte_sur",
    lengthKm: 1.52,
    coordinates: { lat: -33.5498, lng: -70.6242 },
    rates: { TB: clp(157.96), TA: clp(315.93), TS: clp(473.89) },
    schedules: ALL_DAY_TB,
  },
  {
    porticoCode: "PA32",
    segmentName: "Colón - Calera de Tango",
    axis: "eje_norte_sur",
    direction: "norte_sur",
    lengthKm: 4.38,
    coordinates: { lat: -33.5605, lng: -70.6195 },
    rates: { TB: clp(455.18), TA: clp(910.37), TS: clp(1365.56) },
    schedules: ALL_DAY_TB,
  },
  {
    porticoCode: "PA37",
    segmentName: "Calera de Tango - La Capilla",
    axis: "eje_norte_sur",
    direction: "norte_sur",
    lengthKm: 1.25,
    coordinates: { lat: -33.5708, lng: -70.6158 },
    rates: { TB: clp(129.9), TA: clp(259.81), TS: clp(389.71) },
    schedules: ALL_DAY_TB,
  },
  {
    porticoCode: "PA1",
    segmentName: "La Capilla - Los Guindos",
    axis: "eje_norte_sur",
    direction: "norte_sur",
    lengthKm: 7.68,
    coordinates: { lat: -33.5855, lng: -70.6098 },
    rates: { TB: clp(868.37), TA: clp(1736.74), TS: clp(2605.11) },
    schedules: ALL_DAY_TB,
  },

  // ── EJE GENERAL VELÁSQUEZ · Sur → Norte ─────────────────────────────────
  {
    porticoCode: "PA19",
    segmentName: "Ruta 5 Sur - Américo Vespucio",
    axis: "eje_general_velasquez",
    direction: "sur_norte",
    lengthKm: 3.97,
    coordinates: { lat: -33.4775, lng: -70.6415 },
    rates: { TB: clp(412.57), TA: clp(618.86), TS: clp(863.61) },
    schedules: SCHEDULES.PA19,
  },
  {
    porticoCode: "PA21",
    segmentName: "Américo Vespucio - Carlos Valdovinos",
    axis: "eje_general_velasquez",
    direction: "sur_norte",
    lengthKm: 4.93,
    coordinates: { lat: -33.4662, lng: -70.6378 },
    rates: { TB: clp(512.34), TA: clp(768.51), TS: clp(1151.48) },
    schedules: SCHEDULES.PA21,
  },
  {
    porticoCode: "PA23",
    segmentName: "Carlos Valdovinos - Alameda",
    axis: "eje_general_velasquez",
    direction: "sur_norte",
    lengthKm: 2.77,
    coordinates: { lat: -33.4548, lng: -70.6575 },
    rates: { TB: clp(287.86), TA: clp(431.8), TS: clp(575.73) },
    schedules: SCHEDULES.PA23,
  },
  {
    porticoCode: "PA25",
    segmentName: "Alameda - Río Mapocho",
    axis: "eje_general_velasquez",
    direction: "sur_norte",
    lengthKm: 4.06,
    coordinates: { lat: -33.4385, lng: -70.6512 },
    rates: { TB: clp(421.93), TA: clp(632.89), TS: clp(843.86) },
    schedules: SCHEDULES.PA25,
  },
  {
    porticoCode: "PA28",
    segmentName: "Río Mapocho - Ruta 5 Norte",
    axis: "eje_general_velasquez",
    direction: "sur_norte",
    lengthKm: 4.93,
    coordinates: { lat: -33.4188, lng: -70.6468 },
    rates: { TB: clp(512.34), TA: clp(768.51), TS: clp(1024.69) },
    schedules: SCHEDULES.PA28,
  },

  // ── EJE GENERAL VELÁSQUEZ · Norte → Sur ─────────────────────────────────
  {
    porticoCode: "PA20",
    segmentName: "Ruta 5 Norte - Río Mapocho",
    axis: "eje_general_velasquez",
    direction: "norte_sur",
    lengthKm: 4.93,
    coordinates: { lat: -33.4205, lng: -70.6452 },
    rates: { TB: clp(512.34), TA: clp(768.51), TS: clp(1537.04) },
    schedules: ALL_DAY_TB,
  },
  {
    porticoCode: "PA22",
    segmentName: "Río Mapocho - Alameda",
    axis: "eje_general_velasquez",
    direction: "norte_sur",
    lengthKm: 4.06,
    coordinates: { lat: -33.4402, lng: -70.6498 },
    rates: { TB: clp(421.93), TA: clp(632.89), TS: clp(1265.79) },
    schedules: ALL_DAY_TB,
  },
  {
    porticoCode: "PA24",
    segmentName: "Alameda - Carlos Valdovinos",
    axis: "eje_general_velasquez",
    direction: "norte_sur",
    lengthKm: 2.77,
    coordinates: { lat: -33.4565, lng: -70.6558 },
    rates: { TB: clp(287.86), TA: clp(431.8), TS: clp(863.61) },
    schedules: ALL_DAY_TB,
  },
  {
    porticoCode: "PA26",
    segmentName: "Carlos Valdovinos - Américo Vespucio",
    axis: "eje_general_velasquez",
    direction: "norte_sur",
    lengthKm: 4.93,
    coordinates: { lat: -33.4685, lng: -70.6362 },
    rates: { TB: clp(512.34), TA: clp(768.51), TS: clp(1537.04) },
    schedules: ALL_DAY_TB,
  },
  {
    porticoCode: "PA29",
    segmentName: "Américo Vespucio - Ruta 5 Sur",
    axis: "eje_general_velasquez",
    direction: "norte_sur",
    lengthKm: 3.97,
    coordinates: { lat: -33.4792, lng: -70.6398 },
    rates: { TB: clp(412.57), TA: clp(618.86), TS: clp(1237.72) },
    schedules: ALL_DAY_TB,
  },
];

export const AUTOPISTA_CENTRAL_PORTICOS: TagPortico[] =
  PORTICO_SEEDS.map(buildPortico);

export const AUTOPISTA_CENTRAL_SOURCE =
  "MOP — PEAJES TARIFAS 2026 / Autopistas Urbanas (PDF)";
