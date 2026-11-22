"use client";

import React from "react";
import Link from "next/link";
import { Check, Star } from "lucide-react";
import { useEfiqo } from "@/context/EfiqoContext";
import { BETA_USERS } from "@/types/efiqo";
import { Footer } from "@/components/Footer";

export default function PricingPage() {
  const { profile, setIsAuthModalOpen } = useEfiqo();

  const isBetaEligible = Boolean(
    profile &&
      BETA_USERS.some((u) => u.email.toLowerCase() === profile.email.toLowerCase()) &&
      !profile.isPremiumUser
  );

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-16 space-y-12 min-w-0">
        <div className="max-w-2xl">
          <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-2">
            Plans &amp; Pricing
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white text-balance">
            Transparent pricing with a one-time lifetime unlock.
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Use efIQo free for your core coursework, or unlock unlimited decks, quizzes, and items forever with a single payment.
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
          {/* Free Tier */}
          <div className="min-w-0 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Free Scholar Plan</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    For single-term courses and quick recall
                  </p>
                </div>
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                  $0
                </span>
              </div>

              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300 pt-5 border-t border-slate-100 dark:border-slate-800">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Up to 7 flashcard sets &amp; 7 practice quizzes</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Up to 20 cards or questions per set</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Efi AI synthesis from topics or 10 MB PDFs</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Side-by-side PDF reader &amp; Pomodoro timer</span>
                </li>
              </ul>
            </div>

            {profile ? (
              <Link
                href="/dashboard"
                className="mt-8 w-full py-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white text-center block"
              >
                Open Dashboard
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="mt-8 w-full py-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white cursor-pointer"
              >
                Start Free Workspace
              </button>
            )}
          </div>

          {/* Lifetime Premium */}
          <div className="min-w-0 rounded-2xl border border-blue-600/50 bg-white dark:bg-slate-900 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Premium Plan</span>
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                  </h2>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    One-time lifetime unlock · No subscriptions
                  </p>
                </div>
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                  {isBetaEligible ? "$2.50" : "$4.99"}
                </span>
              </div>

              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300 pt-5 border-t border-slate-100 dark:border-slate-800">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Unlimited flashcard sets &amp; practice quizzes</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Unlimited cards &amp; questions per set</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Full deck JSON export &amp; public sharing links</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>50% early-access discount for registered beta scholars</span>
                </li>
              </ul>
            </div>

            {profile?.isPremiumUser ? (
              <div className="mt-8 w-full py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm font-semibold text-center">
                Premium Unlocked on Your Account
              </div>
            ) : isBetaEligible ? (
              <form
                action="https://www.paypal.com/ncp/payment/8Y8A5MD9DW9B8"
                method="post"
                target="_blank"
                className="mt-8 space-y-2"
              >
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium text-center">
                  Beta scholar 50% discount detected for {profile?.email}
                </p>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold cursor-pointer"
                >
                  Unlock Beta Pro with PayPal
                </button>
              </form>
            ) : (
              <form
                action="https://www.paypal.com/ncp/payment/FX7KJ62DYGV5J"
                method="post"
                target="_blank"
                className="mt-8"
              >
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold cursor-pointer"
                >
                  Upgrade Forever for $4.99
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Comparison Table */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Plan Limits Comparison</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-6 font-semibold">Feature</th>
                  <th className="py-3 px-6 font-semibold">Free</th>
                  <th className="py-3 px-6 font-semibold">Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                <tr>
                  <td className="py-3 px-6 font-medium">Flashcard Sets</td>
                  <td className="py-3 px-6 tabular-nums">7 sets</td>
                  <td className="py-3 px-6 font-semibold text-slate-900 dark:text-white">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-3 px-6 font-medium">Quiz Sets</td>
                  <td className="py-3 px-6 tabular-nums">7 sets</td>
                  <td className="py-3 px-6 font-semibold text-slate-900 dark:text-white">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-3 px-6 font-medium">Cards / Questions per Set</td>
                  <td className="py-3 px-6 tabular-nums">Up to 20</td>
                  <td className="py-3 px-6 font-semibold text-slate-900 dark:text-white">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-3 px-6 font-medium">Efi AI Topic &amp; 10 MB PDF Synthesis</td>
                  <td className="py-3 px-6">Included</td>
                  <td className="py-3 px-6">Included</td>
                </tr>
                <tr>
                  <td className="py-3 px-6 font-medium">Local PDF Reader &amp; Pomodoro Timer</td>
                  <td className="py-3 px-6">Included</td>
                  <td className="py-3 px-6">Included</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
