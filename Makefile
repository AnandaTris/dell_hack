.PHONY: up down dev dev-web dev-agent dev-profile dev-knowledge seed type-check k8s k8s-status k8s-down logs demo-reset

COMPOSE=docker compose -f infra/docker/docker-compose.yml --env-file .env.local

# ── Docker compose ──────────────────────────────────────────────────────────

up:
	@echo "Building images one at a time to keep memory usage low..."
	$(COMPOSE) build profile-service
	$(COMPOSE) build knowledge-service
	$(COMPOSE) build agent-service
	$(COMPOSE) build web
	$(COMPOSE) up -d
	@echo "✓ CareKaki is up."
	@echo "  Web:               http://localhost:3000"
	@echo "  Agent service:     http://localhost:3002"
	@echo "  Profile service:   http://localhost:3003"
	@echo "  Knowledge service: http://localhost:3004"
	@echo "  Coordinator:       http://localhost:3000/coordinator"

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f

# ── Local development (no Docker) ─────────────────────────────────────────

dev-web:
	cd apps/web && npm run dev

dev-agent:
	cd services/agent-service && npm run dev

dev-profile:
	cd services/profile-service && npm run dev

dev-knowledge:
	cd services/knowledge-service && npm run dev

# ── Type checking ──────────────────────────────────────────────────────────

type-check:
	npm run type-check -w @carekaki/agent-service
	npm run type-check -w @carekaki/profile-service
	npm run type-check -w @carekaki/knowledge-service
	cd apps/web && npx tsc --noEmit

# ── Demo utilities ─────────────────────────────────────────────────────────

demo-reset:
	curl -s -X POST http://localhost:3002/reset-mock | cat
	@echo "\n✓ Demo reset — mock turn counter cleared"

seed:
	@echo "Knowledge service reads services.json directly — no seeding needed."
	@echo "✓ All 19 Singapore care services available at http://localhost:3004/services"

# ── Kubernetes ─────────────────────────────────────────────────────────────

k8s:
	@echo "Applying Kubernetes manifests to cluster..."
	kubectl apply -f infra/k8s/namespace.yaml
	kubectl apply -f infra/k8s/configmap.yaml
	kubectl apply -f infra/k8s/secret.yaml
	kubectl apply -f infra/k8s/profile-service.yaml
	kubectl apply -f infra/k8s/knowledge-service.yaml
	kubectl apply -f infra/k8s/agent-service.yaml
	kubectl apply -f infra/k8s/web.yaml
	kubectl apply -f infra/k8s/ingress.yaml
	kubectl apply -f infra/k8s/hpa.yaml
	@echo "✓ Manifests applied. Check status:"
	@echo "  kubectl get pods -n carekaki"

k8s-status:
	kubectl get pods,svc,hpa -n carekaki

k8s-down:
	kubectl delete namespace carekaki --ignore-not-found
