interface AppFooterProps {
  /** Etiqueta del indicador de estado (ej. GPS Online) */
  statusLabel?: string;
  /** Si el sistema está operativo / conectado */
  isOnline?: boolean;
}

export function AppFooter({
  statusLabel = "Sistema Conectado",
  isOnline = true,
}: AppFooterProps) {
  return (
    <footer
      data-shell="footer"
      className="relative z-40 shrink-0 border-t border-slate-800/50 bg-[#0f172a] px-4 py-2.5 md:px-6"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] text-slate-500 md:text-xs">
          Transportes Apoquindo © {new Date().getFullYear()}
        </p>

        <div
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium md:text-xs ${
            isOnline
              ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20"
              : "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isOnline ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
            }`}
            aria-hidden
          />
          {statusLabel}
        </div>
      </div>
    </footer>
  );
}
