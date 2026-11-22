"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, HelpCircle, Loader2, Search } from "lucide-react";
import { fetchCommunityLibrary } from "@/lib/firebase";
import type { FlashcardSet, QuizSet } from "@/types/efiqo";
import { Footer } from "@/components/Footer";

export default function CommunityPage() {
  const [queryText, setQueryText] = useState("");
  const [filter, setFilter] = useState<"all" | "flashcards" | "quizzes">("all");
  const [loading, setLoading] = useState(true);
  const [flashcards, setFlashcards] = useState<FlashcardSet[]>([]);
  const [quizzes, setQuizzes] = useState<QuizSet[]>([]);

  useEffect(() => {
    fetchCommunityLibrary()
      .then((res) => {
        setFlashcards(res.flashcards);
        setQuizzes(res.quizzes);
      })
      .finally(() => setLoading(false));
  }, []);

  const term = queryText.trim().toLowerCase();
  const filteredFlashcards = flashcards.filter(
    (f) =>
      !term ||
      f.name.toLowerCase().includes(term) ||
      f.desc.toLowerCase().includes(term) ||
      (f.subject || "").toLowerCase().includes(term)
  );
  const filteredQuizzes = quizzes.filter(
    (q) =>
      !term ||
      q.name.toLowerCase().includes(term) ||
      q.desc.toLowerCase().includes(term) ||
      (q.subject || "").toLowerCase().includes(term)
  );

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10 space-y-6 min-w-0">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Community Study Library
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Explore public flashcard decks and practice quizzes shared across efIQo.
            </p>
          </div>
          <Link
            href="/create"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold whitespace-nowrap self-start md:self-auto"
          >
            Create Your Own Set
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="Search by title, subject, or description..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-slate-200/70 dark:bg-slate-800 w-fit max-w-full">
            {(
              [
                { id: "all", label: "All" },
                { id: "flashcards", label: `Flashcards (${filteredFlashcards.length})` },
                { id: "quizzes", label: `Quizzes (${filteredQuizzes.length})` },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setFilter(t.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer whitespace-nowrap ${
                  filter === t.id
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex items-center justify-center gap-2 text-sm text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading community library...</span>
          </div>
        ) : (
          <div className="space-y-8">
            {(filter === "all" || filter === "flashcards") && (
              <section className="space-y-3">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white inline-flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Flashcard Sets ({filteredFlashcards.length})</span>
                </h2>
                {filteredFlashcards.length === 0 ? (
                  <p className="text-sm text-slate-500 py-4">No matching community flashcard decks.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredFlashcards.map((deck) => (
                      <Link
                        key={deck.id}
                        href={`/materials/flashcards/${encodeURIComponent(deck.id)}`}
                        className="min-w-0 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-blue-500/60 transition-colors flex flex-col justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                            {deck.subject || "Flashcards"} · {deck.flashcards.length} cards
                          </p>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 line-clamp-1">
                            {deck.name}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {deck.desc || "Shared community flashcard deck."}
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                          Study Deck &rarr;
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            )}

            {(filter === "all" || filter === "quizzes") && (
              <section className="space-y-3">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white inline-flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-rose-600" />
                  <span>Practice Quizzes ({filteredQuizzes.length})</span>
                </h2>
                {filteredQuizzes.length === 0 ? (
                  <p className="text-sm text-slate-500 py-4">No matching community quizzes.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredQuizzes.map((quiz) => (
                      <Link
                        key={quiz.id}
                        href={`/materials/quizzes/${encodeURIComponent(quiz.id)}?mode=attempt`}
                        className="min-w-0 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-rose-500/60 transition-colors flex flex-col justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                            {quiz.subject || "Quiz"} · {quiz.questions.length} questions
                          </p>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 line-clamp-1">
                            {quiz.name}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {quiz.desc || "Shared multiple-choice assessment."}
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                          Attempt Quiz &rarr;
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
