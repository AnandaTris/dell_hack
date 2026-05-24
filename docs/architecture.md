# CareKaki — Architecture

> Dell InnovateDash Hackathon 2026 @ SUTD | Problem Owner: Care Corner Singapore (ICCP)

---

## 1. Overview

CareKaki is a **cloud-native, multi-agent AI care navigator** for seniors and caregivers in Singapore.

The core thesis: the problem is not "how do I find care services" — it's "how do I know which ones are right for my situation, and what do I do first?" CareKaki replaces the search-and-scroll experience with a conversation that builds understanding, then produces a personalised pathway with per-item rationale. When a situation is complex, it performs a warm handover to a human Care Corner coordinator — generating a structured Care Brief so the family never has to repeat themselves.

```
┌──────────────────────────────────────────────────────────────────────┐
│                      CareKaki System Architecture                    │
│                                                                      │
│  Clients                    Kubernetes cluster                       │
│  ┌─────────────┐            ┌─────────────────────────────────────┐  │
│  │ Senior PWA  │            │  ┌──────────────────────┐           │  │
│  │ (Next.js)   │──HTTPS────▶│  │  nginx Ingress + TLS │           │  │
│  │             │            │  └──────────┬───────────┘           │  │
���  │ Caregiver   │            │             ▼                        ���  │
│  │             │            │  ┌───────���──────────────┐           │  │
���  │ Coordinator │            │  │  web (Next.js PWA)   │ :3000     │  │
│  │ dashboard   │            │  │  - Chat UI           │           │  │
│  └───────��─────┘            │  │  - Coordinator portal│           │  │
│                             │  │  - API routes (BFF)  │           │  │
│                             │  └────────┬─────┬────��──┘           │  │
│                             │           │     │                    │  │
│                             │     ┌─────┘     └──────┐            │  │
│                             │     ▼                  ▼            │  │
│                             │  ┌──────────┐  ┌───────────────┐   │  │
│                             │  │  agent-  │  │   profile-    │   │  │
│                             │  │  service │  │   service     │   │  │
│                             │  │  :3002   │  │   :3003       │   │  │
│                             │  │          │  │               │   ���  │
│                             │  │ Profiler │  │ Care Profile  ���   │  │
│                             │  │ Navigator│  │ Care Briefs   │   │  │
│                             │  │ Handover │  │ (in-memory →  │   │  │
│                             │  │ Guardian │  │  Postgres)    │   ���  │
│                             │  └────┬─────┘  └───────────���───┘   │  │
│                             │       │                             │  │
│                             │       ▼                             │  │
│                             │  ┌────────────────┐                │  │
│                             │  │ knowledge-svc  │ :3004           │  │
│                             │  │                │                │  │
���                             │  │ 19 SG services │                │  │
│                             │  │ Rule-based RAG │                │  │
│                             │  └────────────────┘                │  │
│                             └─────────────────────────────────────┘  │
│                                                                      │
│  External                                                            │
│  ┌──────────────────────────┐                                        │
│  │  Claude API (Anthropic)  │  claude-opus-4-7                       │
│  │  - Profiler agent        │  POST /v1/messages                     │
│  │  - Navigator agent       │  Prompt caching on system prompts      │
│  │  - Handover agent        │                                        │
│  └────────────���─────────────┘                                        │
└──────────���───────────────────────────────────────────────────────────┘
```

---

## 2. Services

| Service | Port | Language / Framework | Responsibility |
|---|---|---|---|
| **web** | 3000 | Next.js 16, React 19, TypeScript | PWA: senior/caregiver chat UI, coordinator portal, Next.js API route BFF |
| **agent-service** | 3002 | Node.js, Hono, TypeScript | Multi-agent Claude orchestration — Profiler, Navigator, Handover, Guardian |
| **profile-service** | 3003 | Node.js, Hono, TypeScript | Living Care Profile + Care Brief CRUD (in-memory; Postgres-ready) |
| **knowledge-service** | 3004 | Node.js, Hono, TypeScript | Singapore care services retrieval — rule-based scoring over 19 seed services |

---

## 3. Agent architecture

