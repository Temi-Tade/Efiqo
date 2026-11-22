"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  Plus,
  Library,
  User,
} from "lucide-react";
import { useEfiqo } from "@/context/EfiqoContext";

const BOTTOM_NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, primary: false },
  { href: "/materials", label: "Materials", icon: Layers, primary: false },
  { href: "/create", label: "Create", icon: Plus, primary: true },
  { href: "/community", label: "Library", icon: Library, primary: false },
  { href: "/user", label: "User", icon: User, primary: false },
] as const;

export function MobileBottomNav() {
  const { profile, isHydrated } = useEfiqo();
  const pathname = usePathname();

  if (!isHydrated || !profile) return null;

  const isItemActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-slate-200/90 dark:border-slate-800/90 bg-[#F7F8FA]/95 dark:bg-[#0B0F19]/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto items-center">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const active = isItemActive(item.href);
          const Icon = item.icon;

          if (item.primary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center gap-0.5 px-1 min-w-0 group"
              >
                <span
                  className={`w-11 h-11 -mt-5 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ring-4 ring-[#F7F8FA] dark:ring-[#0B0F19] ${
                    active
                      ? "bg-rose-600 text-white shadow-rose-600/30"
                      : "bg-blue-600 text-white shadow-blue-600/30 group-hover:bg-blue-700"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" strokeWidth={2.5} />
                </span>
                <span
                  className={`text-[11px] leading-none font-semibold truncate max-w-full ${
                    active
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-blue-600 dark:text-blue-400"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 px-1 min-w-0 transition-colors ${
                active
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" strokeWidth={active ? 2.25 : 1.75} />
              <span
                className={`text-[11px] leading-none truncate max-w-full ${
                  active ? "font-semibold" : "font-medium"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
