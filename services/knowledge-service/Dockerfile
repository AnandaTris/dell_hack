# Build context: repository root
FROM node:22-alpine AS base
WORKDIR /workspace

FROM base AS deps
COPY services/knowledge-service/package.json ./services/knowledge-service/package.json
WORKDIR /workspace/services/knowledge-service
RUN npm install --production=false

FROM deps AS build
WORKDIR /workspace
COPY tsconfig.base.json ./tsconfig.base.json
COPY services/knowledge-service/tsconfig.json ./services/knowledge-service/tsconfig.json
COPY services/knowledge-service/src/ ./services/knowledge-service/src/
WORKDIR /workspace/services/knowledge-service
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
COPY --from=build /workspace/services/knowledge-service/dist ./dist
COPY --from=deps /workspace/services/knowledge-service/node_modules ./node_modules
COPY services/knowledge-service/package.json ./
COPY data/seed/services.json ./data/seed/services.json

ENV SERVICES_DATA_PATH=/app/data/seed/services.json

EXPOSE 3004
HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:3004/health || exit 1

CMD ["node", "dist/index.js"]
