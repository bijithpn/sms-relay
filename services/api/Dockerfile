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
COPY --from=build /app/packages ./packages
COPY --from=build /app/services/api/dist ./services/api/dist
COPY --from=build /app/services/api/package.json ./services/api/package.json

CMD ["node", "services/api/dist/main.js"]
