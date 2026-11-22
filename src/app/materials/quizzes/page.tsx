"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, HelpCircle, Play, Plus, Search, Share2, Sparkles, Trash2 } from "lucide-react";
import { useEfiqo } from "@/context/EfiqoContext";
import { STARTER_QUIZZES } from "@/types/efiqo";
import { Footer } from "@/components/Footer";

export default function QuizzesLibraryPage() {
  const { profile, isHydrated, deleteQuizSet, setIsAuthModalOpen, showToast } = useEfiqo();
  const [queryText, setQueryText] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!isHydrated) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-sm text-slate-500">
        Loading practice quizzes...
      </div>
    );
  }

  const quizzes = profile ? profile.quizzes : STARTER_QUIZZES;
  const term = queryText.trim().toLowerCase();
  const filtered = quizzes.filter(
    (q) =>
      !term ||
      q.name.toLowerCase().includes(term) ||
      q.desc.toLowerCase().includes(term) ||
      (q.subject || "").toLowerCase().includes(term)
  );

  const handleShare = async (id: string, name: string) => {
    const url = `${window.location.origin}/materials/quizzes/${encodeURIComponent(id)}?mode=attempt`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `efIQo · ${name}`,
          text: `Attempt ${name} with me on efIQo!`,
          url,
        });
        return;
      } catch {
        // Fallback
      }
    }
    await navigator.clipboard.writeText(url);
    showToast("Shareable quiz link copied to clipboard.", "success");
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
              <HelpCircle className="w-6 h-6 text-rose-600 shrink-0" />
              <span>Practice Quizzes</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {profile
                ? `${profile.quizzes.length}${profile.isPremiumUser ? "" : "/7"} quizzes in your library.`
                : "Test your recall on starter exams or sign in to create custom assessments."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/create?type=ai"
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Quiz</span>
            </Link>
            <Link
              href="/create?type=quiz"
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>New Quiz</span>
            </Link>
          </div>
        </div>

        {!profile && (
          <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-slate-700 dark:text-slate-300">
              Sign in to save attempt scores, author custom questions, and generate exams from PDFs.
            </p>
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold whitespace-nowrap cursor-pointer self-start sm:self-auto"
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
            placeholder="Search quizzes..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-10 text-center">
            <p className="text-sm text-slate-500 mb-4">No practice quizzes found.</p>
            <Link
              href="/create?type=quiz"
              className="inline-block px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold"
            >
              Create First Quiz
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((quiz) => {
              const canEdit = Boolean(profile && quiz.by === profile.email);
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
                    <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1 line-clamp-1">
                      {quiz.name}
                    </h2>
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
                      {canEdit ? (
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
                        onClick={() => handleShare(quiz.id, quiz.name)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        title="Share quiz"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>

                      {canEdit &&
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
      </main>

      <Footer />
    </div>
  );
}
