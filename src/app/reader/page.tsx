"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PdfReaderStudio } from "@/components/PdfReaderStudio";
import { Footer } from "@/components/Footer";

export default function ReaderPage() {
  return (
    <div className="flex-1 flex flex-col min-w-0">
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-6 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              PDF Focus Reader &amp; Pomodoro Timer
            </h1>
          </div>
        </div>

        <PdfReaderStudio />
      </main>

      <Footer />
    </div>
  );
}
