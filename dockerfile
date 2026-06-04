# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src/ src/
COPY test/ test/

RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache tzdata

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY ca.pem ./

EXPOSE 3000

CMD ["node", "dist/main.js"]
