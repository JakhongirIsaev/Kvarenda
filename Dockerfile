FROM node:22-slim AS build

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Copy everything
COPY . .

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Build only what's needed for production (skip typecheck and mockup-sandbox)
ENV BASE_PATH=/
RUN pnpm --filter @workspace/kvarenda run build && \
    pnpm --filter @workspace/api-server run build

# Production stage
FROM node:22-slim AS production

WORKDIR /app

# Copy built artifacts and required node_modules (for externalized deps like pg)
COPY --from=build /app/artifacts/api-server/dist ./artifacts/api-server/dist
COPY --from=build /app/artifacts/kvarenda/dist ./artifacts/kvarenda/dist
COPY --from=build /app/node_modules ./node_modules

ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
