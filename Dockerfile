FROM oven/bun:1 AS base
WORKDIR /usr/src/app

FROM base AS build
RUN bun add -g pnpm

# 1. Copy root config and ALL package.jsons to establish the workspace map
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/docs/package.json ./packages/docs/
COPY packages/corpus/package.json ./packages/corpus/

# 2. Install dependencies
# We use --shamefully-hoist to ensure Bun can resolve packages easily in a monorepo
RUN pnpm install --frozen-lockfile --shamefully-hoist

# 3. Copy source code for BOTH packages
COPY packages/corpus ./packages/corpus
COPY packages/docs ./packages/docs

# 4. Build the dependency first (Crucial if @ozanarslan/corpus has its own build step)
RUN pnpm --filter @ozanarslan/corpus build || echo "No build script for corpus"

# 5. Build the docs package
# We run this from the package directory to ensure Bun resolves local paths correctly
WORKDIR /usr/src/app/packages/docs
RUN bun run build.ts

FROM base AS release
WORKDIR /usr/src/app

# 6. Copy the built assets
COPY --from=build /usr/src/app/packages/docs/dist .

EXPOSE 3000
ENV NODE_ENV=production

RUN ls -R .

CMD ["bun", "run", "index.js"]
