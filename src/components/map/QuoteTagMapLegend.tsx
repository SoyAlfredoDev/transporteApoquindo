"use client";

interface QuoteTagMapLegendProps {
  tagCount: number;
  ambCount: number;
}

export function QuoteTagMapLegend({
  tagCount,
  ambCount,
}: QuoteTagMapLegendProps) {
  if (tagCount === 0) return null;

  return (
    <div
      className="pointer-events-none absolute bottom-3 left-3 z-10 max-w-[200px] rounded-lg border border-slate-200/90 bg-white/95 px-3 py-2 shadow-sm backdrop-blur-sm"
      aria-label="Leyenda de pórticos TAG"
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        Peajes detectados
      </p>
      <ul className="mt-1.5 space-y-1">
        {tagCount - ambCount > 0 ? (
          <li className="flex items-center gap-2 text-xs text-slate-700">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#1A6FE8] ring-1 ring-white"
              aria-hidden
            />
            <span>
              {tagCount - ambCount} pórtico{tagCount - ambCount === 1 ? "" : "s"}{" "}
              TAG
            </span>
          </li>
        ) : null}
        {ambCount > 0 ? (
          <li className="flex items-center gap-2 text-xs text-slate-700">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-600 ring-1 ring-white"
              aria-hidden
            />
            <span>
              {ambCount} peaje{ambCount === 1 ? "" : "s"} AMB
            </span>
          </li>
        ) : null}
      </ul>
    </div>
  );
}
