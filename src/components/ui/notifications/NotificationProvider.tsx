"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { NotificationToast } from "@/components/ui/notifications/NotificationToast";
import type {
  NotificationInput,
  NotificationItem,
} from "@/components/ui/notifications/types";

interface NotificationContextValue {
  notify: (input: NotificationInput) => string;
  dismiss: (id: string) => void;
  success: (title: string, message?: string) => string;
  error: (title: string, message?: string) => string;
  info: (title: string, message?: string) => string;
  warning: (title: string, message?: string) => string;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

const MAX_VISIBLE = 4;

function createId(): string {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<NotificationItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback((input: NotificationInput) => {
    const id = createId();
    const item: NotificationItem = {
      ...input,
      id,
      createdAt: Date.now(),
      durationMs: input.durationMs ?? 4500,
    };

    setItems((current) => [item, ...current].slice(0, MAX_VISIBLE));
    return id;
  }, []);

  const success = useCallback(
    (title: string, message?: string) =>
      notify({ type: "success", title, message }),
    [notify],
  );

  const error = useCallback(
    (title: string, message?: string) =>
      notify({ type: "error", title, message }),
    [notify],
  );

  const info = useCallback(
    (title: string, message?: string) =>
      notify({ type: "info", title, message }),
    [notify],
  );

  const warning = useCallback(
    (title: string, message?: string) =>
      notify({ type: "warning", title, message }),
    [notify],
  );

  const value = useMemo(
    () => ({ notify, dismiss, success, error, info, warning }),
    [notify, dismiss, success, error, info, warning],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-[10050] flex flex-col items-center gap-2 p-4 pt-[max(1rem,env(safe-area-inset-top))]"
        aria-live="polite"
        aria-label="Notificaciones del sistema"
      >
        {items.map((item) => (
          <NotificationToast
            key={item.id}
            item={item}
            onDismiss={() => dismiss(item.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification(): NotificationContextValue {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification debe usarse dentro de NotificationProvider",
    );
  }
  return context;
}
