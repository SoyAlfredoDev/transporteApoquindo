import type { ReactNode } from "react";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppNavbar, type AppNavId } from "@/components/layout/AppNavbar";

interface AppShellProps {
  children: ReactNode;
  activeNav?: AppNavId;
  footerStatusLabel?: string;
  footerOnline?: boolean;
}

/**
 * Layout inmersivo 100dvh: Navbar + Workspace (flex-1) + Footer.
 * Sin scroll exterior; el contenido interno gestiona su propio overscroll.
 */
export function AppShell({
  children,
  activeNav,
  footerStatusLabel,
  footerOnline = true,
}: AppShellProps) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden overscroll-none">
      <AppNavbar activeNav={activeNav} />

      <main className="relative min-h-0 flex-1 overflow-hidden overscroll-none">
        {children}
      </main>

      <AppFooter statusLabel={footerStatusLabel} isOnline={footerOnline} />
    </div>
  );
}
