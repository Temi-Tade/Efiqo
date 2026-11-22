"use client";

import React, { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { useEfiqo } from "@/context/EfiqoContext";

export function AuthRequiredCard({
  title = "Sign in to access your study workspace",
  subtitle = "Sync flashcards, practice quizzes, and mastery scores across devices with Google or start right away as a guest.",
}: {
  title?: string;
  subtitle?: string;
}) {
  const { handleSignIn, authError } = useEfiqo();
  const [loading, setLoading] = useState(false);

  return (
    <div className="max-w-md mx-auto my-10 px-4">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{subtitle}</p>

        {authError && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">{authError}</span>
          </div>
        )}

        <div className="mt-6 space-y-3">
          <button
            type="button"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              await handleSignIn("google");
              setLoading(false);
            }}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/70 text-slate-900 dark:text-white font-semibold text-sm transition-colors cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin shrink-0" />
            ) : (
              <img src="/images/google-logo.png" alt="Google" className="w-5 h-5 shrink-0" />
            )}
            <span>Sign In with Google</span>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              await handleSignIn("local");
              setLoading(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold text-sm transition-colors cursor-pointer disabled:opacity-60"
          >
            <span>Continue as Guest (Local Only)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
