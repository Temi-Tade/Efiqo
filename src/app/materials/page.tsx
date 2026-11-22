"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Clock,
  HelpCircle,
  Layers,
  Play,
  Plus,
  Search,
  Share2,
  Trash2,
  Upload,
} from "lucide-react";
import { useEfiqo } from "@/context/EfiqoContext";
import {
  capitalizeFirst,
  STARTER_FLASHCARDS,
  STARTER_QUIZZES,
  type FlashcardSet,
  type QuizSet,
} from "@/types/efiqo";
import { Footer } from "@/components/Footer";

export default function MaterialsPage() {
  const {
    profile,
    isHydrated,
    saveFlashcardSet,
    saveQuizSet,
    deleteFlashcardSet,
    deleteQuizSet,
    setIsAuthModalOpen,
    showToast,
  } = useEfiqo();

  const [queryText, setQueryText] = useState("");
  const [filter, setFilter] = useState<"all" | "flashcards" | "quizzes">("all");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!isHydrated) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-sm text-slate-500">
        Loading study materials...
      </div>
    );
  }

  const allFlashcards = profile ? profile.flashcards : STARTER_FLASHCARDS;
  const allQuizzes = profile ? profile.quizzes : STARTER_QUIZZES;

  const term = queryText.trim().toLowerCase();
  const filteredFlashcards = allFlashcards.filter(
    (f) =>
      !term ||
      f.name.toLowerCase().includes(term) ||
      f.desc.toLowerCase().includes(term) ||
      (f.subject || "").toLowerCase().includes(term)
  );
  const filteredQuizzes = allQuizzes.filter(
    (q) =>
      !term ||
      q.name.toLowerCase().includes(term) ||
      q.desc.toLowerCase().includes(term) ||
      (q.subject || "").toLowerCase().includes(term)
  );

  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile) {
      setIsAuthModalOpen(true);
      e.target.value = "";
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed.flashcards)) {
        const imported: FlashcardSet = {
          ...parsed,
          id: typeof crypto !== "undefined" ? crypto.randomUUID() : `imp-${Date.now()}`,
          name: capitalizeFirst(String(parsed.name || "Imported Flashcards")),
          by: profile.email,
          created: new Date().toUTCString(),
        };
        await saveFlashcardSet(imported);
        showToast(`Imported flashcard set "${imported.name}".`, "success");
      } else if (Array.isArray(parsed.questions)) {
        const imported: QuizSet = {
          ...parsed,
          id: typeof crypto !== "undefined" ? crypto.randomUUID() : `imp-${Date.now()}`,
          name: capitalizeFirst(String(parsed.name || "Imported Quiz")),
          by: profile.email,
          timeStamp: new Date().toUTCString(),
        };
        await saveQuizSet(imported);
        showToast(`Imported quiz "${imported.name}".`, "success");
      } else {
        showToast("JSON file does not match efIQo flashcard or quiz schema.", "error");
      }
    } catch {
      showToast("Could not parse JSON file.", "error");
    }
    e.target.value = "";
  };

  const handleShareItem = async (id: string, name: string, type: "flashcard" | "quiz") => {
    const path =
      type === "flashcard"
        ? `/materials/flashcards/${encodeURIComponent(id)}`
        : `/materials/quizzes/${encodeURIComponent(id)}?mode=attempt`;
    const url = `${window.location.origin}${path}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `efIQo · ${name}`,
          text: `Study ${name} with me on efIQo!`,
          url,
        });
        return;
      } catch {
        // Fallback to copy
      }
    }
    await navigator.clipboard.writeText(url);
    showToast("Shareable link copied to clipboard.", "success");
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10 space-y-8 min-w-0">
        {/* Header & Primary Actions */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 min-w-0">
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              {profile ? "Personal Study Library" : "Starter Study Library"}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Study Materials
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Organize your flashcard decks and practice quizzes, import JSON sets, or share links.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/create"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create New</span>
            </Link>

            <label className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0">
              <Upload className="w-4 h-4" />
              <span>Import JSON</span>
              <input
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={handleImportJson}
              />
            </label>

            <Link
              href="/community"
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>Community</span>
            </Link>
          </div>
        </div>

        {/* Guest Sign-In Callout */}
        {!profile && (
          <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/30 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Browsing Starter Materials
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Sign in with Google or Guest Mode to save your own decks, track card mastery, and sync progress.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer self-start sm:self-auto"
            >
              Sign In to Sync
            </button>
          </div>
        )}

        {/* Search & Segmented Type Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="Filter your flashcards and quizzes..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-slate-200/70 dark:bg-slate-800 w-fit max-w-full">
            {(
              [
                { id: "all", label: `All (${filteredFlashcards.length + filteredQuizzes.length})` },
                { id: "flashcards", label: `Flashcards (${filteredFlashcards.length})` },
                { id: "quizzes", label: `Quizzes (${filteredQuizzes.length})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
                  filter === tab.id
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Flashcard Decks Section */}
        {(filter === "all" || filter === "flashcards") && (
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white inline-flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Flashcard Decks ({filteredFlashcards.length})</span>
              </h2>
              <Link
                href="/materials/flashcards"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 whitespace-nowrap"
              >
                <span>Open Flashcards View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {filteredFlashcards.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center">
                <p className="text-sm text-slate-500 mb-3">
                  {term ? "No flashcard decks match your search." : "You have no flashcard decks yet."}
                </p>
                <Link
                  href="/create?type=flashcard"
                  className="inline-block px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold"
                >
                  Create Flashcard Deck
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFlashcards.map((deck) => {
                  const mastered = deck.flashcards.filter((c) => c.mastery === "mastered").length;
                  const canDelete = Boolean(profile && deck.by === profile.email);
                  return (
                    <div
                      key={deck.id}
                      className="min-w-0 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums truncate">
                          {deck.subject || "Flashcards"} · {deck.flashcards.length} cards · {mastered} mastered
                        </p>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 line-clamp-1">
                          {capitalizeFirst(deck.name)}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {deck.desc || "No description provided."}
                        </p>
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
                          {canDelete && (
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
                            onClick={() => handleShareItem(deck.id, deck.name, "flashcard")}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            title="Share deck"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>

                          {canDelete &&
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
          </section>
        )}

        {/* Practice Quizzes Section */}
        {(filter === "all" || filter === "quizzes") && (
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white inline-flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Practice Quizzes ({filteredQuizzes.length})</span>
              </h2>
              <Link
                href="/materials/quizzes"
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline inline-flex items-center gap-1 whitespace-nowrap"
              >
                <span>Open Quizzes View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {filteredQuizzes.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center">
                <p className="text-sm text-slate-500 mb-3">
                  {term ? "No quizzes match your search." : "You have no practice quizzes yet."}
                </p>
                <Link
                  href="/create?type=quiz"
                  className="inline-block px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold"
                >
                  Create Practice Quiz
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredQuizzes.map((quiz) => {
                  const canDelete = Boolean(profile && quiz.by === profile.email);
                  return (
                    <div
                      key={quiz.id}
                      className="min-w-0 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums truncate">
                          {quiz.subject || "Quiz"} · {quiz.questions.length} questions
                          {typeof quiz.lastScore === "number"
                            ? ` · Last: ${quiz.lastScore}/${quiz.questions.length}`
                            : ""}
                        </p>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 line-clamp-1">
                          {capitalizeFirst(quiz.name)}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {quiz.desc || "No description provided."}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/materials/quizzes/${encodeURIComponent(quiz.id)}?mode=attempt`}
                            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold inline-flex items-center gap-1 whitespace-nowrap"
                          >
                            <Play className="w-3 h-3" />
                            <span>Attempt</span>
                          </Link>
                          {canDelete ? (
                            <Link
                              href={`/materials/quizzes/${encodeURIComponent(quiz.id)}?mode=create`}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap"
                            >
                              Edit
                            </Link>
                          ) : (
                            <Link
                              href={`/materials/quizzes/${encodeURIComponent(quiz.id)}?mode=preview`}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1 whitespace-nowrap"
                            >
                              <Clock className="w-3 h-3" />
                              <span>Preview</span>
                            </Link>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleShareItem(quiz.id, quiz.name, "quiz")}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            title="Share quiz"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>

                          {canDelete &&
                            (confirmDeleteId === quiz.id ? (
                              <button
                                type="button"
                                onClick={() => {
                                  deleteQuizSet(quiz.id);
                                  setConfirmDeleteId(null);
                                }}
                                className="px-2 py-1 rounded-md bg-rose-600 text-white text-xs font-semibold cursor-pointer"
                              >
                                Confirm
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(quiz.id)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                                title="Delete quiz"
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
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
