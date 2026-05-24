# CareKaki — Your care buddy that knows where to start

> Dell InnovateDash Hackathon 2026 @ SUTD
> Problem owner: Care Corner Singapore (ICCP)

**CareKaki is not a directory. It understands you, then brings the right help to you — and a human, when you need one.**

---

## The problem

Singapore has excellent community care services. But finding and navigating them is fragmented, confusing, and exhausting — especially for seniors after a hospital discharge, or for caregivers already stretched thin. Most people don't fail because services don't exist. They fail because no one helps them make sense of what's right for their specific situation.

## The solution

CareKaki holds a natural conversation with a senior or caregiver, builds a **Living Care Profile** in real time, and uses it to generate a **personalised care pathway** — each service with a plain-language "why this is for you" specific to their situation. When needs are complex, CareKaki generates a structured **Care Brief** and performs a **warm handover** to a Care Corner coordinator — so the family never has to repeat themselves.

---

## Demo — the hero scenario

**Mdm Tan, 78** — just discharged from hospital after a fall. Lives alone. Hypertension. Low digital confidence. Her daughter **Wei Ling, 45** is the caregiver but works full-time with two kids.

1. Wei Ling picks "I'm caring for someone" + language
2. She describes the situation in plain language → **profile builds live on screen**
3. After 4 turns, a **personalised pathway** appears: Interim Caregiver, Home Nursing, Home Physiotherapy, Caregiving Grant, Home Modification Fund — each with "because Mdm Tan lives alone post-discharge and qualifies for full subsidies"
4. System recognises complexity → **warm handover offered**
5. Wei Ling confirms → **Care Brief generated** → Coordinator portal receives case → callback confirmed
6. Coordinator sees: summary, key needs, financial eligibility, handover notes for the first call

**Try it:** `make up` then open http://localhost:3000. Click "Run demo" in the chat input.

---

## Quick start

### With Docker (recommended)

```bash
cp .env.example .env
# Add ANTHROPIC_API_KEY to .env (optional — MOCK_MODE works without it)
make up
```

Open http://localhost:3000 (senior/caregiver UI) or http://localhost:3000/coordinator (coordinator portal).

### Local dev (no Docker)

```bash
npm install
cp .env.example .env.local

# In separate terminals:
make dev-web       # Next.js on :3000
make dev-agent     # agent-service on :3002
make dev-profile   # profile-service on :3003
make dev-knowledge # knowledge-service on :3004
```

### MOCK_MODE (no API key needed)

Set `MOCK_MODE=true` in `.env` — all agents return pre-built Mdm Tan scenario data. The "Run demo" button in the chat input autoplays the full 4-turn scenario.

---

## Architecture

4 microservices + Next.js BFF:

| Service | Port | Role |
|---|---|---|
| web | 3000 | Next.js PWA — chat UI, coordinator dashboard, API BFF |
| agent-service | 3002 | Claude agents — Profiler, Navigator, Handover, Guardian |
| profile-service | 3003 | Living Care Profile + Care Brief CRUD |
| knowledge-service | 3004 | 19 Singapore care services, rule-based scoring retrieval |

All containerised with Docker, orchestrated with Kubernetes (manifests in `infra/k8s/`). See [`docs/architecture.md`](docs/architecture.md) for the full design.

---

## AI agents (all Claude `claude-opus-4-7`)

| Agent | Tool | Purpose |
|---|---|---|
| **Profiler** | `extract_profile_update` (auto) | Conversational intake → Living Care Profile |
| **Navigator** | `build_care_pathway` (forced) | Profile + retrieved services → personalised pathway with rationale |
| **Handover** | `create_care_brief` (forced) | Profile + pathway → structured coordinator brief |
| **Guardian** | Pattern matching (no LLM call) | Safety: crisis, medical advice, escalation |

Prompt caching on long system prompts. Every agent has a deterministic mock fallback.

---

## Five differentiators

1. **Living Care Profile** — built through conversation, not forms. Drives all personalisation.
2. **Agentic Navigator** — structured, multi-step AI reasoning. Not a chatbot, not a filter.
3. **"Why this for you"** — every recommendation explains itself using the user's own profile factors.
4. **Warm Handover** — Care Brief auto-generated; coordinator sees full context; family doesn't repeat.
5. **Responsible AI** — Guardian safety layer, no medical advice, PDPA-aware, human always reachable.

---

## Kubernetes

```bash
# Apply all manifests (requires kubectl + kind/minikube)
make k8s

# Check status
make k8s-status

# Teardown
make k8s-down
```

Includes: Namespace, ConfigMap, Secret (template), Deployments, ClusterIP Services, nginx Ingress, HPA (agent-service: 1–5 pods; web: 2–8 pods).

---

## Project structure

```
.
├── apps/web/                   # Next.js 16 PWA
├── services/
│   ├── agent-service/          # Claude multi-agent orchestration
│   ├── profile-service/        # Care Profile + Brief CRUD
│   └── knowledge-service/      # SG care services retrieval
├── data/seed/services.json     # 19 curated Singapore care services
├── infra/
│   ├── docker/                 # docker-compose.yml
│   └── k8s/                    # Kubernetes manifests
├── docs/architecture.md        # Full architecture documentation
├── Makefile                    # make up/down/dev/type-check/k8s
└── .env.example
```

---

## Care services included

19 real Singapore care services: Home Medical, Home Nursing, Home Personal Care, Home Therapy, Interim Caregiver Service, Meals on Wheels, Senior Care Centre, Day Rehabilitation, Dementia Day Care, Active Ageing Centre, Home Caregiving Grant, Caregivers Training Grant, Seniors Mobility Fund, CareShield Life, MediFund, AIC Referral, Community Case Management, Care Corner ICCP, Medical Social Worker.

Sources: Agency for Integrated Care (AIC), Care Corner Singapore, Ministry of Health.

---

## Environment variables

See `.env.example`. Key vars:

| Variable | Description | Default |
|---|---|---|
| `ANTHROPIC_API_KEY` | Claude API key | — (MOCK_MODE if absent) |
| `MOCK_MODE` | Use scripted mock responses | `false` |
| `CLAUDE_MODEL` | Claude model to use | `claude-opus-4-7` |
| `AGENT_SERVICE_URL` | Internal service URL | `http://localhost:3002` |
| `PROFILE_SERVICE_URL` | Internal service URL | `http://localhost:3003` |
