export type NotificationType = "success" | "error" | "info" | "warning";

export interface NotificationInput {
  type: NotificationType;
  title: string;
  message?: string;
  /** Duración en ms antes de auto-cerrar. Default: 4500 */
  durationMs?: number;
}

export interface NotificationItem extends NotificationInput {
  id: string;
  createdAt: number;
}
