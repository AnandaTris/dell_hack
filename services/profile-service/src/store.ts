import { v4 as uuid } from "uuid";

export interface StoredProfile {
  id: string;
  sessionId: string;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// Phase 2: in-memory store. Phase 3 will swap in Postgres.
const profiles = new Map<string, StoredProfile>();
const sessionIndex = new Map<string, string>(); // sessionId → profile id

export const store = {
  create(sessionId: string, data: Record<string, unknown>): StoredProfile {
    const id = uuid();
    const now = new Date().toISOString();
    const profile: StoredProfile = { id, sessionId, data, createdAt: now, updatedAt: now };
    profiles.set(id, profile);
    sessionIndex.set(sessionId, id);
    return profile;
  },

  getById(id: string): StoredProfile | undefined {
    return profiles.get(id);
  },

  getBySession(sessionId: string): StoredProfile | undefined {
    const id = sessionIndex.get(sessionId);
    return id ? profiles.get(id) : undefined;
  },

  upsertBySession(sessionId: string, data: Record<string, unknown>): StoredProfile {
    const existing = this.getBySession(sessionId);
    if (existing) {
      const merged = deepMerge(existing.data, data);
      const updated: StoredProfile = { ...existing, data: merged, updatedAt: new Date().toISOString() };
      profiles.set(existing.id, updated);
      return updated;
    }
    return this.create(sessionId, data);
  },

  list(): StoredProfile[] {
    return Array.from(profiles.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },

  delete(id: string): boolean {
    const p = profiles.get(id);
    if (p) {
      sessionIndex.delete(p.sessionId);
      profiles.delete(id);
      return true;
    }
    return false;
  },
};

function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> {
  const result = { ...target };
  for (const [k, v] of Object.entries(source)) {
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      result[k] = deepMerge(
        (result[k] as Record<string, unknown>) ?? {},
        v as Record<string, unknown>
      );
    } else if (v !== undefined) {
      result[k] = v;
    }
  }
  return result;
}
