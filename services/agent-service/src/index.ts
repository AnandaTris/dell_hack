import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { runProfilerAgent } from "./agents/profiler.js";
import { runNavigatorAgent } from "./agents/navigator.js";
import { runHandoverAgent } from "./agents/handover.js";
import { getMockResponse, resetMockTurn } from "./lib/mock.js";
import type { IntakeRequest, NavigateRequest, HandoverRequest } from "./types.js";

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

app.post("/navigate", async (c) => {
  let body: NavigateRequest;
  try {
    body = await c.req.json<NavigateRequest>();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const { profile, sessionId } = body;

  // Fetch relevant services from knowledge-service
  const knowledgeUrl = process.env.KNOWLEDGE_SERVICE_URL ?? "http://localhost:3004";

  let services: unknown[] = [];
  try {
    const searchPayload = {
      recentHospitalDischarge: profile.careNeeds?.recentHospitalDischarge,
      primaryDiagnosis: profile.careNeeds?.primaryDiagnosis,
      mobility: profile.careNeeds?.mobility,
      chronicConditions: profile.careNeeds?.chronicConditions,
      adlSupport: profile.careNeeds?.adlSupport,
      livingArrangement: profile.senior?.livingArrangement,
      hasCaregiver: profile.caregiverContext?.hasCaregiver,
      caregiverStressLevel: profile.caregiverContext?.caregiverStressLevel,
      citizenshipStatus: profile.financial?.citizenshipStatus,
      estimatedIncome: profile.financial?.estimatedIncome,
      pioneerGeneration: profile.financial?.pioneerGeneration,
      urgency: profile.transitionFlags?.urgency,
    };

    const res = await fetch(`${knowledgeUrl}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(searchPayload),
      signal: AbortSignal.timeout(5_000),
    });

    if (res.ok) {
      const data = await res.json() as { results: unknown[] };
      services = data.results ?? [];
    }
  } catch (err) {
    console.warn("[agent-service] knowledge-service unavailable:", err);
    // Continue with empty services — navigator will use mock fallback
  }

  console.log(
    `[agent-service] Navigator: session=${sessionId}, services retrieved=${services.length}`
  );

  const pathway = await runNavigatorAgent({ profile, services: services as Parameters<typeof runNavigatorAgent>[0]["services"] });

  return c.json({
    ...pathway,
    id: `pathway-${sessionId}-${Date.now()}`,
    profileId: sessionId,
    generatedAt: new Date().toISOString(),
  });
});

app.post("/handover", async (c) => {
  let body: HandoverRequest;
  try {
    body = await c.req.json<HandoverRequest>();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const { profile, pathway, sessionId } = body;

  console.log(`[agent-service] Handover agent: session=${sessionId}`);

  const brief = await runHandoverAgent({
    profile,
    pathway: pathway as { groups: Parameters<typeof runHandoverAgent>[0]["pathway"]["groups"] },
  });

  return c.json({ ...brief, generatedAt: new Date().toISOString() });
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
