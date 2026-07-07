/**
 * Índice de pórticos TAG oficiales MOP 2026 — todas las concesiones en /storage
 */

export { AUTOPISTA_CENTRAL_PORTICOS } from "@/features/quotes/data/autopistaCentral2026";
export { COSTANERA_NORTE_PORTICOS } from "@/features/quotes/data/highways/costaneraNorte2026";
export { VESPUCIO_NORTE_PORTICOS } from "@/features/quotes/data/highways/vespucioNorte2026";
export { VESPUCIO_SUR_PORTICOS } from "@/features/quotes/data/highways/vespucioSur2026";
export { TUNEL_SAN_CRISTOBAL_PORTICOS } from "@/features/quotes/data/highways/tunelSanCristobal2026";
export { AVO_I_PORTICOS } from "@/features/quotes/data/highways/avoI2026";
export { ACCESO_NORORIENTE_PORTICOS } from "@/features/quotes/data/highways/accesoNororiente2026";
export { ACCESO_VIAL_PORTICOS } from "@/features/quotes/data/highways/accesoVial2026";
export { PUENTE_INDUSTRIAL_PORTICOS } from "@/features/quotes/data/highways/puenteIndustrial2026";

import { AUTOPISTA_CENTRAL_PORTICOS } from "@/features/quotes/data/autopistaCentral2026";
import { COSTANERA_NORTE_PORTICOS } from "@/features/quotes/data/highways/costaneraNorte2026";
import { VESPUCIO_NORTE_PORTICOS } from "@/features/quotes/data/highways/vespucioNorte2026";
import { VESPUCIO_SUR_PORTICOS } from "@/features/quotes/data/highways/vespucioSur2026";
import { TUNEL_SAN_CRISTOBAL_PORTICOS } from "@/features/quotes/data/highways/tunelSanCristobal2026";
import { AVO_I_PORTICOS } from "@/features/quotes/data/highways/avoI2026";
import { ACCESO_NORORIENTE_PORTICOS } from "@/features/quotes/data/highways/accesoNororiente2026";
import { ACCESO_VIAL_PORTICOS } from "@/features/quotes/data/highways/accesoVial2026";
import { PUENTE_INDUSTRIAL_PORTICOS } from "@/features/quotes/data/highways/puenteIndustrial2026";
import type { TagPortico } from "@/features/quotes/data/tagTariffs";

export const ALL_MOP_2026_PORTICOS: TagPortico[] = [
  ...AUTOPISTA_CENTRAL_PORTICOS,
  ...COSTANERA_NORTE_PORTICOS,
  ...VESPUCIO_NORTE_PORTICOS,
  ...VESPUCIO_SUR_PORTICOS,
  ...TUNEL_SAN_CRISTOBAL_PORTICOS,
  ...AVO_I_PORTICOS,
  ...ACCESO_NORORIENTE_PORTICOS,
  ...ACCESO_VIAL_PORTICOS,
  ...PUENTE_INDUSTRIAL_PORTICOS,
];
