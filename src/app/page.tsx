"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LandingPage } from "@/components/LandingPage";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const shareId = searchParams.get("share_id");
    const type = searchParams.get("type");
    if (!shareId) return;
    if (type === "flashcard") {
      router.replace(`/materials/flashcards/${encodeURIComponent(shareId)}`);
    } else if (type === "quiz") {
      router.replace(`/materials/quizzes/${encodeURIComponent(shareId)}?mode=attempt`);
    }
  }, [searchParams, router]);

  return <LandingPage />;
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
      <HomeContent />
    </Suspense>
  );
}
