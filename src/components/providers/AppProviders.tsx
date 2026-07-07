"use client";

import type { ReactNode } from "react";
import { BusinessTariffsProvider } from "@/features/quotes/context/BusinessTariffsProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return <BusinessTariffsProvider>{children}</BusinessTariffsProvider>;
}
