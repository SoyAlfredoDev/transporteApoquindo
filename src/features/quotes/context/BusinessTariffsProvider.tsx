"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_BUSINESS_TARIFFS,
  BUSINESS_TARIFFS_STORAGE_KEY,
  loadBusinessTariffsFromStorage,
  saveBusinessTariffsToStorage,
  type BusinessTariffs,
} from "@/features/quotes/data/businessTariffs";

interface BusinessTariffsContextValue {
  tariffs: BusinessTariffs;
  saveTariffs: (tariffs: BusinessTariffs) => void;
  resetTariffs: () => void;
}

const BusinessTariffsContext =
  createContext<BusinessTariffsContextValue | null>(null);

export function BusinessTariffsProvider({ children }: { children: ReactNode }) {
  const [tariffs, setTariffs] = useState<BusinessTariffs>(
    DEFAULT_BUSINESS_TARIFFS,
  );

  useEffect(() => {
    setTariffs(loadBusinessTariffsFromStorage());
  }, []);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === BUSINESS_TARIFFS_STORAGE_KEY) {
        setTariffs(loadBusinessTariffsFromStorage());
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const saveTariffs = useCallback((next: BusinessTariffs) => {
    setTariffs(next);
    saveBusinessTariffsToStorage(next);
  }, []);

  const resetTariffs = useCallback(() => {
    setTariffs(DEFAULT_BUSINESS_TARIFFS);
    saveBusinessTariffsToStorage(DEFAULT_BUSINESS_TARIFFS);
  }, []);

  const value = useMemo(
    () => ({ tariffs, saveTariffs, resetTariffs }),
    [tariffs, saveTariffs, resetTariffs],
  );

  return (
    <BusinessTariffsContext.Provider value={value}>
      {children}
    </BusinessTariffsContext.Provider>
  );
}

export function useBusinessTariffs(): BusinessTariffsContextValue {
  const context = useContext(BusinessTariffsContext);
  if (!context) {
    throw new Error(
      "useBusinessTariffs debe usarse dentro de BusinessTariffsProvider",
    );
  }
  return context;
}
