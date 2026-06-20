# Single-stage Bun image. Builds the Vite frontend, then runs the Hono server
# which serves the built SPA + the API on $PORT.
FROM oven/bun:1

WORKDIR /app

# Install dependencies first (better layer caching).
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# App source (node_modules/dist/data excluded via .dockerignore).
COPY . .

# Build the frontend to ./dist.
RUN bun run build

ENV NODE_ENV=production
ENV PORT=3000
# SQLite lives here; mount a volume at /app/data to persist across redeploys.
ENV DB_PATH=/app/data/dsa.sqlite

EXPOSE 3000

CMD ["bun", "server/index.ts"]
