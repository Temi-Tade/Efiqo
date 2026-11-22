"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Clock,
  FileText,
  Layers,
  Play,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";
import { useEfiqo } from "@/context/EfiqoContext";
import { AuthRequiredCard } from "@/components/AuthRequiredCard";
import { Footer } from "@/components/Footer";

export default function DashboardPage() {
  const { profile, isHydrated, pomodoroSessions } = useEfiqo();

  if (!isHydrated) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-sm text-slate-500">
        Loading workspace...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center py-10">
          <AuthRequiredCard
            title="Sign in to open your Dashboard"
            subtitle="Access your active recall flashcards, timed practice quizzes, and study mastery progress."
          />
        </div>
        <Footer />
      </div>
    );
  }

  const totalCards = profile.flashcards.reduce((acc, f) => acc + f.flashcards.length, 0);
  const masteredCards = profile.flashcards.reduce(
    (acc, f) => acc + f.flashcards.filter((c) => c.mastery === "mastered").length,
    0
  );
  const recentFlashcards = profile.flashcards.slice(0, 4);
  const recentQuizzes = profile.quizzes.slice(0, 4);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10 space-y-8 min-w-0">
        {/* Header & Primary Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 min-w-0">
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Workspace Overview · {profile.isPremiumUser ? "Premium Plan" : "Free Plan"}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white [overflow-wrap:anywhere]">
              Welcome back, {profile.userName || "Scholar"}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/create?type=ai"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate with Efi</span>
            </Link>
            <Link
              href="/create"
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create Study Set</span>
            </Link>
            <Link
              href="/reader"
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <FileText className="w-4 h-4" />
              <span>PDF Reader</span>
            </Link>
          </div>
        </div>

        {/* 4-Column Quantitative KPI Strip */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 min-w-0">
            <p className="text-xs text-slate-500 dark:text-slate-400">Flashcard Decks</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums mt-1">
              {profile.isPremiumUser ? profile.flashcards.length : `${profile.flashcards.length}/7`}
            </p>
          </div>
          <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 min-w-0">
            <p className="text-xs text-slate-500 dark:text-slate-400">Practice Quizzes</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums mt-1">
              {profile.isPremiumUser ? profile.quizzes.length : `${profile.quizzes.length}/7`}
            </p>
          </div>
          <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 min-w-0">
            <p className="text-xs text-slate-500 dark:text-slate-400">Cards Mastered</p>
            <p className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums mt-1">
              {masteredCards}/{totalCards}
            </p>
          </div>
          <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 min-w-0">
            <p className="text-xs text-slate-500 dark:text-slate-400">Focus Sprints</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums mt-1">
              {pomodoroSessions}
            </p>
          </div>
        </section>

        {/* Two-Column Study Materials Snapshot */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
          {/* Recent Flashcards */}
          <section className="min-w-0 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Layers className="w-4 h-4 text-blue-600 shrink-0" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
                  Flashcard Decks
                </h2>
              </div>
              <Link
                href="/materials/flashcards"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 whitespace-nowrap shrink-0"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentFlashcards.length === 0 ? (
              <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  No flashcard decks yet.
                </p>
                <Link
                  href="/create?type=flashcard"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold"
                >
                  Create First Deck
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {recentFlashcards.map((deck) => {
                  const mastered = deck.flashcards.filter((c) => c.mastery === "mastered").length;
                  return (
                    <div
                      key={deck.id}
                      className="p-4 sm:px-5 flex items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {deck.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate tabular-nums">
                          {deck.subject || "Flashcards"} · {deck.flashcards.length} cards · {mastered} mastered
                        </p>
                      </div>
                      <Link
                        href={`/materials/flashcards/${encodeURIComponent(deck.id)}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold whitespace-nowrap shrink-0"
                      >
                        Study
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Recent Quizzes */}
          <section className="min-w-0 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Clock className="w-4 h-4 text-rose-600 shrink-0" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
                  Practice Quizzes
                </h2>
              </div>
              <Link
                href="/materials/quizzes"
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline inline-flex items-center gap-1 whitespace-nowrap shrink-0"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentQuizzes.length === 0 ? (
              <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  No quizzes created yet.
                </p>
                <Link
                  href="/create?type=quiz"
                  className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold"
                >
                  Create First Quiz
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {recentQuizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="p-4 sm:px-5 flex items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {quiz.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate tabular-nums">
                        {quiz.subject || "Quiz"} · {quiz.questions.length} questions
                        {typeof quiz.lastScore === "number"
                          ? ` · Last: ${quiz.lastScore}/${quiz.questions.length}`
                          : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/materials/quizzes/${encodeURIComponent(quiz.id)}?mode=attempt`}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold inline-flex items-center gap-1 whitespace-nowrap"
                      >
                        <Play className="w-3 h-3" />
                        <span>Attempt</span>
                      </Link>
                      <Link
                        href={`/materials/quizzes/${encodeURIComponent(quiz.id)}?mode=create`}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Dedicated Route Shortcuts */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 min-w-0">
          <Link
            href="/materials"
            className="min-w-0 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <BookOpen className="w-5 h-5 text-blue-600 mb-3" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Full Materials Library</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Filter, import JSON, share links, and organize all flashcards and quizzes.
            </p>
          </Link>

          <Link
            href="/community"
            className="min-w-0 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <Search className="w-5 h-5 text-emerald-600 mb-3" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Community Library</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Browse shared decks and practice assessments across subjects.
            </p>
          </Link>

          <Link
            href="/user"
            className="min-w-0 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <FileText className="w-5 h-5 text-rose-600 mb-3" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Account &amp; Plan</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Manage your scholar profile, appearance theme, and membership status.
            </p>
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
