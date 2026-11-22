"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEfiqo } from "@/context/EfiqoContext";

const SIGNED_IN_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/materials", label: "Materials" },
  { href: "/create", label: "Create" },
  { href: "/reader", label: "Reader" },
  { href: "/pricing", label: "Pricing" },
];

const PUBLIC_LINKS = [
  { href: "/materials", label: "Materials" },
  { href: "/create", label: "Create" },
  { href: "/community", label: "Community" },
  { href: "/pricing", label: "Pricing" },
];

export function Navbar() {
  const { profile, setIsAuthModalOpen } = useEfiqo();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = profile ? SIGNED_IN_LINKS : PUBLIC_LINKS;

  const isRouteActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-[#F7F8FA]/95 dark:bg-[#0B0F19]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-8 min-w-0">
        {/* Zone 1: Brand Wordmark */}
        <Link
          href="/"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center gap-2 text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0"
        >
          <img
            src="/images/efIQo_logo.png"
            alt="efIQo mark"
            className="w-7 h-7 object-contain"
            referrerPolicy="no-referrer"
          />
          <span>efIQo</span>
        </Link>

        {/* Zone 2: Clean Single-Line Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300 min-w-0">
          {navLinks.map((item) => {
            const active = isRouteActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 dark:hover:text-white ${
                  active
                    ? "text-blue-600 dark:text-blue-400 underline underline-offset-8 decoration-2"
                    : ""
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action + Mobile Drawer Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {profile ? (
            <Link
              href="/user"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg border transition-colors whitespace-nowrap shrink-0 max-w-[150px] sm:max-w-[190px] ${
                isRouteActive("/user")
                  ? "border-blue-600 bg-blue-50/70 dark:bg-blue-950/40"
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              <img
                src={profile.pfp.url || "/images/default_avatar.png"}
                alt={profile.userName}
                className="w-6 h-6 rounded-full object-cover shrink-0"
                referrerPolicy="no-referrer"
              />
              <span className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                {profile.userName || "Account"}
              </span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Start Studying
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="md:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 cursor-pointer"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Route Drawer */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-1">
          {[
            { href: "/dashboard", label: "Dashboard" },
            { href: "/materials", label: "All Materials" },
            { href: "/materials/flashcards", label: "Flashcards" },
            { href: "/materials/quizzes", label: "Quizzes" },
            { href: "/create", label: "Create Studio" },
            { href: "/reader", label: "PDF Reader" },
            { href: "/community", label: "Community Library" },
            { href: "/pricing", label: "Pricing" },
            { href: "/user", label: profile ? "Account & Settings" : "Sign In / Account" },
          ].map((item) => {
            const active = isRouteActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
