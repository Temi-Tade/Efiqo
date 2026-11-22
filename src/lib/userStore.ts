import type { UserProfile } from "@/types/efiqo";

const globalForStore = globalThis as unknown as {
  efiqoUsers?: Map<string, UserProfile>;
};

export const userMemoryStore = globalForStore.efiqoUsers ?? new Map<string, UserProfile>();
if (!globalForStore.efiqoUsers) {
  globalForStore.efiqoUsers = userMemoryStore;
}
