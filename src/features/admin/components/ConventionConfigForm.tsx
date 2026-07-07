"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useNotification } from "@/components/ui/notifications/NotificationProvider";
import type { BusinessTariffs } from "@/features/quotes/data/businessTariffs";
import { useBusinessTariffs } from "@/features/quotes/context/BusinessTariffsProvider";
import { formatClp } from "@/features/quotes/services/quoteCalculator";

function parseNumberInput(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function ConventionConfigForm() {
  const { tariffs, saveTariffs, resetTariffs } = useBusinessTariffs();
  const { success, info } = useNotification();
  const [draft, setDraft] = useState<BusinessTariffs>(tariffs);

  useEffect(() => {
    setDraft(tariffs);
  }, [tariffs]);

  const updateField = <K extends keyof BusinessTariffs>(
    key: K,
    value: BusinessTariffs[K],
  ) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const handleSave = () => {
    saveTariffs(draft);
    success(
      "Configuración guardada",
      "El cotizador ya utiliza los nuevos valores del convenio.",
    );
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#F8FAFC]">
      <div className="shrink-0 border-b border-slate-200 px-4 py-4">
        <h2 className="text-base font-semibold text-slate-800">
          Configuración de Convenio
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Parámetros comerciales corporativos — Transportes Apoquindo
        </p>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain p-4">
        <div className="mx-auto max-w-lg space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Select
            id="currency"
            label="Tipo moneda"
            value={draft.currency}
            onChange={() => undefined}
            options={[{ value: "CLP", label: "CLP — Peso Chileno" }]}
            disabled
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              id="base-fare"
              label="Bajada de bandera"
              type="number"
              min={0}
              step={1}
              value={draft.baseFare}
              onChange={(e) =>
                updateField("baseFare", parseNumberInput(e.target.value))
              }
            />
            <Input
              id="base-fare-vip"
              label="Bajada de bandera VIP"
              type="number"
              min={0}
              step={1}
              value={draft.baseFareVip}
              onChange={(e) =>
                updateField("baseFareVip", parseNumberInput(e.target.value))
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              id="price-per-km"
              label="Valor km"
              type="number"
              min={0}
              step={1}
              value={draft.pricePerKm}
              onChange={(e) =>
                updateField("pricePerKm", parseNumberInput(e.target.value))
              }
            />
            <Input
              id="price-per-km-vip"
              label="Valor km VIP"
              type="number"
              min={0}
              step={1}
              value={draft.pricePerKmVip}
              onChange={(e) =>
                updateField("pricePerKmVip", parseNumberInput(e.target.value))
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              id="price-per-waiting-minute"
              label="Valor minuto de espera"
              type="number"
              min={0}
              step={1}
              value={draft.pricePerWaitingMinute}
              onChange={(e) =>
                updateField(
                  "pricePerWaitingMinute",
                  parseNumberInput(e.target.value),
                )
              }
            />
            <Input
              id="price-per-waiting-minute-vip"
              label="Valor minuto espera VIP"
              type="number"
              min={0}
              step={1}
              value={draft.pricePerWaitingMinuteVip}
              onChange={(e) =>
                updateField(
                  "pricePerWaitingMinuteVip",
                  parseNumberInput(e.target.value),
                )
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              id="default-tag-value"
              label="Valor tag"
              type="number"
              min={0}
              step={1}
              value={draft.defaultTagValue}
              onChange={(e) =>
                updateField("defaultTagValue", parseNumberInput(e.target.value))
              }
            />
            <Input
              id="price-per-200-meters"
              label="Cada 200 metros"
              type="number"
              min={0}
              step={1}
              value={draft.pricePer200Meters}
              onChange={(e) =>
                updateField(
                  "pricePer200Meters",
                  parseNumberInput(e.target.value),
                )
              }
            />
          </div>

          <Input
            id="minimum-fare"
            label="Tarifa mínima"
            type="number"
            min={0}
            step={1}
            value={draft.minimumFare}
            onChange={(e) =>
              updateField("minimumFare", parseNumberInput(e.target.value))
            }
          />

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <input
              type="checkbox"
              checked={draft.chargeBaseFare}
              onChange={(e) => updateField("chargeBaseFare", e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-[#1A6FE8] focus:ring-[#1A6FE8]/30"
            />
            <div>
              <p className="text-sm font-medium text-slate-800">Cobro base km</p>
              <p className="text-xs text-slate-500">
                Incluye bajada de bandera en el cálculo por distancia
              </p>
            </div>
          </label>

          <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-500">
            <p className="font-medium text-slate-700">Vista previa fórmula</p>
            <p className="mt-1">
              Base = max(bajada + km × {formatClp(draft.pricePerKm)}, mínima{" "}
              {formatClp(draft.minimumFare)}) + minutos ×{" "}
              {formatClp(draft.pricePerWaitingMinute)} + pórticos ×{" "}
              {formatClp(draft.defaultTagValue)}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 rounded-xl bg-[#1A6FE8] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1558c0]"
            >
              Guardar configuración
            </button>
            <button
              type="button"
              onClick={() => {
                resetTariffs();
                info(
                  "Valores restaurados",
                  "Se aplicaron los parámetros oficiales por defecto.",
                );
              }}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              Restaurar valores
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
