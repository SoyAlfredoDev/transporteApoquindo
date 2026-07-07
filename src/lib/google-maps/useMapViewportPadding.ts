"use client";

import { useContext } from "react";
import {
  WorkspaceLayoutContext,
  useWorkspaceLayout,
} from "@/lib/layout/WorkspaceLayoutProvider";

const ADMIN_MAP_PADDING: google.maps.Padding = {
  top: 72,
  right: 24,
  bottom: 48,
  left: 24,
};

/** Padding para fitBounds — dinámico en cotizador, fijo en administración. */
export function useMapViewportPadding(): google.maps.Padding {
  const cotizadorLayout = useContext(WorkspaceLayoutContext);
  if (!cotizadorLayout) return ADMIN_MAP_PADDING;
  return cotizadorLayout.mapPadding;
}

export { useWorkspaceLayout };
