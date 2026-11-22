"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { capitalizeFirst, type FlashcardSet, type QuizSet, type UserProfile } from "@/types/efiqo";
import {
  STORAGE_KEY,
  buildOrFetchFirebaseUserProfile,
  checkGoogleRedirectResult,
  createEmptyProfile,
  ensureFirebaseInitialized,
  getUserProfileFromStore,
  saveUserProfileToStore,
  signInWithGoogleAccount,
  signOutAccount,
  subscribeToFirebaseAuth,
  updateUserProfileFields,
} from "@/lib/firebase";

export type ActiveStudio =
  | { type: "overview" }
  | { type: "flashcard"; set: FlashcardSet | null; isNew?: boolean }
  | { type: "quiz"; set: QuizSet | null; initialMode?: "create" | "preview" | "attempt"; isNew?: boolean }
  | { type: "reader" };

interface ToastState {
  id: number;
  message: string;
  tone: "info" | "success" | "error";
}

interface EfiqoContextValue {
  profile: UserProfile | null;
  isHydrated: boolean;
  theme: "device" | "light" | "dark";
  activeStudio: ActiveStudio;
  setActiveStudio: React.Dispatch<React.SetStateAction<ActiveStudio>>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authError: string;
  setAuthError: (msg: string) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (open: boolean) => void;
  isPremiumModalOpen: boolean;
  setIsPremiumModalOpen: (open: boolean) => void;
  premiumReason: string;
  openPremiumModal: (reason?: string) => void;
  isTermsOpen: boolean;
  setIsTermsOpen: (open: boolean) => void;
  toast: ToastState | null;
  showToast: (message: string, tone?: "info" | "success" | "error") => void;
  handleSignIn: (mode?: "google" | "local", onSuccess?: () => void) => Promise<void>;
  handleSignOut: () => Promise<void>;
  cycleTheme: () => Promise<void>;
  updateProfile: (next: UserProfile) => Promise<void>;
  saveFlashcardSet: (set: FlashcardSet) => Promise<void>;
  deleteFlashcardSet: (id: string) => Promise<void>;
  saveQuizSet: (set: QuizSet) => Promise<void>;
  deleteQuizSet: (id: string) => Promise<void>;
  pomodoroSeconds: number;
  pomodoroMode: "focus" | "short" | "long";
  pomodoroRunning: boolean;
  pomodoroSessions: number;
  togglePomodoro: () => void;
  resetPomodoro: (mode?: "focus" | "short" | "long") => void;
}

const EfiqoContext = createContext<EfiqoContextValue | null>(null);

const POMODORO_DURATIONS = {
  focus: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
};

