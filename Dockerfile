# ===== AFMS Dockerfile for Fly.io =====
FROM node:20-slim AS build
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-slim AS runner
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production

# Production deps + prisma CLI + tsx
COPY package*.json ./
RUN npm ci --omit=dev
RUN npm install --no-save prisma tsx

# Copy prisma schema BEFORE running generate
COPY --from=build /app/prisma ./prisma
RUN npx prisma generate

# Copy built Next.js app
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.ts ./

# Data directories (Fly volume mounts at /data)
RUN mkdir -p /data/uploads/bills

EXPOSE 3000

# On every boot: link uploads to volume, run migrations + seed (idempotent), start
CMD ["sh", "-c", "ln -sf /data/uploads uploads && npx prisma migrate deploy && npx prisma db seed && node_modules/.bin/next start -H 0.0.0.0 -p 3000"]
