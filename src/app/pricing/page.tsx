"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, Star } from "lucide-react";
import { useEfiqo } from "@/context/EfiqoContext";
import { BETA_USERS, PLAN_LIMITS } from "@/types/efiqo";
import { Footer } from "@/components/Footer";

export default function PricingPage() {
  const { profile, setIsAuthModalOpen } = useEfiqo();
  const [showCheckoutInfo, setShowCheckoutInfo] = useState(false);

  const isBetaEligible = Boolean(
    profile &&
      BETA_USERS.some((u) => u.email.toLowerCase() === profile.email.toLowerCase()) &&
      !profile.isPremiumUser
  );

  const activePriceLabel = isBetaEligible
    ? PLAN_LIMITS.premium.betaPriceLabel
    : PLAN_LIMITS.premium.priceLabel;

  const activationSubject = encodeURIComponent(
    `efIQo Premium Activation (${activePriceLabel}) - ${profile?.email || "Scholar"}`
  );
  const activationBody = encodeURIComponent(
    `Hello efIQo Team,\n\nI would like to activate efIQo Premium (${activePriceLabel}) for my account:\nEmail: ${
      profile?.email || ""
    }\nName: ${profile?.fullName || profile?.userName || ""}\n\nPlease share Nigerian bank transfer / Paystack payment details.`
  );

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-16 space-y-12 min-w-0">
        <div className="max-w-2xl">
          <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-2">
            Plans &amp; Pricing (NGN)
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white text-balance">
            Built for Nigerian scholars with a one-time Naira unlock.
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Prepare for university exams, JAMB, WAEC, and professional certifications free—or unlock bigger study sets and 15 MB lecture PDFs forever with one Naira payment.
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
                    For semester courses &amp; daily active recall
                  </p>
                </div>
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                  {PLAN_LIMITS.free.priceLabel}
                </span>
              </div>

              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300 pt-5 border-t border-slate-100 dark:border-slate-800">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Up to 7 flashcard sets &amp; 7 practice quizzes</span>
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
                    One-time Naira lifetime unlock · No monthly fees
                  </p>
                </div>
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                  {activePriceLabel}
                </span>
              </div>

              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300 pt-5 border-t border-slate-100 dark:border-slate-800">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Unlimited flashcard sets &amp; practice quizzes</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Max 50 flashcards or quiz questions per set</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Unlimited AI generations with Efi</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>15 MB max PDF upload for Efi AI synthesis</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Full deck JSON export &amp; public sharing links</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>50% early-access discount for beta scholars (₦2,500)</span>
                </li>
              </ul>
            </div>

            {profile?.isPremiumUser ? (
              <div className="mt-8 w-full py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm font-semibold text-center">
                Premium Unlocked on Your Account
              </div>
            ) : (
              <div className="mt-8 space-y-3">
                {isBetaEligible && (
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium text-center">
                    Beta scholar 50% discount detected for {profile?.email}
                  </p>
                )}

                {!showCheckoutInfo ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (!profile) {
                        setIsAuthModalOpen(true);
                        return;
                      }
                      setShowCheckoutInfo(true);
                    }}
                    className={`w-full py-3 rounded-xl text-white text-sm font-semibold cursor-pointer ${
                      isBetaEligible
                        ? "bg-rose-600 hover:bg-rose-700"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {isBetaEligible
                      ? `Unlock Beta Pro for ${PLAN_LIMITS.premium.betaPriceLabel}`
                      : `Upgrade Forever for ${PLAN_LIMITS.premium.priceLabel}`}
                  </button>
                ) : (
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 space-y-2.5 text-xs">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      Nigerian Bank Transfer / NGN Activation ({activePriceLabel})
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      Send a quick activation request with your registered email (
                      <span className="font-semibold">{profile?.email}</span>) to receive Naira transfer or local card checkout instructions.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <a
                        href={`mailto:tenderluxetechenterprises@gmail.com?subject=${activationSubject}&body=${activationBody}`}
                        className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                      >
                        Request Naira Checkout
                      </a>
                      <button
                        type="button"
                        onClick={() => setShowCheckoutInfo(false)}
                        className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
                  <th className="py-3 px-6 font-semibold">Free ({PLAN_LIMITS.free.priceLabel})</th>
                  <th className="py-3 px-6 font-semibold">Premium ({PLAN_LIMITS.premium.priceLabel})</th>
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
                  <td className="py-3 px-6 font-medium">Max Flashcards or Questions per Set</td>
                  <td className="py-3 px-6 tabular-nums">20 per set</td>
                  <td className="py-3 px-6 font-semibold text-slate-900 dark:text-white tabular-nums">50 per set</td>
                </tr>
                <tr>
                  <td className="py-3 px-6 font-medium">Efi AI Generations Limit</td>
                  <td className="py-3 px-6 tabular-nums">3 per day</td>
                  <td className="py-3 px-6 font-semibold text-slate-900 dark:text-white">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-3 px-6 font-medium">Max PDF Upload (Efi AI Synthesis)</td>
                  <td className="py-3 px-6 tabular-nums">5 MB max</td>
                  <td className="py-3 px-6 font-semibold text-slate-900 dark:text-white tabular-nums">15 MB max</td>
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
