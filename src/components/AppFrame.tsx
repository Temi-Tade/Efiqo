"use client";

import React from "react";
import { Navbar } from "./Navbar";
import { GlobalModals } from "./Modals";
import { MobileBottomNav } from "./MobileBottomNav";

export function AppFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-clip flex flex-col pb-16 md:pb-0">
      <Navbar />
      <div className="flex-1 min-w-0 flex flex-col">{children}</div>
      <MobileBottomNav />
      <GlobalModals />
    </div>
  );
}
