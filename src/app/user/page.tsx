"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Laptop, Loader2, LogOut, Moon, Star, Sun, Trash2, Upload } from "lucide-react";
import { useEfiqo } from "@/context/EfiqoContext";
import { deleteUserAccountFromStore, isUsernameAvailable } from "@/lib/firebase";
import type { UserProfile } from "@/types/efiqo";
import { AuthRequiredCard } from "@/components/AuthRequiredCard";
import { Footer } from "@/components/Footer";

export default function UserPage() {
  const router = useRouter();
  const { profile, isHydrated, theme, cycleTheme, updateProfile, handleSignOut, showToast } = useEfiqo();

  const [editing, setEditing] = useState(false);
  const [draftForm, setDraftForm] = useState<UserProfile | null>(null);
  const [usernameOk, setUsernameOk] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!isHydrated) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-sm text-slate-500">
        Loading account...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center py-10">
          <AuthRequiredCard
            title="Sign in to view your Profile"
            subtitle="Customize your scholar profile, appearance theme, and synced study progress."
          />
        </div>
        <Footer />
      </div>
    );
  }

  const form = editing && draftForm ? draftForm : profile;

  const updateDraft = (updater: (prev: UserProfile) => UserProfile) => {
    setDraftForm((prev) => updater(prev ?? profile));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result || "");
      updateDraft((prev) => ({ ...prev, pfp: { file: file.name, url } }));
    };
    reader.readAsDataURL(file);
  };

  const handleUsernameChange = async (value: string) => {
    updateDraft((prev) => ({ ...prev, userName: value }));
    if (value.trim().length < 4) {
      setUsernameOk(false);
      return;
    }
    setCheckingUsername(true);
    const ok = await isUsernameAvailable(value, profile.email);
    setUsernameOk(ok);
    setCheckingUsername(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameOk === false) {
      showToast("Username must be at least 4 characters and unique.", "error");
      return;
    }
    await updateProfile(form);
    setDraftForm(null);
    setEditing(false);
    showToast("Profile updated.", "success");
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10 space-y-6 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Account &amp; Profile
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage your scholar details, appearance preferences, and plan membership.
            </p>
          </div>

          <button
            type="button"
            onClick={cycleTheme}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            {theme === "light" ? (
              <Sun className="w-4 h-4" />
            ) : theme === "dark" ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Laptop className="w-4 h-4" />
            )}
            <span className="capitalize">Theme: {theme}</span>
          </button>
        </div>

        {/* Profile Form Card */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-4 min-w-0">
              <img
                src={form.pfp.url || "/images/default_avatar.png"}
                alt={form.fullName}
                className="w-16 h-16 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0">
                <p className="text-lg font-bold text-slate-900 dark:text-white truncate">
                  {form.fullName || form.userName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{form.email}</p>
                {editing && (
                  <label className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Avatar</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </label>
                )}
              </div>
            </div>

            {!editing && (
              <button
                type="button"
                onClick={() => {
                  setDraftForm(profile);
                  setUsernameOk(null);
                  setEditing(true);
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Edit Profile
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="min-w-0">
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Username{" "}
                  {editing && (
                    <span className="ml-1">
                      {checkingUsername ? (
                        <Loader2 className="inline w-3 h-3 animate-spin" />
                      ) : usernameOk === true ? (
                        <Check className="inline w-3 h-3 text-emerald-600" />
                      ) : usernameOk === false ? (
                        <span className="text-rose-600">Unavailable</span>
                      ) : null}
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={form.userName}
                  disabled={!editing}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  className="w-full min-w-0 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm disabled:opacity-60"
                />
              </div>

              <div className="min-w-0">
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={form.fullName}
                  disabled={!editing}
                  onChange={(e) => updateDraft((p) => ({ ...p, fullName: e.target.value }))}
                  className="w-full min-w-0 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm disabled:opacity-60"
                />
              </div>

              <div className="min-w-0">
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={form.dob}
                  disabled={!editing}
                  onChange={(e) => updateDraft((p) => ({ ...p, dob: e.target.value }))}
                  className="w-full min-w-0 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm disabled:opacity-60"
                />
              </div>

              <div className="min-w-0">
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Sex
                </label>
                <select
                  value={form.gender}
                  disabled={!editing}
                  onChange={(e) => updateDraft((p) => ({ ...p, gender: e.target.value }))}
                  className="w-full min-w-0 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm disabled:opacity-60"
                >
                  <option value="">-- Select --</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="min-w-0">
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={form.tel}
                  disabled={!editing}
                  onChange={(e) => updateDraft((p) => ({ ...p, tel: e.target.value }))}
                  className="w-full min-w-0 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm disabled:opacity-60"
                />
              </div>

              <div className="min-w-0">
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Academic Level
                </label>
                <select
                  value={form.level}
                  disabled={!editing}
                  onChange={(e) => updateDraft((p) => ({ ...p, level: e.target.value }))}
                  className="w-full min-w-0 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm disabled:opacity-60"
                >
                  <option value="">-- Select --</option>
                  <option value="Pre-primary">Pre-primary</option>
                  <option value="Primary">Primary</option>
                  <option value="Secondary (High School)">Secondary (High School)</option>
                  <option value="College (Undergrad)">College (Undergrad)</option>
                  <option value="College (Postgrad)">College (Postgrad)</option>
                  <option value="others">Others</option>
                </select>
              </div>
            </div>

            {editing && (
              <div className="flex flex-wrap justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setDraftForm(null);
                    setUsernameOk(null);
                    setEditing(false);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </section>

        {/* Membership & Session Controls */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {profile.isPremiumUser ? "efIQo Premium Member" : "Free Scholar Plan"}
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {profile.isPremiumUser
                ? "Unlimited flashcard sets, quizzes, and items unlocked."
                : `${profile.flashcards.length}/7 flashcard sets and ${profile.quizzes.length}/7 quiz sets used.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!profile.isPremiumUser && (
              <Link
                href="/pricing"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold whitespace-nowrap"
              >
                Upgrade to Premium
              </Link>
            )}

            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Account</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={async () => {
                  await deleteUserAccountFromStore(profile.email);
                  await handleSignOut();
                  showToast("Account deleted.", "info");
                  router.push("/");
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold cursor-pointer"
              >
                Confirm Delete
              </button>
            )}

            <button
              type="button"
              onClick={async () => {
                await handleSignOut();
                router.push("/");
              }}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
