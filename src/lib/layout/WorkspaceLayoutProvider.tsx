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

const MAP_CARD_SELECTOR = "[data-map-card]";

const FALLBACK_MAP_PADDING: google.maps.Padding = {
  top: 40,
  right: 40,
  bottom: 40,
  left: 40,
};

export interface WorkspaceLayoutMetrics {
  mapPadding: google.maps.Padding;
}

function measureLayout(): WorkspaceLayoutMetrics {
  if (typeof window === "undefined") {
    return { mapPadding: FALLBACK_MAP_PADDING };
  }

  const mapCard = document.querySelector(MAP_CARD_SELECTOR)?.getBoundingClientRect();

  if (!mapCard) {
    return { mapPadding: FALLBACK_MAP_PADDING };
  }

  return {
    mapPadding: {
      top: 32,
      right: 32,
      bottom: 32,
      left: 32,
    },
  };
}

const WorkspaceLayoutContext = createContext<WorkspaceLayoutMetrics | null>(null);

export { WorkspaceLayoutContext };

export function WorkspaceLayoutProvider({ children }: { children: ReactNode }) {
  const [metrics, setMetrics] = useState<WorkspaceLayoutMetrics>(() => measureLayout());

  const refresh = useCallback(() => {
    setMetrics(measureLayout());
  }, []);

  useEffect(() => {
    refresh();
    const frame = window.requestAnimationFrame(refresh);

    let observer: ResizeObserver | null = null;

    const attachObserver = () => {
      const mapCard = document.querySelector(MAP_CARD_SELECTOR);
      if (!mapCard || observer) return;
      observer = new ResizeObserver(refresh);
      observer.observe(mapCard);
    };

    attachObserver();
    const retry = window.setTimeout(attachObserver, 150);

    window.addEventListener("resize", refresh);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(retry);
      window.removeEventListener("resize", refresh);
      observer?.disconnect();
    };
  }, [refresh]);

  const value = useMemo(() => metrics, [metrics]);

  return (
    <WorkspaceLayoutContext.Provider value={value}>
      {children}
    </WorkspaceLayoutContext.Provider>
  );
}

export function useWorkspaceLayout(): WorkspaceLayoutMetrics {
  const context = useContext(WorkspaceLayoutContext);
  if (!context) {
    return { mapPadding: FALLBACK_MAP_PADDING };
  }
  return context;
}
