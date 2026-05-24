FROM node:22-alpine AS base
WORKDIR /app
RUN npm install -g tsx

# Install dependencies
FROM base AS deps
COPY package.json ./
RUN npm install --production=false

# Build
FROM deps AS build
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# Runtime
FROM node:22-alpine AS runtime
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./

EXPOSE 3002
HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:3002/health || exit 1

CMD ["node", "dist/index.js"]
