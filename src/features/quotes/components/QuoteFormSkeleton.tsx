export function QuoteFormSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden>
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
