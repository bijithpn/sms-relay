# Base image for all services
FROM node:20-alpine AS base
RUN npm install -g pnpm

FROM base AS build
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm run build

FROM base AS runner
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json

CMD ["node", "dist/index.js"]
