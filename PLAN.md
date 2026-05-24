# CareKaki — Build Plan (Dell InnovateDash Hackathon 2026)

> Working name: **CareKaki** ("kaki" = buddy/companion in Singlish/Malay).
> Tagline: *"Your care buddy that knows where to start."*
> This document is the spec for an AI coding agent (Sonnet) to execute. Build the **vertical slice** described in Section 7. Deploy story is **Docker + Kubernetes**. AI backend is **Claude API**.

---

## 1. The judge's lens (the rubric we are designing against)

The PS is unusually prescriptive about what it does *not* want. A judge advances the team that:

- **Solves the stated problem, not the easy one.** The PS explicitly says: *not* a directory, *not* a list of services, *not* a traditional chatbot or matching platform. Most teams will build exactly that and lose. We must visibly be something else.
- **Demonstrates "understanding the client profile."** Care needs, functional limitations, caregiving context, **and digital readiness**. This phrase is in the PS — we make it the centre of the product.
- **Shows the warm human handover.** "Seamless linkage to Care Corner... clear human-supported escalation and handovers." This is named explicitly. We build it as a hero feature, not a footnote.
- **Hits Dell's cloud-native bar.** Dell ran a Docker + Kubernetes workshop. Technical judges want containers, orchestration, microservices, API-driven design. We give them real K8s manifests + a working demo, not slideware.
- **Uses AI responsibly and "beyond chatbots."** Agentic multi-agent reasoning + explicit safety guardrails. Judges reward teams that show they thought about harm, not just capability.
- **Is emotionally credible.** Real Singapore care schemes, a real persona, a real care-transition moment. Local judges (Dell + Care Corner) will instantly tell who did the domain research.
- **Generalizes.** Works for Care Corner today, extensible to any ICCP provider. Show the platform, not a one-off.

**Win condition:** a judge watches the 5-min video and thinks *"this team actually understood the brief, built something real, and I'd want to talk to them."*

---

## 2. The concept (one paragraph)

CareKaki is an **agentic care navigator** for seniors and caregivers. Instead of listing services, it holds a natural conversation to build a **Living Care Profile**, reasons over real community-care resources to assemble a **personalized care pathway** (with a plain-language "why this is for you"), adapts its interface to the user's **digital readiness**, and — when the situation is complex or a care transition is underway — performs a **warm handover** to a Care Corner coordinator by auto-generating a structured **Care Brief**, so the senior never has to repeat their story. AI does the triage and sense-making; humans do the relationship and the hard decisions.

---

## 3. The five differentiators (each maps to a PS requirement)

| # | Differentiator | What it is | PS requirement it satisfies |
|---|---|---|---|
| 1 | **Living Care Profile ("Care Passport")** | An evolving, portable structured profile built through conversation — care needs, functional limits, caregiving context, finances, digital readiness. Solves fragmentation at the *data layer*, not just the UI. | "prioritise understanding the client profile" |
| 2 | **Agentic Navigator (not a chatbot)** | Multi-agent reasoning that constructs a *pathway* of grouped, sequenced recommendations — each with an explainable "why this is for you" tied to profile factors. | "self navigation... guide them to make sense of their options... personalized recommendations"; "go beyond traditional chatbots or matching platforms" |
| 3 | **Digital-readiness adaptive UX** | Interface adapts to literacy/comfort: voice-first option, large text / high contrast, simplified flows, multilingual (English/Mandarin/Malay/Tamil; dialect roadmap: Hokkien/Cantonese/Teochew). | "readiness for digital tools"; "many seniors face difficulties navigating digital tools" |
| 4 | **Warm Handover + Care Brief** | On complexity/transition, escalates to a human coordinator and generates a structured brief (profile + pathway + summary). Coordinator dashboard receives it; senior doesn't repeat their story. | "clear human-supported escalation and handovers"; "seamless linkage to Care Corner or other ICCP providers" |
| 5 | **Responsible-AI guardrails** | No medical/legal advice; safety classifier escalates distress/abuse/self-harm to humans + helplines; "talk to a human" always available; explainable + source-cited; PDPA-aware consent and data minimization. | "leverage AI responsibly and effectively" |

**Anti-directory positioning (say this out loud in the video):** *"We are not a directory. A directory makes you search. CareKaki understands you, then brings the right help to you — and a human, when you need one."*

