"use client";

import { useContext } from "react";
import { WorkspaceLayoutContext } from "@/lib/layout/WorkspaceLayoutProvider";

const ADMIN_MAP_PADDING: google.maps.Padding = {
  top: 72,
  right: 24,
  bottom: 48,
  left: 24,
};

const FALLBACK_PADDING: google.maps.Padding = {
  top: 40,
  right: 40,
  bottom: 40,
  left: 40,
};

/** Padding para fitBounds — dinámico en cotizador (tarjeta del mapa), fijo en admin. */
export function useMapViewportPadding(): google.maps.Padding {
  const cotizadorLayout = useContext(WorkspaceLayoutContext);
  if (!cotizadorLayout) return ADMIN_MAP_PADDING;
  return cotizadorLayout.mapPadding ?? FALLBACK_PADDING;
}
