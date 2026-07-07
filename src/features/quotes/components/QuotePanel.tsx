"use client";

import type { ReactNode } from "react";
import { useWorkspaceLayout } from "@/lib/layout/WorkspaceLayoutProvider";

interface QuotePanelProps {
  children: ReactNode;
}

/**
 * Panel flotante del cotizador.
 * Un solo contenedor con scroll interno y altura máxima según el workspace real
 * (navbar + footer + safe-area), sin depender de porcentajes frágiles.
 */
export function QuotePanel({ children }: QuotePanelProps) {
  const { panelMaxHeightPx } = useWorkspaceLayout();

  return (
    <div
      className="pointer-events-none absolute z-[1000] left-3 right-3 md:left-5 md:right-auto md:w-full md:max-w-md"
      style={{
        bottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div
        data-quote-panel
        className="pointer-events-auto overflow-x-hidden overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-[#F8FAFC] p-5 shadow-2xl [-webkit-overflow-scrolling:touch]"
        style={{ maxHeight: panelMaxHeightPx }}
      >
        {children}
      </div>
    </div>
  );
}
