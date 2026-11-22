"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEfiqo } from "@/context/EfiqoContext";
import { fetchCommunityLibrary } from "@/lib/firebase";
import { STARTER_FLASHCARDS, type FlashcardSet } from "@/types/efiqo";
import { FlashcardStudio } from "@/components/FlashcardStudio";
import { Footer } from "@/components/Footer";

function FlashcardDetailContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const deckId = decodeURIComponent(params.id || "");
  const initialEdit = searchParams.get("edit") === "1";

  const { profile, isHydrated } = useEfiqo();
  const [remoteLookup, setRemoteLookup] = useState<{
    id: string;
    deck: FlashcardSet | null;
  } | null>(null);

  const localDeck =
    profile?.flashcards.find((f) => f.id === deckId) ??
    STARTER_FLASHCARDS.find((f) => f.id === deckId) ??
    null;

  useEffect(() => {
    if (!isHydrated || localDeck) return;
    let active = true;

    fetchCommunityLibrary()
      .then((res) => {
        if (!active) return;
        const found = res.flashcards.find((f) => f.id === deckId) || null;
        setRemoteLookup({ id: deckId, deck: found });
      })
      .catch(() => {
        if (active) setRemoteLookup({ id: deckId, deck: null });
      });

    return () => {
      active = false;
    };
  }, [deckId, isHydrated, localDeck]);

  const searching = isHydrated && !localDeck && remoteLookup?.id !== deckId;
  const resolvedDeck = localDeck ?? (remoteLookup?.id === deckId ? remoteLookup.deck : null);

  if (!isHydrated || searching) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 gap-2 text-sm text-slate-500">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Loading flashcard deck...</span>
      </div>
    );
  }

  if (!resolvedDeck) {
    return (
      <div className="flex-1 flex flex-col">
        <main className="flex-1 max-w-xl mx-auto w-full px-4 py-16 text-center space-y-4">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Flashcard Deck Not Found
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            This deck may have been deleted or the share link is incorrect.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/materials/flashcards"
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Flashcards</span>
            </Link>
            <Link
              href="/community"
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              Browse Community
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 min-w-0">
        <FlashcardStudio
          key={`${resolvedDeck.id}-${initialEdit ? "edit" : "study"}`}
          initialSet={resolvedDeck}
          initialEdit={initialEdit}
        />
      </main>
      <Footer />
    </div>
  );
}

export default function FlashcardDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-12 text-sm text-slate-500">
          Loading flashcard deck...
        </div>
      }
    >
      <FlashcardDetailContent />
    </Suspense>
  );
}
