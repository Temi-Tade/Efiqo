"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Loader2,
  Play,
  Plus,
  RotateCcw,
  Share2,
  Sparkles,
  Trash2,
  XCircle,
} from "lucide-react";
import { useEfiqo } from "@/context/EfiqoContext";
import type { QuizQuestion, QuizSet } from "@/types/efiqo";
import { EfiGeneratorModal } from "./Modals";

export function QuizStudio({
  initialSet,
  initialMode = "create",
}: {
  initialSet: QuizSet | null;
  initialMode?: "create" | "preview" | "attempt";
}) {
  const { profile, saveQuizSet, setActiveStudio, openPremiumModal, showToast } = useEfiqo();

  const [quiz, setQuiz] = useState<QuizSet | null>(initialSet);
  const [mode, setMode] = useState<"create" | "preview" | "attempt" | "result">(
    initialSet ? (initialMode === "attempt" ? "attempt" : initialSet.questions.length > 0 ? "preview" : "create") : "create"
  );

  // New Quiz Info
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [subject, setSubject] = useState("");
  const [showEfiGen, setShowEfiGen] = useState(false);

  // Authoring state
  const [questionText, setQuestionText] = useState("");
  const [optionInput, setOptionInput] = useState("");
  const [optionsList, setOptionsList] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState("");

  // Attempt / Preview state
  const [qIndex, setQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [timerMinutes, setTimerMinutes] = useState<number>(0); // 0 = untimed
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [aiExplanations, setAiExplanations] = useState<Record<number, string>>({});
  const [loadingExplainIdx, setLoadingExplainIdx] = useState<number | null>(null);

  const isOwner = !quiz || quiz.by === profile?.email;

  const finalizeSubmit = useCallback(async () => {
    if (!quiz) return;
    let score = 0;
    quiz.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.answer) score++;
    });

    const updated: QuizSet = {
      ...quiz,
      lastScore: score,
      lastAttempted: new Date().toUTCString(),
    };
    setQuiz(updated);
    if (profile && isOwner) {
      await saveQuizSet(updated);
    }
    setConfirmSubmit(false);
    setMode("result");
  }, [quiz, userAnswers, profile, isOwner, saveQuizSet]);

  // Exam countdown timer
  useEffect(() => {
    if (mode !== "attempt" || timerMinutes <= 0) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          setTimeout(() => finalizeSubmit(), 0);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [mode, timerMinutes, finalizeSubmit]);

  // Keyboard shortcuts 1-4 during quiz attempt
  useEffect(() => {
    if (mode !== "attempt" || !quiz) return;
    const onKey = (e: KeyboardEvent) => {
      const idx = Number(e.key) - 1;
      const currentQ = quiz.questions[qIndex];
      if (idx >= 0 && idx < (currentQ?.options.length || 0)) {
        setUserAnswers((prev) => ({ ...prev, [qIndex]: currentQ.options[idx] }));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, quiz, qIndex]);

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (!profile.isPremiumUser && profile.quizzes.length >= 7) {
      openPremiumModal("Free Quiz Set Limit Reached (7/7)");
      return;
    }
    const created: QuizSet = {
      id: typeof crypto !== "undefined" ? crypto.randomUUID() : `qz-${Date.now()}`,
      name: title.trim(),
      desc: desc.trim(),
      subject: subject.trim() || "General",
      questions: [],
      mode: "create",
      timeStamp: new Date().toUTCString(),
      by: profile.email,
    };
    await saveQuizSet(created);
    setQuiz(created);
    setMode("create");
    setActiveStudio({ type: "quiz", set: created, initialMode: "create" });
    showToast("Quiz created. Add your questions below.", "success");
  };

  const handleAddOption = () => {
    const val = optionInput.trim();
    if (!val) return;
    if (optionsList.includes(val)) {
      showToast("This option already exists.", "error");
      return;
    }
    setOptionsList((prev) => [...prev, val]);
    setOptionInput("");
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quiz || !profile) return;
    if (!profile.isPremiumUser && quiz.questions.length >= 20) {
      openPremiumModal("Free Quiz Limit Reached (20 Questions/Quiz)");
      return;
    }
    if (optionsList.length < 2 || !correctAnswer) {
      showToast("Add at least 2 options and select the correct answer.", "error");
      return;
    }

    const nextQuestion: QuizQuestion = {
      question: questionText.trim(),
      options: optionsList,
      answer: correctAnswer,
    };
    const updated: QuizSet = {
      ...quiz,
      questions: [...quiz.questions, nextQuestion],
    };
    setQuiz(updated);
    await saveQuizSet(updated);
    setQuestionText("");
    setOptionsList([]);
    setCorrectAnswer("");
    showToast("Question added to quiz.", "success");
  };

  const handleDeleteQuestion = async (idx: number) => {
    if (!quiz) return;
    const nextQuestions = quiz.questions.filter((_, i) => i !== idx);
    const updated = { ...quiz, questions: nextQuestions };
    setQuiz(updated);
    setQIndex(0);
    await saveQuizSet(updated);
    showToast("Question deleted.", "info");
  };

  const startAttempt = (mins: number) => {
    if (!quiz || quiz.questions.length < 2) {
      showToast("Add at least 2 questions before attempting this quiz.", "error");
      return;
    }
    setTimerMinutes(mins);
    setSecondsLeft(mins * 60);
    setUserAnswers({});
    setQIndex(0);
    setAiExplanations({});
    setMode("attempt");
  };

  const handleShare = async () => {
    if (!quiz) return;
    const url = `${window.location.origin}/?share_id=${encodeURIComponent(quiz.id)}&type=quiz`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `efIQo · ${quiz.name}`,
          text: `Attempt ${quiz.name} with me on efIQo!`,
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

  const handleExplainWithEfi = async (idx: number, q: QuizQuestion) => {
    setLoadingExplainIdx(idx);
    try {
      const res = await fetch("/api/generate/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "quiz",
          question: q.question,
          answer: q.answer,
          userAnswer: userAnswers[idx] || "",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to get explanation.");
      setAiExplanations((prev) => ({ ...prev, [idx]: json.explanation }));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not reach Efi.", "error");
    } finally {
      setLoadingExplainIdx(null);
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  if (!quiz) {
    return (
      <div className="max-w-2xl mx-auto py-6">
        <button
          type="button"
          onClick={() => setActiveStudio({ type: "overview" })}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Library</span>
        </button>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">New Practice Quiz</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Build a custom multiple-choice exam or generate one from lecture notes with Efi.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowEfiGen(true)}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create with Efi</span>
            </button>
          </div>

          <form onSubmit={handleCreateQuiz} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Quiz Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Organic Chemistry Midterm Mock"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Course / Subject (Optional)
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Chemistry"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Description (Optional)
              </label>
              <textarea
                rows={3}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Topics covered, exam rules, or notes..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={!title.trim()}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm cursor-pointer"
            >
              Create Quiz
            </button>
          </form>
        </div>

        {showEfiGen && (
          <EfiGeneratorModal
            mode="quiz"
            onClose={() => setShowEfiGen(false)}
            onGeneratedQuiz={async (generated) => {
              await saveQuizSet(generated);
              setQuiz(generated);
              setMode("preview");
              setActiveStudio({ type: "quiz", set: generated, initialMode: "preview" });
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quiz Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => setActiveStudio({ type: "overview" })}
            className="mt-0.5 p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{quiz.name}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 tabular-nums">
              {quiz.desc ? `${quiz.desc} · ` : ""}
              {quiz.questions.length} questions
              {typeof quiz.lastScore === "number" ? ` · Last score: ${quiz.lastScore}/${quiz.questions.length}` : ""}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isOwner && mode !== "attempt" && (
            <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setMode("create")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer ${
                  mode === "create"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                Author
              </button>
              <button
                type="button"
                onClick={() => {
                  setQIndex(0);
                  setMode("preview");
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer ${
                  mode === "preview"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                Preview
              </button>
            </div>
          )}

          {mode !== "attempt" && (
            <>
              <button
                type="button"
                onClick={() => startAttempt(0)}
                className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Attempt Untimed</span>
              </button>
              <button
                type="button"
                onClick={() => startAttempt(10)}
                className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>10m Timed Exam</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={handleShare}
            className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* CREATE MODE */}
      {mode === "create" && isOwner && (
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Add Question</h2>
            <form onSubmit={handleAddQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Question Prompt
                </label>
                <textarea
                  rows={3}
                  required
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Write a clear, unambiguous question..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Add Answer Options
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={optionInput}
                    onChange={(e) => setOptionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddOption();
                      }
                    }}
                    placeholder="Type an option and press Add"
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {optionsList.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Select the radio button next to the correct answer:
                  </p>
                  {optionsList.map((opt) => (
                    <div
                      key={opt}
                      className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                    >
                      <label className="flex items-center gap-2.5 text-sm cursor-pointer flex-1 min-w-0">
                        <input
                          type="radio"
                          name="correct-answer"
                          checked={correctAnswer === opt}
                          onChange={() => setCorrectAnswer(opt)}
                        />
                        <span className="truncate">{opt}</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setOptionsList((prev) => prev.filter((o) => o !== opt));
                          if (correctAnswer === opt) setCorrectAnswer("");
                        }}
                        className="text-xs text-rose-600 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="submit"
                disabled={!questionText.trim() || optionsList.length < 2 || !correctAnswer}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Question to Quiz</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-6 space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Question Bank ({quiz.questions.length})
            </h2>
            {quiz.questions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-sm text-slate-500">
                No questions added yet. Create your first question on the left.
              </div>
            ) : (
              <div className="space-y-3">
                {quiz.questions.map((q, idx) => (
                  <div
                    key={`${q.question}-${idx}`}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {idx + 1}. {q.question}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(idx)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer shrink-0"
                        title="Delete question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-2">
                      Answer: {q.answer} · {q.options.length} options
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PREVIEW OR ATTEMPT MODE */}
      {(mode === "preview" || mode === "attempt") && (
        <div className="max-w-3xl mx-auto">
          {quiz.questions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center text-sm text-slate-500">
              No questions have been added to this quiz yet.
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                <span>
                  Question {qIndex + 1} of {quiz.questions.length}
                </span>
                {mode === "attempt" && timerMinutes > 0 && (
                  <span
                    className={`font-mono font-semibold inline-flex items-center gap-1.5 ${
                      secondsLeft < 60 ? "text-rose-600" : "text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    {formatTimer(secondsLeft)}
                  </span>
                )}
              </div>

              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${((qIndex + 1) / quiz.questions.length) * 100}%` }}
                />
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                {quiz.questions[qIndex].question}
              </h2>

              <div className="space-y-3">
                {quiz.questions[qIndex].options.map((opt, optIdx) => {
                  const selected = userAnswers[qIndex] === opt;
                  return (
                    <button
                      key={`${opt}-${optIdx}`}
                      type="button"
                      disabled={mode === "preview"}
                      onClick={() => setUserAnswers((prev) => ({ ...prev, [qIndex]: opt }))}
                      className={`w-full text-left px-4 py-3.5 rounded-xl border text-sm font-medium transition-colors flex items-center gap-3 ${
                        mode === "preview"
                          ? "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300"
                          : selected
                          ? "border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 cursor-pointer"
                          : "border-slate-200 dark:border-slate-800 hover:border-blue-400 cursor-pointer"
                      }`}
                    >
                      <span className="font-mono text-xs text-slate-400 w-5 shrink-0">{optIdx + 1}.</span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  disabled={qIndex === 0}
                  onClick={() => setQIndex((i) => Math.max(0, i - 1))}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-40 text-sm font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                {qIndex < quiz.questions.length - 1 ? (
                  <button
                    type="button"
                    disabled={mode === "attempt" && !userAnswers[qIndex]}
                    onClick={() => setQIndex((i) => i + 1)}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 disabled:opacity-40 text-sm font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : mode === "attempt" ? (
                  <button
                    type="button"
                    disabled={Object.keys(userAnswers).length < quiz.questions.length}
                    onClick={() => setConfirmSubmit(true)}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-sm font-semibold cursor-pointer"
                  >
                    Submit Quiz
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => startAttempt(0)}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold cursor-pointer"
                  >
                    Attempt Quiz
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Confirmation Modal */}
          {confirmSubmit && (
            <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs overflow-y-auto overscroll-contain flex items-center justify-center p-3 sm:p-4">
              <div className="w-full min-w-0 max-w-sm my-auto max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xl">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Submit Quiz Attempt?</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 break-words">
                  You have answered {Object.keys(userAnswers).length} of {quiz.questions.length} questions in {quiz.name}.
                </p>
                <div className="mt-6 flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmSubmit(false)}
                    className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    Review Answers
                  </button>
                  <button
                    type="button"
                    onClick={finalizeSubmit}
                    className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer"
                  >
                    Confirm &amp; Grade
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RESULT & LINE-BY-LINE REVIEW */}
      {mode === "result" && (
        <div className="max-w-3xl mx-auto space-y-6">
          {(() => {
            const score = quiz.questions.filter((q, i) => userAnswers[i] === q.answer).length;
            const pct = Math.round((score / Math.max(quiz.questions.length, 1)) * 100);
            return (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Final Assessment Score</p>
                  <p className="text-4xl font-extrabold text-slate-900 dark:text-white tabular-nums mt-1">
                    {score}/{quiz.questions.length}{" "}
                    <span className="text-xl font-semibold text-blue-600 dark:text-blue-400">({pct}%)</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => startAttempt(timerMinutes)}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake Quiz</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveStudio({ type: "overview" })}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    Return to Library
                  </button>
                </div>
              </div>
            );
          })()}

          <div className="space-y-4">
            {quiz.questions.map((q, idx) => {
              const userChoice = userAnswers[idx] || "No answer selected";
              const isRight = userChoice === q.answer;
              const explanation = aiExplanations[idx] || q.explanation;

              return (
                <div
                  key={`${q.question}-${idx}`}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      {idx + 1}. {q.question}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold shrink-0 ${
                        isRight ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {isRight ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      <span>{isRight ? "Correct" : "Incorrect"}</span>
                    </span>
                  </div>

                  <div className="text-sm space-y-1">
                    <p className="text-slate-600 dark:text-slate-300">
                      Your answer:{" "}
                      <span className={isRight ? "font-semibold text-emerald-700 dark:text-emerald-400" : "font-semibold text-rose-700 dark:text-rose-400"}>
                        {userChoice}
                      </span>
                    </p>
                    {!isRight && (
                      <p className="text-slate-600 dark:text-slate-300">
                        Correct answer:{" "}
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">{q.answer}</span>
                      </p>
                    )}
                  </div>

                  {explanation ? (
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      <strong className="text-slate-900 dark:text-white">Explanation: </strong>
                      {explanation}
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={loadingExplainIdx === idx}
                      onClick={() => handleExplainWithEfi(idx, q)}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      {loadingExplainIdx === idx ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                      <span>Explain Answer with Efi</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
