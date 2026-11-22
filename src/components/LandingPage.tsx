"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Clock,
  FileText,
  Layers,
  RotateCw,
} from "lucide-react";
import { useEfiqo } from "@/context/EfiqoContext";
import { STARTER_FLASHCARDS, STARTER_QUIZZES } from "@/types/efiqo";
import { Footer } from "./Footer";

const DEMO_CARDS = STARTER_FLASHCARDS[0].flashcards;
const DEMO_QUIZ = STARTER_QUIZZES[0].questions[0];

const FAQS = [
  {
    q: "How does Efi synthesize flashcards and quizzes from my lecture PDFs?",
    a: "Upload any PDF lecture deck or textbook chapter (up to 5 MB on Free, or 15 MB on Premium) inside the Create Studio. Our server-side Gemini pipeline extracts high-yield concepts, concise definitions, and 4-option multiple-choice exam questions with answer explanations.",
  },
  {
    q: "Can I use efIQo without uploading a PDF or using AI?",
    a: "Yes. You can author custom flashcard decks with attached reference images and build your own multi-option quizzes manually, complete with preview and timed exam modes.",
  },
  {
    q: "How does the side-by-side PDF reader and Focus Mode work?",
    a: "Open the PDF Reader route to load local course PDFs directly in your browser without uploading them to external servers. Pair your reading with the built-in 25-minute Pomodoro focus timer and switch into full-screen Focus Mode whenever you need deep concentration.",
  },
  {
    q: "How can I share a flashcard deck or quiz with classmates?",
    a: "Every flashcard set and quiz includes a Share action that generates a direct study link. Classmates can open the link to study your cards or attempt your quiz immediately.",
  },
  {
    q: "What is included in the Free plan versus the ₦5,000 one-time Premium plan?",
    a: "The Free plan gives you up to 7 flashcard sets, 7 quiz sets, max 20 flashcards or questions per set, and 5 MB PDF uploads. Premium removes the set limit and expands capacity to 50 items per set and 15 MB PDF uploads for a single ₦5,000 payment (₦2,500 for beta scholars).",
  },
  {
    q: "Is my study progress saved across light and dark sessions?",
    a: "Yes. Card mastery status (Mastered vs. Needs Review), quiz scores, and theme preference (System, Light, or Dark) persist in your workspace store.",
  },
];

