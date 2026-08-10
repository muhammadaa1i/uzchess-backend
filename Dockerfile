FROM node:25-alpine AS build

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm ci

COPY . .

RUN npm run build

RUN npm prune --omit=dev

FROM node:25-alpine

WORKDIR /app

COPY package.json .

RUN npm install --omit=dev

COPY --from=build /app/dist app/dist

CMD ["node", "dist/main.js"]