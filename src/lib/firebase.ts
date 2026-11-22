import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut, type Auth } from "firebase/auth";
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
import { BETA_USERS, STARTER_FLASHCARDS, STARTER_QUIZZES, type FlashcardSet, type QuizSet, type UserProfile } from "@/types/efiqo";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;
let provider: GoogleAuthProvider | null = null;

if (typeof window !== "undefined" && isFirebaseConfigured) {
  try {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    auth = getAuth(app);
    firestore = getFirestore(app);
    provider = new GoogleAuthProvider();
  } catch (err) {
    console.warn("Firebase initialization skipped, using local workspace store:", err);
  }
}

export const STORAGE_KEY = "efiqo user data";

export function createEmptyProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  const email = overrides.email || "learner@efiqo.local";
  const isBeta = BETA_USERS.some((u) => u.email.toLowerCase() === email.toLowerCase());
  return {
    userName: overrides.userName || "Scholar",
    theme: overrides.theme || "device",
    createdOn: overrides.createdOn || new Date().toUTCString(),
    userId: overrides.userId || (typeof crypto !== "undefined" ? crypto.randomUUID() : `user-${Date.now()}`),
    pfp: overrides.pfp || { file: "/images/default_avatar.png", url: "/images/default_avatar.png" },
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

export async function getUserProfileFromStore(email: string): Promise<UserProfile | null> {
  if (firestore) {
    try {
      const snap = await getDoc(doc(firestore, "users", email));
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
    } catch {
      // Fallback to local API store if Firestore rules or network block read
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

  if (firestore && auth?.currentUser) {
    try {
      await setDoc(doc(firestore, "users", profile.email), profile, { merge: true });
    } catch {
      // Fall through to local API backup
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

export async function updateUserProfileFields(email: string, patch: Partial<UserProfile>): Promise<void> {
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const merged = { ...JSON.parse(raw), ...patch };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    }
  }

  if (firestore && auth?.currentUser) {
    try {
      await updateDoc(doc(firestore, "users", email), patch as Record<string, unknown>);
    } catch {
      // Fallback
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
  if (firestore && auth?.currentUser) {
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

export async function fetchCommunityLibrary(): Promise<{ flashcards: FlashcardSet[]; quizzes: QuizSet[] }> {
  const flashcards: FlashcardSet[] = [...STARTER_FLASHCARDS];
  const quizzes: QuizSet[] = [...STARTER_QUIZZES];

  if (firestore) {
    try {
      const q = query(collection(firestore, "users"), where("email", "!=", ""));
      const snap = await getDocs(q);
      snap.forEach((docSnap) => {
        const data = docSnap.data() as Partial<UserProfile>;
        if (Array.isArray(data.flashcards)) flashcards.push(...data.flashcards);
        if (Array.isArray(data.quizzes)) quizzes.push(...data.quizzes);
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

export async function isUsernameAvailable(username: string, currentEmail: string): Promise<boolean> {
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

export async function signInWithGoogleAccount(): Promise<{ profile: UserProfile; mode: "firebase" | "local" }> {
  if (auth && provider) {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const email = user.email || "scholar@efiqo.local";
      const existing = await getUserProfileFromStore(email);
      if (existing) {
        await saveUserProfileToStore(existing);
        return { profile: existing, mode: "firebase" };
      }

      const displayName = user.displayName || "efIQo Scholar";
      const firstName = displayName.includes(" ") ? displayName.slice(0, displayName.indexOf(" ")) : displayName;
      const fresh = createEmptyProfile({
        email,
        fullName: displayName,
        userName: firstName,
        pfp: {
          file: user.photoURL || "/images/default_avatar.png",
          url: user.photoURL || "/images/default_avatar.png",
        },
        tel: user.providerData?.[0]?.phoneNumber || "",
      });
      await saveUserProfileToStore(fresh);
      return { profile: fresh, mode: "firebase" };
    } catch (err) {
      // In preview iframes or unauthorized domains, gracefully fall back to local session
      console.warn("Google popup auth unavailable in current origin, starting local study session:", err);
    }
  }

  const fallbackEmail = "scholar@efiqo.local";
  const existing = await getUserProfileFromStore(fallbackEmail);
  const localProfile =
    existing ||
    createEmptyProfile({
      email: fallbackEmail,
      fullName: "efIQo Scholar",
      userName: "Scholar",
    });
  await saveUserProfileToStore(localProfile);
  return { profile: localProfile, mode: "local" };
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
