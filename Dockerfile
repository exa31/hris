# syntax=docker/dockerfile:1

FROM node:lts-bookworm-slim AS builder
WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy project files and build Nuxt app
COPY . .
RUN npm run build

FROM node:lts-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Copy built output only
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/public ./public
COPY --from=builder /app/migrations ./migrations

# Install migration tool in runtime image so container can migrate before boot.
RUN npm install -g node-pg-migrate@8

EXPOSE 3000

CMD ["sh", "-c", "node-pg-migrate up --migrations-dir migrations --database-url \"$DATABASE_URL\" && node .output/server/index.mjs"]
