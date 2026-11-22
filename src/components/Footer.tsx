"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, Laptop, Moon, Share2, Sun } from "lucide-react";
import { useEfiqo } from "@/context/EfiqoContext";

export function Footer() {
  const { theme, cycleTheme, setIsTermsOpen, showToast } = useEfiqo();

  const handleShareSite = async () => {
    const url = typeof window !== "undefined" ? window.location.origin : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "efIQo",
          text: "Make your study sessions more engaging with efIQo, your all-in-one study toolkit!",
          url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      showToast("Link copied to clipboard.", "success");
    }
  };

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-[#F7F8FA] dark:bg-[#0B0F19] py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <img src="/images/efIQo_logo.png" alt="efIQo" className="w-6 h-6 object-contain" />
            <span className="text-lg font-bold text-slate-900 dark:text-white">efIQo</span>
          </Link>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            &copy; TenderLuxe Tech. Enterprises {new Date().getFullYear()}. All rights reserved.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 text-xs font-medium text-slate-600 dark:text-slate-300">
          <Link href="/dashboard" className="hover:text-slate-900 dark:hover:text-white">
            Dashboard
          </Link>
          <Link href="/materials" className="hover:text-slate-900 dark:hover:text-white">
            Materials
          </Link>
          <Link href="/create" className="hover:text-slate-900 dark:hover:text-white">
            Create
          </Link>
          <Link href="/community" className="hover:text-slate-900 dark:hover:text-white">
            Community
          </Link>
          <Link href="/pricing" className="hover:text-slate-900 dark:hover:text-white">
            Pricing
          </Link>
          <button
            type="button"
            onClick={cycleTheme}
            className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            {theme === "light" ? (
              <Sun className="w-3.5 h-3.5" />
            ) : theme === "dark" ? (
              <Moon className="w-3.5 h-3.5" />
            ) : (
              <Laptop className="w-3.5 h-3.5" />
            )}
            <span className="capitalize">Theme: {theme}</span>
          </button>
          <button
            type="button"
            onClick={handleShareSite}
            className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share efIQo</span>
          </button>
          <a
            href="https://buymeacoffee.com/temiloluwa"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Support</span>
          </a>
          <button
            type="button"
            onClick={() => setIsTermsOpen(true)}
            className="hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            Terms
          </button>
        </div>
      </div>
    </footer>
  );
}
