"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEfiqo } from "@/context/EfiqoContext";
import { fetchCommunityLibrary } from "@/lib/firebase";
import { STARTER_QUIZZES, type QuizSet } from "@/types/efiqo";
import { QuizStudio } from "@/components/QuizStudio";
import { Footer } from "@/components/Footer";

function QuizDetailContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const quizId = decodeURIComponent(params.id || "");
  const rawMode = searchParams.get("mode");

  const { profile, isHydrated } = useEfiqo();
  const [remoteLookup, setRemoteLookup] = useState<{
    id: string;
    quiz: QuizSet | null;
  } | null>(null);

  const localQuiz =
    profile?.quizzes.find((q) => q.id === quizId) ??
    STARTER_QUIZZES.find((q) => q.id === quizId) ??
    null;

  useEffect(() => {
    if (!isHydrated || localQuiz) return;
    let active = true;

    fetchCommunityLibrary()
      .then((res) => {
        if (!active) return;
        const found = res.quizzes.find((q) => q.id === quizId) || null;
        setRemoteLookup({ id: quizId, quiz: found });
      })
      .catch(() => {
        if (active) setRemoteLookup({ id: quizId, quiz: null });
      });

    return () => {
      active = false;
    };
  }, [quizId, isHydrated, localQuiz]);

  const searching = isHydrated && !localQuiz && remoteLookup?.id !== quizId;
  const resolvedQuiz = localQuiz ?? (remoteLookup?.id === quizId ? remoteLookup.quiz : null);

  if (!isHydrated || searching) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 gap-2 text-sm text-slate-500">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Loading practice quiz...</span>
      </div>
    );
  }

  if (!resolvedQuiz) {
    return (
      <div className="flex-1 flex flex-col">
        <main className="flex-1 max-w-xl mx-auto w-full px-4 py-16 text-center space-y-4">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Quiz Not Found
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            This quiz may have been removed or the link is no longer valid.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/materials/quizzes"
              className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Quizzes</span>
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

  const resolvedMode: "create" | "preview" | "attempt" =
    rawMode === "attempt"
      ? "attempt"
      : rawMode === "create"
      ? "create"
      : rawMode === "preview"
      ? "preview"
      : resolvedQuiz.questions.length > 0
      ? "preview"
      : "create";

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 min-w-0">
        <QuizStudio
          key={`${resolvedQuiz.id}-${resolvedMode}`}
          initialSet={resolvedQuiz}
          initialMode={resolvedMode}
        />
      </main>
      <Footer />
    </div>
  );
}

export default function QuizDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-12 text-sm text-slate-500">
          Loading practice quiz...
        </div>
      }
    >
      <QuizDetailContent />
    </Suspense>
  );
}
