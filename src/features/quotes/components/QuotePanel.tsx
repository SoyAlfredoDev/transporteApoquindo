import type { ReactNode } from "react";

interface QuotePanelProps {
  children: ReactNode;
}

export function QuotePanel({ children }: QuotePanelProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center p-4 md:inset-auto md:bottom-8 md:left-8 md:justify-start">
      <div className="pointer-events-auto w-full max-w-md overflow-hidden rounded-t-2xl border border-slate-200 bg-[#F8FAFC] shadow-2xl md:rounded-2xl">
        <div className="max-h-[55dvh] overflow-y-auto overscroll-contain p-5 md:max-h-[calc(100dvh-6rem)]">
          {children}
        </div>
      </div>
    </div>
  );
}
