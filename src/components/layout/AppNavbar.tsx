"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Cotizador", id: "cotizador" as const },
  { href: "/administracion", label: "Administración", id: "administracion" as const },
];

export type AppNavId = (typeof NAV_ITEMS)[number]["id"];

interface AppNavbarProps {
  activeNav?: AppNavId;
}

export function AppNavbar({ activeNav }: AppNavbarProps) {
  const pathname = usePathname();

  return (
    <header className="relative z-40 shrink-0 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-4 py-2.5 md:px-6">
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/images/logo-transporte-apoquindo.png"
            alt="Transportes Apoquindo"
            width={220}
            height={48}
            className="h-8 w-auto object-contain md:h-9"
            priority
          />
        </Link>

        <nav
          className="flex items-center gap-1 rounded-xl border border-slate-200/80 bg-white/60 p-1 shadow-sm"
          aria-label="Navegación principal"
        >
          {NAV_ITEMS.map((item) => {
            const isActive =
              activeNav === item.id ||
              (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href));

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors md:px-4 md:text-sm ${
                  isActive
                    ? "bg-[#1A6FE8] text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