---

## 4. Personas & the hero scenario (drives the demo)

- **Mdm Tan, 78** — recently discharged after a fall; reduced mobility; lives alone; speaks Mandarin; low digital confidence.
- **Wei Ling, 45** — Mdm Tan's daughter; works full-time, two kids; the caregiver doing the navigating; English; phone-first.

**Hero flow (this is exactly what runs live in the demo):**
1. Landing → pick mode: *"I need help for myself"* vs *"I'm caring for someone"* → pick language. (Establishes senior vs caregiver + readiness.)
2. **Conversational intake** (Profiler agent) — Wei Ling describes the situation in plain language. The **Care Profile panel updates live** on screen as understanding builds (visualizes "understanding the client profile").
3. **Navigator agent** produces a **Care Pathway**: grouped by need (e.g., *Home Care & Nursing*, *Day Rehabilitation*, *Home Modification*, *Financial Assistance*, *Caregiver Support*), each item with a one-line **"why this is for you"** and a concrete next step. Not a flat list.
4. **Escalation moment** — system recognizes *recent hospital discharge + multiple interacting needs* = a care transition needing a human. It offers a **warm handover** to a Care Corner coordinator.
5. **Warm handover** — generates the **Care Brief**, shows the **Coordinator dashboard** receiving the case, confirms a callback time. Mdm Tan/Wei Ling never re-explain anything.
6. Close: same profile could be shared to any ICCP provider → the scalability point.

---

## 5. Architecture (cloud-native — this is the Dell scorer)

**Style:** microservices, containerized, orchestrated on Kubernetes, API-driven. Runs locally on `docker-compose`; ships with real K8s manifests runnable on `kind`/`minikube`.

```
                         ┌─────────────────────────────────────────────┐
   Clients               │              Kubernetes cluster              │
 ┌──────────────┐        │  ┌──────────┐                                │
 │ Senior PWA   │        │  │ Ingress  │  (nginx ingress)               │
 │ Caregiver    │──HTTPS─┼─▶│  +TLS    │                                │
 │ Coordinator  │        │  └────┬─────┘                                │
 │ dashboard    │        │       ▼                                      │
 └──────────────┘        │  ┌──────────────┐   API-driven (REST/JSON)   │
                         │  │ api-gateway   │ (BFF)                      │
                         │  └──┬───┬───┬────┘                            │
                         │     ▼   ▼   ▼                                 │
                         │  ┌────────┐ ┌────────────┐ ┌──────────────┐  │
                         │  │profile │ │ agent-svc  │ │ knowledge-svc │  │
                         │  │ -svc   │ │ (Claude)   │ │  (RAG)        │  │
                         │  └───┬────┘ └─────┬──────┘ └──────┬───────┘  │
                         │      ▼            ▼               ▼          │
                         │  ┌────────┐  ┌─────────┐    ┌──────────────┐ │
                         │  │Postgres│  │ handover│    │ pgvector /    │ │
                         │  │+ Redis │  │  -svc   │    │ embeddings    │ │
                         │  └────────┘  └─────────┘    └──────────────┘ │
                         │  HPA on agent-svc + gateway · Secrets/Config  │
                         └─────────────────────────────────────────────┘
                                          │
                                   ┌──────▼───────┐
                                   │  Claude API  │ (Anthropic SDK)
                                   └──────────────┘
```

**Microservices (each its own Dockerfile):**
- `api-gateway` — BFF; auth/session, request routing, rate limiting, streams SSE to the client. (Can be a thin Node/Express or Next.js route layer.)
- `agent-service` — the AI brain. Orchestrates the multi-agent flow against Claude (Anthropic SDK). Endpoints: `POST /intake` (extract/update profile), `POST /navigate` (build pathway), `POST /handover` (generate care brief), `POST /safety-check`. Streaming responses.
- `profile-service` — CRUD for Living Care Profiles. Postgres. Versioned profile, export/delete (PDPA).
- `knowledge-service` — curated Singapore care-services dataset + retrieval (RAG). pgvector for semantic search; falls back to structured filters.
- `handover-service` — generates Care Brief, manages the coordinator case queue (simulated CRM), notification stub (SMS/WhatsApp placeholder).