### 3.1 Profiler agent (`POST /intake`)
**Purpose:** Hold a natural, empathetic conversation to build the Living Care Profile.

**Mechanism:**
- Claude `claude-opus-4-7` with `extract_profile_update` tool (auto tool_choice)
- System prompt contains: language instruction, current profile summary ("do not re-ask"), Singapore care system background
- Prompt caching (`cache_control: ephemeral`) on the long system prompt — reduces latency + cost on repeated turns
- Guardian safety check runs on every user message before Claude is called

**Output:** `{ response, profileUpdate, requiresEscalation, safetyFlag }`

### 3.2 Navigator agent (`POST /navigate`)
**Purpose:** Generate a personalised, grouped care pathway with per-item rationale.

**Mechanism:**
1. Agent-service calls `knowledge-service POST /search` with the Care Profile — returns top-scored services (scored against 18 rule-based criteria: discharge status, mobility, living arrangement, conditions, caregiver stress, financial tier)
2. Claude `claude-opus-4-7` with **forced** `build_care_pathway` tool (`tool_choice: { type: "tool" }`) — guaranteed structured output
3. System prompt gives Claude: the full care profile + pre-scored services + explicit instruction to write personal "why this for you" rationale

**Output:** `Pathway { groups[], escalationRecommended, escalationReason, confidence }`

### 3.3 Handover agent (`POST /handover`)
**Purpose:** Generate a structured Care Brief for the coordinator before their first call.

**Mechanism:**
- Claude `claude-opus-4-7` with **forced** `create_care_brief` tool
- Input: full profile + pathway
- Output covers: executive summary, key needs (ordered by urgency), recommended services, caregiver stress context, financial eligibility, handover notes for coordinator tone

**Output:** `CareBriefPayload` — saved to profile-service and returned to client

### 3.4 Guardian (safety classifier, synchronous)
**Purpose:** Non-negotiable safety layer on every user message.

**Mechanism:** Pattern-matching (no Claude call — deterministic, instant)
- Crisis patterns: abuse, self-harm, domestic violence, emergency → appends SOS 995, Samaritans 1-767, AIC 1800-650-6060; sets `requiresEscalation: true`
- Medical advice patterns → appends disclaimer, no escalation

---

## 4. Living Care Profile

The profile is built incrementally through conversation and drives all downstream logic:

```typescript
interface CareProfile {
  mode: "self" | "caregiver";
  language: "en" | "zh" | "ms" | "ta";
  digitalReadiness: "low" | "medium" | "high";
  senior: { name, age, livingArrangement, primaryLanguage };
  careNeeds: { mobility, chronicConditions, recentHospitalDischarge, primaryDiagnosis, adlSupport };
  caregiverContext: { hasCaregiver, caregiverRelationship, caregiverStressLevel };
  financial: { citizenshipStatus, estimatedIncome, pioneerGeneration };
  transitionFlags: { recentHospitalDischarge, careTransitionNeeded, urgency };
  completeness: number;  // 0–100, drives pathway trigger at ≥75
}
```

**Completeness scoring:** mode: +5, name: +10, age: +10, living arrangement: +10, discharge: +10, mobility: +10, conditions: +10, caregiver: +10, financial: +15

When completeness ≥ 75%, the chat page calls `/api/navigate` to generate the pathway.

---

## 5. Warm Handover flow

```
User clicks "Talk to a human"
        │
        ▼ REQUEST_HANDOVER → stage: "escalation"
HandoverPanel shows confirmation
  → User clicks "Yes, send my Care Brief"
        │
        ▼ POST /api/handover
  → POST agent-service /handover
      → Handover agent (forced create_care_brief tool)
  → POST profile-service /care-briefs (persist)
  → Return CareBrief to client
        │
        ▼ SET_CARE_BRIEF → stage: "handover"
Family sees: summary + key needs + financial notes + callback time
        │
        ▼ (background)
Coordinator portal polls GET /api/cases every 10s
  → New case appears with urgency tag
  → Coordinator clicks Accept → PATCH /api/cases/:id { status: "accepted" }
  → Coordinator clicks Schedule callback → "in_progress"
```

---

