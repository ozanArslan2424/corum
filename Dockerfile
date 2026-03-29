FROM oven/bun:1 AS base
WORKDIR /usr/src/app

FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

FROM base AS build
COPY --from=install /temp/dev/node_modules node_modules
COPY . .
RUN bun run build-docs.ts

FROM base AS release
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/docs/dist ./docs
COPY --from=build /usr/src/app/dist ./docs/dist
EXPOSE 3000
ENV NODE_ENV=production
CMD ["bun", "run", "docs/index.js"]