export function LandingPage() {
  const { profile, setIsAuthModalOpen, handleSignIn } = useEfiqo();
  const router = useRouter();

  // Interactive hero/demo flashcard state
  const [demoIndex, setDemoIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [demoMastered, setDemoMastered] = useState<Record<string, boolean>>({});

  // Interactive demo quiz state
  const [selectedDemoOption, setSelectedDemoOption] = useState<string | null>(null);

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const currentDemoCard = DEMO_CARDS[demoIndex];
  const masteredCount = Object.values(demoMastered).filter(Boolean).length;

  const openWorkspaceOrAuth = () => {
    if (profile) {
      router.push("/dashboard");
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <div id="top" className="min-h-screen flex flex-col w-full overflow-x-clip">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-8 pb-12 lg:pt-16 lg:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          <div className="lg:col-span-6 min-w-0 flex flex-col justify-center">
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-3">
              Active Recall Studio · Flashcards, Quizzes &amp; PDF Synthesis
            </p>
            <h1 className="text-[clamp(2rem,4.2vw,3.75rem)] font-extrabold tracking-tight leading-[1.06] text-slate-900 dark:text-white text-balance mb-5">
              Turn dense lecture notes into lasting recall.
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mb-8">
              Build custom flashcard decks, run timed multiple-choice exams, read course PDFs alongside a Pomodoro sprint timer, and synthesize study sets directly from lecture slides with Efi.
            </p>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={openWorkspaceOrAuth}
                className="px-5 sm:px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm sm:text-base inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>{profile ? "Open Dashboard" : "Open Study Workspace"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#demo"
                className="px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold text-sm sm:text-base transition-colors whitespace-nowrap shrink-0"
              >
                Try Interactive Deck
              </a>
            </div>
          </div>

          <div className="lg:col-span-6 min-w-0">
            <div className="h-full min-h-[260px] sm:min-h-[320px] lg:min-h-[420px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 relative">
              <img
                src="/images/hero_study_desk_1795358729158.jpg"
                alt="Sunlit modern university study desk with laptop displaying flashcards and handwritten notebook"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent text-white">
                <p className="text-xs font-medium text-slate-200">
                  Unified Workspace · Flashcards, Timed Quizzes &amp; Focus Reader
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column Quantitative Spec Strip */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800 overflow-hidden">
          <div className="p-4 sm:p-6 min-w-0">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Free Tier Allowance</p>
            <p className="mt-1 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              7 Decks + 7 Quizzes
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Max 20 items/set at ₦0</p>
          </div>
          <div className="p-4 sm:p-6 min-w-0">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Lecture Upload Limit</p>
            <p className="mt-1 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              5 MB Free · 15 MB Pro
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Direct slide-to-deck synthesis</p>
          </div>
          <div className="p-4 sm:p-6 min-w-0">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Study Focus Modes</p>
            <p className="mt-1 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              4 Built-In Tools
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Flip, Exam Timer, PDF &amp; Pomodoro</p>
          </div>
          <div className="p-4 sm:p-6 min-w-0">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Lifetime Pro Unlock</p>
            <p className="mt-1 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              ₦5,000 Once
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Max 50 items/set · Unlimited sets</p>
          </div>
        </div>
      </section>

      {/* Interactive Demo Sandbox */}
      <section id="demo" className="border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Test the Active Recall Engine Right Here
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl">
                Flip through a live Cellular Respiration deck and answer a sample Neuroanatomy question before creating an account.
              </p>
            </div>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
              Deck Mastery: {masteredCount}/{DEMO_CARDS.length} Mastered
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Live Flashcard Flipper */}
            <div className="lg:col-span-7 min-w-0 space-y-4">
              <div className="w-full overflow-hidden rounded-2xl">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setIsFlipped((f) => !f)}
                  onKeyDown={(e) => {
                    if (e.key === " " || e.key === "Enter") {
                      e.preventDefault();
                      setIsFlipped((f) => !f);
                    }
                  }}
                  className="perspective-1200 w-full h-72 sm:h-80 cursor-pointer focus:outline-none"
                  aria-label="Flip sample flashcard"
                >
                  <div
                    className={`relative w-full h-full transition-transform duration-500 preserve-3d ${
                      isFlipped ? "rotate-y-180" : ""
                    }`}
                  >
                    {/* Front */}
                    <div className="absolute inset-0 backface-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-[#F7F8FA] dark:bg-slate-950 p-5 sm:p-8 flex flex-col justify-between">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>Biology · Card {demoIndex + 1} of {DEMO_CARDS.length}</span>
                      <span className="inline-flex items-center gap-1">
                        <RotateCw className="w-3.5 h-3.5" />
                        Click to flip
                      </span>
                    </div>
                    <div className="text-center px-2 sm:px-4">
                      <p className="text-xl sm:text-3xl font-bold text-slate-900 dark:text-white [overflow-wrap:anywhere]">
                        {currentDemoCard.term}
                      </p>
                    </div>
                    <div className="h-1 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${((demoIndex + 1) / DEMO_CARDS.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Back */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl border border-blue-600/40 bg-blue-50/40 dark:bg-slate-900 p-5 sm:p-8 flex flex-col justify-between overflow-y-auto">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-blue-700 dark:text-blue-400">
                      <span>Definition · {currentDemoCard.term}</span>
                      <span>Click to flip back</span>
                    </div>
                    <p className="text-sm sm:text-lg text-slate-800 dark:text-slate-100 leading-relaxed text-center max-w-lg mx-auto [overflow-wrap:anywhere]">
                      {currentDemoCard.def}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setDemoMastered((m) => ({ ...m, [currentDemoCard.id]: false }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                          demoMastered[currentDemoCard.id] === false
                            ? "border-amber-500 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                            : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        Needs Review
                      </button>
                      <button
                        type="button"
                        onClick={() => setDemoMastered((m) => ({ ...m, [currentDemoCard.id]: true }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                          demoMastered[currentDemoCard.id] === true
                            ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                            : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        Got It
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsFlipped(false);
                    setDemoIndex((i) => (i === 0 ? DEMO_CARDS.length - 1 : i - 1));
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Previous Card
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsFlipped(false);
                    setDemoIndex((i) => (i + 1) % DEMO_CARDS.length);
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold hover:opacity-90 cursor-pointer"
                >
                  Next Card
                </button>
              </div>
            </div>

            {/* Live Quiz Check */}
            <div className="lg:col-span-5 min-w-0 rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#F7F8FA] dark:bg-slate-950 p-5 sm:p-7">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                Sample Quiz Check · Neuroanatomy
              </p>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug mb-4">
                {DEMO_QUIZ.question}
              </h3>

              <div className="space-y-2.5">
                {DEMO_QUIZ.options.map((opt) => {
                  const isChosen = selectedDemoOption === opt;
                  const isCorrect = opt === DEMO_QUIZ.answer;
                  const showState = selectedDemoOption !== null;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSelectedDemoOption(opt)}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                        !showState
                          ? "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500"
                          : isCorrect
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200"
                          : isChosen
                          ? "border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200"
                          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-60"
                      }`}
                    >
                      <span>{opt}</span>
                      {showState && isCorrect && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {selectedDemoOption && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong className="text-slate-900 dark:text-white">
                    {selectedDemoOption === DEMO_QUIZ.answer ? "Correct: " : "Explanation: "}
                  </strong>
                  {DEMO_QUIZ.explanation}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities Asymmetric Bento Grid */}
      <section id="toolkit" className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-16 lg:py-24">
        <div className="max-w-2xl mb-12">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white text-balance">
            Four focused study instruments in one workspace.
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
            Every view is engineered for concentration—no cluttered social feeds, no distracting banners, and direct keyboard control.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 01 - Wide */}
          <div className="lg:col-span-2 min-w-0 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden grid grid-cols-1 sm:grid-cols-2">
            <div className="p-6 sm:p-8 min-w-0 flex flex-col justify-between">
              <div>
                <p className="text-xs font-mono text-blue-600 dark:text-blue-400 mb-2">01. Active Recall Flashcards</p>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  Flip, rate confidence, and isolate weak terms.
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Attach reference images to definitions, navigate with arrow keys or touch swipes, shuffle card order, filter down to missed concepts, and export decks to JSON or CSV.
                </p>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  3D Tactile Flip
                </span>
                <span>·</span>
                <span>Image Attachments</span>
              </div>
            </div>
            <div className="min-h-[220px] min-w-0 bg-slate-100 dark:bg-slate-800">
              <img
                src="/images/editorial_notes_recall_1795358728415.jpg"
                alt="Ruled index flashcards beside digital tablet on slate surface"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Card 02 */}
          <div className="min-w-0 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <p className="text-xs font-mono text-rose-600 dark:text-rose-400 mb-2">02. Timed Quiz Engine</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Simulated exam pressure with instant line-by-line review.
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Author 4-option multiple-choice tests, toggle an optional countdown timer, and ask Efi for a concise conceptual explanation on any missed question.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Keyboard 1–4 Select</span>
              <span>Auto-Graded</span>
            </div>
          </div>

          {/* Card 03 */}
          <div className="min-w-0 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <p className="text-xs font-mono text-blue-600 dark:text-blue-400 mb-2">03. Lecture-to-Deck AI</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Synthesize decks from topics or lecture PDFs.
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Feed Efi a syllabus topic or your professor&apos;s lecture slides. Receive structured flashcard sets or practice exams ready to edit, study, and share.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <img src="/images/gemini-logo.png" alt="Gemini" className="w-4 h-4 object-contain" />
              <span>Powered by Gemini</span>
            </div>
          </div>

          {/* Card 04 - Wide */}
          <div className="lg:col-span-2 min-w-0 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden grid grid-cols-1 sm:grid-cols-2">
            <div className="min-h-[220px] min-w-0 bg-slate-100 dark:bg-slate-800 order-2 sm:order-1">
              <img
                src="/images/editorial_library_focus_1795358728720.jpg"
                alt="University library reading room with walnut study tables and warm lamps"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-6 sm:p-8 min-w-0 flex flex-col justify-between order-1 sm:order-2">
              <div>
                <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mb-2">04. PDF Reader & Pomodoro</p>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  Read course papers beside a built-in focus clock.
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Open local PDFs instantly inside the workspace, hide chrome in Focus Mode, jot down quick scratchpad notes, and pace your reading in 25-minute Pomodoro sprints.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  Zero-Upload PDF View
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  25/5/15 Timer
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Workflow + Starter Library Preview */}
      <section id="workflow" className="border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5 min-w-0">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
                From raw syllabus to exam readiness in three steps.
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                Designed around the active recall loop used by medical, engineering, and law students.
              </p>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400 pt-0.5 tabular-nums shrink-0">01</span>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white">Upload PDFs or Author Directly</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                      Drop in lecture slides for Efi synthesis or type custom terms, diagrams, and 4-option questions.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400 pt-0.5 tabular-nums shrink-0">02</span>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white">Drill &amp; Measure Mastery</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                      Grade each flashcard as Mastered or Needs Review, and test yourself under optional quiz timers.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400 pt-0.5 tabular-nums shrink-0">03</span>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white">Share &amp; Study Collaboratively</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                      Generate direct share links for study groups or discover community-built sets across subjects.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 min-w-0">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#F7F8FA] dark:bg-slate-950 p-4 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white">Starter Study Library</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Included automatically when you open your workspace
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (profile) {
                        router.push("/materials");
                      } else {
                        handleSignIn("local", () => router.push("/materials"));
                      }
                    }}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Browse All Materials
                  </button>
                </div>

                <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden">
                  {STARTER_FLASHCARDS.map((deck) => (
                    <div key={deck.id} className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{deck.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {deck.subject} · Flashcard Deck · {deck.flashcards.length} cards
                        </p>
                      </div>
                      <Link
                        href={`/materials/flashcards/${encodeURIComponent(deck.id)}`}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
                      >
                        Study Deck
                      </Link>
                    </div>
                  ))}
                  {STARTER_QUIZZES.map((quiz) => (
                    <div key={quiz.id} className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{quiz.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {quiz.subject} · Practice Quiz · {quiz.questions.length} questions
                        </p>
                      </div>
                      <Link
                        href={`/materials/quizzes/${encodeURIComponent(quiz.id)}?mode=attempt`}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
                      >
                        Attempt Quiz
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transparent Pricing Matrix */}
      <section id="pricing" className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-16 lg:py-24">
        <div className="max-w-2xl mb-10">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Simple pricing. Pay once if you outgrow the free tier.
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300">
            Start with generous limits at zero cost—no credit card required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="min-w-0 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-baseline justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Free Plan</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">For semester courses &amp; exam prep</p>
                </div>
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">₦0</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300 pt-4 border-t border-slate-100 dark:border-slate-800">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Up to 7 flashcard sets &amp; 7 quiz sets</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Max 20 flashcards or quiz questions per set</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>3 AI generations per day with Efi</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>5 MB max PDF upload for Efi AI synthesis</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Side-by-side PDF reader &amp; Pomodoro focus timer</span>
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={openWorkspaceOrAuth}
              className="mt-8 w-full py-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white transition-colors cursor-pointer"
            >
              {profile ? "Go to Dashboard" : "Start Free Workspace"}
            </button>
          </div>

          <div className="min-w-0 rounded-2xl border border-blue-600/50 bg-white dark:bg-slate-900 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Premium Plan</h3>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">One-time lifetime unlock (NGN)</p>
                </div>
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">₦5,000</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300 pt-4 border-t border-slate-100 dark:border-slate-800">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Unlimited flashcard sets &amp; quiz sets</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Max 50 flashcards or quiz questions per set</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>15 MB max PDF upload for Efi AI synthesis</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>50% early-access discount for registered beta scholars (₦2,500)</span>
                </li>
              </ul>
            </div>
            <Link
              href="/pricing"
              className="mt-8 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white transition-colors text-center block"
            >
              View Plan Details
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-8">
            Frequently Asked Questions
          </h2>
          <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden">
            {FAQS.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={item.q}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    <span className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
