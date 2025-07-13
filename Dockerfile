# ---------- Stage 1: Build ----------
  FROM node:20-alpine AS builder

  WORKDIR /app
  ENV NODE_OPTIONS="--max-old-space-size=4096"
  ENV NODE_ENV=production
  
  COPY package.json yarn.lock ./
  RUN yarn install --production=false
  COPY . .
  RUN yarn build
  
  # ---------- Stage 2: Production ----------
  FROM node:20-alpine AS production
  
  WORKDIR /app
  ENV NODE_OPTIONS="--max-old-space-size=2048"
  ENV NODE_ENV=production
  
  RUN apk add --no-cache dumb-init
  
  # Create non-root user
  RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001 -G nodejs
  
  # Copy package files
  COPY package.json yarn.lock ./
  RUN yarn install --frozen-lockfile --production=true && yarn cache clean
  
  # Copy built app from builder
  COPY --from=builder /app/dist ./dist
  
  # Create writable folders with correct permissions
  RUN mkdir -p uploads logs \
      && chown -R nestjs:nodejs uploads logs
  
  # Switch to non-root user
  USER nestjs
  
  # Expose the listening port
  EXPOSE 8080
  
  # Health check
  HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8080/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1
  
  # Entrypoint with dumb-init
  ENTRYPOINT ["dumb-init", "--"]
  CMD ["node", "dist/main"]  