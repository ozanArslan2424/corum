FROM oven/bun:1 AS base
WORKDIR /usr/src/app

FROM base AS build
COPY package.json bun.lock .
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM base AS prerelease
RUN bun add marked
COPY --from=build /usr/src/app/dist ./dist
COPY docs ./docs
RUN bun run docs/build.ts

FROM base AS release
WORKDIR /usr/src/app
COPY --from=prerelease /usr/src/app/docs/dist ./docs
COPY --from=prerelease /usr/src/app/node_modules ./node_modules
EXPOSE 3000
ENV NODE_ENV=production
CMD ["bun", "run", "docs/index.js"]
