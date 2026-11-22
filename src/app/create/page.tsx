"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  HelpCircle,
  Layers,
  Loader2,
  Sparkles,
  Upload,
} from "lucide-react";
import { useEfiqo } from "@/context/EfiqoContext";
import { PLAN_LIMITS, type FlashcardSet, type QuizSet } from "@/types/efiqo";
import { AuthRequiredCard } from "@/components/AuthRequiredCard";
import { Footer } from "@/components/Footer";

function CreateStudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialParam = searchParams.get("type");
  const initialTab: "flashcard" | "quiz" | "ai" =
    initialParam === "quiz" ? "quiz" : initialParam === "ai" ? "ai" : "flashcard";

  const { profile, isHydrated, saveFlashcardSet, saveQuizSet, openPremiumModal, showToast } = useEfiqo();

  const [tab, setTab] = useState<"flashcard" | "quiz" | "ai">(initialTab);

  // Manual Flashcard State
  const [fcTitle, setFcTitle] = useState("");
  const [fcSubject, setFcSubject] = useState("");
  const [fcDesc, setFcDesc] = useState("");

  // Manual Quiz State
  const [qzTitle, setQzTitle] = useState("");
  const [qzSubject, setQzSubject] = useState("");
  const [qzDesc, setQzDesc] = useState("");

  // Efi AI State
  const [aiKind, setAiKind] = useState<"flashcard" | "quiz">("flashcard");
  const [aiSourceType, setAiSourceType] = useState<"topic" | "pdf">("topic");
  const [aiCourse, setAiCourse] = useState("");
  const [aiTopic, setAiTopic] = useState("");
  const [aiCount, setAiCount] = useState(8);
  const [aiPdf, setAiPdf] = useState<File | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  if (!isHydrated) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-sm text-slate-500">
        Loading creation studio...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center py-10">
          <AuthRequiredCard
            title="Sign in to create study materials"
            subtitle="Author custom flashcard decks, timed quizzes, or synthesize sets from your lecture PDFs with Efi."
          />
        </div>
        <Footer />
      </div>
    );
  }

  const handleCreateFlashcard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.isPremiumUser && profile.flashcards.length >= 7) {
      openPremiumModal("Free Flashcard Set Quota Reached (7/7)");
      return;
    }
    const created: FlashcardSet = {
      id: typeof crypto !== "undefined" ? crypto.randomUUID() : `fc-${Date.now()}`,
      name: fcTitle.trim(),
      desc: fcDesc.trim(),
      subject: fcSubject.trim() || "General",
      flashcards: [],
      number: 0,
      created: new Date().toUTCString(),
      by: profile.email,
      mode: "edit",
    };
    await saveFlashcardSet(created);
    showToast("Flashcard deck created. Add your cards now.", "success");
    router.push(`/materials/flashcards/${encodeURIComponent(created.id)}?edit=1`);
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.isPremiumUser && profile.quizzes.length >= 7) {
      openPremiumModal("Free Quiz Quota Reached (7/7)");
      return;
    }
    const created: QuizSet = {
      id: typeof crypto !== "undefined" ? crypto.randomUUID() : `qz-${Date.now()}`,
      name: qzTitle.trim(),
      desc: qzDesc.trim(),
      subject: qzSubject.trim() || "General",
      questions: [],
      mode: "create",
      timeStamp: new Date().toUTCString(),
      by: profile.email,
    };
    await saveQuizSet(created);
    showToast("Quiz created. Add your first question now.", "success");
    router.push(`/materials/quizzes/${encodeURIComponent(created.id)}?mode=create`);
  };

  const readFileBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const res = String(reader.result || "");
        resolve(res.split(",")[1] || "");
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleGenerateWithEfi = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiError("");

    if (!profile.isPremiumUser) {
      if (aiKind === "flashcard" && profile.flashcards.length >= 7) {
        openPremiumModal("Free Flashcard Set Quota Reached (7/7)");
        return;
      }
      if (aiKind === "quiz" && profile.quizzes.length >= 7) {
        openPremiumModal("Free Quiz Quota Reached (7/7)");
        return;
      }
    }

    const maxItems = profile.isPremiumUser
      ? PLAN_LIMITS.premium.maxItemsPerSet
      : PLAN_LIMITS.free.maxItemsPerSet;
    const maxPdfMb = profile.isPremiumUser
      ? PLAN_LIMITS.premium.maxPdfMb
      : PLAN_LIMITS.free.maxPdfMb;

    if (aiCount > maxItems) {
      if (!profile.isPremiumUser) {
        openPremiumModal(`Free Plan supports up to ${maxItems} items per set. Upgrade for up to 50.`);
      } else {
        setAiError(`Premium sets support up to ${maxItems} items per generation.`);
      }
      return;
    }

    if (aiSourceType === "pdf") {
      if (!aiPdf) {
        setAiError(`Please select a PDF document (max ${maxPdfMb} MB).`);
        return;
      }
      if (aiPdf.size > maxPdfMb * 1024 * 1024 || aiPdf.type !== "application/pdf") {
        setAiError(
          `Document must be a PDF under ${maxPdfMb} MB${
            !profile.isPremiumUser ? " on the Free plan (15 MB on Premium)" : ""
          }.`
        );
        return;
      }
    }

    setAiLoading(true);
    try {
      let fileData = "";
      let mimeType = "";
      if (aiSourceType === "pdf" && aiPdf) {
        fileData = await readFileBase64(aiPdf);
        mimeType = aiPdf.type;
      }

      const endpoint = aiKind === "flashcard" ? "/api/generate/flashcards" : "/api/generate/quiz";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course: aiCourse,
          topic: aiSourceType === "topic" ? aiTopic : "",
          number: aiCount,
          isPremium: profile.isPremiumUser,
          fileData,
          mimeType,
        }),
      });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.error || "Failed to generate study material.");
      }

      if (aiKind === "flashcard") {
        const items = (payload as Array<{ term: string; def: string }>).map((item, i) => ({
          id: `${Date.now()}-${i}`,
          term: item.term,
          def: item.def,
          mastery: "new" as const,
        }));
        const created: FlashcardSet = {
          id: typeof crypto !== "undefined" ? crypto.randomUUID() : `fc-${Date.now()}`,
          name: aiSourceType === "pdf" ? aiCourse : aiTopic || aiCourse,
          desc: aiSourceType === "pdf" ? `Synthesized from ${aiPdf?.name}` : `${aiCourse} · ${aiTopic}`,
          subject: aiCourse,
          flashcards: items,
          number: items.length,
          created: new Date().toUTCString(),
          by: profile.email,
          mode: "study",
        };
        await saveFlashcardSet(created);
        showToast(`Efi generated ${items.length} flashcards.`, "success");
        router.push(`/materials/flashcards/${encodeURIComponent(created.id)}`);
      } else {
        const questions = payload as QuizSet["questions"];
        const created: QuizSet = {
          id: typeof crypto !== "undefined" ? crypto.randomUUID() : `qz-${Date.now()}`,
          name: aiSourceType === "pdf" ? aiCourse : aiTopic || aiCourse,
          desc: aiSourceType === "pdf" ? `Synthesized from ${aiPdf?.name}` : `${aiCourse} · ${aiTopic}`,
          subject: aiCourse,
          questions,
          mode: "preview",
          timeStamp: new Date().toUTCString(),
          by: profile.email,
        };
        await saveQuizSet(created);
        showToast(`Efi generated ${questions.length} quiz questions.`, "success");
        router.push(`/materials/quizzes/${encodeURIComponent(created.id)}?mode=preview`);
      }
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Could not generate study set.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed.flashcards)) {
        const imported: FlashcardSet = {
          ...parsed,
          id: typeof crypto !== "undefined" ? crypto.randomUUID() : `imp-${Date.now()}`,
          by: profile.email,
          created: new Date().toUTCString(),
        };
        await saveFlashcardSet(imported);
        showToast(`Imported "${imported.name}".`, "success");
        router.push(`/materials/flashcards/${encodeURIComponent(imported.id)}`);
      } else if (Array.isArray(parsed.questions)) {
        const imported: QuizSet = {
          ...parsed,
          id: typeof crypto !== "undefined" ? crypto.randomUUID() : `imp-${Date.now()}`,
          by: profile.email,
          timeStamp: new Date().toUTCString(),
        };
        await saveQuizSet(imported);
        showToast(`Imported "${imported.name}".`, "success");
        router.push(`/materials/quizzes/${encodeURIComponent(imported.id)}?mode=preview`);
      } else {
        showToast("JSON does not match efIQo flashcard or quiz schema.", "error");
      }
    } catch {
      showToast("Could not parse JSON file.", "error");
    }
    e.target.value = "";
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10 space-y-6 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Creation Studio
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Build a custom deck, author a multiple-choice quiz, or synthesize material with Efi.
            </p>
          </div>

          <label className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold inline-flex items-center gap-2 cursor-pointer shrink-0">
            <Upload className="w-4 h-4" />
            <span>Import JSON</span>
            <input type="file" accept="application/json,.json" className="hidden" onChange={handleImportJson} />
          </label>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 rounded-xl bg-slate-200/70 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setTab("flashcard")}
            className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              tab === "flashcard"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Flashcard Deck</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("quiz")}
            className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              tab === "quiz"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <HelpCircle className="w-4 h-4 text-rose-600" />
            <span>Practice Quiz</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("ai")}
            className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              tab === "ai"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Generate with Efi</span>
          </button>
        </div>

        {/* Tab Forms */}
        {tab === "flashcard" && (
          <form
            onSubmit={handleCreateFlashcard}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-5"
          >
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">New Flashcard Set</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Name your deck first, then add terms, definitions, and reference diagrams.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="min-w-0">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Deck Title (min. 4 characters)
                </label>
                <input
                  type="text"
                  required
                  minLength={4}
                  value={fcTitle}
                  onChange={(e) => setFcTitle(e.target.value)}
                  placeholder="e.g. Renal Physiology & Fluid Balance"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                />
              </div>

              <div className="min-w-0">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Course / Subject (Optional)
                </label>
                <input
                  type="text"
                  value={fcSubject}
                  onChange={(e) => setFcSubject(e.target.value)}
                  placeholder="e.g. Medicine"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Description (Optional)
              </label>
              <textarea
                rows={3}
                value={fcDesc}
                onChange={(e) => setFcDesc(e.target.value)}
                placeholder="Key mechanisms, equations, and clinical correlations..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={fcTitle.trim().length < 4}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm cursor-pointer"
            >
              Create &amp; Add Cards
            </button>
          </form>
        )}

        {tab === "quiz" && (
          <form
            onSubmit={handleCreateQuiz}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-5"
          >
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">New Practice Quiz</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Configure your quiz details, then author multiple-choice questions and answers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="min-w-0">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Quiz Title
                </label>
                <input
                  type="text"
                  required
                  value={qzTitle}
                  onChange={(e) => setQzTitle(e.target.value)}
                  placeholder="e.g. Organic Chemistry Midterm Mock"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                />
              </div>

              <div className="min-w-0">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Course / Subject (Optional)
                </label>
                <input
                  type="text"
                  value={qzSubject}
                  onChange={(e) => setQzSubject(e.target.value)}
                  placeholder="e.g. Chemistry"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Description (Optional)
              </label>
              <textarea
                rows={3}
                value={qzDesc}
                onChange={(e) => setQzDesc(e.target.value)}
                placeholder="Topics covered, exam rules, or notes..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={!qzTitle.trim()}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold text-sm cursor-pointer"
            >
              Create &amp; Author Questions
            </button>
          </form>
        )}

        {tab === "ai" && (
          <form
            onSubmit={handleGenerateWithEfi}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-5"
          >
            <div className="flex items-center gap-3">
              <img src="/images/Efi2.png" alt="Efi" className="w-10 h-10 object-contain shrink-0" />
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Synthesize Study Material with Efi
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Generate structured flashcards or 4-option exam questions from a topic or PDF (
                  {profile.isPremiumUser ? "15 MB max" : "5 MB max on Free"}).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  Output Format
                </label>
                <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => setAiKind("flashcard")}
                    className={`py-2 rounded-md text-xs font-semibold cursor-pointer ${
                      aiKind === "flashcard"
                        ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Flashcard Deck
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiKind("quiz")}
                    className={`py-2 rounded-md text-xs font-semibold cursor-pointer ${
                      aiKind === "quiz"
                        ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Practice Quiz
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  Source Material
                </label>
                <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => setAiSourceType("topic")}
                    className={`py-2 rounded-md text-xs font-semibold cursor-pointer ${
                      aiSourceType === "topic"
                        ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Course &amp; Topic
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiSourceType("pdf")}
                    className={`py-2 rounded-md text-xs font-semibold cursor-pointer ${
                      aiSourceType === "pdf"
                        ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Upload PDF
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="min-w-0">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Course / Subject
                </label>
                <input
                  type="text"
                  required
                  value={aiCourse}
                  onChange={(e) => setAiCourse(e.target.value)}
                  placeholder={aiKind === "flashcard" ? "e.g. Organic Chemistry" : "e.g. Macroeconomics"}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                />
              </div>

              <div className="min-w-0">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Number of {aiKind === "flashcard" ? "Cards" : "Questions"} (3–
                  {profile.isPremiumUser
                    ? PLAN_LIMITS.premium.maxItemsPerSet
                    : PLAN_LIMITS.free.maxItemsPerSet}
                  )
                </label>
                <input
                  type="number"
                  min={3}
                  max={
                    profile.isPremiumUser
                      ? PLAN_LIMITS.premium.maxItemsPerSet
                      : PLAN_LIMITS.free.maxItemsPerSet
                  }
                  required
                  value={aiCount}
                  onChange={(e) => setAiCount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm tabular-nums"
                />
              </div>
            </div>

            {aiSourceType === "topic" ? (
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Specific Topic
                </label>
                <input
                  type="text"
                  required
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder={
                    aiKind === "flashcard" ? "e.g. Nucleophilic Substitution" : "e.g. Monetary Policy"
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Lecture PDF (Max{" "}
                  {profile.isPremiumUser
                    ? PLAN_LIMITS.premium.maxPdfMb
                    : PLAN_LIMITS.free.maxPdfMb}{" "}
                  MB)
                </label>
                <label className="flex flex-col items-center justify-center p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 cursor-pointer text-center overflow-hidden">
                  <Upload className="w-5 h-5 text-blue-600 mb-2 shrink-0" />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-200 max-w-full truncate px-2">
                    {aiPdf ? aiPdf.name : "Choose a PDF document"}
                  </span>
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    className="hidden"
                    onChange={(e) => setAiPdf(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            )}

            {aiError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 [overflow-wrap:anywhere]">
                {aiError}
              </div>
            )}

            <button
              type="submit"
              disabled={aiLoading}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              {aiLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing with Efi...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate {aiKind === "flashcard" ? "Flashcard Deck" : "Quiz"}</span>
                </>
              )}
            </button>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-12 text-sm text-slate-500">
          Loading creation studio...
        </div>
      }
    >
      <CreateStudioContent />
    </Suspense>
  );
}
