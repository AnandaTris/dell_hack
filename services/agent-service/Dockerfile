FROM node:22-alpine AS base
WORKDIR /workspace

FROM base AS deps
COPY services/agent-service/package.json ./services/agent-service/package.json
WORKDIR /workspace/services/agent-service
RUN npm install --production=false

FROM deps AS build
WORKDIR /workspace
COPY tsconfig.base.json ./tsconfig.base.json
COPY services/agent-service/tsconfig.json ./services/agent-service/tsconfig.json
COPY services/agent-service/src/ ./services/agent-service/src/
WORKDIR /workspace/services/agent-service
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
COPY --from=build /workspace/services/agent-service/dist ./dist
COPY --from=deps /workspace/services/agent-service/node_modules ./node_modules
COPY services/agent-service/package.json ./

EXPOSE 3002
HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:3002/health || exit 1

CMD ["node", "dist/index.js"]
