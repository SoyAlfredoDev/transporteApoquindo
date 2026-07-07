/**
 * Pórticos oficiales — Acceso Vial 2026
 * Fuente: storage/ACCESO-VIAL.pdf (MOP)
 */

import {
  buildOfficialPortico,
  type PorticoSeed,
} from "@/features/quotes/data/porticoFactory";

const SEEDS: PorticoSeed[] = [
  {
    porticoCode: "P-AMB",
    segmentName: "Pórtico Acceso Vial AMB",
    highwayId: "acceso-vial",
    highwayName: "Acceso Vial AMB",
    coordinates: { lat: -33.47000, lng: -70.64000 },
    rates: { TB: 889, TA: 1800, TS: 2650 },
  }
];

export const ACCESO_VIAL_PORTICOS = SEEDS.map(buildOfficialPortico);
