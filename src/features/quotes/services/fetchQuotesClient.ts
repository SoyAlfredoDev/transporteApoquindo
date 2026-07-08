import type { SavedQuoteRecord } from "@/features/quotes/types/quoteRecord";

export async function fetchSavedQuotes(): Promise<SavedQuoteRecord[]> {
  const response = await fetch("/api/quotes", { cache: "no-store" });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(payload?.error ?? "No se pudieron cargar las cotizaciones.");
  }

  const data = (await response.json()) as { quotes: SavedQuoteRecord[] };
  return data.quotes ?? [];
}
