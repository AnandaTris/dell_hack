import { v4 as uuid } from "uuid";

export interface StoredBrief {
  id: string;
  sessionId: string;
  profileId: string;
  pathwayId?: string | undefined;
  summary: string;
  seniorDetails: {
    name?: string | undefined;
    age?: number | undefined;
    situation: string;
  };
  keyNeeds: string[];
  recommendedServices: string[];
  urgencyLevel: "routine" | "urgent" | "critical";
  caregiverInfo?: string | undefined;
  financialConsiderations?: string | undefined;
  recentTransition?: string | undefined;
  handoverNotes: string;
  generatedAt: string;
  status: "pending" | "accepted" | "in_progress" | "resolved";
  callbackTime?: string | undefined;
  coordinatorNotes?: string | undefined;
}

const briefs = new Map<string, StoredBrief>();

export const briefStore = {
  create(data: Omit<StoredBrief, "id">): StoredBrief {
    const id = uuid();
    const brief: StoredBrief = { ...data, id };
    briefs.set(id, brief);
    return brief;
  },

  getById(id: string): StoredBrief | undefined {
    return briefs.get(id);
  },

  list(): StoredBrief[] {
    return Array.from(briefs.values()).sort(
      (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
    );
  },

  update(id: string, patch: Partial<StoredBrief>): StoredBrief | undefined {
    const existing = briefs.get(id);
    if (!existing) return undefined;
    const updated: StoredBrief = { ...existing, ...patch, id };
    briefs.set(id, updated);
    return updated;
  },

  delete(id: string): boolean {
    return briefs.delete(id);
  },
};
