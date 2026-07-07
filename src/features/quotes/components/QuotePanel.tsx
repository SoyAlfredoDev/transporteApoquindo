import type { ReactNode } from "react";

interface QuotePanelProps {
  children: ReactNode;
}

/**
 * Panel flotante del cotizador — posicionado dentro del workspace (no fixed al viewport).
 */
export function QuotePanel({ children }: QuotePanelProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center p-3 md:inset-auto md:bottom-5 md:left-5 md:justify-start">
      <div className="pointer-events-auto w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/90 bg-[#F8FAFC]/95 shadow-2xl backdrop-blur-sm">
        <div className="max-h-[min(52dvh,100%)] overflow-y-auto overscroll-contain p-5">
          {children}
        </div>
      </div>
    </div>
  );
}
