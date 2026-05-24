# CareKaki — Architecture (placeholder)

Full architecture diagram and write-up will be completed in Phase 6.

## System overview

CareKaki is a cloud-native, microservices-based agentic care navigator. See PLAN.md Section 5 for the full architecture diagram.

## Services

| Service | Port | Responsibility |
|---|---|---|
| web (Next.js PWA) | 3000 | Senior/caregiver chat UI + coordinator dashboard |
| api-gateway | 3001 | BFF — routing, session, SSE streaming |
| agent-service | 3002 | Multi-agent Claude orchestration |
| profile-service | 3003 | Living Care Profile CRUD (Postgres) |
| knowledge-service | 3004 | SG care services retrieval (structured JSON + Claude reasoning) |
| handover-service | 3005 | Care Brief generation + coordinator case queue |

## Data stores

- **Postgres 16** — profiles, briefs, cases
- **Docker / Kubernetes** — containerised microservices with Deployments, Services, Ingress, HPA

## AI stack

- **Claude API** (Anthropic SDK) — multi-agent orchestration
- Agents: Profiler, Navigator, Explainer, Guardian (safety), Handover
- Prompt caching on long system prompts + service context
