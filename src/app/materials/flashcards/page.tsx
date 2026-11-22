"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Layers, Plus, Search, Share2, Sparkles, Trash2 } from "lucide-react";
import { useEfiqo } from "@/context/EfiqoContext";
import { capitalizeFirst, STARTER_FLASHCARDS } from "@/types/efiqo";
import { Footer } from "@/components/Footer";

export default function FlashcardsLibraryPage() {
  const { profile, isHydrated, deleteFlashcardSet, setIsAuthModalOpen, showToast } = useEfiqo();
  const [queryText, setQueryText] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!isHydrated) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-sm text-slate-500">
        Loading flashcard decks...
      </div>
    );
  }

  const decks = profile ? profile.flashcards : STARTER_FLASHCARDS;
  const term = queryText.trim().toLowerCase();
  const filtered = decks.filter(
    (d) =>
      !term ||
      d.name.toLowerCase().includes(term) ||
      d.desc.toLowerCase().includes(term) ||
      (d.subject || "").toLowerCase().includes(term)
  );

  const handleShare = async (id: string, name: string) => {
    const url = `${window.location.origin}/materials/flashcards/${encodeURIComponent(id)}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `efIQo · ${name}`,
          text: `Study ${name} with me on efIQo!`,
          url,
        });
        return;
      } catch {
        // Fallback
      }
    }
    await navigator.clipboard.writeText(url);
    showToast("Shareable deck link copied to clipboard.", "success");
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10 space-y-6 min-w-0">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 min-w-0">
          <div className="min-w-0">
            <Link
              href="/materials"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Materials</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <Layers className="w-6 h-6 text-blue-600 shrink-0" />
              <span>Flashcard Decks</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {profile
                ? `${profile.flashcards.length}${profile.isPremiumUser ? "" : "/7"} decks in your library.`
                : "Practice starter decks or sign in to create unlimited custom sets."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/create?type=ai"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Deck</span>
            </Link>
            <Link
              href="/create?type=flashcard"
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>New Deck</span>
            </Link>
          </div>
        </div>

        {!profile && (
          <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-slate-700 dark:text-slate-300">
              Sign in to save mastery ratings, attach diagrams, and author your own decks.
            </p>
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold whitespace-nowrap cursor-pointer self-start sm:self-auto"
            >
              Sign In
            </button>
          </div>
        )}

        <div className="relative max-w-md min-w-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="Search flashcard decks..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-10 text-center">
            <p className="text-sm text-slate-500 mb-4">No flashcard decks found.</p>
            <Link
              href="/create?type=flashcard"
              className="inline-block px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold"
            >
              Create New Flashcard Deck
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((deck) => {
              const total = deck.flashcards.length;
              const mastered = deck.flashcards.filter((c) => c.mastery === "mastered").length;
              const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;
              const canEdit = Boolean(profile && deck.by === profile.email);

              return (
                <div
                  key={deck.id}
                  className="min-w-0 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="min-w-0 space-y-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums truncate">
                      {deck.subject || "Flashcards"} · {total} cards · {mastered} mastered
                    </p>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                      {capitalizeFirst(deck.name)}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {deck.desc || "No description provided."}
                    </p>
                    <div className="pt-1">
                      <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/materials/flashcards/${encodeURIComponent(deck.id)}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold inline-flex items-center gap-1 whitespace-nowrap"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>Study</span>
                      </Link>
                      {canEdit && (
                        <Link
                          href={`/materials/flashcards/${encodeURIComponent(deck.id)}?edit=1`}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap"
                        >
                          Edit
                        </Link>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleShare(deck.id, deck.name)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        title="Share deck"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>

                      {canEdit &&
                        (confirmDeleteId === deck.id ? (
                          <button
                            type="button"
                            onClick={() => {
                              deleteFlashcardSet(deck.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-2 py-1 rounded-md bg-rose-600 text-white text-xs font-semibold cursor-pointer"
                          >
                            Confirm
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(deck.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                            title="Delete deck"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