**Data:** Postgres (profiles, services, cases) + pgvector (embeddings) + Redis (session/cache). 

**Cloud-native checklist to show explicitly:** Dockerfiles (multi-stage), `docker-compose.yml`, K8s `Deployment`/`Service`/`Ingress`/`ConfigMap`/`Secret`/`HorizontalPodAutoscaler`, liveness/readiness probes, namespace, resource limits, 12-factor config via env. Mention horizontal scale + graceful shutdown.

---

## 6. AI design (the "beyond chatbots / responsible AI" scorer)

**Multi-agent orchestration inside `agent-service` (all Claude, via Anthropic SDK):**
1. **Profiler agent** — turns free-form conversation into a structured Care Profile via tool-use / JSON schema output. Asks only what's missing; never interrogates.
2. **Navigator agent** — given the profile + retrieved services, reasons to a *sequenced, grouped pathway* with rationale per item. Cites the source service record.
3. **Explainer agent** — renders each recommendation in plain language matched to the user's digital-readiness/literacy level and language.
4. **Guardian agent (safety)** — runs on every turn: detects distress / abuse / self-harm / medical-emergency signals; blocks medical/legal advice; forces human escalation + surfaces helplines when triggered.
5. **Handover agent** — composes the Care Brief and decides *when* a human is needed (complexity, care transition, low confidence, safety).

**Responsible-AI specifics to implement and show:**
- System prompts forbid diagnosis/medical/legal/financial advice → always "check with a professional / your doctor / a coordinator."
- Confidence-aware: when uncertain, the system escalates rather than fabricates.
- Every recommendation is **explainable + source-cited** (which profile factors, which service record).
- Persistent **"Talk to a human"** affordance on every screen.
- Helpline fallback (e.g., AIC hotline 1800-650-6060; Samaritans of Singapore for distress) shown on safety trigger.
- **PDPA**: explicit consent screen, data minimization, profile export + delete, no training on user data.
- Use **prompt caching** on the long system prompts + services context to cut cost/latency.

---

## 7. What Sonnet builds (the vertical slice) + tech stack

**Scope discipline:** build the ONE hero flow (Section 4) end-to-end so it runs live. Proper microservice boundaries + real K8s manifests, but each service kept minimal. Always keep `main` in a demoable state.

**Stack:**
- **Frontend:** Next.js (App Router) PWA · TypeScript · Tailwind + shadcn/ui · accessible (large-text/high-contrast toggle, keyboard nav, ARIA) · voice input via Web Speech API · i18n (next-intl) seeded with EN + ZH. Three surfaces: Senior/Caregiver chat app + live Profile panel + Coordinator dashboard.
- **Backend:** Node + TypeScript microservices (Express or Hono). `agent-service` uses **`@anthropic-ai/sdk`** with tool-use/structured output + streaming + prompt caching.
- **Data:** Postgres + pgvector + Redis. Drizzle/Prisma for schema. Seed script with real SG services.
- **Infra:** per-service multi-stage Dockerfiles · `docker-compose.yml` for local · `k8s/` manifests (Deployment/Service/Ingress/ConfigMap/Secret/HPA + probes) runnable on `kind`/`minikube` · `Makefile` for `make dev`, `make up`, `make k8s`.

**Repo layout (monorepo):**
```
/apps
  /web                # Next.js PWA (senior/caregiver) + coordinator dashboard
/services
  /api-gateway
  /agent-service      # Claude multi-agent orchestration
  /profile-service
  /knowledge-service  # RAG over SG care services
  /handover-service
/packages
  /shared             # shared types (CareProfile, Pathway, CareBrief), zod schemas
/infra
  /docker             # compose
  /k8s                # manifests
/data
  /seed               # SG care services dataset (JSON)
/docs
  architecture.md     # the diagram + write-up for the submission
PLAN.md
```

