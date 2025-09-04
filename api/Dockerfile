# Base Image
FROM node:20-alpine AS base

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Dev
FROM node:20-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Prod
FROM node:20-alpine AS production
WORKDIR /app

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

COPY package*.json ./
RUN npm ci --only=production

COPY --from=build --chown=nodejs:nodejs /app/dist ./dist

USER nodejs

EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=1s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["node", "dist/server.js"]
