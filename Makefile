.PHONY: up down dev seed type-check k8s k8s-down

COMPOSE=docker compose -f infra/docker/docker-compose.yml

up:
	$(COMPOSE) up -d
	@echo "✓ All services up. Postgres at localhost:5432"

down:
	$(COMPOSE) down

dev:
	$(COMPOSE) up -d postgres
	@echo "✓ Postgres running"
	@echo "  Run 'pnpm --filter @carekaki/web dev' to start the frontend (Phase 1+)"

seed:
	@echo "Seeding Singapore care services into knowledge-service..."
	pnpm seed

type-check:
	pnpm type-check

k8s:
	@echo "Applying Kubernetes manifests..."
	kubectl apply -f infra/k8s/namespace.yaml
	kubectl apply -f infra/k8s/

k8s-down:
	kubectl delete namespace carekaki --ignore-not-found

logs:
	$(COMPOSE) logs -f
