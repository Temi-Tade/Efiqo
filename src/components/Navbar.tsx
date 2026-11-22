"use client";

import React from "react";
import { useEfiqo } from "@/context/EfiqoContext";

export function Navbar() {
  const {
    profile,
    activeStudio,
    setActiveStudio,
    setIsAuthModalOpen,
    setIsProfileModalOpen,
    setIsSearchModalOpen,
  } = useEfiqo();

  if (profile) {
    return (
      <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800/80 bg-[#F7F8FA]/90 dark:bg-[#0B0F19]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          <button
            type="button"
            onClick={() => setActiveStudio({ type: "overview" })}
            className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 cursor-pointer"
          >
            <img
              src="/images/efIQo_logo.png"
              alt="efIQo mark"
              className="w-7 h-7 object-contain"
              referrerPolicy="no-referrer"
            />
            <span>efIQo</span>
          </button>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <button
              type="button"
              onClick={() => setActiveStudio({ type: "overview" })}
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 dark:hover:text-white cursor-pointer ${
                activeStudio.type === "overview"
                  ? "text-blue-600 dark:text-blue-400 underline underline-offset-8 decoration-2"
                  : ""
              }`}
            >
              Library
            </button>
            <button
              type="button"
              onClick={() => setActiveStudio({ type: "flashcard", set: null, isNew: true })}
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 dark:hover:text-white cursor-pointer ${
                activeStudio.type === "flashcard"
                  ? "text-blue-600 dark:text-blue-400 underline underline-offset-8 decoration-2"
                  : ""
              }`}
            >
              Flashcard Studio
            </button>
            <button
              type="button"
              onClick={() => setActiveStudio({ type: "quiz", set: null, initialMode: "create", isNew: true })}
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 dark:hover:text-white cursor-pointer ${
                activeStudio.type === "quiz"
                  ? "text-blue-600 dark:text-blue-400 underline underline-offset-8 decoration-2"
                  : ""
              }`}
            >
              Quiz Studio
            </button>
            <button
              type="button"
              onClick={() => setActiveStudio({ type: "reader" })}
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 dark:hover:text-white cursor-pointer ${
                activeStudio.type === "reader"
                  ? "text-blue-600 dark:text-blue-400 underline underline-offset-8 decoration-2"
                  : ""
              }`}
            >
              PDF Reader
            </button>
            <button
              type="button"
              onClick={() => setIsSearchModalOpen(true)}
              className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              Community
            </button>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <img
                src={profile.pfp.url || "/images/default_avatar.png"}
                alt={profile.userName}
                className="w-6 h-6 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100 max-w-[120px] truncate">
                {profile.userName || "Account"}
              </span>
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800/80 bg-[#F7F8FA]/90 dark:bg-[#0B0F19]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        <a
          href="#top"
          className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0"
        >
          <img
            src="/images/efIQo_logo.png"
            alt="efIQo mark"
            className="w-7 h-7 object-contain"
            referrerPolicy="no-referrer"
          />
          <span>efIQo</span>
        </a>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
          <a href="#toolkit" className="hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-8 whitespace-nowrap shrink-0">
            Toolkit
          </a>
          <a href="#demo" className="hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-8 whitespace-nowrap shrink-0">
            Interactive Demo
          </a>
          <a href="#workflow" className="hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-8 whitespace-nowrap shrink-0">
            Workflow
          </a>
          <a href="#pricing" className="hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-8 whitespace-nowrap shrink-0">
            Pricing
          </a>
          <a href="#faq" className="hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-8 whitespace-nowrap shrink-0">
            FAQ
          </a>
        </nav>

        <div className="shrink-0">
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Start Studying
          </button>
        </div>
      </div>
    </header>
  );
}
