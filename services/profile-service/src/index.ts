import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { store } from "./store.js";
import { briefStore, type StoredBrief } from "./brief-store.js";

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "http://localhost:3002", "http://web:3000", "http://agent-service:3002"],
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  })
);

app.get("/health", (c) =>
  c.json({ status: "ok", service: "profile-service", profiles: store.list().length })
);

// Create or update by session
app.post("/profiles/session/:sessionId", async (c) => {
  const { sessionId } = c.req.param();
  const body = await c.req.json<Record<string, unknown>>();
  const profile = store.upsertBySession(sessionId, body);
  return c.json(profile, 200);
});

// Get by session
app.get("/profiles/session/:sessionId", (c) => {
  const { sessionId } = c.req.param();
  const profile = store.getBySession(sessionId);
  if (!profile) return c.json({ error: "not found" }, 404);
  return c.json(profile);
});

// Get by id
app.get("/profiles/:id", (c) => {
  const { id } = c.req.param();
  const profile = store.getById(id);
  if (!profile) return c.json({ error: "not found" }, 404);
  return c.json(profile);
});

// Update by id (partial)
app.patch("/profiles/:id", async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json<Record<string, unknown>>();
  const existing = store.getById(id);
  if (!existing) return c.json({ error: "not found" }, 404);
  const updated = store.upsertBySession(existing.sessionId, body);
  return c.json(updated);
});

// Delete (PDPA compliance)
app.delete("/profiles/:id", (c) => {
  const { id } = c.req.param();
  const deleted = store.delete(id);
  return deleted ? c.json({ ok: true }) : c.json({ error: "not found" }, 404);
});

// List (coordinator view)
app.get("/profiles", (c) => {
  return c.json(store.list());
});

// === Care brief endpoints (for warm handover) ===

app.post("/care-briefs", async (c) => {
  const body = await c.req.json<Omit<StoredBrief, "id">>();
  const brief = briefStore.create(body);
  return c.json(brief, 201);
});

app.get("/care-briefs", (c) => {
  return c.json(briefStore.list());
});

app.get("/care-briefs/:id", (c) => {
  const { id } = c.req.param();
  const brief = briefStore.getById(id);
  if (!brief) return c.json({ error: "not found" }, 404);
  return c.json(brief);
});

app.patch("/care-briefs/:id", async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json<Partial<StoredBrief>>();
  const updated = briefStore.update(id, body);
  if (!updated) return c.json({ error: "not found" }, 404);
  return c.json(updated);
});

app.delete("/care-briefs/:id", (c) => {
  const { id } = c.req.param();
  const deleted = briefStore.delete(id);
  return deleted ? c.json({ ok: true }) : c.json({ error: "not found" }, 404);
});

const PORT = Number(process.env.PORT ?? 3003);

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`[profile-service] Running on http://localhost:${PORT}`);
  console.log(`[profile-service] Storage: in-memory (Phase 2) — Postgres in Phase 3`);
});
