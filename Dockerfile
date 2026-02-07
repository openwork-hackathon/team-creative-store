# ============================================
# Multi-stage Dockerfile for team-creative-store
# Supports: api, web (nginx), worker
# ============================================

# ============================================
# Stage 1: Base image with Bun
# ============================================
FROM oven/bun:1.2-alpine AS base
WORKDIR /app

# ============================================
# Stage 2: Install dependencies
# ============================================
FROM base AS deps

# Copy package files for all workspaces
COPY package.json bun.lock ./
COPY packages/api/package.json ./packages/api/
COPY packages/db/package.json ./packages/db/
COPY packages/shared/package.json ./packages/shared/
COPY packages/web/package.json ./packages/web/
COPY packages/worker/package.json ./packages/worker/

# Install all dependencies
RUN bun install --frozen-lockfile

# ============================================
# Stage 3: Build shared packages & generate Prisma client
# ============================================
FROM deps AS builder

# Copy all source code
COPY . .

# Generate Prisma client
RUN bun run prisma:generate

# Build web frontend
RUN bun run build:web

# ============================================
# Stage 4: API production image
# ============================================
FROM base AS api

ENV NODE_ENV=production
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/api/node_modules ./packages/api/node_modules
COPY --from=deps /app/packages/db/node_modules ./packages/db/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules

# Copy source code
COPY packages/api ./packages/api
COPY packages/db ./packages/db
COPY packages/shared ./packages/shared
COPY package.json ./

# Copy generated Prisma client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 3000

CMD ["bun", "run", "--cwd", "packages/api", "start"]

# ============================================
# Stage 5: Worker production image
# ============================================
FROM base AS worker

ENV NODE_ENV=production
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/worker/node_modules ./packages/worker/node_modules
COPY --from=deps /app/packages/db/node_modules ./packages/db/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules

# Copy source code
COPY packages/worker ./packages/worker
COPY packages/db ./packages/db
COPY packages/shared ./packages/shared
COPY package.json ./

# Copy generated Prisma client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

CMD ["bun", "run", "--cwd", "packages/worker", "start"]

# ============================================
# Stage 6: Web (Nginx) production image
# ============================================
FROM nginx:alpine AS web

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files
COPY --from=builder /app/packages/web/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
