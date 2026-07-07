/**
 * Pórticos oficiales — AVO I 2026
 * Fuente: storage/AVO-I.pdf (MOP)
 */

import {
  buildOfficialPortico,
  type PorticoSeed,
} from "@/features/quotes/data/porticoFactory";

const SEEDS: PorticoSeed[] = [
  {
    porticoCode: "P101",
    segmentName: "Bilbao",
    highwayId: "avo-i",
    highwayName: "Américo Vespucio Oriente I",
    coordinates: { lat: -33.50000, lng: -70.57000 },
    rates: { TB: 232, TA: 464, TS: 696 },
  },
  {
    porticoCode: "P102",
    segmentName: "Martín de Zamora",
    highwayId: "avo-i",
    highwayName: "Américo Vespucio Oriente I",
    coordinates: { lat: -33.49400, lng: -70.56600 },
    rates: { TB: 232, TA: 464, TS: 696 },
  },
  {
    porticoCode: "P103",
    segmentName: "Los Militares",
    highwayId: "avo-i",
    highwayName: "Américo Vespucio Oriente I",
    coordinates: { lat: -33.48800, lng: -70.56200 },
    rates: { TB: 232, TA: 464, TS: 696 },
  },
  {
    porticoCode: "P104",
    segmentName: "Presidente Riesco",
    highwayId: "avo-i",
    highwayName: "Américo Vespucio Oriente I",
    coordinates: { lat: -33.48200, lng: -70.55800 },
    rates: { TB: 232, TA: 464, TS: 696 },
  },
  {
    porticoCode: "P105",
    segmentName: "Salida Kennedy Oriente",
    highwayId: "avo-i",
    highwayName: "Américo Vespucio Oriente I",
    coordinates: { lat: -33.47600, lng: -70.55400 },
    rates: { TB: 232, TA: 464, TS: 696 },
  },
  {
    porticoCode: "P106",
    segmentName: "Salida Kennedy Poniente",
    highwayId: "avo-i",
    highwayName: "Américo Vespucio Oriente I",
    coordinates: { lat: -33.47000, lng: -70.55000 },
    rates: { TB: 232, TA: 464, TS: 696 },
  },
  {
    porticoCode: "P107",
    segmentName: "Kennedy-Vespucio",
    highwayId: "avo-i",
    highwayName: "Américo Vespucio Oriente I",
    coordinates: { lat: -33.46400, lng: -70.54600 },
    rates: { TB: 232, TA: 464, TS: 696 },
  },
  {
    porticoCode: "P108",
    segmentName: "Costanera Norte - Nororiente",
    highwayId: "avo-i",
    highwayName: "Américo Vespucio Oriente I",
    coordinates: { lat: -33.45800, lng: -70.54200 },
    rates: { TB: 232, TA: 464, TS: 696 },
  },
  {
    porticoCode: "P109",
    segmentName: "Pte. Centenario",
    highwayId: "avo-i",
    highwayName: "Américo Vespucio Oriente I",
    coordinates: { lat: -33.45200, lng: -70.53800 },
    rates: { TB: 232, TA: 464, TS: 696 },
  },
  {
    porticoCode: "P110",
    segmentName: "La Pirámide",
    highwayId: "avo-i",
    highwayName: "Américo Vespucio Oriente I",
    coordinates: { lat: -33.44600, lng: -70.53400 },
    rates: { TB: 232, TA: 464, TS: 696 },
  },
  {
    porticoCode: "P111",
    segmentName: "Cerro Colorado",
    highwayId: "avo-i",
    highwayName: "Américo Vespucio Oriente I",
    coordinates: { lat: -33.44000, lng: -70.53000 },
    rates: { TB: 232, TA: 464, TS: 696 },
  }
];

export const AVO_I_PORTICOS = SEEDS.map(buildOfficialPortico);