## 6. Knowledge service scoring

19 curated Singapore care services, each scored against profile factors:

| Trigger | Services boosted |
|---|---|
| `recentHospitalDischarge + transitionRelevance` | home-medical, home-nursing, home-therapy, aic-referral (+30) |
| `livingArrangement: "alone" + discharge` | interim-caregiver (+35) |
| `mobility: "wheelchair"/"bedbound"` | home-personal-care, smf (+20) |
| `chronicConditions includes "dementia"` | dementia-day-care (+40) |
| `hasCaregiver: true` | home-caregiving-grant, caregivers-training-grant (+20) |
| `estimatedIncome: "low" + citizen/PR` | medifund (+25) |
| keyword overlap | +3 per match |

Top 10 results (by score) are passed to Navigator agent with `matchReasons[]`.

---

## 7. API surface

### agent-service (port 3002)
| Method | Path | Description |
|---|---|---|
| GET | /health | Liveness check |
| POST | /intake | Profiler agent |
| POST | /navigate | Navigator agent |
| POST | /handover | Handover agent |
| POST | /reset-mock | Demo reset |

### profile-service (port 3003)
| Method | Path | Description |
|---|---|---|
| GET | /health | Liveness check |
| POST | /profiles/session/:id | Upsert profile |
| GET/PATCH/DELETE | /profiles/:id | Profile CRUD |
| POST | /care-briefs | Create brief |
| GET | /care-briefs | List briefs |
| GET/PATCH/DELETE | /care-briefs/:id | Brief CRUD |

### knowledge-service (port 3004)
| Method | Path | Description |
|---|---|---|
| GET | /health | Liveness check |
| GET | /services | All 19 services |
| POST | /search | Scored retrieval by profile |

### web — Next.js API routes
| Method | Path | Description |
|---|---|---|
| POST | /api/chat | Profiler proxy + profile persistence |
| POST | /api/navigate | Navigator proxy |
| POST | /api/handover | Handover proxy + brief save |
| GET | /api/cases | Care briefs list |
| PATCH | /api/cases/[id] | Update brief status |
| GET | /api/health | K8s probe |
| POST | /api/demo/reset | Reset mock for demo replay |

---

## 8. Infrastructure

### Docker Compose (local)
```bash
make up          # build + start all services
make down        # stop
make logs        # follow logs
make demo-reset  # reset mock turn counter for demo replay
make type-check  # TypeScript across all services
```

### Kubernetes (`make k8s`)
Manifests in `infra/k8s/`:

| File | Content |
|---|---|
| `namespace.yaml` | carekaki namespace |
| `configmap.yaml` | shared env (service URLs, model, flags) |
| `secret.yaml` | ANTHROPIC_API_KEY template |
| `*-service.yaml` | Deployment (1–2 replicas) + ClusterIP Service |
| `ingress.yaml` | nginx ingress → web:3000 at `carekaki.local` |
| `hpa.yaml` | HPA: agent-service (1–5 pods, 60% CPU), web (2–8 pods, 70% CPU) |

---

## 9. MOCK_MODE

All agents support `MOCK_MODE=true` or absent API key. Every live call has a deterministic fallback — demo runs without the Claude API.

| Component | Mock behavior |
|---|---|
| Profiler | Replays 4-turn Mdm Tan script |
| Navigator | Returns MOCK_PATHWAY |
| Handover | Returns MOCK_CARE_BRIEF |
| All Next.js routes | Return mock data if agent-service unreachable |
| Chat page | "Run demo" button autoplays Wei Ling scenario |

---

## 10. Responsible AI

| Risk | Mitigation |
|---|---|
| Medical advice | System prompt hard-rule; Guardian disclaimer on every flagged message |
| Crisis / self-harm | Guardian pattern match → SOS 995, Samaritans 1-767, AIC 1800-650-6060; escalation flag |
| Privacy / PDPA | DELETE endpoint; no PII in logs; session-scoped profiles; PDPA note on landing page |
| AI hallucination | Services from curated seed data; Claude writes rationale, never service facts |
| Over-reliance | "Talk to a human" always visible; escalation banner on pathway; final CTA to coordinator |