export function EfiqoProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [theme, setTheme] = useState<"device" | "light" | "dark">("device");
  const [activeStudio, setActiveStudio] = useState<ActiveStudio>({ type: "overview" });

  const [isAuthModalOpen, setIsAuthModalOpenState] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [premiumReason, setPremiumReason] = useState("Pricing");
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const [pomodoroMode, setPomodoroMode] = useState<"focus" | "short" | "long">("focus");
  const [pomodoroSeconds, setPomodoroSeconds] = useState(POMODORO_DURATIONS.focus);
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const [pomodoroSessions, setPomodoroSessions] = useState(0);

  const setIsAuthModalOpen = useCallback((open: boolean) => {
    setIsAuthModalOpenState(open);
    if (!open) setAuthError("");
  }, []);

  const showToast = useCallback((message: string, tone: "info" | "success" | "error" = "info") => {
    const id = Date.now();
    setToast({ id, message, tone });
    setTimeout(() => {
      setToast((curr) => (curr?.id === id ? null : curr));
    }, 4500);
  }, []);

  const applyThemeClass = useCallback((mode: "device" | "light" | "dark") => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = mode === "dark" || (mode === "device" && prefersDark);
    root.classList.toggle("dark", shouldBeDark);
  }, []);

  useEffect(() => {
    let active = true;
    let unsubscribeAuth = () => {};

    const init = async () => {
      try {
        const storedTheme =
          (localStorage.getItem("efiqo theme") as "device" | "light" | "dark" | null) || "device";

        await ensureFirebaseInitialized();

        // 1. Handle any pending Firebase mobile/redirect Google login first
        try {
          const redirectProfile = await checkGoogleRedirectResult();
          if (redirectProfile && active) {
            setProfile(redirectProfile);
            const resolved = redirectProfile.theme || storedTheme;
            setTheme(resolved);
            applyThemeClass(resolved);
            showToast(`Welcome back, ${redirectProfile.userName}`, "success");
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Google sign-in redirect failed.";
          if (active) {
            setAuthError(msg);
            showToast(msg, "error");
          }
        }

        // 2. Load cached local session if present while Firebase auth resolves
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw && active) {
          const parsed = JSON.parse(raw) as UserProfile;
          setProfile(parsed);
          const resolvedTheme = parsed.theme || storedTheme;
          setTheme(resolvedTheme);
          applyThemeClass(resolvedTheme);

          const fresh = await getUserProfileFromStore(parsed.email);
          if (fresh && active) {
            setProfile(fresh);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
            setTheme(fresh.theme || resolvedTheme);
            applyThemeClass(fresh.theme || resolvedTheme);
          }
        } else if (active) {
          setTheme(storedTheme);
          applyThemeClass(storedTheme);
        }

        // 3. Subscribe to live Firebase Auth state changes (matches pre-migration auth flow)
        unsubscribeAuth = subscribeToFirebaseAuth(async (firebaseUser) => {
          if (!active) return;
          if (firebaseUser) {
            try {
              const fbProfile = await buildOrFetchFirebaseUserProfile(firebaseUser);
              if (!active) return;
              setProfile(fbProfile);
              const resolved = fbProfile.theme || storedTheme;
              setTheme(resolved);
              applyThemeClass(resolved);
            } catch {
              // Keep existing cached profile if network unavailable
            }
          }
        });
      } catch {
        applyThemeClass("device");
      } finally {
        if (active) setIsHydrated(true);
      }
    };

    init();
    return () => {
      active = false;
      unsubscribeAuth();
    };
  }, [applyThemeClass, showToast]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => {
      if (theme === "device") applyThemeClass("device");
    };
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, [theme, applyThemeClass]);

  // Pomodoro timer tick
  useEffect(() => {
    if (!pomodoroRunning) return;
    const interval = setInterval(() => {
      setPomodoroSeconds((prev) => {
        if (prev <= 1) {
          setPomodoroRunning(false);
          if (pomodoroMode === "focus") {
            setPomodoroSessions((s) => s + 1);
            showToast("Focus sprint complete. Take a 5-minute break.", "success");
          } else {
            showToast("Break finished. Ready for your next focus sprint.", "info");
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [pomodoroRunning, pomodoroMode, showToast]);

  const togglePomodoro = () => setPomodoroRunning((r) => !r);

  const resetPomodoro = (mode: "focus" | "short" | "long" = pomodoroMode) => {
    setPomodoroRunning(false);
    setPomodoroMode(mode);
    setPomodoroSeconds(POMODORO_DURATIONS[mode]);
  };

  const handleSignIn = async (
    mode: "google" | "local" = "google",
    onSuccess?: () => void
  ) => {
    setAuthError("");
    try {
      if (mode === "local") {
        const localProf =
          (await getUserProfileFromStore("scholar@efiqo.local")) ||
          createEmptyProfile({ email: "scholar@efiqo.local" });
        await saveUserProfileToStore(localProf);
        setProfile(localProf);
        setTheme(localProf.theme || "device");
        applyThemeClass(localProf.theme || "device");
        setIsAuthModalOpen(false);
        showToast(`Signed in as ${localProf.userName} (Guest Mode)`, "info");
        onSuccess?.();
        return;
      }

      const res = await signInWithGoogleAccount();
      if (res.mode === "redirect") {
        showToast("Redirecting to Google sign-in...", "info");
        return;
      }

      if (res.profile) {
        setProfile(res.profile);
        setTheme(res.profile.theme || "device");
        applyThemeClass(res.profile.theme || "device");
        setIsAuthModalOpen(false);
        showToast(`Welcome back, ${res.profile.userName}`, "success");
        onSuccess?.();
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Could not complete Google sign-in. Please try again.";
      setAuthError(msg);
      showToast(msg, "error");
    }
  };

  const handleSignOut = async () => {
    await signOutAccount();
    setProfile(null);
    setActiveStudio({ type: "overview" });
    setIsProfileModalOpen(false);
    showToast("Signed out cleanly.", "info");
  };

  const cycleTheme = async () => {
    const order: Array<"device" | "light" | "dark"> = ["device", "light", "dark"];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);
    applyThemeClass(next);
    localStorage.setItem("efiqo theme", next);
    if (profile) {
      const updated = { ...profile, theme: next };
      setProfile(updated);
      await updateUserProfileFields(profile.email, { theme: next });
    }
  };

  const updateProfile = async (next: UserProfile) => {
    setProfile(next);
    await saveUserProfileToStore(next);
  };

  const saveFlashcardSet = async (set: FlashcardSet) => {
    if (!profile) return;
    const normalized: FlashcardSet = {
      ...set,
      name: capitalizeFirst(set.name) || set.name,
    };
    const exists = profile.flashcards.some((f) => f.id === normalized.id);
    const nextFlashcards = exists
      ? profile.flashcards.map((f) => (f.id === normalized.id ? normalized : f))
      : [normalized, ...profile.flashcards];
    const updated = { ...profile, flashcards: nextFlashcards };
    setProfile(updated);
    await saveUserProfileToStore(updated);
  };

  const deleteFlashcardSet = async (id: string) => {
    if (!profile) return;
    const updated = {
      ...profile,
      flashcards: profile.flashcards.filter((f) => f.id !== id),
    };
    setProfile(updated);
    await saveUserProfileToStore(updated);
    if (activeStudio.type === "flashcard" && activeStudio.set?.id === id) {
      setActiveStudio({ type: "overview" });
    }
    showToast("Flashcard set deleted.", "info");
  };

  const saveQuizSet = async (set: QuizSet) => {
    if (!profile) return;
    const normalized: QuizSet = {
      ...set,
      name: capitalizeFirst(set.name) || set.name,
    };
    const exists = profile.quizzes.some((q) => q.id === normalized.id);
    const nextQuizzes = exists
      ? profile.quizzes.map((q) => (q.id === normalized.id ? normalized : q))
      : [normalized, ...profile.quizzes];
    const updated = { ...profile, quizzes: nextQuizzes };
    setProfile(updated);
    await saveUserProfileToStore(updated);
  };

  const deleteQuizSet = async (id: string) => {
    if (!profile) return;
    const updated = {
      ...profile,
      quizzes: profile.quizzes.filter((q) => q.id !== id),
    };
    setProfile(updated);
    await saveUserProfileToStore(updated);
    if (activeStudio.type === "quiz" && activeStudio.set?.id === id) {
      setActiveStudio({ type: "overview" });
    }
    showToast("Quiz deleted.", "info");
  };

  const openPremiumModal = (reason = "Upgrade to efIQo Pro") => {
    setPremiumReason(reason);
    setIsPremiumModalOpen(true);
  };

  return (
    <EfiqoContext.Provider
      value={{
        profile,
        isHydrated,
        theme,
        activeStudio,
        setActiveStudio,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authError,
        setAuthError,
        isProfileModalOpen,
        setIsProfileModalOpen,
        isSearchModalOpen,
        setIsSearchModalOpen,
        isPremiumModalOpen,
        setIsPremiumModalOpen,
        premiumReason,
        openPremiumModal,
        isTermsOpen,
        setIsTermsOpen,
        toast,
        showToast,
        handleSignIn,
        handleSignOut,
        cycleTheme,
        updateProfile,
        saveFlashcardSet,
        deleteFlashcardSet,
        saveQuizSet,
        deleteQuizSet,
        pomodoroSeconds,
        pomodoroMode,
        pomodoroRunning,
        pomodoroSessions,
        togglePomodoro,
        resetPomodoro,
      }}
    >
      {children}
    </EfiqoContext.Provider>
  );
}

export function useEfiqo() {
  const ctx = useContext(EfiqoContext);
  if (!ctx) throw new Error("useEfiqo must be used within EfiqoProvider");
  return ctx;
}
