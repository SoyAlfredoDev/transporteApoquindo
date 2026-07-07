"use client";

import type { ReactNode } from "react";
import { NotificationProvider } from "@/components/ui/notifications/NotificationProvider";
import { BusinessTariffsProvider } from "@/features/quotes/context/BusinessTariffsProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <NotificationProvider>
      <BusinessTariffsProvider>{children}</BusinessTariffsProvider>
    </NotificationProvider>
  );
}
