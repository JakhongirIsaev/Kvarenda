FROM node:22-slim AS build

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Copy everything
COPY . .

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Build frontend and backend
ENV BASE_PATH=/
ENV NODE_ENV=production
RUN pnpm run build

# Production stage
FROM node:22-slim AS production

WORKDIR /app

# Copy built artifacts and node_modules
COPY --from=build /app/artifacts/api-server/dist ./artifacts/api-server/dist
COPY --from=build /app/artifacts/kvarenda/dist ./artifacts/kvarenda/dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./

ENV NODE_ENV=production

CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
