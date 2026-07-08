import type { SaveQuoteInput, SaveQuoteResult } from "@/features/quotes/types/quoteRecord";

export async function saveQuoteToDatabase(
  input: SaveQuoteInput,
): Promise<SaveQuoteResult> {
  const response = await fetch("/api/quotes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(payload?.error ?? "No se pudo guardar la cotización.");
  }

  return (await response.json()) as SaveQuoteResult;
}
