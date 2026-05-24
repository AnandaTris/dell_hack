import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { searchServices, getAllServices } from "./retriever.js";
import type { SearchInput } from "./retriever.js";

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "http://localhost:3002", "http://web:3000", "http://agent-service:3002"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  })
);

app.get("/health", (c) => c.json({ status: "ok", service: "knowledge-service" }));

app.get("/services", (c) => {
  const all = getAllServices();
  return c.json({ services: all, total: all.length });
});

app.post("/search", async (c) => {
  let body: SearchInput;
  try {
    body = await c.req.json<SearchInput>();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const maxResults = Number(c.req.query("limit") ?? 10);
  const results = searchServices(body, maxResults);

  return c.json({
    results,
    total: results.length,
    query: body,
  });
});

const PORT = Number(process.env.PORT ?? 3004);

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`[knowledge-service] Running on http://localhost:${PORT}`);
});
