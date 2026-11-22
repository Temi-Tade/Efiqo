"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Clock,
  FileText,
  HelpCircle,
  Layers,
  Menu,
  Play,
  Plus,
  Search,
  Share2,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useEfiqo } from "@/context/EfiqoContext";
import type { FlashcardSet, QuizSet } from "@/types/efiqo";
import { FlashcardStudio } from "./FlashcardStudio";
import { QuizStudio } from "./QuizStudio";
import { PdfReaderStudio } from "./PdfReaderStudio";
import { EfiGeneratorModal } from "./Modals";

export function WorkspaceDashboard() {
  const {
    profile,
    activeStudio,
    setActiveStudio,
    deleteFlashcardSet,
    deleteQuizSet,
    saveFlashcardSet,
    saveQuizSet,
    setIsSearchModalOpen,
    openPremiumModal,
    pomodoroSessions,
    showToast,
  } = useEfiqo();

  const [sidebarSearch, setSidebarSearch] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [libraryFilter, setLibraryFilter] = useState<"all" | "flashcards" | "quizzes">("all");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [efiModalMode, setEfiModalMode] = useState<"flashcard" | "quiz" | null>(null);

  if (!profile) return null;

  const term = sidebarSearch.trim().toLowerCase();
  const filteredFlashcards = profile.flashcards.filter(
    (f) => !term || f.name.toLowerCase().includes(term)
  );
  const filteredQuizzes = profile.quizzes.filter(
    (q) => !term || q.name.toLowerCase().includes(term)
  );

  const totalCards = profile.flashcards.reduce((acc, f) => acc + f.flashcards.length, 0);
  const masteredCards = profile.flashcards.reduce(
    (acc, f) => acc + f.flashcards.filter((c) => c.mastery === "mastered").length,
    0
  );

  const handleCreateNew = (kind: "flashcard" | "quiz") => {
    if (!profile.isPremiumUser) {
      if (kind === "flashcard" && profile.flashcards.length >= 7) {
        openPremiumModal("Free Flashcard Set Quota Reached (7/7)");
        return;
      }
      if (kind === "quiz" && profile.quizzes.length >= 7) {
        openPremiumModal("Free Quiz Set Quota Reached (7/7)");
        return;
      }
    }
    if (kind === "flashcard") {
      setActiveStudio({ type: "flashcard", set: null, isNew: true });
    } else {
      setActiveStudio({ type: "quiz", set: null, initialMode: "create", isNew: true });
    }
    setMobileSidebarOpen(false);
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
        showToast(`Imported flashcard set "${imported.name}".`, "success");
      } else if (Array.isArray(parsed.questions)) {
        const imported: QuizSet = {
          ...parsed,
          id: typeof crypto !== "undefined" ? crypto.randomUUID() : `imp-${Date.now()}`,
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
    const url = `${window.location.origin}/?share_id=${encodeURIComponent(id)}&type=${type}`;
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
    showToast("Share link copied to clipboard.", "success");
  };

  const SidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={sidebarSearch}
            onChange={(e) => setSidebarSearch(e.target.value)}
            placeholder="Filter your sets..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleCreateNew("flashcard")}
            className="px-2.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center justify-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Flashcard</span>
          </button>
          <button
            type="button"
            onClick={() => handleCreateNew("quiz")}
            className="px-2.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold inline-flex items-center justify-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Quiz</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
            <span className="inline-flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Flashcards
            </span>
            <span className="font-mono tabular-nums">
              {profile.isPremiumUser ? filteredFlashcards.length : `${profile.flashcards.length}/7`}
            </span>
          </div>
          {filteredFlashcards.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">No flashcard sets found.</p>
          ) : (
            <ul className="space-y-1">
              {filteredFlashcards.map((f) => {
                const isActive = activeStudio.type === "flashcard" && activeStudio.set?.id === f.id;
                return (
                  <li key={f.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveStudio({ type: "flashcard", set: f });
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium truncate transition-colors cursor-pointer ${
                        isActive
                          ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70"
                      }`}
                    >
                      {f.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
            <span className="inline-flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              Quizzes
            </span>
            <span className="font-mono tabular-nums">
              {profile.isPremiumUser ? filteredQuizzes.length : `${profile.quizzes.length}/7`}
            </span>
          </div>
          {filteredQuizzes.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">No quizzes found.</p>
          ) : (
            <ul className="space-y-1">
              {filteredQuizzes.map((q) => {
                const isActive = activeStudio.type === "quiz" && activeStudio.set?.id === q.id;
                return (
                  <li key={q.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveStudio({ type: "quiz", set: q, initialMode: "preview" });
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium truncate transition-colors cursor-pointer ${
                        isActive
                          ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-semibold"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70"
                      }`}
                    >
                      {q.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {!profile.isPremiumUser && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => openPremiumModal("Upgrade to Unlimited Sets")}
            className="w-full py-2 px-3 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold cursor-pointer"
          >
            Unlock Unlimited ($4.99)
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto w-full flex min-h-[calc(100vh-4rem)]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        {SidebarContent}
      </aside>

      {/* Mobile Sidebar Drawer */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-slate-950/60 backdrop-blur-xs flex"
          onClick={() => setMobileSidebarOpen(false)}
        >
          <aside
            className="w-72 bg-white dark:bg-slate-900 h-full border-r border-slate-200 dark:border-slate-800 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white">Study Sets</span>
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">{SidebarContent}</div>
          </aside>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
        {/* Mobile Workspace Bar */}
        <div className="lg:hidden flex items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
          >
            <Menu className="w-4 h-4" />
            <span>My Sets</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveStudio({ type: "overview" })}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-800 cursor-pointer"
            >
              Library
            </button>
            <button
              type="button"
              onClick={() => setActiveStudio({ type: "reader" })}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-800 cursor-pointer"
            >
              PDF Reader
            </button>
          </div>
        </div>

        {activeStudio.type === "flashcard" && (
          <FlashcardStudio
            key={activeStudio.set?.id || (activeStudio.isNew ? "new-flashcard" : "none-flashcard")}
            initialSet={activeStudio.set}
          />
        )}

        {activeStudio.type === "quiz" && (
          <QuizStudio
            key={`${activeStudio.set?.id || (activeStudio.isNew ? "new-quiz" : "none-quiz")}-${activeStudio.initialMode || "create"}`}
            initialSet={activeStudio.set}
            initialMode={activeStudio.initialMode}
          />
        )}

        {activeStudio.type === "reader" && <PdfReaderStudio />}

        {activeStudio.type === "overview" && (
          <div className="space-y-8">
            {/* Greeting + Quick Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  Hello, {profile.userName || "Scholar"}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Pick up a deck, synthesize a practice quiz from a PDF, or open your study reader.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEfiModalMode("flashcard")}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Flashcards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEfiModalMode("quiz")}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Quiz</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStudio({ type: "reader" })}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>PDF Reader</span>
                </button>
                <label className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import JSON</span>
                  <input type="file" accept="application/json,.json" className="hidden" onChange={handleImportJson} />
                </label>
              </div>
            </div>

            {/* Study Telemetry Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800 overflow-hidden">
              <div className="p-5">
                <p className="text-xs text-slate-500 dark:text-slate-400">Flashcard Sets</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums mt-1">
                  {profile.flashcards.length}
                </p>
              </div>
              <div className="p-5">
                <p className="text-xs text-slate-500 dark:text-slate-400">Practice Quizzes</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums mt-1">
                  {profile.quizzes.length}
                </p>
              </div>
              <div className="p-5">
                <p className="text-xs text-slate-500 dark:text-slate-400">Cards Mastered</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums mt-1">
                  {masteredCards}/{totalCards}
                </p>
              </div>
              <div className="p-5">
                <p className="text-xs text-slate-500 dark:text-slate-400">Focus Sprints</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums mt-1">
                  {pomodoroSessions}
                </p>
              </div>
            </div>

            {/* Filter & Community Search Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-200/70 dark:bg-slate-800 w-fit">
                {(
                  [
                    { id: "all", label: "All Materials" },
                    { id: "flashcards", label: `Flashcards (${profile.flashcards.length})` },
                    { id: "quizzes", label: `Quizzes (${profile.quizzes.length})` },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setLibraryFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      libraryFilter === tab.id
                        ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setIsSearchModalOpen(true)}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Browse Community Library</span>
              </button>
            </div>

            {/* Flashcard Sets Grid */}
            {(libraryFilter === "all" || libraryFilter === "flashcards") && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white inline-flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span>Flashcard Sets</span>
                  </h2>
                  <button
                    type="button"
                    onClick={() => handleCreateNew("flashcard")}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    + New Flashcard Set
                  </button>
                </div>

                {profile.flashcards.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center">
                    <p className="text-sm text-slate-500 mb-3">You have not created any flashcard sets yet.</p>
                    <button
                      type="button"
                      onClick={() => handleCreateNew("flashcard")}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold cursor-pointer"
                    >
                      Create First Deck
                    </button>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {profile.flashcards.map((deck) => {
                      const mastered = deck.flashcards.filter((c) => c.mastery === "mastered").length;
                      return (
                        <div
                          key={deck.id}
                          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                        >
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                              {deck.subject || "Flashcards"} · {deck.flashcards.length} cards · {mastered} mastered
                            </p>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 line-clamp-1">
                              {deck.name}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                              {deck.desc || "No description provided."}
                            </p>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <button
                              type="button"
                              onClick={() => setActiveStudio({ type: "flashcard", set: deck })}
                              className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold cursor-pointer"
                            >
                              Study Deck
                            </button>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleShareItem(deck.id, deck.name, "flashcard")}
                                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                title="Share deck"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>

                              {confirmDeleteId === deck.id ? (
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
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* Quizzes Grid */}
            {(libraryFilter === "all" || libraryFilter === "quizzes") && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white inline-flex items-center gap-2">
                    <Clock className="w-4 h-4 text-rose-600" />
                    <span>Practice Quizzes</span>
                  </h2>
                  <button
                    type="button"
                    onClick={() => handleCreateNew("quiz")}
                    className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                  >
                    + New Quiz
                  </button>
                </div>

                {profile.quizzes.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center">
                    <p className="text-sm text-slate-500 mb-3">You have not created any quizzes yet.</p>
                    <button
                      type="button"
                      onClick={() => handleCreateNew("quiz")}
                      className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold cursor-pointer"
                    >
                      Create First Quiz
                    </button>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {profile.quizzes.map((quiz) => (
                      <div
                        key={quiz.id}
                        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                      >
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                            {quiz.subject || "Quiz"} · {quiz.questions.length} questions
                            {typeof quiz.lastScore === "number"
                              ? ` · Last: ${quiz.lastScore}/${quiz.questions.length}`
                              : ""}
                          </p>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 line-clamp-1">
                            {quiz.name}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {quiz.desc || "No description provided."}
                          </p>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setActiveStudio({ type: "quiz", set: quiz, initialMode: "attempt" })}
                              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Play className="w-3 h-3" />
                              <span>Attempt</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveStudio({ type: "quiz", set: quiz, initialMode: "create" })}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold cursor-pointer"
                            >
                              Edit
                            </button>
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

                            {confirmDeleteId === quiz.id ? (
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
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </main>

      {efiModalMode && (
        <EfiGeneratorModal
          mode={efiModalMode}
          onClose={() => setEfiModalMode(null)}
          onGeneratedFlashcards={async (generated) => {
            await saveFlashcardSet(generated);
            setActiveStudio({ type: "flashcard", set: generated });
          }}
          onGeneratedQuiz={async (generated) => {
            await saveQuizSet(generated);
            setActiveStudio({ type: "quiz", set: generated, initialMode: "preview" });
          }}
        />
      )}
    </div>
  );
}
