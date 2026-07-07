"use client";

interface QuoteFormSubmitButtonProps {
  formId: string;
  isCalculating?: boolean;
  canSubmit?: boolean;
}

export function QuoteFormSubmitButton({
  formId,
  isCalculating = false,
  canSubmit = true,
}: QuoteFormSubmitButtonProps) {
  return (
    <button
      type="submit"
      form={formId}
      disabled={isCalculating || !canSubmit}
      className="w-full rounded-lg bg-[#1A6FE8] py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#1558BA] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-md"
    >
      {isCalculating ? "Calculando ruta..." : "Generar cotización"}
    </button>
  );
}
