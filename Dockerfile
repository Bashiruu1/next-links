# syntax=docker/dockerfile:1
# ─────────────────────────────────────────────────────────────────────────────
# next-links · Dockerfile
#
# Multi-stage build — four targets:
#   base     shared Node 20 layer with dependencies installed
#   dev      `npm run dev` hot-reload server  (docker-compose up dev)
#   test     `npm run test:run` — runs Vitest once and exits
#   builder  `npm run build` — produces the static /out folder
#   runner   nginx serving the static /out folder  (docker-compose up runner)
# ─────────────────────────────────────────────────────────────────────────────

# ── base: node + deps ─────────────────────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app

# Copy manifests first so Docker can cache the npm ci layer independently.
COPY package*.json ./
RUN npm ci

# ── dev: hot-reload development server ───────────────────────────────────────
FROM base AS dev
COPY . .
EXPOSE 3000
ENV NODE_ENV=development
CMD ["npm", "run", "dev"]

# ── test: run Vitest once and exit ────────────────────────────────────────────
FROM base AS test
COPY . .
ENV NODE_ENV=test
# Run tests non-interactively (CI mode).
CMD ["npm", "run", "test:run"]

# ── builder: produce static /out folder ──────────────────────────────────────
FROM base AS builder
COPY . .
ENV NODE_ENV=production
RUN npm run build
# The static output lands in /app/out

# ── runner: nginx serving the static site ────────────────────────────────────
FROM nginx:1.27-alpine AS runner
COPY --from=builder /app/out /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
