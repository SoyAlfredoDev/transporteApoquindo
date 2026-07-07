import type { ReactNode } from "react";

interface ModuleCardProps {
  children: ReactNode;
  className?: string;
  /** Etiqueta opcional en la cabecera de la tarjeta */
  title?: string;
  description?: string;
}

export function ModuleCard({
  children,
  className = "",
  title,
  description,
}: ModuleCardProps) {
  return (
    <section
      className={`flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md ${className}`}
    >
      {title ? (
        <header className="shrink-0 border-b border-slate-100 px-5 py-3.5">
          <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-xs text-slate-500">{description}</p>
          ) : null}
        </header>
      ) : null}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
    </section>
  );
}
