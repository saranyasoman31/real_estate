# Multi-Stage Production Dockerfile for Real Estate Backend API
FROM node:20-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install curl for docker healthcheck
RUN apk add --no-cache curl

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# Create uploads folder and set ownership
RUN mkdir -p uploads && chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/v1/health || exit 1

CMD ["node", "src/server.js"]
