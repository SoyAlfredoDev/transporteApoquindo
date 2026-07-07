"use client";

import { useState } from "react";
import Link from "next/link";
import { APIProvider } from "@vis.gl/react-google-maps";
import { TagPorticosMap } from "@/features/admin/components/TagPorticosMap";
import { TagPorticosTable } from "@/features/admin/components/TagPorticosTable";
import { GOOGLE_MAPS_API_KEY } from "@/lib/google-maps/config";

type AdminTab = "table" | "map";

function AdminTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}) {
  const tabs: { id: AdminTab; label: string }[] = [
    { id: "table", label: "Ver Tabla" },
    { id: "map", label: "Ver Mapa" },
  ];

  return (
    <div className="flex shrink-0 gap-1 border-b border-slate-200 bg-white p-2 md:hidden">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
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
  const [activeTab, setActiveTab] = useState<AdminTab>("table");
  const hasApiKey = Boolean(GOOGLE_MAPS_API_KEY);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#F8FAFC]">
      <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur-md">
        <div>
          <h1 className="text-base font-semibold text-slate-800">
            Administración TAG
          </h1>
          <p className="text-xs text-slate-500">
            Gestión visual de peajes urbanos — RM Chile
          </p>
        </div>
        <Link
          href="/"
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
        >
          ← Cotizador
        </Link>
      </header>

      <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} />

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
    </div>
  );
}
