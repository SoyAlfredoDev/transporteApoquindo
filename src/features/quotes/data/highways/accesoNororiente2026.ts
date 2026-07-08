/**
 * Pórticos oficiales — Acceso Nororiente 2026
 * Fuente: storage/ACCESO-NORORIENTE.pdf (MOP)
 */

import {
  buildOfficialPortico,
  type PorticoSeed,
} from "@/features/quotes/data/porticoFactory";

const SEEDS: PorticoSeed[] = [
  {
    porticoCode: "ANO-PON",
    segmentName: "Sector Poniente",
    highwayId: "acceso-nororiente",
    highwayName: "Acceso Nororiente",
    coordinates: { lat: -33.30265, lng: -70.68344 },
    rates: { TB: 4116, TA: 7408, TS: 13170 },
  },
  {
    porticoCode: "ANO-OR",
    segmentName: "Sector Oriente",
    highwayId: "acceso-nororiente",
    highwayName: "Acceso Nororiente",
    coordinates: { lat: -33.38973, lng: -70.59947 },
    rates: { TB: 6173, TA: 11112, TS: 19755 },
  }
];

export const ACCESO_NORORIENTE_PORTICOS = SEEDS.map(buildOfficialPortico);
