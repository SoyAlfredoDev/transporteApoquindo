import type { QuoteExportData } from "@/features/quotes/services/quoteExport";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

/**
 * Simula envío de cotización por correo.
 * Reemplazar por Resend cuando esté configurado.
 */
export async function sendQuoteEmailMock(
  email: string,
  _data: QuoteExportData,
): Promise<void> {
  await new Promise((resolve) => window.setTimeout(resolve, 1400));

  if (!isValidEmail(email)) {
    throw new Error("Ingresa un correo electrónico válido.");
  }

  // Sin Resend: no se envía correo real.
}
