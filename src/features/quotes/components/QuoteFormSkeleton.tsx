export function QuoteFormSkeleton() {
  return (
    <div className="flex min-h-[280px] flex-col gap-4" aria-hidden>
      <div className="space-y-2">
        <div className="h-6 w-40 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
      </div>
      <FieldSkeleton labelWidth="w-12" />
      <FieldSkeleton labelWidth="w-14" />
      <FieldSkeleton labelWidth="w-28" />
      <FieldSkeleton labelWidth="w-20" />
    </div>
  );
}

function FieldSkeleton({ labelWidth = "w-16" }: { labelWidth?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className={`h-4 ${labelWidth} animate-pulse rounded bg-slate-200`} />
      <div className="h-11 animate-pulse rounded-xl bg-slate-200/80" />
    </div>
  );
}
