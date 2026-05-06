# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS base
WORKDIR /usr/src/app

# Install dependencies (dev included for build)
FROM base AS deps
COPY package*.json ./
RUN npm ci

# Build the app
FROM deps AS build
COPY . .
RUN npm run build

# Production image, copy only necessary files
FROM node:20-alpine AS production
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY package*.json ./
# Install only production deps
RUN npm ci --omit=dev
# Copy built files
COPY --from=build /usr/src/app/dist ./dist
# Expose default port
EXPOSE 3000
CMD ["node", "dist/main.js"]


