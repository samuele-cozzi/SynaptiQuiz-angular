# Multi-stage build for SynaptiQuiz
# Stage 1: Build the Angular application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the Angular application
RUN npm run build

# Stage 2: Serve the built application
FROM node:20-alpine

WORKDIR /app

# Install a simple HTTP server to serve the static files
RUN npm install -g @angular/cli@20 && npm install -g http-server

# Copy built artifacts from builder stage
COPY --from=builder /app/dist/synaptiquiz/browser /app/dist

# Expose port 4200 (or change as needed)
EXPOSE 4200

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4200/ || exit 1

# Start the server
CMD ["http-server", "/app/dist", "-p", "4200", "-g"]
