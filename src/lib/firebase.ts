import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  browserLocalPersistence,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut as fbSignOut,
  type Auth,
  type User,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  type Firestore,
} from "firebase/firestore";
import {
  BETA_USERS,
  STARTER_FLASHCARDS,
  STARTER_QUIZZES,
  type FlashcardSet,
  type QuizSet,
  type UserProfile,
} from "@/types/efiqo";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;
let provider: GoogleAuthProvider | null = null;

if (typeof window !== "undefined" && isFirebaseConfigured) {
  try {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    auth = getAuth(app);
    setPersistence(auth, browserLocalPersistence).catch(() => {
      // Persistence may fall back to session/memory in strict browser modes
    });
    firestore = getFirestore(app);
    provider = new GoogleAuthProvider();
    provider.addScope("email");
    provider.addScope("profile");
    provider.setCustomParameters({ prompt: "select_account" });
  } catch (err) {
    console.warn("Firebase initialization failed:", err);
  }
}

export const STORAGE_KEY = "efiqo user data";

function sanitizeForFirestore<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v !== undefined) {
        out[k] = sanitizeForFirestore(v);
      }
    }
    return out as T;
  }
  return value;
}

export function createEmptyProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  const email = overrides.email || "learner@efiqo.local";
  const isBeta = BETA_USERS.some((u) => u.email.toLowerCase() === email.toLowerCase());
  return {
    userName: overrides.userName || "Scholar",
    theme: overrides.theme || "device",
    createdOn: overrides.createdOn || new Date().toUTCString(),
    userId:
      overrides.userId ||
      (typeof crypto !== "undefined" ? crypto.randomUUID() : `user-${Date.now()}`),
    pfp: overrides.pfp || {
      file: "/images/default_avatar.png",
      url: "/images/default_avatar.png",
    },
    fullName: overrides.fullName || "efIQo Scholar",
    gender: overrides.gender || "",
    dob: overrides.dob || "",
    email,
    tel: overrides.tel || "",
    level: overrides.level || "College (Undergrad)",
    isBetaUser: overrides.isBetaUser ?? isBeta,
    isPremiumUser: overrides.isPremiumUser ?? false,
    flashcards: overrides.flashcards || STARTER_FLASHCARDS.map((s) => ({ ...s, by: email })),
    quizzes: overrides.quizzes || STARTER_QUIZZES.map((q) => ({ ...q, by: email })),
    studyMinutes: overrides.studyMinutes || 0,
  };
}

export async function buildOrFetchFirebaseUserProfile(user: User): Promise<UserProfile> {
  const email = user.email || `${user.uid}@efiqo.app`;
  const existing = await getUserProfileFromStore(email);
  const displayName = user.displayName || "efIQo Scholar";
  const firstName = displayName.includes(" ")
    ? displayName.slice(0, displayName.indexOf(" "))
    : displayName;
  const photoUrl = user.photoURL || "/images/default_avatar.png";
  const isBeta = BETA_USERS.some((u) => u.email.toLowerCase() === email.toLowerCase());

  if (existing) {
    const merged: UserProfile = {
      ...existing,
      userId: existing.userId || user.uid,
      email,
      fullName: existing.fullName || displayName,
      userName: existing.userName || firstName,
      pfp: existing.pfp?.url ? existing.pfp : { file: photoUrl, url: photoUrl },
      isBetaUser: existing.isBetaUser ?? isBeta,
    };
    await saveUserProfileToStore(merged);
    return merged;
  }

  const fresh = createEmptyProfile({
    userId: user.uid,
    email,
    fullName: displayName,
    userName: firstName,
    pfp: {
      file: photoUrl,
      url: photoUrl,
    },
    tel: user.phoneNumber || user.providerData?.[0]?.phoneNumber || "",
    isBetaUser: isBeta,
  });
  await saveUserProfileToStore(fresh);
  return fresh;
}

