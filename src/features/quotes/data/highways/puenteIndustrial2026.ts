/**
 * Pórticos oficiales — Puente Industrial 2026
 * Fuente: storage/PUENTE-INDUSTRIAL-1.pdf (MOP)
 */

import {
  buildOfficialPortico,
  type PorticoSeed,
} from "@/features/quotes/data/porticoFactory";

const SEEDS: PorticoSeed[] = [
  {
    porticoCode: "PI-1",
    segmentName: "Puente Industrial",
    highwayId: "puente-industrial",
    highwayName: "Puente Industrial",
    coordinates: { lat: -33.49000, lng: -70.68000 },
    rates: { TB: 772, TA: 2316, TS: 3860 },
  }
];

export const PUENTE_INDUSTRIAL_PORTICOS = SEEDS.map(buildOfficialPortico);
