# Multi-architecture Dockerfile for JobBlaster
FROM --platform=$BUILDPLATFORM node:20-alpine AS base

# Install dependencies and setup
RUN apk add --no-cache libc6-compat netcat-openbsd postgresql-client postgresql15-client
RUN npm install -g tsx@latest vite@latest
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production

# Build stage
FROM base AS builder
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production runtime
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install runtime dependencies
RUN apk add --no-cache libc6-compat netcat-openbsd postgresql-client postgresql15-client
RUN npm install -g tsx@latest vite@latest

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser

# Copy built application and dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist/public ./client/dist
COPY --from=builder /app/package*.json ./

# Create necessary directories and set up start script
RUN mkdir -p uploads && chown -R appuser:nodejs /app
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

USER appuser

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/auth/user', (res) => process.exit(res.statusCode < 500 ? 0 : 1)).on('error', () => process.exit(1))"

# Start the application with migrations
CMD ["/app/start.sh"]