**Seed dataset — real Singapore community-care resources** (use these names; they signal real research and read as credible to local judges):
- Home-based: Home Medical, Home Nursing, Home Personal Care, Home Therapy, Interim Caregiver Service, Meals-on-Wheels.
- Centre-based: Senior Care Centre, Day Rehabilitation, Dementia Day Care, Active Ageing Centre (AAC).
- Financial schemes: Home Caregiving Grant (HCG), Caregivers Training Grant (CTG), Seniors' Mobility & Enabling Fund (SMF), ElderShield/CareShield Life, Pioneer/Merdeka Generation benefits, MediSave/MediFund.
- System/linkage: Agency for Integrated Care (AIC) referrals, Community Case Management Service (CCMS), Care Corner ICCP, hospital Medical Social Worker (transition point).
- Each record: `id, name, category, description, eligibility, costGuide, howToAccess, providerType, transitionRelevance, source`.

---

## 8. Build phases (sequenced so there's always a working demo)

- **Phase 0 — Scaffold.** Monorepo, TS configs, shared types/zod schemas (`CareProfile`, `ServiceRecord`, `Pathway`, `CareBrief`), `docker-compose`, Postgres up, seed dataset loaded. *Done = `make dev` boots empty app + DB.*
- **Phase 1 — Frontend shell.** Landing (mode + language), chat UI, **live Profile panel**, accessibility toggles, coordinator dashboard skeleton. Wired to mock data. *Done = clickable flow with fake responses.*
- **Phase 2 — Profiler agent.** `agent-service` `/intake` with Claude structured output → updates `profile-service`. Stream to UI; Profile panel fills in live. *Done = real conversation builds a real profile.*
- **Phase 3 — Navigator + RAG.** `knowledge-service` retrieval over seed data; Navigator agent `/navigate` → grouped pathway with per-item "why this for you" + source. *Done = personalized pathway renders (clearly not a directory).*
- **Phase 4 — Warm handover + guardrails.** Escalation detection (transition/complexity/safety) → `/handover` Care Brief → coordinator dashboard receives case + callback confirm. Guardian agent safety checks + helpline fallback + "talk to a human" button. *Done = full hero flow works end-to-end.*
- **Phase 5 — Cloud-native + polish.** Dockerfiles, K8s manifests (probes/HPA/secrets), `make k8s` on kind/minikube; a11y pass; deterministic seeded demo scenario for Mdm Tan; loading/empty/error states. *Done = runs on K8s; demo is reliable.*
- **Phase 6 — Submission assets.** `docs/architecture.md` + rendered diagram, UI mockup screenshots, record 5-min video, dry-run demo twice with a recorded fallback clip. *Done = submission package ready.*

---

## 9. The 5-min video (this is the round-1 deliverable — script to this)

- **0:00–0:45 — Hook + problem.** Mdm Tan/Wei Ling persona; the fragmentation pain ("which of 50 websites? am I even eligible?"). State the HMW.
- **0:45–1:15 — Positioning.** *"Not a directory, not a chatbot."* What CareKaki is in one line.
- **1:15–3:15 — Live demo.** The hero flow: intake → live profile → personalized pathway with "why" → escalation → warm handover → coordinator gets the Care Brief. This is the heart — let it breathe.
- **3:15–4:00 — Under the hood.** Architecture diagram (cloud-native, microservices, K8s), multi-agent AI, responsible-AI guardrails. For the technical judges.
- **4:00–4:45 — Impact + scale.** Reduced caregiver burden, faster access during transitions, generalizes to any ICCP provider, plugs into Care Corner's coordinators.
- **4:45–5:00 — Team + close.**

**Required submission artifacts:** (1) 5-min video, (2) problem analysis, (3) solution summary, (4) architecture diagram, (5) UI mockup. We exceed the bar with a *working* demo.

---

## 10. Risks & cut-lines

- **Demo fragility** → seed a deterministic Mdm Tan scenario; record a fallback clip; never live-improvise prompts on camera.
- **API cost/latency** → prompt caching; small max tokens; a mock mode that returns canned structured responses if the key is absent.
- **Over-scope** → if time is short: collapse RAG to curated structured filtering + Claude reasoning (drop pgvector); run fewer containers locally but KEEP the K8s manifests (the cloud-native story is what's graded, not a live cluster); show dialect/voice as one language live + roadmap.
- **Looking like a directory** → enforce grouped pathways + per-item rationale + the handover; never render a flat searchable list.

## 11. One-line pitch (memorize)
*"CareKaki understands the senior, not just the services — it builds a living care profile, hands you a personalized pathway with the reason for each step, and brings in a real Care Corner coordinator the moment you need one. AI does the navigating; humans do the caring."*
