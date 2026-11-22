"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  Edit3,
  ImagePlus,
  Loader2,
  Plus,
  RotateCw,
  Share2,
  Shuffle,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useEfiqo } from "@/context/EfiqoContext";
import type { FlashcardItem, FlashcardSet } from "@/types/efiqo";
import { EfiGeneratorModal } from "./Modals";

export function FlashcardStudio({
  initialSet,
}: {
  initialSet: FlashcardSet | null;
}) {
  const { profile, saveFlashcardSet, setActiveStudio, openPremiumModal, showToast } = useEfiqo();

  const [deck, setDeck] = useState<FlashcardSet | null>(initialSet);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [subject, setSubject] = useState("");
  const [showEfiGen, setShowEfiGen] = useState(false);

  // Study controls
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [missedOnly, setMissedOnly] = useState(false);
  const [shuffledOrder, setShuffledOrder] = useState<number[] | null>(null);
  const [mnemonic, setMnemonic] = useState<string>("");
  const [loadingMnemonic, setLoadingMnemonic] = useState(false);

  // Add/Edit card form
  const [showEditor, setShowEditor] = useState(Boolean(initialSet && initialSet.flashcards.length === 0));
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [termInput, setTermInput] = useState("");
  const [defInput, setDefInput] = useState("");
  const [imgInput, setImgInput] = useState<{ name: string; url: string } | null>(null);

  const isOwner = !deck || deck.by === profile?.email;

  const visibleIndices = React.useMemo(() => {
    if (!deck) return [];
    const base = deck.flashcards
      .map((card, i) => ({ card, i }))
      .filter(({ card }) => (!missedOnly ? true : card.mastery !== "mastered"))
      .map(({ i }) => i);

    if (shuffledOrder) {
      return shuffledOrder.filter((idx) => base.includes(idx));
    }
    return base;
  }, [deck, missedOnly, shuffledOrder]);

  const activeCardRealIndex = visibleIndices[currentIndex] ?? 0;
  const currentCard: FlashcardItem | undefined = deck?.flashcards[activeCardRealIndex];

  const goPrev = useCallback(() => {
    if (visibleIndices.length === 0) return;
    setIsFlipped(false);
    setMnemonic("");
    setCurrentIndex((i) => (i <= 0 ? visibleIndices.length - 1 : i - 1));
  }, [visibleIndices.length]);

  const goNext = useCallback(() => {
    if (visibleIndices.length === 0) return;
    setIsFlipped(false);
    setMnemonic("");
    setCurrentIndex((i) => (i + 1 >= visibleIndices.length ? 0 : i + 1));
  }, [visibleIndices.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setIsFlipped((f) => !f);
      } else if (e.key === "ArrowLeft") {
        goPrev();
      } else if (e.key === "ArrowRight") {
        goNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext]);

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (!profile.isPremiumUser && profile.flashcards.length >= 7) {
      openPremiumModal("Free Flashcard Set Limit Reached (7/7)");
      return;
    }
    const created: FlashcardSet = {
      id: typeof crypto !== "undefined" ? crypto.randomUUID() : `fc-${Date.now()}`,
      name: title.trim(),
      desc: desc.trim(),
      subject: subject.trim() || "General",
      flashcards: [],
      number: 0,
      created: new Date().toUTCString(),
      by: profile.email,
      mode: "edit",
    };
    await saveFlashcardSet(created);
    setDeck(created);
    setShowEditor(true);
    setActiveStudio({ type: "flashcard", set: created });
    showToast("Flashcard set created. Add your first card below.", "success");
  };

  const handleSaveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deck || !profile) return;

    if (!editingCardId && !profile.isPremiumUser && deck.flashcards.length >= 20) {
      openPremiumModal("Free Deck Limit Reached (20 Cards/Set)");
      return;
    }

    let nextCards: FlashcardItem[];
    if (editingCardId) {
      nextCards = deck.flashcards.map((c) =>
        c.id === editingCardId
          ? { ...c, term: termInput.trim(), def: defInput.trim(), img: imgInput }
          : c
      );
    } else {
      const newCard: FlashcardItem = {
        id: typeof crypto !== "undefined" ? crypto.randomUUID() : `card-${Date.now()}`,
        term: termInput.trim(),
        def: defInput.trim(),
        img: imgInput,
        mastery: "new",
      };
      nextCards = [...deck.flashcards, newCard];
      setCurrentIndex(nextCards.length - 1);
    }

    const updated: FlashcardSet = {
      ...deck,
      flashcards: nextCards,
      number: nextCards.length,
    };
    setDeck(updated);
    await saveFlashcardSet(updated);
    setTermInput("");
    setDefInput("");
    setImgInput(null);
    setEditingCardId(null);
    showToast(editingCardId ? "Flashcard updated." : "Flashcard added.", "success");
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!deck) return;
    const nextCards = deck.flashcards.filter((c) => c.id !== cardId);
    const updated: FlashcardSet = {
      ...deck,
      flashcards: nextCards,
      number: nextCards.length,
    };
    setDeck(updated);
    setCurrentIndex(0);
    setIsFlipped(false);
    await saveFlashcardSet(updated);
    showToast("Flashcard removed.", "info");
  };

  const handleSetMastery = async (status: "learning" | "mastered") => {
    if (!deck || !currentCard) return;
    const nextCards = deck.flashcards.map((c) =>
      c.id === currentCard.id ? { ...c, mastery: status } : c
    );
    const updated = { ...deck, flashcards: nextCards };
    setDeck(updated);
    await saveFlashcardSet(updated);
    if (visibleIndices.length > 1) {
      goNext();
    }
  };

  const handleShuffle = () => {
    if (!deck) return;
    if (shuffledOrder) {
      setShuffledOrder(null);
      setCurrentIndex(0);
      return;
    }
    const indices = deck.flashcards.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    setShuffledOrder(indices);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleShare = async () => {
    if (!deck) return;
    const url = `${window.location.origin}/?share_id=${encodeURIComponent(deck.id)}&type=flashcard`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `efIQo · ${deck.name}`,
          text: `Study ${deck.name} with me on efIQo!`,
          url,
        });
        return;
      } catch {
        // Fallback to copy
      }
    }
    await navigator.clipboard.writeText(url);
    showToast("Shareable deck link copied to clipboard.", "success");
  };

  const handleExportJson = () => {
    if (!deck) return;
    const blob = new Blob([JSON.stringify(deck, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${deck.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Deck exported as JSON.", "success");
  };

  const handleAskMnemonic = async () => {
    if (!currentCard) return;
    setLoadingMnemonic(true);
    try {
      const res = await fetch("/api/generate/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "flashcard",
          question: currentCard.term,
          answer: currentCard.def,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not fetch explanation.");
      setMnemonic(json.explanation);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not connect to Efi.", "error");
    } finally {
      setLoadingMnemonic(false);
    }
  };

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImgInput({ name: file.name, url: String(reader.result || "") });
    };
    reader.readAsDataURL(file);
  };

  if (!deck) {
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
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">New Flashcard Set</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Create a custom deck manually or synthesize one from a lecture PDF with Efi.
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

          <form onSubmit={handleCreateDeck} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Deck Title (min. 4 characters)
              </label>
              <input
                type="text"
                required
                minLength={4}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Renal Physiology & Fluid Balance"
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
                placeholder="e.g. Medicine"
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
                placeholder="Key mechanisms, equations, and clinical correlations..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={title.trim().length < 4}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm cursor-pointer"
            >
              Create Flashcard Set
            </button>
          </form>
        </div>

        {showEfiGen && (
          <EfiGeneratorModal
            mode="flashcard"
            onClose={() => setShowEfiGen(false)}
            onGeneratedFlashcards={async (generated) => {
              await saveFlashcardSet(generated);
              setDeck(generated);
              setActiveStudio({ type: "flashcard", set: generated });
            }}
          />
        )}
      </div>
    );
  }

  const masteredCount = deck.flashcards.filter((c) => c.mastery === "mastered").length;

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => setActiveStudio({ type: "overview" })}
            className="mt-0.5 p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Back to Library"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{deck.name}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 tabular-nums">
              {deck.desc ? `${deck.desc} · ` : ""}
              {deck.flashcards.length} cards · {masteredCount} mastered
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleShuffle}
            className={`px-3 py-2 rounded-lg border text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
              shuffledOrder
                ? "border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300"
                : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>{shuffledOrder ? "Shuffled" : "Shuffle"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMissedOnly((m) => !m);
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className={`px-3 py-2 rounded-lg border text-xs font-semibold cursor-pointer ${
              missedOnly
                ? "border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300"
                : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {missedOnly ? "Showing Missed Only" : "Study All"}
          </button>

          {isOwner && (
            <button
              type="button"
              onClick={() => setShowEditor((s) => !s)}
              className={`px-3 py-2 rounded-lg border text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
                showEditor
                  ? "border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                  : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showEditor ? "Hide Editor" : "Add / Edit Cards"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleExportJson}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

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

      {/* Main Stage Grid */}
      <div className={`grid gap-8 ${showEditor ? "lg:grid-cols-12" : "max-w-3xl mx-auto"}`}>
        {/* Flashcard Study Stage */}
        <div className={showEditor ? "lg:col-span-7 space-y-4" : "space-y-4"}>
          {visibleIndices.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-12 text-center">
              <p className="text-base font-semibold text-slate-900 dark:text-white">
                {missedOnly ? "All cards in this deck are mastered." : "No flashcards in this set yet."}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-5">
                {missedOnly
                  ? "Switch back to Study All to review the complete deck."
                  : "Add your first term and definition using the card editor."}
              </p>
              {missedOnly ? (
                <button
                  type="button"
                  onClick={() => setMissedOnly(false)}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold cursor-pointer"
                >
                  Show All Cards
                </button>
              ) : isOwner ? (
                <button
                  type="button"
                  onClick={() => setShowEditor(true)}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold cursor-pointer"
                >
                  Open Card Editor
                </button>
              ) : null}
            </div>
          ) : (
            <>
              <div
                role="button"
                tabIndex={0}
                onClick={() => setIsFlipped((f) => !f)}
                className="perspective-1200 w-full h-80 sm:h-96 cursor-pointer focus:outline-none"
                aria-label="Flip flashcard"
              >
                <div
                  className={`relative w-full h-full transition-transform duration-500 preserve-3d ${
                    isFlipped ? "rotate-y-180" : ""
                  }`}
                >
                  {/* Front */}
                  <div className="absolute inset-0 backface-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-10 flex flex-col justify-between shadow-xs">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                      <span>
                        Card {currentIndex + 1} of {visibleIndices.length} ·{" "}
                        {currentCard?.mastery === "mastered"
                          ? "Mastered"
                          : currentCard?.mastery === "learning"
                          ? "Needs Review"
                          : "New"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <RotateCw className="w-3.5 h-3.5" />
                        Space / Click to flip
                      </span>
                    </div>

                    <div className="text-center px-2">
                      <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white text-balance">
                        {currentCard?.term}
                      </p>
                    </div>

                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${((currentIndex + 1) / visibleIndices.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Back */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl border border-blue-600/40 bg-white dark:bg-slate-900 p-6 sm:p-8 flex flex-col justify-between shadow-xs overflow-y-auto">
                    <div className="flex items-center justify-between text-xs text-blue-600 dark:text-blue-400">
                      <span>Definition · {currentCard?.term}</span>
                      <span>Click to flip back</span>
                    </div>

                    <div className="my-auto py-4 text-center space-y-4">
                      {currentCard?.img?.url && (
                        <img
                          src={currentCard.img.url}
                          alt={currentCard.img.name || currentCard.term}
                          className="max-h-36 mx-auto rounded-lg object-contain border border-slate-200 dark:border-slate-700"
                        />
                      )}
                      <p className="text-base sm:text-lg text-slate-800 dark:text-slate-100 leading-relaxed max-w-xl mx-auto">
                        {currentCard?.def}
                      </p>
                    </div>

                    <div
                      className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={handleAskMnemonic}
                        disabled={loadingMnemonic}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        {loadingMnemonic ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5" />
                        )}
                        <span>Ask Efi for Mnemonic</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSetMastery("learning")}
                          className="px-3 py-1.5 rounded-lg border border-amber-500/50 text-amber-700 dark:text-amber-300 text-xs font-semibold hover:bg-amber-50 dark:hover:bg-amber-950/40 cursor-pointer"
                        >
                          Needs Review
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetMastery("mastered")}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Got It</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {mnemonic && (
                <div className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/70 dark:bg-blue-950/30 p-4 text-sm text-slate-700 dark:text-slate-200">
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">
                    Efi Study Mnemonic
                  </p>
                  <p className="leading-relaxed">{mnemonic}</p>
                </div>
              )}

              {/* Navigation & Card Actions */}
              <div className="flex items-center justify-between gap-4 pt-1">
                <button
                  type="button"
                  onClick={goPrev}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold inline-flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                {isOwner && currentCard && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditor(true);
                        setEditingCardId(currentCard.id);
                        setTermInput(currentCard.term);
                        setDefInput(currentCard.def);
                        setImgInput(currentCard.img || null);
                      }}
                      className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      title="Edit current card"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCard(currentCard.id)}
                      className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                      title="Delete current card"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={goNext}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold inline-flex items-center gap-2 hover:opacity-90 cursor-pointer"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Add / Edit Panel */}
        {showEditor && isOwner && (
          <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 h-fit">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              {editingCardId ? "Edit Flashcard" : "Add New Flashcard"}
            </h2>
            <form onSubmit={handleSaveCard} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Term (Front)
                </label>
                <input
                  type="text"
                  required
                  value={termInput}
                  onChange={(e) => setTermInput(e.target.value)}
                  placeholder="Enter concept or question"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Definition (Back)
                </label>
                <textarea
                  rows={4}
                  required
                  value={defInput}
                  onChange={(e) => setDefInput(e.target.value)}
                  placeholder="Enter clear, concise explanation"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                  <ImagePlus className="w-4 h-4" />
                  <span>{imgInput ? imgInput.name : "Attach Diagram / Image"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
                </label>
                {imgInput && (
                  <button
                    type="button"
                    onClick={() => setImgInput(null)}
                    className="text-xs text-rose-600 hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                {editingCardId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCardId(null);
                      setTermInput("");
                      setDefInput("");
                      setImgInput(null);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold cursor-pointer"
                >
                  {editingCardId ? "Save Changes" : "Add Flashcard"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
