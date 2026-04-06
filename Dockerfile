FROM node:22-slim AS build

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Copy workspace config first for layer caching
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY tsconfig.base.json tsconfig.json ./

# Copy all package.json files from workspace packages
COPY lib/package.json lib/tsconfig.json ./lib/
COPY lib/db/src/ ./lib/db/src/
COPY lib/api-spec/ ./lib/api-spec/
COPY lib/api-zod/ ./lib/api-zod/
COPY lib/api-client-react/ ./lib/api-client-react/
COPY artifacts/api-server/package.json artifacts/api-server/tsconfig.json artifacts/api-server/build.mjs ./artifacts/api-server/
COPY artifacts/kvarenda/package.json artifacts/kvarenda/tsconfig.json artifacts/kvarenda/vite.config.ts artifacts/kvarenda/components.json ./artifacts/kvarenda/
COPY artifacts/mockup-sandbox/ ./artifacts/mockup-sandbox/
COPY scripts/ ./scripts/

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy all source code
COPY . .

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
