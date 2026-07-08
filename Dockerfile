# ===== AFMS Dockerfile for Fly.io =====
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Production deps + prisma CLI + tsx (for migrations & seed at boot)
COPY package*.json ./
RUN npm ci --omit=dev
RUN npm install --no-save prisma tsx
RUN npx prisma generate

# Built Next.js app
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.ts ./
COPY --from=build /app/prisma ./prisma

# Data directories (Fly volume mounts at /data)
RUN mkdir -p /data/uploads/bills

EXPOSE 3000

# On every boot: link uploads to volume, run migrations + seed (idempotent), start server
CMD ["sh", "-c", "ln -sf /data/uploads uploads && npx prisma migrate deploy && npx prisma db seed && node_modules/.bin/next start -H 0.0.0.0 -p 3000"]
