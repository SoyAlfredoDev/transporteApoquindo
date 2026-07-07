/**
 * Pórticos oficiales — Túnel San Cristóbal 2026
 * Fuente: storage/TUNEL-SAN-CRISTOBAL.pdf (MOP)
 */

import {
  buildOfficialPortico,
  type PorticoSeed,
} from "@/features/quotes/data/porticoFactory";

const SEEDS: PorticoSeed[] = [
  {
    porticoCode: "TSC-SN",
    segmentName: "El Salto - Kennedy",
    highwayId: "tunel-san-cristobal",
    highwayName: "Túnel San Cristóbal",
    coordinates: { lat: -33.48000, lng: -70.55000 },
    rates: { TB: 565, TA: 904, TS: 2713 },
  },
  {
    porticoCode: "TSC-NS",
    segmentName: "Kennedy - El Salto",
    highwayId: "tunel-san-cristobal",
    highwayName: "Túnel San Cristóbal",
    coordinates: { lat: -33.44000, lng: -70.58000 },
    rates: { TB: 452, TA: 723, TS: 2169 },
  }
];

export const TUNEL_SAN_CRISTOBAL_PORTICOS = SEEDS.map(buildOfficialPortico);
