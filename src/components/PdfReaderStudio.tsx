"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  FileText,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Upload,
  X,
} from "lucide-react";
import { useEfiqo } from "@/context/EfiqoContext";

const NOTES_STORAGE_KEY = "efiqo scratchpad notes";

export function PdfReaderStudio() {
  const {
    pomodoroSeconds,
    pomodoroMode,
    pomodoroRunning,
    pomodoroSessions,
    togglePomodoro,
    resetPomodoro,
    showToast,
  } = useEfiqo();

  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [pdfName, setPdfName] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [notes, setNotes] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem(NOTES_STORAGE_KEY) || "" : ""
  );
  const readerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  useEffect(() => {
    return () => {
      if (pdfUrl.startsWith("blob:")) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      showToast("Please select a valid PDF document.", "error");
      return;
    }
    if (pdfUrl.startsWith("blob:")) {
      URL.revokeObjectURL(pdfUrl);
    }
    const url = URL.createObjectURL(file);
    setPdfUrl(url);
    setPdfName(file.name);
  };

  const toggleFocusMode = async () => {
    if (!readerRef.current) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await readerRef.current.requestFullscreen();
      }
    } catch {
      showToast("Fullscreen focus mode is restricted by your browser.", "info");
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start min-w-0">
      {/* PDF Viewport */}
      <div
        ref={readerRef}
        className="lg:col-span-8 min-w-0 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col min-h-[420px] sm:min-h-[540px] lg:h-[calc(100vh-12rem)]"
      >
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 sm:gap-4 bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
              {pdfName || "Course PDF Reader"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <label className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer inline-flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5" />
              <span>{pdfUrl ? "Change PDF" : "Open PDF"}</span>
              <input type="file" accept="application/pdf,.pdf" className="hidden" onChange={handleFileChange} />
            </label>

            {pdfUrl && (
              <>
                <button
                  type="button"
                  onClick={toggleFocusMode}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  <span>{isFullscreen ? "Exit Focus" : "Focus Mode"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (pdfUrl.startsWith("blob:")) URL.revokeObjectURL(pdfUrl);
                    setPdfUrl("");
                    setPdfName("");
                  }}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                  title="Close PDF"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {pdfUrl ? (
          <iframe src={pdfUrl} title={pdfName} className="w-full flex-1 border-0 bg-slate-100 dark:bg-slate-950" />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Read Lecture Slides Side-by-Side</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-6">
              Files open locally in your browser. Pair your reading with the Pomodoro sprint timer and scratchpad on the right.
            </p>
            <label className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold cursor-pointer inline-flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span>Upload a PDF</span>
              <input type="file" accept="application/pdf,.pdf" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
        )}
      </div>

      {/* Right Column: Pomodoro Timer + Study Scratchpad */}
      <div className="lg:col-span-4 min-w-0 space-y-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Pomodoro Focus Timer</h2>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums shrink-0">
              Sprints: {pomodoroSessions}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800 mb-5">
            {(
              [
                { id: "focus", label: "Focus 25m" },
                { id: "short", label: "Break 5m" },
                { id: "long", label: "Long 15m" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => resetPomodoro(tab.id)}
                className={`py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                  pomodoroMode === tab.id
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-center py-4">
            <p className="font-mono text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
              {formatTimer(pomodoroSeconds)}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 mt-4">
            <button
              type="button"
              onClick={togglePomodoro}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
            >
              {pomodoroRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{pomodoroRunning ? "Pause" : "Start Sprint"}</span>
            </button>
            <button
              type="button"
              onClick={() => resetPomodoro(pomodoroMode)}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              title="Reset timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Study Scratchpad</h2>
            <span className="text-xs text-slate-400">Auto-saved</span>
          </div>
          <textarea
            rows={9}
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              localStorage.setItem(NOTES_STORAGE_KEY, e.target.value);
            }}
            placeholder="Jot down key definitions, page references, or exam questions while reading..."
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
