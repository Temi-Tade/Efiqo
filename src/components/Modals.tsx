"use client";

import React, { useState, useEffect } from "react";
import { X, Check, Loader2, Upload, Sun, Moon, Laptop, Sparkles, Search, BookOpen, HelpCircle, Trash2, LogOut, Star } from "lucide-react";
import { useEfiqo } from "@/context/EfiqoContext";
import {
  BETA_USERS,
  type FlashcardSet,
  type QuizSet,
  type UserProfile,
} from "@/types/efiqo";
import {
  deleteUserAccountFromStore,
  fetchCommunityLibrary,
  isFirebaseConfigured,
  isUsernameAvailable,
} from "@/lib/firebase";

export function GlobalModals() {
  const {
    profile,
    theme,
    cycleTheme,
    isAuthModalOpen,
    setIsAuthModalOpen,
    isProfileModalOpen,
    setIsProfileModalOpen,
    isSearchModalOpen,
    setIsSearchModalOpen,
    isPremiumModalOpen,
    setIsPremiumModalOpen,
    premiumReason,
    isTermsOpen,
    setIsTermsOpen,
    handleSignIn,
    handleSignOut,
    updateProfile,
    setActiveStudio,
    toast,
    showToast,
  } = useEfiqo();

  const [authLoading, setAuthLoading] = useState(false);

  return (
    <>
      {/* Toast notification */}
      {toast && (
        <div
          role="status"
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-lg border shadow-lg text-sm font-medium flex items-center gap-2.5 max-w-sm transition-all ${
            toast.tone === "error"
              ? "bg-rose-50 dark:bg-rose-950/90 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200"
              : toast.tone === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
          }`}
        >
          <span>{toast.message}</span>
        </div>
      )}

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsAuthModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Enter efIQo Workspace
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Sync flashcards, quizzes, and study mastery across sessions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(false)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Close sign-in dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                disabled={authLoading}
                onClick={async () => {
                  setAuthLoading(true);
                  await handleSignIn("google");
                  setAuthLoading(false);
                }}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-900 dark:text-white font-semibold text-sm transition-colors cursor-pointer disabled:opacity-60"
              >
                {authLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <img src="/images/google-logo.png" alt="Google" className="w-5 h-5" />
                )}
                <span>{isFirebaseConfigured ? "Continue with Google" : "Sign In with Google"}</span>
              </button>

              <button
                type="button"
                disabled={authLoading}
                onClick={async () => {
                  setAuthLoading(true);
                  await handleSignIn("local");
                  setAuthLoading(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors cursor-pointer disabled:opacity-60"
              >
                <span>Quick Start as Guest Scholar</span>
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-5 text-center leading-relaxed">
              Starter Biology, Economics, and Neuroanatomy study sets are preloaded so you can test active recall immediately.
            </p>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {isProfileModalOpen && profile && (
        <ProfileModalContent
          profile={profile}
          theme={theme}
          cycleTheme={cycleTheme}
          onClose={() => setIsProfileModalOpen(false)}
          onSave={updateProfile}
          onSignOut={handleSignOut}
          onOpenPremium={() => {
            setIsProfileModalOpen(false);
            setIsPremiumModalOpen(true);
          }}
          onOpenTerms={() => {
            setIsProfileModalOpen(false);
            setIsTermsOpen(true);
          }}
          showToast={showToast}
        />
      )}

      {/* Community Search Modal */}
      {isSearchModalOpen && (
        <CommunitySearchModal
          onClose={() => setIsSearchModalOpen(false)}
          onSelectFlashcard={(set) => {
            setIsSearchModalOpen(false);
            setActiveStudio({ type: "flashcard", set });
          }}
          onSelectQuiz={(set) => {
            setIsSearchModalOpen(false);
            setActiveStudio({ type: "quiz", set, initialMode: "preview" });
          }}
        />
      )}

      {/* Premium Upgrade Modal */}
      {isPremiumModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsPremiumModalOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{premiumReason}</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  One-time lifetime upgrade. No recurring monthly subscriptions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPremiumModalOpen(false)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Free Plan ($0)</h3>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <li>Up to 7 flashcard sets</li>
                  <li>Up to 7 quiz sets</li>
                  <li>Up to 20 cards/questions per set</li>
                  <li>PDF reader & Pomodoro timer</li>
                </ul>
              </div>
              <div className="p-4 rounded-xl border border-blue-600/40 bg-blue-50/50 dark:bg-blue-950/20">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <span>Premium Plan ($4.99)</span>
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                </h3>
                <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
                  <li>Unlimited flashcard sets</li>
                  <li>Unlimited quiz sets</li>
                  <li>Unlimited cards & questions per set</li>
                  <li>Priority JSON/CSV export & Efi tutor</li>
                </ul>
              </div>
            </div>

            {profile && BETA_USERS.some((u) => u.email.toLowerCase() === profile.email.toLowerCase()) && !profile.isPremiumUser ? (
              <form
                action="https://www.paypal.com/ncp/payment/8Y8A5MD9DW9B8"
                method="post"
                target="_blank"
                className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-200 dark:border-slate-800"
              >
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                  Early access beta discount applied (50% off).
                </p>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm cursor-pointer"
                >
                  Pay Now with PayPal
                </button>
              </form>
            ) : (
              <form
                action="https://www.paypal.com/ncp/payment/FX7KJ62DYGV5J"
                method="post"
                target="_blank"
                className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-200 dark:border-slate-800"
              >
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Checkout powered securely by PayPal.
                </span>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm cursor-pointer"
                >
                  Upgrade for $4.99
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Terms Modal */}
      {isTermsOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsTermsOpen(false)}
        >
          <div
            className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Terms of Use & Privacy</h2>
              <button
                type="button"
                onClick={() => setIsTermsOpen(false)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                By using efIQo, you agree that account information (display name, email, study decks, and preferences) is stored solely to provide, sync, and improve your study workspace.
              </p>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Your Rights</h3>
                <p>
                  You retain the right to access, correct, export, or permanently delete your account and study decks at any time from your Profile panel.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Contact</h3>
                <p>
                  For enquiries, reach out to{" "}
                  <a href="mailto:tenderluxetechenterprises@gmail.com" className="text-blue-600 dark:text-blue-400 underline">
                    tenderluxetechenterprises@gmail.com
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ProfileModalContent({
  profile,
  theme,
  cycleTheme,
  onClose,
  onSave,
  onSignOut,
  onOpenPremium,
  onOpenTerms,
  showToast,
}: {
  profile: UserProfile;
  theme: "device" | "light" | "dark";
  cycleTheme: () => Promise<void>;
  onClose: () => void;
  onSave: (next: UserProfile) => Promise<void>;
  onSignOut: () => Promise<void>;
  onOpenPremium: () => void;
  onOpenTerms: () => void;
  showToast: (msg: string, tone?: "info" | "success" | "error") => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<UserProfile>(profile);
  const [usernameOk, setUsernameOk] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result || "");
      setForm((prev) => ({ ...prev, pfp: { file: file.name, url } }));
    };
    reader.readAsDataURL(file);
  };

  const handleUsernameChange = async (value: string) => {
    setForm((prev) => ({ ...prev, userName: value }));
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
    await onSave(form);
    setEditing(false);
    showToast("Profile updated.", "success");
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[88vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Scholar Profile</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cycleTheme}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              title="Toggle appearance theme"
            >
              {theme === "light" ? (
                <Sun className="w-3.5 h-3.5" />
              ) : theme === "dark" ? (
                <Moon className="w-3.5 h-3.5" />
              ) : (
                <Laptop className="w-3.5 h-3.5" />
              )}
              <span className="capitalize">{theme}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <img
              src={form.pfp.url || "/images/default_avatar.png"}
              alt={form.fullName}
              className="w-16 h-16 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 dark:text-white truncate">{form.fullName || form.userName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{form.email}</p>
              <div className="mt-2 flex items-center gap-2">
                {!editing ? (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <label className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Avatar</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
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
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Full Name</label>
              <input
                type="text"
                value={form.fullName}
                disabled={!editing}
                onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Date of Birth</label>
              <input
                type="date"
                value={form.dob}
                disabled={!editing}
                onChange={(e) => setForm((p) => ({ ...p, dob: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Sex</label>
              <select
                value={form.gender}
                disabled={!editing}
                onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm disabled:opacity-60"
              >
                <option value="">-- Select --</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Phone Number</label>
              <input
                type="tel"
                value={form.tel}
                disabled={!editing}
                onChange={(e) => setForm((p) => ({ ...p, tel: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Academic Level</label>
              <select
                value={form.level}
                disabled={!editing}
                onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm disabled:opacity-60"
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
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setForm(profile);
                  setEditing(false);
                }}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          )}
        </form>

        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 space-y-3">
          {!profile.isPremiumUser && (
            <button
              type="button"
              onClick={onOpenPremium}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Get efIQo Premium ($4.99)</span>
            </button>
          )}

          <div className="flex items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={onOpenTerms}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline cursor-pointer"
            >
              Terms of Use
            </button>

            <div className="flex items-center gap-3">
              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="text-xs font-medium text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Account</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    await deleteUserAccountFromStore(profile.email);
                    await onSignOut();
                    showToast("Account deleted.", "info");
                  }}
                  className="text-xs font-semibold text-white bg-rose-600 px-3 py-1.5 rounded-md cursor-pointer"
                >
                  Confirm Delete
                </button>
              )}

              <button
                type="button"
                onClick={onSignOut}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CommunitySearchModal({
  onClose,
  onSelectFlashcard,
  onSelectQuiz,
}: {
  onClose: () => void;
  onSelectFlashcard: (set: FlashcardSet) => void;
  onSelectQuiz: (set: QuizSet) => void;
}) {
  const [queryText, setQueryText] = useState("");
  const [loading, setLoading] = useState(true);
  const [flashcards, setFlashcards] = useState<FlashcardSet[]>([]);
  const [quizzes, setQuizzes] = useState<QuizSet[]>([]);

  useEffect(() => {
    fetchCommunityLibrary()
      .then((res) => {
        setFlashcards(res.flashcards);
        setQuizzes(res.quizzes);
      })
      .finally(() => setLoading(false));
  }, []);

  const term = queryText.trim().toLowerCase();
  const filteredFlashcards = flashcards.filter(
    (f) => !term || f.name.toLowerCase().includes(term) || f.desc.toLowerCase().includes(term)
  );
  const filteredQuizzes = quizzes.filter(
    (q) => !term || q.name.toLowerCase().includes(term) || q.desc.toLowerCase().includes(term)
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="search"
            autoFocus
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="Search community flashcards and quizzes..."
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-6">
          {loading ? (
            <div className="py-12 flex items-center justify-center gap-2 text-sm text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading shared study library...</span>
            </div>
          ) : filteredFlashcards.length === 0 && filteredQuizzes.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500">
              No matching flashcards or quizzes found for &ldquo;{queryText}&rdquo;.
            </p>
          ) : (
            <>
              {filteredFlashcards.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
                    Flashcard Sets ({filteredFlashcards.length})
                  </h3>
                  <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    {filteredFlashcards.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => onSelectFlashcard(f)}
                        className="w-full px-4 py-3 text-left flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{f.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {f.desc || "Flashcard deck"} · {f.flashcards.length} cards
                          </p>
                        </div>
                        <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {filteredQuizzes.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
                    Quizzes ({filteredQuizzes.length})
                  </h3>
                  <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    {filteredQuizzes.map((q) => (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => onSelectQuiz(q)}
                        className="w-full px-4 py-3 text-left flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{q.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {q.desc || "Multiple-choice quiz"} · {q.questions.length} questions
                          </p>
                        </div>
                        <HelpCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function EfiGeneratorModal({
  mode,
  onClose,
  onGeneratedFlashcards,
  onGeneratedQuiz,
}: {
  mode: "flashcard" | "quiz";
  onClose: () => void;
  onGeneratedFlashcards?: (set: FlashcardSet) => void;
  onGeneratedQuiz?: (set: QuizSet) => void;
}) {
  const { profile, showToast } = useEfiqo();
  const [sourceType, setSourceType] = useState<"topic" | "pdf">("topic");
  const [course, setCourse] = useState("");
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(8);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const readFileBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const res = String(reader.result || "");
        resolve(res.split(",")[1] || "");
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (sourceType === "pdf") {
      if (!pdfFile) {
        setError("Please select a PDF lecture file (max 10 MB).");
        return;
      }
      if (pdfFile.size > 10 * 1024 * 1024 || pdfFile.type !== "application/pdf") {
        setError("Document must be a PDF under 10 MB.");
        return;
      }
    }

    setLoading(true);
    try {
      let fileData = "";
      let mimeType = "";
      if (sourceType === "pdf" && pdfFile) {
        fileData = await readFileBase64(pdfFile);
        mimeType = pdfFile.type;
      }

      const endpoint = mode === "flashcard" ? "/api/generate/flashcards" : "/api/generate/quiz";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course,
          topic: sourceType === "topic" ? topic : "",
          number: count,
          fileData,
          mimeType,
        }),
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.error || "Failed to generate study material.");
      }

      if (mode === "flashcard" && onGeneratedFlashcards) {
        const items = (payload as Array<{ term: string; def: string }>).map((item, i) => ({
          id: `${Date.now()}-${i}`,
          term: item.term,
          def: item.def,
          mastery: "new" as const,
        }));
        const set: FlashcardSet = {
          id: typeof crypto !== "undefined" ? crypto.randomUUID() : `fc-${Date.now()}`,
          name: sourceType === "pdf" ? course : topic || course,
          desc: sourceType === "pdf" ? `Synthesized from ${pdfFile?.name}` : `${course} · ${topic}`,
          subject: course,
          flashcards: items,
          number: items.length,
          created: new Date().toUTCString(),
          by: profile?.email || "scholar@efiqo.local",
          mode: "study",
        };
        onGeneratedFlashcards(set);
        showToast(`Efi generated ${items.length} flashcards.`, "success");
        onClose();
      } else if (mode === "quiz" && onGeneratedQuiz) {
        const questions = payload as QuizSet["questions"];
        const set: QuizSet = {
          id: typeof crypto !== "undefined" ? crypto.randomUUID() : `qz-${Date.now()}`,
          name: sourceType === "pdf" ? course : topic || course,
          desc: sourceType === "pdf" ? `Synthesized from ${pdfFile?.name}` : `${course} · ${topic}`,
          subject: course,
          questions,
          mode: "preview",
          timeStamp: new Date().toUTCString(),
          by: profile?.email || "scholar@efiqo.local",
        };
        onGeneratedQuiz(set);
        showToast(`Efi generated ${questions.length} quiz questions.`, "success");
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate content.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={() => !loading && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <img src="/images/Efi2.png" alt="Efi mascot" className="w-10 h-10 object-contain" />
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {mode === "flashcard" ? "Generate Flashcards with Efi" : "Generate Quiz with Efi"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Powered by Gemini AI on server-side routes
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800 mb-5">
          <button
            type="button"
            onClick={() => setSourceType("topic")}
            className={`py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              sourceType === "topic"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Course & Topic
          </button>
          <button
            type="button"
            onClick={() => setSourceType("pdf")}
            className={`py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              sourceType === "pdf"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Upload PDF Lecture
          </button>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Course / Subject
            </label>
            <input
              type="text"
              required
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder={mode === "flashcard" ? "e.g. Organic Chemistry" : "e.g. Macroeconomics"}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
            />
          </div>

          {sourceType === "topic" ? (
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Specific Topic
              </label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={mode === "flashcard" ? "e.g. Nucleophilic Substitution" : "e.g. Monetary Policy"}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Lecture PDF (Max 10 MB)
              </label>
              <label className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 cursor-pointer text-center">
                <Upload className="w-5 h-5 text-blue-600 mb-1.5" />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                  {pdfFile ? pdfFile.name : "Choose a PDF document"}
                </span>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Number of {mode === "flashcard" ? "Cards" : "Questions"} (3–20)
            </label>
            <input
              type="number"
              min={3}
              max={20}
              required
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm tabular-nums"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Synthesizing with Efi...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate {mode === "flashcard" ? "Flashcard Set" : "Quiz"}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