export async function getUserProfileFromStore(email: string): Promise<UserProfile | null> {
  if (firestore) {
    try {
      const snap = await getDoc(doc(firestore, "users", email));
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
    } catch {
      // Fallback to local API / localStorage if network/rules fail
    }
  }

  try {
    const res = await fetch(`/api/users/${encodeURIComponent(email)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.exists && json.data) return json.data as UserProfile;
    }
  } catch {
    // Ignore network errors and fallback to localStorage
  }

  if (typeof window !== "undefined") {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as UserProfile;
      if (parsed.email === email) return parsed;
    }
  }
  return null;
}

export async function saveUserProfileToStore(profile: UserProfile): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }

  if (firestore && auth?.currentUser && profile.email !== "scholar@efiqo.local") {
    try {
      await setDoc(doc(firestore, "users", profile.email), sanitizeForFirestore(profile), {
        merge: true,
      });
    } catch (err) {
      console.warn("Firestore saveUserProfileToStore error:", err);
    }
  }

  try {
    await fetch(`/api/users/${encodeURIComponent(profile.email)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
  } catch {
    // localStorage already persisted
  }
}

export async function updateUserProfileFields(
  email: string,
  patch: Partial<UserProfile>
): Promise<void> {
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const merged = { ...JSON.parse(raw), ...patch };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    }
  }

  if (firestore && auth?.currentUser && email !== "scholar@efiqo.local") {
    try {
      await updateDoc(
        doc(firestore, "users", email),
        sanitizeForFirestore(patch) as Record<string, unknown>
      );
    } catch (err) {
      console.warn("Firestore updateUserProfileFields error:", err);
    }
  }

  try {
    await fetch(`/api/users/${encodeURIComponent(email)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
  } catch {
    // localStorage already updated
  }
}

export async function deleteUserAccountFromStore(email: string): Promise<void> {
  if (firestore && auth?.currentUser && email !== "scholar@efiqo.local") {
    try {
      await deleteDoc(doc(firestore, "users", email));
    } catch {
      // Fallback
    }
  }
  try {
    await fetch(`/api/users/${encodeURIComponent(email)}`, { method: "DELETE" });
  } catch {
    // Ignore
  }
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem("efiqo temp data");
  }
}

export async function fetchCommunityLibrary(): Promise<{
  flashcards: FlashcardSet[];
  quizzes: QuizSet[];
}> {
  const flashcards: FlashcardSet[] = [...STARTER_FLASHCARDS];
  const quizzes: QuizSet[] = [...STARTER_QUIZZES];

  if (firestore) {
    try {
      const q = query(collection(firestore, "users"), where("email", "!=", ""));
      const snap = await getDocs(q);
      snap.forEach((docSnap) => {
        const data = docSnap.data() as Partial<UserProfile>;
        if (Array.isArray(data.flashcards)) {
          data.flashcards.forEach((f) => {
            if (!flashcards.some((existing) => existing.id === f.id)) flashcards.push(f);
          });
        }
        if (Array.isArray(data.quizzes)) {
          data.quizzes.forEach((qz) => {
            if (!quizzes.some((existing) => existing.id === qz.id)) quizzes.push(qz);
          });
        }
      });
    } catch {
      // Fallback to local API
    }
  }

  try {
    const res = await fetch("/api/users");
    if (res.ok) {
      const users = (await res.json()) as Partial<UserProfile>[];
      users.forEach((u) => {
        if (Array.isArray(u.flashcards)) {
          u.flashcards.forEach((f) => {
            if (!flashcards.some((existing) => existing.id === f.id)) flashcards.push(f);
          });
        }
        if (Array.isArray(u.quizzes)) {
          u.quizzes.forEach((qz) => {
            if (!quizzes.some((existing) => existing.id === qz.id)) quizzes.push(qz);
          });
        }
      });
    }
  } catch {
    // Keep starter library
  }

  return { flashcards, quizzes };
}

export async function isUsernameAvailable(
  username: string,
  currentEmail: string
): Promise<boolean> {
  const normalized = username.trim().toLowerCase();
  if (normalized.length < 4) return false;

  if (firestore) {
    try {
      const q = query(collection(firestore, "users"), where("userName", "!=", ""));
      const snap = await getDocs(q);
      let taken = false;
      snap.forEach((docSnap) => {
        const data = docSnap.data() as Partial<UserProfile>;
        if (data.email !== currentEmail && data.userName?.toLowerCase().trim() === normalized) {
          taken = true;
        }
      });
      if (taken) return false;
    } catch {
      // Continue
    }
  }

  try {
    const res = await fetch("/api/users");
    if (res.ok) {
      const users = (await res.json()) as Partial<UserProfile>[];
      const taken = users.some(
        (u) => u.email !== currentEmail && u.userName?.toLowerCase().trim() === normalized
      );
      if (taken) return false;
    }
  } catch {
    // Ignore
  }

  return true;
}

function formatFirebaseAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code || "";
  const host = typeof window !== "undefined" ? window.location.hostname : "this domain";

  switch (code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Google sign-in popup was closed before completing.";
    case "auth/popup-blocked":
      return "Popup was blocked by your browser. Please allow popups for this site and try again.";
    case "auth/unauthorized-domain":
      return `Google sign-in is blocked on "${host}". Add "${host}" in Firebase Console -> Authentication -> Settings -> Authorized domains.`;
    case "auth/network-request-failed":
      return "Network error while contacting Google/Firebase Authentication. Check your connection and try again.";
    case "auth/operation-not-allowed":
      return "Google sign-in provider is not enabled in Firebase Authentication settings.";
    default:
      return err instanceof Error ? err.message : "Could not complete Google sign-in with Firebase.";
  }
}

export async function checkGoogleRedirectResult(): Promise<UserProfile | null> {
  if (!auth) return null;
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      return await buildOrFetchFirebaseUserProfile(result.user);
    }
  } catch (err) {
    throw new Error(formatFirebaseAuthError(err));
  }
  return null;
}

export function subscribeToFirebaseAuth(
  onUser: (user: User | null) => void
): () => void {
  if (!auth) {
    onUser(null);
    return () => {};
  }
  return onAuthStateChanged(auth, onUser);
}

export async function signInWithGoogleAccount(): Promise<{
  profile?: UserProfile;
  mode: "firebase" | "redirect";
}> {
  if (!auth || !provider) {
    throw new Error(
      "Firebase Authentication is not configured. Verify NEXT_PUBLIC_FIREBASE_* environment variables."
    );
  }

  try {
    const result = await signInWithPopup(auth, provider);
    const profile = await buildOrFetchFirebaseUserProfile(result.user);
    return { profile, mode: "firebase" };
  } catch (err) {
    const code = (err as { code?: string })?.code || "";
    const isTopWindow = typeof window !== "undefined" && window.self === window.top;

    // On mobile browsers (or popup-restricted top-level tabs), seamlessly fall back to Firebase Redirect flow
    if (
      isTopWindow &&
      (code === "auth/popup-blocked" ||
        code === "auth/operation-not-supported-in-this-environment")
    ) {
      await signInWithRedirect(auth, provider);
      return { mode: "redirect" };
    }

    throw new Error(formatFirebaseAuthError(err));
  }
}

export async function signOutAccount(): Promise<void> {
  if (auth) {
    try {
      await fbSignOut(auth);
    } catch {
      // Ignore
    }
  }
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem("efiqo temp data");
  }
}
