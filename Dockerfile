# ---- Build Stage ----
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files for dependency installation
COPY package.json package-lock.json ./
RUN npm install --ignore-scripts

# Copy source code
COPY . .

# Build with webpack (unset TURBOPACK to avoid Next.js 15 Turbopack build)
RUN unset TURBOPACK && npx next build

# ---- Production Stage ----
FROM nginx:alpine

# Copy static export to nginx html directory
COPY --from=builder /app/out /usr/share/nginx/html

# SPA fallback: redirect all routes to index.html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]