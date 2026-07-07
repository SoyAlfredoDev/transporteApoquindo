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

const NAVBAR_SELECTOR = '[data-shell="navbar"]';
const FOOTER_SELECTOR = '[data-shell="footer"]';
const PANEL_SELECTOR = '[data-quote-panel]';

const FALLBACK_MAP_PADDING: google.maps.Padding = {
  top: 72,
  right: 24,
  bottom: 48,
  left: 24,
};

export interface WorkspaceLayoutMetrics {
  workspaceHeightPx: number;
  panelMaxHeightPx: number;
  mapPadding: google.maps.Padding;
}

function measureLayout(): WorkspaceLayoutMetrics {
  if (typeof window === "undefined") {
    return {
      workspaceHeightPx: 600,
      panelMaxHeightPx: 400,
      mapPadding: FALLBACK_MAP_PADDING,
    };
  }

  const navbar =
    document.querySelector(NAVBAR_SELECTOR)?.getBoundingClientRect().height ?? 52;
  const footer =
    document.querySelector(FOOTER_SELECTOR)?.getBoundingClientRect().height ?? 44;
  const workspaceHeightPx = window.innerHeight - navbar - footer;
  const isDesktop = window.matchMedia("(min-width: 768px)").matches;
  const edgeGap = isDesktop ? 20 : 12;

  const panelMaxHeightPx = isDesktop
    ? Math.max(320, workspaceHeightPx - edgeGap * 2)
    : Math.max(260, Math.floor(workspaceHeightPx * 0.7));

  const panel = document.querySelector(PANEL_SELECTOR)?.getBoundingClientRect();

  if (isDesktop) {
    const panelWidth = panel?.width ?? 448;
    const panelLeft = panel?.left ?? edgeGap;
    return {
      workspaceHeightPx,
      panelMaxHeightPx,
      mapPadding: {
        top: Math.ceil(navbar + 12),
        right: 32,
        bottom: Math.ceil(footer + 12),
        left: Math.ceil(panelLeft + panelWidth + 16),
      },
    };
  }

  const panelHeight = panel?.height ?? panelMaxHeightPx;
  return {
    workspaceHeightPx,
    panelMaxHeightPx,
    mapPadding: {
      top: Math.ceil(navbar + 12),
      right: 20,
      bottom: Math.ceil(panelHeight + edgeGap),
      left: 20,
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
      const panel = document.querySelector(PANEL_SELECTOR);
      if (!panel || observer) return;
      observer = new ResizeObserver(refresh);
      observer.observe(panel);
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
    return {
      workspaceHeightPx: 600,
      panelMaxHeightPx: 420,
      mapPadding: FALLBACK_MAP_PADDING,
    };
  }
  return context;
}
