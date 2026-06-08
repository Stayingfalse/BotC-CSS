# ── Stage 1: build React client ──────────────────────────────────────────────
FROM node:22-alpine AS client-build

WORKDIR /app/client
COPY client/package.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# ── Stage 2: production server ────────────────────────────────────────────────
FROM node:22-alpine AS server

WORKDIR /app

# Install server dependencies
COPY package.json ./
RUN npm install --omit=dev

# Copy server source
COPY server/ ./server/

# Copy built client assets from Stage 1
COPY --from=client-build /app/client/dist ./client/dist

EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "server/index.js"]
