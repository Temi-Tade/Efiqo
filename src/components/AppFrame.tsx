"use client";

import React from "react";
import { Navbar } from "./Navbar";
import { GlobalModals } from "./Modals";

export function AppFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-clip flex flex-col">
      <Navbar />
      <div className="flex-1 min-w-0 flex flex-col">{children}</div>
      <GlobalModals />
    </div>
  );
}
