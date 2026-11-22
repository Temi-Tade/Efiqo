"use client";

import React from "react";
import { useEfiqo } from "@/context/EfiqoContext";
import { Navbar } from "./Navbar";
import { GlobalModals } from "./Modals";
import { MobileBottomNav } from "./MobileBottomNav";

export function AppFrame({ children }: { children: React.ReactNode }) {
  const { profile, isHydrated } = useEfiqo();
  const hasBottomNav = Boolean(isHydrated && profile);

  return (
    <div
      className={`min-h-screen w-full min-w-0 overflow-x-clip flex flex-col ${
        hasBottomNav ? "pb-16 md:pb-0" : ""
      }`}
    >
      <Navbar />
      <div className="flex-1 min-w-0 flex flex-col">{children}</div>
      <MobileBottomNav />
      <GlobalModals />
    </div>
  );
}
