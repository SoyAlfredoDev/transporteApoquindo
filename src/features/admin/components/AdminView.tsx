"use client";

import { useState } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";
import { AppShell } from "@/components/layout/AppShell";
import { ConventionConfigForm } from "@/features/admin/components/ConventionConfigForm";
import { TagPorticosMap } from "@/features/admin/components/TagPorticosMap";
import { TagPorticosTable } from "@/features/admin/components/TagPorticosTable";
import { GOOGLE_MAPS_API_KEY } from "@/lib/google-maps/config";

type AdminTab = "config" | "table" | "map";

function AdminTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}) {
  const tabs: { id: AdminTab; label: string }[] = [
    { id: "config", label: "Convenio" },
    { id: "table", label: "Tabla TAG" },
    { id: "map", label: "Mapa TAG" },
  ];

  return (
    <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-slate-200 bg-white/80 p-2 backdrop-blur-sm">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? "bg-[#1A6FE8] text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function MissingApiKeyState() {
  return (
    <div className="flex h-full items-center justify-center bg-[#F8FAFC] p-6">
      <div className="max-w-md rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Configura <code className="font-mono">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>{" "}
        para visualizar el mapa de pórticos TAG.
      </div>
    </div>
  );
}

export function AdminView() {
  const [activeTab, setActiveTab] = useState<AdminTab>("config");
  const hasApiKey = Boolean(GOOGLE_MAPS_API_KEY);

  return (
    <AppShell
      activeNav="administracion"
      footerOnline={hasApiKey}
      footerStatusLabel={hasApiKey ? "Sistema Conectado" : "Maps no configurado"}
    >
      <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#F8FAFC]">
        <div className="shrink-0 border-b border-slate-200 bg-white/60 px-4 py-3 backdrop-blur-sm">
          <h1 className="text-base font-semibold text-slate-800">
            Panel de Administración
          </h1>
          <p className="text-xs text-slate-500">
            Convenio corporativo y pórticos TAG — RM Chile
          </p>
        </div>

        <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "config" ? (
          <div className="min-h-0 flex-1 overflow-hidden">
            <ConventionConfigForm />
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:grid md:grid-cols-2">
            <div
              className={`min-h-0 overflow-hidden ${
                activeTab === "table" ? "flex flex-1 flex-col" : "hidden md:flex"
              }`}
            >
              <TagPorticosTable />
            </div>

            <div
              className={`min-h-0 overflow-hidden ${
                activeTab === "map" ? "flex flex-1 flex-col" : "hidden md:flex"
              }`}
            >
              {hasApiKey ? (
                <APIProvider apiKey={GOOGLE_MAPS_API_KEY} language="es" region="CL">
                  <TagPorticosMap />
                </APIProvider>
              ) : (
                <MissingApiKeyState />
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
