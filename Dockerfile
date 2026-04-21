FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# STEP 1: BUILD
FROM base AS build
COPY . .
ENV CI=true
# Bun workspaces doesn't work very well, so we use pnpm.
RUN bun add -g pnpm
# install all deps because why bother filtering
RUN pnpm i
# order of build matters (not recursive because cli isn't needed)
RUN pnpm --filter corpus-utils build
RUN pnpm --filter @ozanarslan/corpus build
RUN pnpm --filter corpus-docs build

# STEP 2: RELEASE
FROM base AS release
WORKDIR /usr/src/app
# Files shoudl be at root
COPY --from=build /usr/src/app/packages/docs/dist .
EXPOSE 3000
ENV NODE_ENV=production

CMD ["bun", "run", "index.js"]
