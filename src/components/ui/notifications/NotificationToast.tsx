"use client";

import { useEffect, useState } from "react";
import type { NotificationItem } from "@/components/ui/notifications/types";

const STYLES = {
  success: {
    ring: "ring-emerald-200/80",
    iconBg: "bg-emerald-100 text-emerald-700",
    bar: "bg-emerald-500",
    icon: "✓",
  },
  error: {
    ring: "ring-red-200/80",
    iconBg: "bg-red-100 text-red-700",
    bar: "bg-red-500",
    icon: "✕",
  },
  info: {
    ring: "ring-[#1A6FE8]/25",
    iconBg: "bg-[#1A6FE8]/10 text-[#1A6FE8]",
    bar: "bg-[#1A6FE8]",
    icon: "i",
  },
  warning: {
    ring: "ring-amber-200/80",
    iconBg: "bg-amber-100 text-amber-700",
    bar: "bg-amber-500",
    icon: "!",
  },
} as const;

interface NotificationToastProps {
  item: NotificationItem;
  onDismiss: () => void;
}

export function NotificationToast({ item, onDismiss }: NotificationToastProps) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const style = STYLES[item.type];
  const duration = item.durationMs ?? 4500;

  useEffect(() => {
    const enterTimer = window.setTimeout(() => setVisible(true), 10);
    const exitTimer = window.setTimeout(() => setExiting(true), duration - 280);
    const removeTimer = window.setTimeout(onDismiss, duration);

    return () => {
      window.clearTimeout(enterTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(removeTimer);
    };
  }, [duration, onDismiss]);

  const handleDismiss = () => {
    setExiting(true);
    window.setTimeout(onDismiss, 280);
  };

  return (
    <div
      role="status"
      className={`pointer-events-auto w-full max-w-sm transform transition-all duration-300 ease-out ${
        visible && !exiting
          ? "translate-y-0 opacity-100"
          : "-translate-y-2 opacity-0"
      }`}
    >
      <div
        className={`relative overflow-hidden rounded-2xl border border-white/60 bg-white/95 shadow-lg ring-1 backdrop-blur-md ${style.ring}`}
      >
        <div className="flex items-start gap-3 px-4 py-3.5 pr-10">
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${style.iconBg}`}
          >
            {style.icon}
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-sm font-semibold text-slate-900">{item.title}</p>
            {item.message ? (
              <p className="mt-0.5 text-sm leading-snug text-slate-600">
                {item.message}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="absolute right-3 top-3 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Cerrar notificación"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="h-0.5 w-full bg-slate-100">
          <div
            className={`h-full ${style.bar} toast-progress-bar`}
            style={{ animationDuration: `${duration}ms` }}
          />
        </div>
      </div>
    </div>
  );
}
