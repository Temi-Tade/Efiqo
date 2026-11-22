"use client";

import React, { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { LandingPage } from "@/components/LandingPage";
import { WorkspaceDashboard } from "@/components/WorkspaceDashboard";
import { GlobalModals } from "@/components/Modals";
import { useEfiqo } from "@/context/EfiqoContext";
import { fetchCommunityLibrary } from "@/lib/firebase";

function AppShell() {
  const { profile, isHydrated, setActiveStudio, handleSignIn, showToast } = useEfiqo();
  const searchParams = useSearchParams();

  useEffect(() => {
    const shareId = searchParams.get("share_id");
    const type = searchParams.get("type");
    if (!shareId || (type !== "flashcard" && type !== "quiz")) return;

    const loadShared = async () => {
      const lib = await fetchCommunityLibrary();
      if (!profile) {
        await handleSignIn("local");
      }
      if (type === "flashcard") {
        const match = lib.flashcards.find((f) => f.id === shareId);
        if (match) {
          setActiveStudio({ type: "flashcard", set: match });
        } else {
          showToast("Shared flashcard set could not be found.", "error");
        }
      } else if (type === "quiz") {
        const match = lib.quizzes.find((q) => q.id === shareId);
        if (match) {
          setActiveStudio({ type: "quiz", set: match, initialMode: "attempt" });
        } else {
          showToast("Shared quiz could not be found.", "error");
        }
      }
    };
    loadShared();
  }, [searchParams, profile, handleSignIn, setActiveStudio, showToast]);

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-clip flex flex-col">
      <Navbar />
      {!isHydrated ? (
        <div className="flex-1 flex items-center justify-center p-12 text-sm text-slate-500">
          Loading efIQo...
        </div>
      ) : profile ? (
        <WorkspaceDashboard />
      ) : (
        <LandingPage />
      )}
      <GlobalModals />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">
          Loading efIQo...
        </div>
      }
    >
      <AppShell />
    </Suspense>
  );
}
