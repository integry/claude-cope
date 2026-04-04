# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace root files
COPY package.json package-lock.json ./

# Copy workspace package.json files for dependency resolution
COPY apps/frontend/package.json apps/frontend/package.json
COPY apps/backend/package.json apps/backend/package.json
COPY packages/shared/package.json packages/shared/package.json

# Install all dependencies (including devDependencies for building)
RUN npm ci

# Copy source files
COPY apps/frontend/ apps/frontend/
COPY apps/backend/ apps/backend/
COPY packages/shared/ packages/shared/

# Build the React frontend
RUN npm run build --workspace=apps/frontend

# Build the Node.js backend
RUN npm run build --workspace=apps/backend

# Stage 2: Runner
FROM node:20-alpine AS runner

WORKDIR /app

# Copy workspace root files
COPY package.json package-lock.json ./

# Copy only the backend package.json for production dependency installation
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
COPY packages/shared/package.json packages/shared/package.json

# Install production dependencies only
RUN npm ci --omit=dev

# Copy compiled backend
COPY --from=builder /app/apps/backend/dist/ ./dist/

# Copy frontend build output as static files
COPY --from=builder /app/apps/frontend/dist/ ./public/

EXPOSE 3000

CMD ["node", "dist/node.js"]
