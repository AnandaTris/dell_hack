import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { runProfilerAgent } from "./agents/profiler.js";
import { getMockResponse, resetMockTurn } from "./lib/mock.js";
import type { IntakeRequest } from "./types.js";

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "http://web:3000"],
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/health", (c) => c.json({ status: "ok", service: "agent-service" }));

app.post("/intake", async (c) => {
  let body: IntakeRequest;
  try {
    body = await c.req.json<IntakeRequest>();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const { messages, profile, sessionId } = body;

  if (!messages || messages.length === 0) {
    return c.json({ error: "messages required" }, 400);
  }

  const isMockMode = process.env.MOCK_MODE === "true" || !process.env.ANTHROPIC_API_KEY;

  try {
    if (isMockMode) {
      console.log(`[agent-service] MOCK_MODE active for session ${sessionId}`);
      const result = getMockResponse(profile);
      return c.json(result);
    }

    console.log(
      `[agent-service] Running Profiler agent for session ${sessionId}, turn ${messages.filter((m) => m.role === "user").length}`
    );
    const result = await runProfilerAgent({ messages, profile });
    return c.json(result);
  } catch (err) {
    console.error("[agent-service] Profiler agent error:", err);
    // Fallback to mock on error
    const fallback = getMockResponse(profile);
    return c.json({ ...fallback, _fallback: true });
  }
});

// Reset mock turn counter (useful for demo resets)
app.post("/reset-mock", (c) => {
  resetMockTurn();
  return c.json({ ok: true });
});

const PORT = Number(process.env.PORT ?? 3002);

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`[agent-service] Running on http://localhost:${PORT}`);
  console.log(
    `[agent-service] Mode: ${process.env.MOCK_MODE === "true" || !process.env.ANTHROPIC_API_KEY ? "MOCK" : "LIVE (Claude)"}`
  );
});
