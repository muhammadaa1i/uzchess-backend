FROM node:25-alpine AS build

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm ci

COPY . .

RUN npm run build

RUN npm prune --omit=dev \
    && rm -rf node_modules/@swc node_modules/typescript node_modules/ts-node \
    && rm -rf node_modules/@img/sharp-linux-x64 node_modules/@img/sharp-libvips-linux-x64 node_modules/@img/sharp-wasm32 \
    && npm cache clean --force

FROM node:25-alpine

WORKDIR /app

COPY --from=build /app/package.json .
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/assets ./assets

EXPOSE 8000

CMD ["sh", "-c", "npx typeorm -d ./dist/src/data-source.js migration:run && node dist/src/main.js"]