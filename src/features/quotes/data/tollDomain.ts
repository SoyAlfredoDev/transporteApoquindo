/**
 * Glosario de dominio — Peajes y Pórticos en Chile.
 *
 * Fuente oficial de tarifas:
 * https://concesiones.mop.gob.cl/peajes-y-porticos/
 *
 * Este módulo define el vocabulario del negocio para evitar mezclar conceptos
 * en código, UI y cotizaciones.
 */

/** URL del repositorio oficial MOP (Dirección General de Concesiones) */
export const MOP_TOLLS_SOURCE_URL =
  "https://concesiones.mop.gob.cl/peajes-y-porticos/";

/**
 * PEaje — El cobro económico por usar una vía concesionada.
 * Es el monto en CLP que el usuario/empresa debe pagar.
 */
export type PeajeCharge = {
  concept: "peaje";
  amountClp: number;
};

/**
 * PÓRTICO — Infraestructura física de cobro electrónico free flow (sin barrera).
 * Registra el paso del vehículo mediante cámaras/antenas TAG.
 * Cada cruce puede generar uno o más cargos de peaje según el tramo.
 */
export type PorticoInfrastructure = {
  concept: "portico";
};

/**
 * TAG — Medio de pago electrónico (dispositivo + contrato), NO es un peaje ni un pórtico.
 * Habilita el telepeaje en autopistas urbanas y algunas interurbanas.
 */
export type TagPaymentMethod = {
  concept: "tag";
};

/**
 * Sistema de cobro según tipo de ruta concesionada en Chile.
 *
 * - `urban_free_flow`: RM y autopistas urbanas. Múltiples pórticos TAG, tarifa por
 *   tramo/horario (TB, TA, TS). Sin detención.
 * - `interurban_plaza`: Ruta 5, 68, 78, etc. Plazas de peaje con barrera o Stop & Go.
 *   Cobro por plaza/tramo, más predecible.
 */
export type TollSystemType = "urban_free_flow" | "interurban_plaza";

/** Región operativa de la concesión */
export type TollRegion = "rm_urbana" | "interurban" | "transversal";

/** Bloques horarios oficiales en autopistas urbanas (equivalentes MOP) */
export const TARIFF_BLOCK_LABELS = {
  TB: "Tarifa Base (Fuera de Punta)",
  TA: "Tarifa Alta (Punta)",
  TS: "Tarifa Saturada",
} as const;

/**
 * Mapeo código del dominio → UI del cotizador.
 * Usar estos términos en etiquetas de interfaz para consistencia.
 */
export const DOMAIN_UI_LABELS = {
  /** Suma de peajes por pórticos urbanos cruzados */
  tagSubtotal: "Subtotal TAG (Autopistas Urbanas)",
  /** Peaje futuro por plaza interurbana — no implementado aún */
  plazaSubtotal: "Subtotal Peajes (Plazas Interurbanas)",
  /** Distancia × tarifa/km del servicio de transporte */
  kilometersSubtotal: "Subtotal Kilómetros",
} as const;

/**
 * Reglas de negocio permanentes — Peaje vs Pórtico vs TAG
 *
 * 1. El PÓRTICO es el punto geográfico que detectamos en la ruta (coordenadas).
 * 2. El PEaje es el cargo en CLP que resulta de cruzar ese pórtico en un tramo/horario.
 * 3. El TAG es solo el método de pago; en UI decimos "TAG" para el subtotal urbano
 *    porque es el término que usan los usuarios chilenos, pero internamente es
 *    sum(peajes por pórtico).
 * 4. No modelar plazas interurbanas como TagPortico — requieren TollPlaza (futuro).
 * 5. Tarifas oficiales: importar desde MOP (PDF tarifarios por concesión).
 */
export const TOLL_DOMAIN_RULES = {
  porticoGeneratesPeaje: true,
  tagIsPaymentMethodNotCharge: true,
  urbanUsesPorticos: true,
  interurbanUsesPlazas: true,
  officialDataSource: MOP_TOLLS_SOURCE_URL,
} as const;

/** Metadata de autopista para distinguir sistema de cobro */
export interface HighwayTollProfile {
  id: string;
  name: string;
  tollSystem: TollSystemType;
  region: TollRegion;
}

export const HIGHWAY_TOLL_PROFILES: HighwayTollProfile[] = [
  {
    id: "costanera-norte",
    name: "Costanera Norte",
    tollSystem: "urban_free_flow",
    region: "rm_urbana",
  },
  {
    id: "autopista-central",
    name: "Autopista Central",
    tollSystem: "urban_free_flow",
    region: "rm_urbana",
  },
  {
    id: "vespucio-norte",
    name: "Vespucio Norte",
    tollSystem: "urban_free_flow",
    region: "rm_urbana",
  },
  {
    id: "vespucio-sur",
    name: "Vespucio Sur",
    tollSystem: "urban_free_flow",
    region: "rm_urbana",
  },
  {
    id: "tunel-san-cristobal",
    name: "Túnel San Cristóbal",
    tollSystem: "urban_free_flow",
    region: "rm_urbana",
  },
  {
    id: "acceso-sur",
    name: "Acceso Sur",
    tollSystem: "urban_free_flow",
    region: "rm_urbana",
  },
];

/**
 * Plaza de peaje interurbana — modelo futuro (Ruta 5, 68, 78…).
 * NO confundir con TagPortico. Una plaza = un cobro fijo por paso.
 */
export interface TollPlaza {
  id: string;
  highwayId: string;
  highwayName: string;
  name: string;
  coordinates: google.maps.LatLngLiteral;
  tollSystem: "interurban_plaza";
  /** Tarifa fija por categoría vehicular (sin bloques TB/TA/TS) */
  ratesByVehicle: Record<string, number>;
  isMock: boolean;
}
