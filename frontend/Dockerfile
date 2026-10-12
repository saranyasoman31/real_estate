# Multi-Stage Production Dockerfile for Real Estate Frontend (React + Vite + Nginx)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Nginx Alpine Production Server
FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy built assets from builder stage
COPY --from=builder /app/dist .

# Custom Nginx configuration for SPA routing & gzip compression
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
