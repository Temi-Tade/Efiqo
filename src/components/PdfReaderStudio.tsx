"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
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

  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [pdfName, setPdfName] = useState<string>("");
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNum, setPageNum] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(1);
  const [loadingPdf, setLoadingPdf] = useState<boolean>(false);
  const [renderingPage, setRenderingPage] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [notes, setNotes] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem(NOTES_STORAGE_KEY) || "" : ""
  );

  const readerRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Track container width for responsive fit-to-width rendering on mobile & desktop
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const updateWidth = () => {
      if (el.clientWidth > 0) {
        setContainerWidth(el.clientWidth);
      }
    };
    updateWidth();

    const observer = new ResizeObserver(() => updateWidth());
    observer.observe(el);
    return () => observer.disconnect();
  }, [pdfDoc]);

  // Cleanup active PDFDocumentProxy on unmount or replacement
  useEffect(() => {
    return () => {
      if (pdfDoc) {
        pdfDoc.loadingTask?.destroy().catch(() => {});
      }
    };
  }, [pdfDoc]);

  // Render active page onto responsive high-DPI canvas (works on iOS, Android, and Desktop)
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current || containerWidth <= 0) return;
    let cancelled = false;

    const renderPage = async () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }

      setRenderingPage(true);
      try {
        const page = await pdfDoc.getPage(pageNum);
        if (cancelled || !canvasRef.current) return;

        const baseViewport = page.getViewport({ scale: 1 });
        const horizontalPadding = containerWidth < 640 ? 16 : 32;
        const availableWidth = Math.max(containerWidth - horizontalPadding, 220);
        const fitScale = availableWidth / baseViewport.width;
        const targetScale = fitScale * zoom;
        const viewport = page.getViewport({ scale: targetScale });

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        const task = page.render({
          canvas,
          canvasContext: ctx,
          viewport,
          transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined,
        });
        renderTaskRef.current = task;
        await task.promise;
      } catch (err) {
        const name = (err as { name?: string })?.name;
        if (name !== "RenderingCancelledException" && !cancelled) {
          showToast("Could not render this PDF page.", "error");
        }
      } finally {
        if (!cancelled) {
          setRenderingPage(false);
        }
      }
    };

    renderPage();
    return () => {
      cancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
    };
  }, [pdfDoc, pageNum, zoom, containerWidth, showToast]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      showToast("Please select a valid PDF document.", "error");
      return;
    }

    setLoadingPdf(true);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      const buffer = await file.arrayBuffer();
      const loadedDoc = await pdfjsLib.getDocument({ data: buffer }).promise;

      setPdfDoc(loadedDoc);
      setPdfName(file.name);
      setNumPages(loadedDoc.numPages);
      setPageNum(1);
      setZoom(1);
      showToast(`Loaded "${file.name}" (${loadedDoc.numPages} pages).`, "success");
    } catch {
      showToast("Could not open this PDF file. Please try another document.", "error");
    } finally {
      setLoadingPdf(false);
    }
  };

  const closePdf = useCallback(() => {
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }
    setPdfDoc(null);
    setPdfName("");
    setNumPages(0);
    setPageNum(1);
    setZoom(1);
  }, []);

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
      {/* PDF Viewport (Mobile & Desktop via PDF.js Canvas) */}
      <div
        ref={readerRef}
        className="lg:col-span-8 min-w-0 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col min-h-[460px] h-[72vh] lg:h-[calc(100vh-12rem)]"
      >
        <div className="px-3 sm:px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <FileText className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
              {pdfName || "Course PDF Reader"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 shrink-0">
            <label className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer inline-flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5" />
              <span>{pdfDoc ? "Change PDF" : "Open PDF"}</span>
              <input type="file" accept="application/pdf,.pdf" className="hidden" onChange={handleFileChange} />
            </label>

            {pdfDoc && (
              <>
                <button
                  type="button"
                  onClick={toggleFocusMode}
                  className="hidden sm:inline-flex px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 items-center gap-1.5 cursor-pointer"
                >
                  {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  <span>{isFullscreen ? "Exit Focus" : "Focus Mode"}</span>
                </button>
                <button
                  type="button"
                  onClick={closePdf}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                  title="Close PDF"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Page & Zoom Controls Bar when a PDF is loaded */}
        {pdfDoc && (
          <div className="px-3 sm:px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={pageNum <= 1}
                onClick={() => setPageNum((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-medium text-slate-700 dark:text-slate-200 tabular-nums whitespace-nowrap">
                Page {pageNum} of {numPages}
              </span>
              <button
                type="button"
                disabled={pageNum >= numPages}
                onClick={() => setPageNum((p) => Math.min(numPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={zoom <= 0.75}
                onClick={() => setZoom((z) => Math.max(0.75, Number((z - 0.25).toFixed(2))))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(1)}
                className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-[11px] tabular-nums hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                title="Reset zoom to fit width"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                type="button"
                disabled={zoom >= 2.25}
                onClick={() => setZoom((z) => Math.min(2.25, Number((z + 0.25).toFixed(2))))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Canvas Scroll Area or Empty State */}
        {loadingPdf ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 gap-3 text-sm text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span>Opening PDF document...</span>
          </div>
        ) : pdfDoc ? (
          <div
            ref={viewportRef}
            className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-950 p-2 sm:p-4 flex justify-center items-start relative"
          >
            {renderingPage && (
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-slate-900/80 text-white text-[11px] inline-flex items-center gap-1.5 z-10">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Rendering...</span>
              </div>
            )}
            <canvas
              ref={canvasRef}
              className="rounded-lg shadow-sm bg-white block max-w-none"
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Read Lecture Slides on Mobile or Desktop
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-6">
              Files render locally in your browser with PDF.js—no server upload needed. Pair reading with the Pomodoro timer and scratchpad.
            </p>
            <label className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold cursor-pointer inline-flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span>Open PDF</span>
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
